import { 
  Home, 
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Map,
  Leaf,
  Briefcase,
  Shield,
  Network
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'map', icon: Map, label: '3D Map View' },
  { id: 'schemes', icon: Briefcase, label: 'Government Schemes' },
  { id: 'anonymous-reports', icon: Shield, label: 'Citizen Reports' },
  { id: 'impact-predictor', icon: Network, label: 'Village Analyzer' },
  { id: 'environment', icon: Leaf, label: 'Environment Monitor' },
  { id: 'alerts', icon: Bell, label: 'Alerts & Notifications' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, alerts, userRole } = useVillageStore();

  const unreadAlerts = alerts.filter(a => a.type === 'critical').length;

  // Filter menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'field_worker') {
      // Field workers see limited menu
      return menuItems.filter(item => 
        ['dashboard', 'map', 'anonymous-reports', 'settings'].includes(item.id)
      );
    }
    if (userRole === 'user') {
      // Citizens see basic menu including anonymous reports
      return menuItems.filter(item => 
        ['dashboard', 'map', 'schemes', 'anonymous-reports', 'environment', 'settings'].includes(item.id)
      );
    }
    // Admin sees all
    return menuItems;
  };

  const handleMenuClick = (itemId: string) => {
    setActiveView(itemId);
    // On mobile, close sidebar after clicking
    if (window.innerWidth < 768 && !sidebarCollapsed) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay - Only visible when sidebar is open on mobile */}
      {!sidebarCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 top-16 bottom-8"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar - Always render content, just hide/show the container */}
      <aside 
        className={`fixed left-0 bottom-8 bg-slate-900/50 backdrop-blur-md border-r border-white/10 shadow-xl transition-transform duration-300 z-30 ${
          sidebarCollapsed 
            ? '-translate-x-full md:translate-x-0 md:w-16' 
            : 'translate-x-0 w-64'
        }`}
        style={{
          top: 'calc(64px + env(safe-area-inset-top, 0px))'
        }}
      >
        {/* Toggle Button - Desktop Only */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-blue-600 rounded-full items-center justify-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 z-50"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} className="text-white" />
          ) : (
            <ChevronLeft size={14} className="text-white" />
          )}
        </button>

        {/* Menu Items - ALWAYS RENDERED */}
        <nav className="p-2 space-y-1 overflow-y-auto h-full">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const showBadge = item.id === 'alerts' && unreadAlerts > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left whitespace-nowrap">
                      {item.label}
                    </span>
                    {showBadge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full flex-shrink-0">
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
    </>
  );
}
