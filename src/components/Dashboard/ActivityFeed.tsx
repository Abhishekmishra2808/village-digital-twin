import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';
import { Droplet, Zap, AlertCircle, CheckCircle } from 'lucide-react';

export default function ActivityFeed() {
  const { alerts, waterTanks, powerNodes } = useVillageStore();

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'water': return Droplet;
      case 'power': return Zap;
      default: return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-danger';
      case 'warning': return 'text-warning';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Generate activity items from alerts and sensor data
  const activities = [
    ...alerts.slice(-10).reverse(),
    // Add some sensor activities
    ...waterTanks.filter(t => t.status !== 'good').map(t => ({
      id: `activity-${t.id}`,
      type: t.status === 'critical' ? 'critical' : 'warning',
      title: `${t.name} at ${t.currentLevel.toFixed(1)}%`,
      message: t.status === 'critical' ? 'Critical level' : 'Warning threshold',
      timestamp: new Date().toISOString(),
      category: 'water',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="glass-dark p-5 rounded-xl h-[600px]">
      <h3 className="text-lg font-semibold mb-4">Live Activity Feed</h3>
      
      <div className="space-y-3 overflow-y-auto h-[520px] pr-2">
        {activities.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.category);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg glass hover:bg-white/10 transition-colors"
              >
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${colorClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5">{activity.title}</p>
                  <p className="text-xs text-gray-400 mb-1">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                  activity.type === 'critical' ? 'bg-danger pulse-critical' :
                  activity.type === 'warning' ? 'bg-warning' :
                  'bg-blue-400'
                }`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
