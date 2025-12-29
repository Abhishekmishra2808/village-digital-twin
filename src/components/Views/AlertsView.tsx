import { useVillageStore } from '../../store/villageStore';
import { Bell, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AlertsView() {
  const { alerts, waterTanks, powerNodes } = useVillageStore();

  // Generate comprehensive alerts
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const infoAlerts = alerts.filter(a => a.type === 'info');

  // Add infrastructure-based alerts
  const criticalTanks = waterTanks.filter(t => t.status === 'critical');
  const warningTanks = waterTanks.filter(t => t.status === 'warning');
  const criticalPower = powerNodes.filter(p => p.status === 'critical');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertCircle;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border-2 border-red-200">
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-sm text-gray-600">Critical Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{criticalAlerts.length + criticalTanks.length + criticalPower.length}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border-2 border-yellow-200">
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="text-yellow-600" size={24} />
            <h3 className="text-sm text-gray-600">Warnings</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{warningAlerts.length + warningTanks.length}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <Info className="text-blue-600" size={24} />
            <h3 className="text-sm text-gray-600">Info</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{infoAlerts.length}</p>
        </div>
      </div>

      {/* Critical Infrastructure Alerts */}
      {(criticalTanks.length > 0 || criticalPower.length > 0) && (
        <div className="bg-white p-5 rounded-xl border-2 border-red-300">
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            Critical Infrastructure Issues
          </h3>
          <div className="space-y-3">
            {criticalTanks.map(tank => (
              <div key={tank.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">💧 {tank.name}</p>
                    <p className="text-sm text-gray-700">Water level critically low: {tank.currentLevel.toFixed(1)}%</p>
                  </div>
                  <span className="text-xs text-gray-500">Now</span>
                </div>
              </div>
            ))}
            {criticalPower.map(node => (
              <div key={node.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">⚡ {node.name}</p>
                    <p className="text-sm text-gray-700">Overload: {((node.currentLoad / node.capacity) * 100).toFixed(1)}% capacity</p>
                  </div>
                  <span className="text-xs text-gray-500">Now</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Alerts Timeline */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="mr-2" size={20} />
          Alert Timeline
        </h3>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell size={48} className="mx-auto mb-2 opacity-50" />
              <p>No alerts at this time</p>
            </div>
          ) : (
            alerts.slice().reverse().map((alert) => {
              const Icon = getAlertIcon(alert.type);
              const colorClass = alert.type === 'critical' ? 'bg-red-50 border-red-300 text-red-700' :
                                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                                'bg-blue-50 border-blue-300 text-blue-700';

              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${colorClass} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon size={20} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <span className="text-xs opacity-75">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1 capitalize">Category: {alert.category}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
