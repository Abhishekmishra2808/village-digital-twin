import { TrendingUp, TrendingDown, Activity, AlertCircle, Clock } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function KPICards() {
  const { kpis } = useVillageStore();

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
      title: 'Pending Reports',
      value: kpis.pendingReports,
      subtext: 'Anonymous reports',
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
          <div key={index} className="bg-white hover:shadow-md p-6 rounded-xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2 font-medium">{card.title}</p>
                <p className="text-3xl font-bold mb-3 text-gray-900">{card.value}</p>
                {card.change && (
                  <div className={`flex items-center text-sm ${
                    card.color === 'text-success' ? 'text-green-600' : 
                    card.color === 'text-warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    <TrendIcon size={16} className="mr-1" />
                    <span className="font-medium">{card.change} vs last week</span>
                  </div>
                )}
                {card.subtext && (
                  <p className={`text-sm font-medium ${
                    card.color === 'text-success' ? 'text-green-600' : 
                    card.color === 'text-warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    ⚠ {card.subtext}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                card.color === 'text-success' ? 'bg-green-50 text-green-600' : 
                card.color === 'text-warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
              }`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
