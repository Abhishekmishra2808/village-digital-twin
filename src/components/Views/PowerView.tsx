import { useVillageStore } from '../../store/villageStore';
import { Zap, Activity } from 'lucide-react';

export default function PowerView() {
  const { powerNodes, setSelectedAsset } = useVillageStore();

  const totalCapacity = powerNodes.reduce((sum, node) => sum + node.capacity, 0);
  const totalLoad = powerNodes.reduce((sum, node) => sum + node.currentLoad, 0);
  const avgUtilization = (totalLoad / totalCapacity) * 100;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-yellow-600" size={24} />
            <h3 className="text-sm text-gray-600">Total Capacity</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalCapacity} kW</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="text-blue-600" size={24} />
            <h3 className="text-sm text-gray-600">Current Load</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalLoad} kW</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-green-600" size={24} />
            <h3 className="text-sm text-gray-600">Avg Utilization</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgUtilization.toFixed(1)}%</p>
        </div>
      </div>

      {/* Power Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerNodes.map((node) => {
          const loadPercent = (node.currentLoad / node.capacity) * 100;
          const statusColor = loadPercent > 95 ? 'text-red-600' : loadPercent > 80 ? 'text-yellow-600' : 'text-green-600';
          const bgColor = loadPercent > 95 ? 'from-red-50' : loadPercent > 80 ? 'from-yellow-50' : 'from-green-50';

          return (
            <button
              key={node.id}
              onClick={() => setSelectedAsset({ type: 'powerNode', data: node })}
              className={`bg-white p-5 rounded-xl hover:shadow-md transition-shadow cursor-pointer text-left border border-gray-200 bg-gradient-to-br ${bgColor} to-white`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{node.name}</h3>
                  <p className={`text-sm ${statusColor} font-medium`}>
                    ● {node.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>

              {/* Load Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Load</span>
                  <span className="font-bold text-gray-900">{loadPercent.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      loadPercent > 95 ? 'bg-red-500' :
                      loadPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Capacity</p>
                  <p className="font-medium text-gray-900">{node.capacity} kW</p>
                </div>
                <div>
                  <p className="text-gray-600">Current</p>
                  <p className="font-medium text-gray-900">{node.currentLoad} kW</p>
                </div>
                <div>
                  <p className="text-gray-600">Voltage</p>
                  <p className="font-medium text-gray-900">{node.voltage} V</p>
                </div>
                <div>
                  <p className="text-gray-600">Temp</p>
                  <p className="font-medium text-gray-900">{node.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
