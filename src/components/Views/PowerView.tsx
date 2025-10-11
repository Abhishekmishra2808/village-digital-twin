import { useVillageStore } from '../../store/villageStore';
import { Zap, Activity } from 'lucide-react';

export default function PowerView() {
  const { powerNodes, setSelectedAsset } = useVillageStore();

  const totalCapacity = powerNodes.reduce((sum, node) => sum + node.capacity, 0);
  const totalLoad = powerNodes.reduce((sum, node) => sum + node.currentLoad, 0);
  const avgUtilization = (totalLoad / totalCapacity) * 100;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background to-gray-800">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-yellow-400" size={24} />
            <h3 className="text-sm text-gray-400">Total Capacity</h3>
          </div>
          <p className="text-3xl font-bold">{totalCapacity} kW</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="text-blue-400" size={24} />
            <h3 className="text-sm text-gray-400">Current Load</h3>
          </div>
          <p className="text-3xl font-bold">{totalLoad} kW</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-success" size={24} />
            <h3 className="text-sm text-gray-400">Avg Utilization</h3>
          </div>
          <p className="text-3xl font-bold">{avgUtilization.toFixed(1)}%</p>
        </div>
      </div>

      {/* Power Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerNodes.map((node) => {
          const loadPercent = (node.currentLoad / node.capacity) * 100;
          const statusColor = loadPercent > 95 ? 'text-danger' : loadPercent > 80 ? 'text-warning' : 'text-success';
          const bgColor = loadPercent > 95 ? 'from-red-500/20' : loadPercent > 80 ? 'from-yellow-500/20' : 'from-green-500/20';

          return (
            <button
              key={node.id}
              onClick={() => setSelectedAsset({ type: 'powerNode', data: node })}
              className={`glass-dark p-5 rounded-xl hover:scale-105 transition-transform cursor-pointer text-left bg-gradient-to-br ${bgColor} to-transparent`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{node.name}</h3>
                  <p className={`text-sm ${statusColor} font-medium`}>
                    ● {node.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>

              {/* Load Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Load</span>
                  <span className="font-bold">{loadPercent.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      loadPercent > 95 ? 'bg-danger' :
                      loadPercent > 80 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Capacity</p>
                  <p className="font-medium">{node.capacity} kW</p>
                </div>
                <div>
                  <p className="text-gray-400">Current</p>
                  <p className="font-medium">{node.currentLoad} kW</p>
                </div>
                <div>
                  <p className="text-gray-400">Voltage</p>
                  <p className="font-medium">{node.voltage} V</p>
                </div>
                <div>
                  <p className="text-gray-400">Temp</p>
                  <p className="font-medium">{node.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
