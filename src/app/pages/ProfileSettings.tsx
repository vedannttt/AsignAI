import { useState } from 'react';
import { User, Mail, Shield, Bell, Key, Settings, CreditCard, HelpCircle } from 'lucide-react';

export function ProfileSettings() {
  const userStr = localStorage.getItem('user');
  const [user, setUser] = useState(userStr ? JSON.parse(userStr) : null);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  const settingsOptions = [
    { id: 'profile', icon: User, label: 'Personal Information', desc: 'Update your basic profile details' },
    { id: 'preferences', icon: Settings, label: 'App Preferences', desc: 'Theme, default difficulty, and grading styles' },
    { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Email and push notification rules' },
    { id: 'security', icon: Shield, label: 'Privacy & Security', desc: 'Manage your password and security questions' },
    { id: 'apiKeys', icon: Key, label: 'API Integrations', desc: 'Manage connections to Canvas or Blackboard' },
    { id: 'billing', icon: CreditCard, label: 'Subscription', desc: 'View billing history and plans' },
    { id: 'support', icon: HelpCircle, label: 'Help & Support', desc: 'Get assistance and view documentation' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto dark:text-gray-200">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-2">
          {settingsOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeTab === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setActiveTab(opt.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left ${isActive ? 'bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium ${isActive ? 'text-purple-700 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>{opt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                  {user?.avatar}
                </div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" value={user?.name || ''} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={user?.email || ''} onChange={(e) => setUser({...user, email: e.target.value})} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <input type="text" disabled defaultValue={user?.role} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 rounded-xl cursor-not-allowed capitalize dark:text-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department / Institution</label>
                  <input type="text" value={user?.institution || ''} onChange={(e) => setUser({...user, institution: e.target.value})} placeholder="e.g. Science Dept, University of X" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button className="px-5 py-2.5 rounded-xl font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/30">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">Settings panel for {activeTab.toUpperCase()} is mocked for demonstration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
