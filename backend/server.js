const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], assignments: [] }, null, 2));
}

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.users) parsed.users = [];
    if (!parsed.assignments) parsed.assignments = [];
    return parsed;
  } catch (e) {
    return { users: [], assignments: [] };
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'api_secret'
});

const upload = multer();

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  console.log('--- SIGNUP ATTEMPT ---', req.body.email);
  try {
    const { name, email, password, role, institution, department } = req.body;
    const db = readDB();
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
       console.log('Signup failed: user exists');
       return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const newUser = {
      id: Date.now().toString(),
      name, email, password: hashedPassword, role, institution, department, avatar,
      createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    writeDB(db);

    console.log('Signup success:', newUser.email);
    res.status(201).json({
      message: 'User created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('--- LOGIN ATTEMPT ---', req.body.email);
  try {
    const { email, password, role } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: password mismatch');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.role !== role) {
      console.log('Login failed: wrong role', user.role, 'vs', role);
      return res.status(400).json({ error: `Account is not registered as a ${role}` });
    }

    console.log('Login success:', user.email);
    res.status(200).json({
      message: 'Logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const deadline = req.body.deadline || new Date(Date.now() + 86400000).toISOString();

  const uploadPromises = req.files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: 'raw',
        folder: 'assignments',
        public_id: file.originalname
      }, (error, result) => {
        if (error) reject(error);
        else resolve({ name: file.originalname, size: file.size, url: result.secure_url });
      });
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  });

  Promise.all(uploadPromises)
    .then(async (uploadedFiles) => {
      const db = readDB();
      const studentName = req.body.studentName || 'Unknown Student';
      const uploaderRole = req.body.uploaderRole || 'student';

      const newAssignments = uploadedFiles.map(f => ({
        id: Date.now().toString() + Math.random().toString(),
        name: f.name,
        size: f.size,
        url: f.url,
        uploadedAt: new Date().toISOString(),
        dueDateRaw: deadline,
        studentName: studentName,
        uploaderRole: uploaderRole,
        targetAssignment: req.body.targetAssignment || null,
        targetDeadline: req.body.targetDeadline || null
      }));
      
      if (!db.assignments) db.assignments = [];
      db.assignments.push(...newAssignments);
      writeDB(db);

      res.status(200).json({ message: 'Files uploaded successfully', files: newAssignments });
    })
    .catch((error) => {
      console.error('Upload Error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    });
});

app.get('/api/assignments', async (req, res) => {
  try {
    const db = readDB();
    const assignments = (db.assignments || []).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
