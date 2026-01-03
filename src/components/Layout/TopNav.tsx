import { Wifi, LogOut, Menu } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { Capacitor } from '@capacitor/core';

export default function TopNav() {
  const { wsConnected, username, userRole, logout, toggleSidebar } = useVillageStore();
  const isMobile = Capacitor.isNativePlatform();

  const getRoleName = () => {
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'field_worker') return 'Field Worker';
    return 'Citizen';
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  return (
    <nav 
      className="h-16 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 flex items-center justify-between px-4 shadow-lg fixed left-0 right-0 z-[9999]"
      style={{
        top: isMobile ? 'constant(safe-area-inset-top)' : '0',
        paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : '0'
      }}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu size={22} className="text-white" strokeWidth={2.5} />
        </button>

        {/* App Logo & Name */}
        <div className="flex items-center space-x-2.5">
          <img 
            src="/ruralens-logo.png" 
            alt="RuraLens" 
            className="w-9 h-9 rounded-lg shadow-md"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div 
            className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md hidden"
          >
            <span className="text-white font-bold text-sm">RL</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-bold text-white leading-tight">
              RuraLens
            </div>
            <div className="text-[10px] text-teal-100 leading-tight font-medium">
              Smart Village System
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Minimalist Icons */}
      <div className="flex items-center space-x-2">
        {/* Connection Status - Minimalist */}
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all backdrop-blur-sm ${
          wsConnected 
            ? 'bg-white/20 hover:bg-white/30' 
            : 'bg-red-500/40 hover:bg-red-500/50'
        }`}>
          <Wifi 
            size={18} 
            className="text-white" 
            strokeWidth={2.5}
          />
        </div>

        {/* User Profile - Minimalist Avatar */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all cursor-pointer">
          <div className="w-7 h-7 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
            <span className="text-white font-bold text-xs">{getInitials(username)}</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[80px]">
              {username}
            </div>
            <div className="text-[9px] text-teal-100 leading-tight font-medium">
              {getRoleName()}
            </div>
          </div>
        </div>

        {/* Logout Button - Minimalist */}
        <button 
          onClick={logout}
          className="flex items-center justify-center w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-red-500/50 rounded-lg transition-all active:scale-95"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}
