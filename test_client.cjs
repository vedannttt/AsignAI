const http = require('http');

const data = JSON.stringify({
  name: "Vedant",
  email: "vedantgpt29@gmail.com",
  password: "password123",
  role: "teacher",
  institution: "VIT",
  department: "IT"
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let chunks = '';
  res.on('data', d => chunks += d);
  res.on('end', () => console.log('Response:', res.statusCode, chunks));
});

req.on('error', error => console.error('Error:', error));
req.write(data);
req.end();
