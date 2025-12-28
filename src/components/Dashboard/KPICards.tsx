import { TrendingUp, TrendingDown, Activity, AlertCircle, Clock } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function KPICards() {
  const { kpis, citizenReports } = useVillageStore();

  const cards = [
    {
      title: 'Infrastructure Health',
      value: `${kpis.infrastructureHealth}%`,
      change: '+2%',
      trend: 'up',
      icon: Activity,
      color: 'text-success',
    },
    {
      title: 'Active Sensors',
      value: kpis.activeSensors,
      subtext: `${kpis.offlineSensors} offline`,
      icon: AlertCircle,
      color: kpis.offlineSensors > 0 ? 'text-warning' : 'text-success',
    },
    {
      title: 'Citizen Reports',
      value: citizenReports.length,
      subtext: `${kpis.pendingReports} pending`,
      icon: AlertCircle,
      color: kpis.pendingReports > 3 ? 'text-danger' : 'text-warning',
    },
    {
      title: 'Avg Response Time',
      value: `${kpis.avgResponseTime}hrs`,
      change: '-15%',
      trend: 'down',
      icon: Clock,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <div key={index} className="bg-card hover:bg-card-hover p-6 rounded-2xl smooth-transition shadow-modern border border-slate-700/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2 font-medium">{card.title}</p>
                <p className="text-3xl font-bold mb-3 text-white">{card.value}</p>
                {card.change && (
                  <div className={`flex items-center text-sm ${card.color}`}>
                    <TrendIcon size={16} className="mr-1" />
                    <span className="font-medium">{card.change} vs last week</span>
                  </div>
                )}
                {card.subtext && (
                  <p className={`text-sm ${card.color} font-medium`}>
                    ⚠ {card.subtext}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.color === 'text-success' ? 'bg-green-500/20' : card.color === 'text-warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                <Icon size={24} className={card.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
