import { Bell } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function MobileHeader() {
  const { alerts } = useVillageStore();
  
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-slate-900 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50 safe-top">
      <div className="flex items-center gap-2">
        <img src="/ruralens-logo.png" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-white text-lg">RuraLens</span>
      </div>
      <button className="p-2 rounded-full active:bg-white/10 text-slate-300 relative">
        <Bell size={20} />
        {alerts.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
}
