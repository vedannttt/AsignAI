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
  Timer,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Generate Assignment',
    description: 'AI-powered creation',
    path: '/dashboard/assignment-generator',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Upload,
    title: 'Upload Assignment',
    description: 'Upload for evaluation',
    path: '/dashboard/upload',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: MessageSquare,
    title: 'Provide Feedback',
    description: 'Send to students',
    path: '/dashboard/student-submissions',
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Key,
    title: 'Answer Key',
    description: 'Auto-generate keys',
    path: '/dashboard/answer-key-generator',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: CheckCircle2,
    title: 'Evaluate Work',
    description: 'AI-powered grading',
    path: '/dashboard/evaluation',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Plagiarism Check',
    description: 'Ensure originality',
    path: '/dashboard/plagiarism-checker',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  {
    icon: Copy,
    title: 'Copy Detection',
    description: 'Similarity analysis',
    path: '/dashboard/copy-detection',
    bgColor: 'bg-teal-100',
    iconColor: 'text-teal-600',
  },
];

const stats = [
  { label: 'Assignments Created', value: '24', icon: FileText, trend: '+15% vs last month', trendColor: 'text-green-500', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { label: 'Students Evaluated', value: '156', icon: CheckCircle2, trend: '+8% vs last month', trendColor: 'text-green-500', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { label: 'Avg. Class Grade', value: '78%', icon: TrendingUp, trend: '+5% vs last month', trendColor: 'text-green-500', iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { label: 'Hours Saved', value: '46', icon: Clock, trend: '+20% vs last month', trendColor: 'text-green-500', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
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

  // Teacher Dashboard
  return (
    <div className="p-4 lg:p-8 space-y-6 transition-colors bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          Welcome back, Dr. {firstName}! 👋
        </h1>
        <p className="text-slate-500 text-sm">
          Here's what's happening with your classes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col">
                <p className="text-xs text-slate-500 font-semibold mb-3">{stat.label}</p>
                <div className="flex items-center justify-between mb-3">
                   <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                   <div className={`w-10 h-10 ${stat.iconBg} rounded-[10px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                     <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                   </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wide">
                  <TrendingUp className={`w-3 h-3 ${stat.trendColor}`} />
                  <span className={stat.trendColor}>{stat.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
             <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center">View All <ChevronRight className="w-4 h-4 ml-0.5"/></button>
          </div>
          <div className="space-y-6 flex-1">
            {[
              { action: 'Generated assignment', subject: 'Mathematics - Calculus', time: '2 hours ago', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
              { action: 'Evaluated submission', subject: 'Physics - Mechanics', time: '5 hours ago', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
              { action: 'Checked plagiarism', subject: 'English - Essay Writing', time: '1 day ago', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-50' },
              { action: 'Upload assignment', subject: 'History - Chapter 4', time: '1 day ago', icon: Upload, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((activity, index) => {
               const ActIcon = activity.icon;
               return (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center shrink-0`}>
                   <ActIcon className={`w-4 h-4 ${activity.color}`}/>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{activity.action}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{activity.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{activity.time}</p>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Quick Actions Array grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-transparent hover:border-slate-200 transition-all hover:bg-slate-100 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bgColor} ${feature.iconColor} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">{feature.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}