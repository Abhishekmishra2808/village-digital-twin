import { Cloud, Wifi, User, LogOut, Menu } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

export default function TopNav() {
  const { wsConnected, kpis, username, userRole, logout, toggleSidebar } = useVillageStore();

  const getRoleName = () => {
    if (userRole === 'admin') return 'Administrator';
    if (userRole === 'field_worker') return 'Field Worker';
    return 'Citizen';
  };

  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-6 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        {/* App Name */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-lg md:text-2xl font-semibold text-gray-900">
            RuraLens
          </div>
          <div className="hidden sm:block text-xs md:text-sm text-gray-500">
            Smart Village Management
          </div>
        </div>
      </div>

      {/* Right Section - System Health Indicators */}
      <div className="flex items-center space-x-2 md:space-x-6">
        {/* Current Time - Hidden on small screens */}
        <div className="hidden lg:flex items-center space-x-2">
          <Cloud size={18} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {format(new Date(), 'PPp')}
          </span>
        </div>

        {/* Infrastructure Health - Hidden on small screens */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">
            <span className="hidden lg:inline">Health: </span>
            <span className="font-semibold text-green-600">{kpis.infrastructureHealth}%</span>
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <Wifi 
            size={16} 
            className={wsConnected ? 'text-green-500' : 'text-red-500'} 
          />
          <span className={`hidden sm:inline text-xs md:text-sm ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
          <User size={16} className="text-gray-600" />
          <span className="hidden sm:inline text-xs md:text-sm text-gray-700 font-medium truncate max-w-[80px] md:max-w-none">{username}</span>
          <span className="hidden md:inline text-xs text-gray-500">({getRoleName()})</span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline text-xs md:text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
}
