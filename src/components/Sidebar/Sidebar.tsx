import { 
  Home, 
  Droplet, 
  Zap, 
  Sprout,
  Bell,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Map,
  Leaf,
  CloudRain,
  Briefcase
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'map', icon: Map, label: '3D Map View' },
  { id: 'schemes', icon: Briefcase, label: 'Government Schemes' },
  { id: 'water', icon: Droplet, label: 'Water Infrastructure' },
  { id: 'power', icon: Zap, label: 'Power Grid' },
  { id: 'agriculture', icon: Sprout, label: 'Agriculture' },
  { id: 'environment', icon: Leaf, label: 'Environment Monitor' },
  { id: 'flood', icon: CloudRain, label: 'Flood Prediction' },
  { id: 'alerts', icon: Bell, label: 'Alerts & Notifications' },
  { id: 'reports', icon: Users, label: 'Citizen Reports' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, alerts, userRole } = useVillageStore();

  const unreadAlerts = alerts.filter(a => a.type === 'critical').length;

  // Filter menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'field_worker') {
      // Field workers see limited menu - only Dashboard, 3D Map View, and Settings
      return menuItems.filter(item => 
        ['dashboard', 'map', 'settings'].includes(item.id)
      );
    }
    if (userRole === 'user') {
      // Citizens see basic menu (no roads and waste)
      return menuItems.filter(item => 
        ['dashboard', 'map', 'schemes', 'water', 'power', 'environment', 'flood', 'reports', 'settings'].includes(item.id)
      );
    }
    // Admin sees all except roads and waste (removed from admin view)
    return menuItems;
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-8 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-10 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg"
      >
        {sidebarCollapsed ? <ChevronRight size={14} className="text-white" /> : <ChevronLeft size={14} className="text-white" />}
      </button>

      {/* Menu Items */}
      <nav className="p-2 space-y-1">
        {getMenuItems().map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const showBadge = item.id === 'alerts' && unreadAlerts > 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
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
