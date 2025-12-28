import { 
  Home, 
  Droplet, 
  Zap, 
  Navigation, 
  Trash2, 
  Sprout,
  Bell,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'water', icon: Droplet, label: 'Water Infrastructure' },
  { id: 'power', icon: Zap, label: 'Power Grid' },
  { id: 'roads', icon: Navigation, label: 'Roads & Transport' },
  { id: 'waste', icon: Trash2, label: 'Waste Management' },
  { id: 'agriculture', icon: Sprout, label: 'Agriculture' },
  { id: 'alerts', icon: Bell, label: 'Alerts & Notifications' },
  { id: 'reports', icon: Users, label: 'Citizen Reports' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, alerts } = useVillageStore();

  const unreadAlerts = alerts.filter(a => a.type === 'critical').length;

  return (
    <aside className={`fixed left-0 top-16 bottom-8 glass-modern shadow-modern transition-all duration-300 z-10 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors shadow-lg border border-slate-600"
      >
        {sidebarCollapsed ? <ChevronRight size={14} className="text-slate-200" /> : <ChevronLeft size={14} className="text-slate-200" />}
      </button>

      {/* Menu Items */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const showBadge = item.id === 'alerts' && unreadAlerts > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-blue' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  {showBadge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse-soft">
                      {unreadAlerts}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
