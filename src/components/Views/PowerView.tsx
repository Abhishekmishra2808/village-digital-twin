import { useVillageStore } from '../../store/villageStore';
import { Zap, Activity } from 'lucide-react';

export default function PowerView() {
  const { powerNodes, setSelectedAsset } = useVillageStore();

  const totalCapacity = powerNodes.reduce((sum, node) => sum + node.capacity, 0);
  const totalLoad = powerNodes.reduce((sum, node) => sum + node.currentLoad, 0);
  const avgUtilization = (totalLoad / totalCapacity) * 100;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-transparent">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-yellow-400" size={24} />
            <h3 className="text-sm text-slate-400">Total Capacity</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalCapacity} kW</p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="text-blue-400" size={24} />
            <h3 className="text-sm text-slate-400">Current Load</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalLoad} kW</p>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur-md p-5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="text-green-400" size={24} />
            <h3 className="text-sm text-slate-400">Avg Utilization</h3>
          </div>
          <p className="text-3xl font-bold text-white">{avgUtilization.toFixed(1)}%</p>
        </div>
      </div>

      {/* Power Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {powerNodes.map((node) => {
          const loadPercent = (node.currentLoad / node.capacity) * 100;
          const statusColor = loadPercent > 95 ? 'text-red-400' : loadPercent > 80 ? 'text-yellow-400' : 'text-green-400';
          const bgColor = loadPercent > 95 ? 'from-red-500/10' : loadPercent > 80 ? 'from-yellow-500/10' : 'from-green-500/10';

          return (
            <button
              key={node.id}
              onClick={() => setSelectedAsset({ type: 'powerNode', data: node })}
              className={`bg-slate-900/50 backdrop-blur-md p-5 rounded-xl hover:shadow-md transition-shadow cursor-pointer text-left border border-white/10 bg-gradient-to-br ${bgColor} to-transparent`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">{node.name}</h3>
                  <p className={`text-sm ${statusColor} font-medium`}>
                    ● {node.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>

              {/* Load Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Load</span>
                  <span className="font-bold text-white">{loadPercent.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
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
                  <p className="text-slate-400">Capacity</p>
                  <p className="font-medium text-white">{node.capacity} kW</p>
                </div>
                <div>
                  <p className="text-slate-400">Current</p>
                  <p className="font-medium text-white">{node.currentLoad} kW</p>
                </div>
                <div>
                  <p className="text-slate-400">Voltage</p>
                  <p className="font-medium text-white">{node.voltage} V</p>
                </div>
                <div>
                  <p className="text-slate-400">Temp</p>
                  <p className="font-medium text-white">{node.temperature.toFixed(1)}°C</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
