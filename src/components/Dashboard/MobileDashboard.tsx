import { useVillageStore } from '../../store/villageStore';
import { Droplets, Zap, AlertTriangle, Activity, ArrowRight } from 'lucide-react';

export default function MobileDashboard() {
  const { kpis, alerts, setActiveView, userRole } = useVillageStore();

  // Quick stats for mobile
  const stats = [
    { 
      label: 'Water Level', 
      value: '85%', 
      icon: Droplets, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      view: 'water'
    },
    { 
      label: 'Power Grid', 
      value: 'Stable', 
      icon: Zap, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10',
      view: 'power'
    },
    { 
      label: 'Active Alerts', 
      value: alerts.length.toString(), 
      icon: AlertTriangle, 
      color: 'text-orange-400', 
      bg: 'bg-orange-500/10',
      view: 'alerts'
    },
    { 
      label: 'Sensors', 
      value: kpis.activeSensors.toString(), 
      icon: Activity, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      view: 'analytics'
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-sm text-slate-400">Village Status Monitor</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <img src="/ruralens-logo.png" alt="Logo" className="h-6 w-6" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveView(stat.view)}
            className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-transform text-left"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
          <button 
            onClick={() => setActiveView('alerts')}
            className="text-xs text-blue-400 font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 text-center text-slate-500 text-sm">
              No active alerts
            </div>
          ) : (
            alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  alert.type === 'critical' ? 'bg-red-500' : 
                  alert.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div>
                  <h3 className="text-sm font-medium text-white">{alert.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.message}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <ActionRow 
            label="Report an Issue" 
            desc="Roads, Water, Waste..." 
            onClick={() => setActiveView('reports')} 
          />
          <ActionRow 
            label="View Government Schemes" 
            desc="Track progress & funds" 
            onClick={() => setActiveView('schemes')} 
          />
          {userRole === 'admin' && (
            <ActionRow 
              label="Admin Controls" 
              desc="Manage village settings" 
              onClick={() => setActiveView('settings')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ActionRow({ label, desc, onClick }: { label: string, desc: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between active:bg-slate-800 transition-colors"
    >
      <div className="text-left">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <ArrowRight size={16} className="text-slate-500" />
    </button>
  );
}
