import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  FileText,
  Key,
  Upload,
  CheckCircle2,
  Shield,
  MessageSquare,
  Copy,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Generate Assignment',
    description: 'Create custom assignments with AI in seconds',
    path: '/dashboard/assignment-generator',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Key,
    title: 'Generate Answer Key',
    description: 'Automatically create detailed answer keys',
    path: '/dashboard/answer-key-generator',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Upload,
    title: 'Upload Assignment',
    description: 'Upload and manage student submissions',
    path: '/dashboard/upload',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: CheckCircle2,
    title: 'Evaluate Assignment',
    description: 'AI-powered grading and assessment',
    path: '/dashboard/evaluation',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Plagiarism Checker',
    description: 'Detect copied content and ensure originality',
    path: '/dashboard/plagiarism-checker',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: MessageSquare,
    title: 'Feedback',
    description: 'Generate personalized student feedback',
    path: '/dashboard/student-submissions',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Copy,
    title: 'Copy Detection',
    description: 'Advanced similarity analysis',
    path: '/dashboard/copy-detection',
    color: 'from-teal-500 to-cyan-500',
  },
];

const stats = [
  { label: 'Assignments Created', value: '1,234', icon: FileText, trend: '+12%' },
  { label: 'Students Evaluated', value: '5,678', icon: Users, trend: '+8%' },
  { label: 'Hours Saved', value: '890', icon: Clock, trend: '+23%' },
];

export function DashboardHome() {
  const [activeView, setActiveView] = useState('overview'); // For students

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'teacher' };
  const firstName = user.name.split(' ')[0];

  const [liveAssignments, setLiveAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (user.role === 'student') {
      fetch('http://localhost:5000/api/assignments')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map(item => ({
              title: item.name,
              due: new Date(item.dueDateRaw || Date.now() + 86400000).toLocaleString(),
              dueDateRaw: item.dueDateRaw || new Date(Date.now() + 86400000).toISOString(),
              urgency: 'high',
              dataUrl: item.url,
              uploaderRole: item.uploaderRole || 'teacher'
            }));
            // Store all assignments so we can cross-reference submissions
            setLiveAssignments(formatted);
          }
        })
        .catch(err => console.error('Error fetching assignments:', err));
    }
  }, [user.role]);

  const customAssignmentsStr = localStorage.getItem('student_assignments');
  const customAssignments = customAssignmentsStr ? JSON.parse(customAssignmentsStr) : [];
  
  const now = new Date().toISOString();
  
  const studentSubmissionsList = [
    ...liveAssignments.filter((a: any) => a.uploaderRole === 'student' && a.studentName === user.name),
    ...customAssignments.filter((a: any) => a.uploaderRole === 'student' && a.studentName === user.name)
  ];

  const allAssignmentsList = [
    ...liveAssignments.filter((a: any) => a.uploaderRole === 'teacher'),
    ...customAssignments.filter((a: any) => a.uploaderRole === 'teacher').map((a: any) => ({
      title: a.name,
      due: new Date(a.dueDateRaw || Date.now() + 86400000).toLocaleString(),
      dueDateRaw: a.dueDateRaw || new Date(Date.now() + 86400000).toISOString(),
      urgency: 'high',
      dataUrl: a.url
    }))
  ];

  const upcomingDeadlinesList: any[] = [];
  const pastDueList: any[] = [];
  const completedList: any[] = [];

  allAssignmentsList.forEach(task => {
     // Check if student submitted this task
     const submission = studentSubmissionsList.find(sub => sub.targetAssignment === task.title);
     
     if (submission) {
         const isLate = new Date(submission.uploadedAt).getTime() > new Date(task.dueDateRaw).getTime();
         completedList.push({
             ...task,
             status: isLate ? 'Late Submission' : 'Graded',
             isLate: isLate
         });
     } else {
         if (task.dueDateRaw > now) {
             upcomingDeadlinesList.push(task);
         } else {
             pastDueList.push(task);
         }
     }
  });

  const handleViewDocument = (dataUrl?: string, title?: string) => {
    if (dataUrl) {
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
          window.open(dataUrl, '_blank');
      } else if (dataUrl.includes('data:application/pdf')) {
          const win = window.open();
          if (win) {
              win.document.write(`<title>${title}</title><iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; position:absolute;" allowfullscreen></iframe>`);
          }
      } else if (dataUrl.includes('data:image/')) {
          const win = window.open();
          if (win) {
              win.document.write(`<title>${title}</title><div style="text-align:center; padding:20px;"><img src="${dataUrl}" style="max-width:100%;"/></div>`);
          }
      } else if (dataUrl.includes('data:text/')) {
          try {
              const base64Data = dataUrl.split(',')[1];
              const textContent = decodeURIComponent(escape(atob(base64Data)));
              const win = window.open();
              if (win) {
                  win.document.write(`<title>${title}</title><div style="font-family:sans-serif; padding:20px; white-space:pre-wrap; max-width:800px; margin:auto;">${textContent}</div>`);
              }
          } catch (e) {
              const a = document.createElement("a");
              a.href = dataUrl;
              a.download = title || "document";
              a.click();
          }
      } else {
          // Download unsupported formats like .docx
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = title || "document.docx";
          a.click();
      }
    } else {
       const win = window.open();
       if (win) {
          win.document.write(`<title>${title}</title><div style="font-family:sans-serif; padding:40px; max-width:800px; margin:auto;"><h1>${title}</h1><p><b>Dummy Data Mode:</b> This is a placeholder document since no actual file was attached for this item.</p><br><p><b>Question 1.</b> Explain the primary theories behind this topic.</p><p><b>Question 2.</b> Provide 3 practical applications in the real world.</p></div>`);
       }
    }
  };

  if (user.role === 'student') {
    return (
      <div className="p-4 lg:p-8 space-y-8 dark:text-gray-200 transition-colors">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome back, {firstName} 🎓
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your academic progress.
          </p>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => setActiveView('upcoming')} className="text-left bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-blue-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Assignments</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">{upcomingDeadlinesList.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </button>
          <button onClick={() => setActiveView('completed')} className="text-left bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-green-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Assignments</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">{completedList.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </button>
          <button onClick={() => setActiveView('pastDue')} className="text-left bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-red-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Past Due</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-white">{pastDueList.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Student Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/dashboard/upload" className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">Submit Assignment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload a document to complete your pending work</p>
            </Link>
            <Link to="/dashboard/feedback" className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors">View Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Check recent grades and teacher comments</p>
            </Link>
          </div>
        </div>

        {activeView === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            {/* Upcoming Deadlines (Overview) */}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {upcomingDeadlinesList.length === 0 ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">You're all caught up! No active upcoming deadlines right now.</p>
              ) : upcomingDeadlinesList.map((task, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${task.urgency === 'high' ? 'bg-red-500' : task.urgency === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {task.due}
                        {task.uploadedAt && <span className="ml-2 text-purple-500">| Uploaded: {task.uploadedAt}</span>}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleViewDocument(task.dataUrl, task.title)} className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">View Document</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">{activeView.replace(/([A-Z])/g, ' $1').trim()} Assignments</h2>
              <button onClick={() => setActiveView('overview')} className="text-sm text-gray-500 hover:text-purple-600 dark:hover:text-purple-400">Close</button>
            </div>
            {activeView === 'upcoming' && (
              <div className="space-y-4">
                {upcomingDeadlinesList.length === 0 ? (
                   <div className="p-8 text-center border rounded-xl border-dashed border-gray-200 dark:border-gray-700">
                     <p className="text-gray-500 dark:text-gray-400">You have no upcoming assignments due!</p>
                   </div>
                ) : upcomingDeadlinesList.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500">Due: {item.due}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleViewDocument(item.dataUrl, item.title)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">View</button>
                       <Link to="/dashboard/upload" state={{ assignmentTitle: item.title, dueDateRaw: item.dueDateRaw }} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors">Submit Ans</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeView === 'completed' && (
              <div className="space-y-4">
                {completedList.length === 0 ? (
                    <div className="p-8 text-center border rounded-xl border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">You have no completed assignments yet.</p>
                    </div>
                ) : completedList.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${item.isLate ? 'text-yellow-500' : 'text-green-500'}`} />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        <p className={`text-sm ${item.isLate ? 'text-yellow-600' : 'text-gray-500'}`}>Status: {item.status}</p>
                      </div>
                    </div>
                    <Link to="/dashboard/feedback" className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">View Grade</Link>
                  </div>
                ))}
              </div>
            )}
            {activeView === 'pastDue' && (
              <div className="space-y-4">
                {pastDueList.map((item, i) => (
                  <div key={i} className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300">{item.title}</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">Due: {item.due}</p>
                      </div>
                    </div>
                    <Link to="/dashboard/upload" state={{ assignmentTitle: item.title, dueDateRaw: item.dueDateRaw }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Late Submit</Link>
                  </div>
                ))}
                {pastDueList.length === 0 && (
                   <p className="text-gray-500">No past due assignments!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 transition-colors">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your assignments today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">{stat.trend}</span>
                <span className="text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.path}
                to={feature.path}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            {
              action: 'Generated assignment',
              subject: 'Mathematics - Calculus',
              time: '2 hours ago',
            },
            {
              action: 'Evaluated submission',
              subject: 'Physics - Mechanics',
              time: '5 hours ago',
            },
            {
              action: 'Checked plagiarism',
              subject: 'English - Essay Writing',
              time: '1 day ago',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 py-3 border-b last:border-0 border-gray-100 dark:border-gray-700"
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.subject}</p>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}