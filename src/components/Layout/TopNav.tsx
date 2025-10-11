import { Cloud, Wifi, User } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

export default function TopNav() {
  const { wsConnected, kpis } = useVillageStore();

  return (
    <nav className="h-16 glass-modern border-b border-slate-700/50 flex items-center justify-between px-6 shadow-modern">
      {/* Village Name */}
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-gradient-blue">
          Sundarpur Digital Twin
        </div>
        <div className="text-sm text-slate-400">
          Maharashtra, India
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="flex items-center space-x-6">
        {/* Current Time */}
        <div className="flex items-center space-x-2">
          <Cloud size={18} className="text-slate-400" />
          <span className="text-sm text-slate-300">
            {format(new Date(), 'PPp')}
          </span>
        </div>

        {/* Infrastructure Health */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft shadow-glow-green" />
          <span className="text-sm text-slate-300">
            Health: <span className="font-semibold text-green-400">{kpis.infrastructureHealth}%</span>
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <Wifi 
            size={18} 
            className={wsConnected ? 'text-green-400' : 'text-red-400'} 
          />
          <span className={`text-sm ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors border border-slate-600/50">
          <User size={18} className="text-slate-300" />
          <span className="text-sm text-slate-200">Admin</span>
        </div>
      </div>
    </nav>
  );
}
