import { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Database, 
  Monitor,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function SettingsView() {
  const { userRole, username } = useVillageStore();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      criticalAlerts: true,
      dailyReport: true,
    },
    display: {
      theme: 'dark',
      language: 'en',
      timezone: 'Asia/Kolkata',
      mapStyle: 'satellite',
      autoRefresh: true,
      refreshInterval: 5,
    },
    privacy: {
      shareLocation: false,
      analyticsTracking: true,
      publicProfile: userRole === 'user',
    },
  });

  const tabs = [
    { id: 'general', icon: Settings, label: 'General' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'display', icon: Monitor, label: 'Display' },
    { id: 'privacy', icon: Lock, label: 'Privacy' },
    { id: 'data', icon: Database, label: 'Data Management' },
  ];

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your preferences and account settings</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-white rounded-xl p-4 h-fit border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl p-8 border border-gray-200">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      value="RuraLens"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value="Configurable"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      value={settings.display.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, timezone: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{username}</h3>
                    <p className="text-gray-600 capitalize">{userRole?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-gray-900 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'sms' && 'Receive SMS alerts for critical issues'}
                          {key === 'push' && 'Browser push notifications'}
                          {key === 'criticalAlerts' && 'Immediate alerts for critical infrastructure issues'}
                          {key === 'dailyReport' && 'Daily summary report at 9:00 AM'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, [key]: e.target.checked }
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Display Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, theme: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Style
                    </label>
                    <select
                      value={settings.display.mapStyle}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, mapStyle: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                    >
                      <option value="satellite">Satellite</option>
                      <option value="streets">Streets</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Refresh Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={settings.display.refreshInterval}
                      onChange={(e) => setSettings({
                        ...settings,
                        display: { ...settings.display, refreshInterval: parseInt(e.target.value) }
                      })}
                      min="1"
                      max="60"
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Management</h2>
                
                <div className="grid gap-4">
                  <button className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-all">
                    <Download size={20} />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Export Data</p>
                      <p className="text-sm text-blue-600">Download all infrastructure data as CSV/JSON</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 hover:bg-purple-100 transition-all">
                    <Upload size={20} />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Import Data</p>
                      <p className="text-sm text-purple-600">Upload sensor data or configuration files</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-100 transition-all">
                    <RefreshCw size={20} />
                    <div className="text-left flex-1">
                      <p className="font-semibold">Reset Dashboard</p>
                      <p className="text-sm text-orange-600">Reset all views to default configuration</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                <Save size={20} />
                Save Changes
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
