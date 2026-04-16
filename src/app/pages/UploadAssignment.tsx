import { useState } from 'react';
import { useLocation } from 'react-router';
import { Upload as UploadIcon, File, X, CheckCircle } from 'lucide-react';

export function UploadAssignment() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; progress: number; file?: File }>
  >([]);
  const [deadline, setDeadline] = useState('');
  
  const location = useLocation();
  const targetAssignment = location.state?.assignmentTitle || '';
  const targetDeadline = location.state?.dueDateRaw || '';

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { role: 'teacher', name: 'Unknown' };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    simulateUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      simulateUpload(files);
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('studentName', user.name);
      formData.append('uploaderRole', user.role);
      formData.append('deadline', deadline);
      formData.append('targetAssignment', targetAssignment);
      formData.append('targetDeadline', targetDeadline);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed: ${res.status} ${errText}`);
      }
    } catch (error: any) {
      console.warn('Backend upload failed, attempting local dummy fallback:', error);
      
      const dummyAssignments = JSON.parse(localStorage.getItem('student_assignments') || '[]');
      
      const fileReaders = files.map(f => {
         return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
               dummyAssignments.push({
                   name: f.name,
                   studentName: user.name,
                   uploaderRole: user.role,
                   uploadedAt: new Date().toISOString(),
                   dueDateRaw: deadline || new Date(Date.now() + 86400000).toISOString(),
                   url: reader.result,
                   targetAssignment,
                   targetDeadline
               });
               resolve();
            };
            reader.readAsDataURL(f);
         });
      });

      await Promise.all(fileReaders);
      try {
         localStorage.setItem('student_assignments', JSON.stringify(dummyAssignments));
      } catch (e) {
         console.warn("Local storage full, saving truncated file refs instead:", e);
         const optimized = dummyAssignments.map((da: any) => ({
             ...da,
             url: da.url && da.url.length > 50000 ? da.url.substring(0, 100) + '... (Offline Truncated to save space text)' : da.url
         }));
         try {
             localStorage.setItem('student_assignments', JSON.stringify(optimized));
         } catch (e2) {
             console.error("Critical storage error:", e2);
         }
      }
    }
  };

  const simulateUpload = (files: File[]) => {
     // Just queue them in state for submission, no immediate backend upload
     const fileEntries = files.map(file => ({
       name: file.name,
       size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
       progress: 100, // Show as ready
       file 
     }));
     setUploadedFiles(prev => [...prev, ...fileEntries]);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const submitToDashboard = async () => {
    if (user.role === 'teacher' && !deadline) {
      alert("Please set a deadline for these assignments.");
      return;
    }
    const completeFiles = uploadedFiles.filter(f => f.progress === 100);
    if (completeFiles.length === 0) return;

    try {
      const filesToUpload = completeFiles.map(f => f.file).filter(Boolean) as File[];
      
      if (filesToUpload.length > 0) {
         await handleUpload(filesToUpload);
      }

      setUploadedFiles([]);
      setDeadline('');

      // Create notification
      const notifMsg = user.role === 'student' ? `${user.name} has uploaded an assignment` : `Teacher has uploaded a new assignment`;
      const notifs = JSON.parse(localStorage.getItem('global_notifications') || '[]');
      notifs.unshift({ text: notifMsg, time: new Date().toISOString(), uploaderRole: user.role, id: Date.now() });
      localStorage.setItem('global_notifications', JSON.stringify(notifs));
      window.dispatchEvent(new Event('storage'));

      alert(user.role === 'student' ? 'Submissions sent to Teacher successfully!' : 'Assignments successfully submitted to the Student Dashboard!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit assignments');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          {user.role === 'student' ? 'Submit Assignment' : 'Upload Assignment'}
        </h1>
        <p className="text-gray-600">
          {user.role === 'student' ? 'Upload your work to send to the teacher' : 'Upload student submissions for evaluation'}
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm mb-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <UploadIcon className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-500 mb-6">
              Support for PDF, DOC, DOCX files up to 10MB
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30">
                <UploadIcon className="w-5 h-5" />
                Browse Files
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Uploaded Files ({uploadedFiles.length})
          </h2>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {file.progress === 100 ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <File className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 ml-4">{file.size}</p>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{file.progress}%</p>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {user.role === 'teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Submission Deadline</label>
                <input 
                  type="datetime-local" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
              </div>
            )}
            <button
              onClick={submitToDashboard}
              disabled={uploadedFiles.some(f => f.progress < 100)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              {user.role === 'student' ? 'Submit to Teacher' : 'Submit to Student Dashboard'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
