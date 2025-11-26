import { Home, Briefcase, Map, Bell, Menu } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function MobileNav() {
  const { activeView, setActiveView, toggleSidebar } = useVillageStore();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'schemes', icon: Briefcase, label: 'Schemes' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'reports', icon: Bell, label: 'Reports' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* More Menu Button (Triggers existing sidebar logic if needed for extra settings) */}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-400"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </div>
  );
}
