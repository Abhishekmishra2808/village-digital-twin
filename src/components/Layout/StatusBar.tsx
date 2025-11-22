import { Wifi, Activity, Server, ShieldCheck } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function StatusBar() {
  const { userRole } = useVillageStore();

  return (
    <footer className="h-8 bg-slate-950 border-t border-white/10 flex items-center justify-between px-4 text-[10px] text-slate-500 select-none z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-emerald-500 font-medium">System Online</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-help">
          <Server size={10} />
          <span>v2.4.0-beta</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-help">
          <Wifi size={10} />
          <span>14ms latency</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-1.5">
          <Activity size={10} />
          <span>CPU: 12%</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={10} />
          <span className="capitalize">{userRole?.replace('_', ' ')} Mode</span>
        </div>
        
        <div className="text-slate-600">
          &copy; 2024 RuraLens
        </div>
      </div>
    </footer>
  );
}