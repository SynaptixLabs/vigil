import React, { useState } from 'react';
import { Sun, Moon, Bell, Mail, Shield, User } from 'lucide-react';
import Toast from '../components/Toast';

interface SettingsProps {
  theme: string;
  toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme }) => {
  const [name, setName] = useState('Avi Rabino');
  const [email, setEmail] = useState('avi@synaptixlabs.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ message: 'Profile saved successfully!', type: 'success' });
  };

  return (
    <div className="ml-64 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              data-testid="settings-input-name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              data-testid="settings-input-email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors" data-testid="settings-btn-save-profile">
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <Sun className="w-5 h-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            data-testid="settings-btn-theme-toggle"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-gray-600'}`} onClick={() => theme === 'dark' && toggleTheme()} data-testid="settings-theme-light">
            <Sun className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-900 dark:text-white">Light</span>
          </div>
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${theme === 'dark' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-200'}`} onClick={() => theme === 'light' && toggleTheme()} data-testid="settings-theme-dark">
            <Moon className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-900 dark:text-white">Dark</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-5 h-5 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Email Notifications', desc: 'Receive task updates via email', state: emailNotifs, setter: setEmailNotifs, testid: 'settings-toggle-email-notifs', icon: <Mail className="w-4 h-4 text-gray-400" /> },
            { label: 'Push Notifications', desc: 'Browser push notifications', state: pushNotifs, setter: setPushNotifs, testid: 'settings-toggle-push-notifs', icon: <Bell className="w-4 h-4 text-gray-400" /> },
            { label: 'Weekly Digest', desc: 'Summary email every Monday', state: weeklyDigest, setter: setWeeklyDigest, testid: 'settings-toggle-digest', icon: <Shield className="w-4 h-4 text-gray-400" /> },
          ].map(item => (
            <div key={item.testid} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => item.setter(!item.state)}
                data-testid={item.testid}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  item.state ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.state ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Settings;
