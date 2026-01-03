import { Bell, Search, Menu, User, LogOut } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

export default function TopNav() {
  const { toggleSidebar, username, userRole, logout } = useVillageStore();
  const isMobile = Capacitor.isNativePlatform();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getInitials = (name: string | null) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ${isMobile ? 'pt-safe' : ''}`}
    >
      {/* Left: Brand & Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <img src="/ruralens-logo.png" alt="RuraLens Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg tracking-tight hidden md:block">
            RuraLens <span className="text-xs font-normal text-slate-500 ml-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">BETA</span>
          </span>
        </div>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search schemes, reports, or sensors..." 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-white">{username || 'User'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{userRole?.replace('_', ' ')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-white/10 text-xs font-medium text-white">
              {getInitials(username)}
            </div>
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 glass-card overflow-hidden z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white">{username}</p>
                  <p className="text-xs text-slate-500 truncate">{userRole}</p>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors">
                    <User size={14} /> Profile
                  </button>
                  <button 
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}