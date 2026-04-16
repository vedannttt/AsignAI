import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  Key,
  Upload,
  CheckCircle2,
  Shield,
  MessageSquare,
  Copy,
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Moon,
  Sun,
  Users,
  Bot,
  Plus,
  Timer,
  GitPullRequestDraft,
  LineChart,
  ListChecks,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['teacher', 'student'] },
  { icon: FileText, label: 'Assignment Generator', path: '/dashboard/assignment-generator', roles: ['teacher'] },
  { icon: Key, label: 'Answer Key Generator', path: '/dashboard/answer-key-generator', roles: ['teacher'] },
  { icon: Upload, label: 'Upload Assignment', path: '/dashboard/upload', roles: ['teacher', 'student'] },
  { icon: CheckCircle2, label: 'Evaluation', path: '/dashboard/evaluation', roles: ['teacher'] },
  { icon: ListChecks, label: 'Rubric Builder', path: '/dashboard/rubric-builder', roles: ['teacher'] },
  { icon: LineChart, label: 'Class Insights', path: '/dashboard/class-insights', roles: ['teacher'] },
  { icon: Users, label: 'Student Submissions', path: '/dashboard/student-submissions', roles: ['teacher'] },
  { icon: Shield, label: 'Plagiarism Checker', path: '/dashboard/plagiarism-checker', roles: ['teacher'] },
  { icon: MessageSquare, label: 'Feedback', path: '/dashboard/feedback', roles: ['student'] },
  { icon: Copy, label: 'Copy Detection', path: '/dashboard/copy-detection', roles: ['teacher'] },
  { icon: Bot, label: 'Doubt Solver Bot', path: '/dashboard/doubt-solver', roles: ['student'] },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false); // desktop Youtube-style
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dynamicNotifications, setDynamicNotifications] = useState<any[]>([]);
  const [toastNotif, setToastNotif] = useState<{ id: number, text: string } | null>(null);
  const [urgentDeadline, setUrgentDeadline] = useState<{title: string, msRemaining: number} | null>(null);

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Redirect to signin if no user - using useEffect
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const updateNotifs = () => {
      const notifsStr = localStorage.getItem('global_notifications');
      if (notifsStr && user) {
         const notifs = JSON.parse(notifsStr);
         const relevant = notifs.filter((n: any) => n.uploaderRole !== user.role);
         setDynamicNotifications(relevant);

         if (relevant.length > 0) {
            const latest = relevant[0];
            const isRecent = (Date.now() - new Date(latest.time).getTime()) < 5000;
            const seenFlagStr = localStorage.getItem('seen_notifs') || '[]';
            const seen = JSON.parse(seenFlagStr);
            if (isRecent && !seen.includes(latest.id)) {
               setToastNotif({ id: latest.id, text: latest.text });
               seen.push(latest.id);
               localStorage.setItem('seen_notifs', JSON.stringify(seen));
               setTimeout(() => setToastNotif(prev => prev?.id === latest.id ? null : prev), 5000);
            }
         }
      }
    };
    updateNotifs();
    window.addEventListener('storage', updateNotifs);
    return () => window.removeEventListener('storage', updateNotifs);
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'student') {
       const fetchDeadlines = async () => {
          let offlineAsgs: any[] = [];
          try {
             const offStr = localStorage.getItem('student_assignments');
             if (offStr) offlineAsgs = JSON.parse(offStr);
          } catch(e) {}
             
          let teacherAsgs: any[] = [];
          let studentSubmissions: any[] = [];

          try {
             const res = await fetch('http://localhost:5000/api/assignments');
             const data = await res.json();
             if (Array.isArray(data)) {
                 teacherAsgs = [...teacherAsgs, ...data.filter((a: any) => a.uploaderRole === 'teacher')];
                 studentSubmissions = [...studentSubmissions, ...data.filter((a: any) => a.uploaderRole === 'student' && a.studentName === user.name)];
             }
          } catch(e) {}

          if (Array.isArray(offlineAsgs)) {
              teacherAsgs = [...teacherAsgs, ...offlineAsgs.filter((a: any) => a.uploaderRole === 'teacher')];
              studentSubmissions = [...studentSubmissions, ...offlineAsgs.filter((a: any) => a.uploaderRole === 'student' && a.studentName === user.name)];
          }
             
          let nearest: any = null;
          let minTime = Infinity;
          const now = Date.now();
             
          // Get past submissions so we don't alert for completed tasks
          const submittedTitles = studentSubmissions.map((s: any) => s.targetAssignment || s.name);
          const pendingAsgs = teacherAsgs.filter((a: any) => !submittedTitles.includes(a.name));

          pendingAsgs.forEach((a: any) => {
              if (a.dueDateRaw) {
                  const tgt = new Date(a.dueDateRaw).getTime();
                  const diff = tgt - now;
                  // Check if <= 5 hours (5 * 60 * 60 * 1000 = 18000000 ms) and > 0
                  if (diff > 0 && diff <= 18000000 && diff < minTime) {
                      minTime = diff;
                      nearest = { title: a.name, msRemaining: diff };
                  }
              }
          });
          setUrgentDeadline(nearest);
       };
       fetchDeadlines();
       const interval = setInterval(fetchDeadlines, 60000); // Check every minute
       return () => clearInterval(interval);
    }
  }, [user?.role]);

  // Show loading state while redirecting
  if (!user) {
    return null;
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role as string)
  );

  const handleSignOut = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const mockSearchResults = user.role === 'teacher' 
    ? [
        { type: 'Student', name: 'Alice Smith' },
        { type: 'Student', name: 'Bob Johnson' },
        { type: 'Assignment', name: 'Cloud Computing (CC)' },
        { type: 'Assignment', name: 'Software testing and quality assurance (STQA)' },
        { type: 'Assignment', name: 'Probabilistic Graphical Model (PGM)' },
        { type: 'Assignment', name: 'Software Computing (SC)' },
        { type: 'Assignment', name: 'Startup planing development (MDM)' },
        { type: 'Assignment', name: 'Physics - Vectors' },
      ]
    : [
        { type: 'Assignment', name: 'Cloud Computing (CC)' },
        { type: 'Assignment', name: 'Software testing and quality assurance (STQA)' },
        { type: 'Assignment', name: 'Probabilistic Graphical Model (PGM)' },
        { type: 'Assignment', name: 'Software Computing (SC)' },
        { type: 'Assignment', name: 'Startup planing development (MDM)' },
      ];

  const staticNotifications = user.role === 'teacher' 
    ? [
        { text: 'A student completed Physics Quiz.', time: '1 hour ago' },
        { text: 'System Update: New evaluations available.', time: '2 hours ago' },
      ]
    : [
        { text: 'Your English Essay has been evaluated.', time: '1 day ago' },
      ];

  const notifications = [
     ...dynamicNotifications.map(n => ({ text: n.text, time: new Date(n.time).toLocaleTimeString() })),
     ...staticNotifications
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-purple-600 via-violet-600 to-indigo-700 text-white flex flex-col z-50 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 ' + (isDesktopExpanded ? 'w-64' : 'w-20')
        }`}
      >
        <button 
          onClick={() => {
             if (window.innerWidth < 1024) {
                 setIsSidebarOpen(!isSidebarOpen);
             } else {
                 setIsDesktopExpanded(!isDesktopExpanded);
             }
          }}
          className={`p-6 flex items-center gap-3 text-left focus:outline-none hover:bg-white/5 transition-colors ${isDesktopExpanded ? '' : 'justify-center'}`}
        >
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {(isDesktopExpanded || isSidebarOpen) && (
            <div className="whitespace-nowrap overflow-hidden origin-left transition-all duration-300">
              <h1 className="font-semibold text-lg">AI Assignment Agent</h1>
              <p className="text-xs text-purple-200">Powered by AI</p>
            </div>
          )}
        </button>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isDesktopExpanded && !isSidebarOpen ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl transition-all ${isDesktopExpanded || isSidebarOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center mx-2'} ${
                  isActive
                    ? 'bg-white text-purple-600 shadow-lg shadow-purple-500/20'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(isDesktopExpanded || isSidebarOpen) && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-white/10 backdrop-blur">
          <button onClick={handleSignOut} className={`w-full flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors ${isDesktopExpanded || isSidebarOpen ? 'justify-center' : 'justify-center'}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(isDesktopExpanded || isSidebarOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border dark:border-gray-800 z-[60]">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5 dark:text-gray-200" />
                  ) : (
                    <Menu className="w-5 h-5 dark:text-gray-200" />
                  )}
                </button>
              </div>

              {/* Middle: Search */}
              <div className="flex-1 flex justify-center mx-4 group">
                <div className="relative w-full max-w-md focus-within:max-w-2xl transition-all duration-500 ease-out z-50">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => {
                        if (searchQuery.length > 0) setIsSearchOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(e.target.value.length > 0);
                    }}
                    placeholder={user.role === 'teacher' ? "Search for student or assignment..." : "Search for assignment..."}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100/80 dark:bg-gray-800/80 border border-transparent focus:border-purple-500/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:bg-white dark:focus:bg-gray-900 transition-all dark:text-gray-200 shadow-sm focus:shadow-lg focus:shadow-purple-500/5"
                  />
                  {isSearchOpen && searchQuery && (
                    <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-2">
                      {mockSearchResults.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((result, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            if (user.role === 'student') navigate('/dashboard/upload');
                            else navigate(result.type === 'Student' ? '/dashboard/evaluation' : '/dashboard/assignment-generator');
                          }}
                          className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">{result.type}</span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{result.name}</p>
                        </div>
                      ))}
                      {mockSearchResults.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">No results found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Ticker, Create Button, Bell, Dark Mode, Profile */}
              <div className="flex items-center gap-3">
                {/* Ticker for Students */}
                {user.role === 'student' && urgentDeadline && (
                   <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-full animate-pulse">
                      <Timer className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                         Due Soon: {urgentDeadline.title} ({Math.ceil(urgentDeadline.msRemaining / 3600000)}h left)
                      </span>
                   </div>
                )}

                {/* Universal Submit Button for Students */}
                {user.role === 'student' && (
                   <Link to="/dashboard/upload" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300">
                      <Upload className="w-5 h-5" />
                      <span>Submit</span>
                   </Link>
                )}

                {/* Universal Create Button for Teachers */}
                {user.role === 'teacher' && (
                   <Link to="/dashboard/assignment-generator" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300">
                      <Plus className="w-5 h-5" />
                      <span>Create</span>
                   </Link>
                )}
                
                <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] group"
                    >
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 transition-colors" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    </button>
                    {isNotificationsOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20">
                          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          </div>
                          <div className="max-h-80 overflow-y-auto">
                            {notifications.map((notif, i) => (
                              <div key={i} className="p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors">
                                <p className="text-sm text-gray-800 dark:text-gray-200">{notif.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      document.documentElement.classList.toggle('dark');
                    }}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] group"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-amber-500 transition-colors" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 transition-colors" />}
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="hidden sm:flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 p-1.5 pr-3 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group ring-1 ring-transparent hover:ring-purple-500/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-purple-500/30 group-hover:scale-105 transition-transform">
                      {user.avatar}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium dark:text-gray-200">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 animate-in slide-in-from-top-2 duration-200">
                        {/* User Info */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                              {user.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link to="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          <Link to="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
              {/* Role Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'teacher' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
              </div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>

      {toastNotif && (
        <div className="fixed bottom-4 right-4 z-[100] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-purple-200 dark:border-purple-900/50 animate-in slide-in-from-bottom-5">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                 <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                 <h4 className="text-sm font-semibold text-gray-900 dark:text-white">New Notification</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-400">{toastNotif.text}</p>
              </div>
              <button onClick={() => setToastNotif(null)} className="ml-4 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <X className="w-4 h-4 text-gray-500" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}