import { useVillageStore } from '../../store/villageStore';
import { Droplet, Gauge } from 'lucide-react';

export default function WaterView() {
  const { waterTanks, setSelectedAsset } = useVillageStore();

  const totalCapacity = waterTanks.reduce((sum, tank) => sum + tank.capacity, 0);
  const totalCurrent = waterTanks.reduce((sum, tank) => sum + (tank.capacity * tank.currentLevel / 100), 0);
  const avgLevel = (totalCurrent / totalCapacity) * 100;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background to-gray-800">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Droplet className="text-cyan-400" size={24} />
            <h3 className="text-sm text-gray-400">Total Capacity</h3>
          </div>
          <p className="text-3xl font-bold">{totalCapacity.toLocaleString()} L</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Gauge className="text-blue-400" size={24} />
            <h3 className="text-sm text-gray-400">Current Level</h3>
          </div>
          <p className="text-3xl font-bold">{totalCurrent.toLocaleString()} L</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Droplet className="text-success" size={24} />
            <h3 className="text-sm text-gray-400">Average Fill</h3>
          </div>
          <p className="text-3xl font-bold">{avgLevel.toFixed(1)}%</p>
        </div>
      </div>

      {/* Tank Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {waterTanks.map((tank) => {
          const statusColor = tank.status === 'good' ? 'text-success' : 
                             tank.status === 'warning' ? 'text-warning' : 'text-danger';
          const bgColor = tank.status === 'good' ? 'from-green-500/20' : 
                         tank.status === 'warning' ? 'from-yellow-500/20' : 'from-red-500/20';

          return (
            <button
              key={tank.id}
              onClick={() => setSelectedAsset({ type: 'waterTank', data: tank })}
              className={`glass-dark p-5 rounded-xl hover:scale-105 transition-transform cursor-pointer text-left bg-gradient-to-br ${bgColor} to-transparent`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{tank.name}</h3>
                  <p className={`text-sm ${statusColor} font-medium`}>
                    ● {tank.status.toUpperCase()}
                  </p>
                </div>
                <div className="text-4xl">💧</div>
              </div>

              {/* Level Gauge */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Level</span>
                  <span className="font-bold">{tank.currentLevel.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      tank.status === 'good' ? 'bg-success' :
                      tank.status === 'warning' ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${tank.currentLevel}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Capacity</p>
                  <p className="font-medium">{tank.capacity.toLocaleString()} L</p>
                </div>
                <div>
                  <p className="text-gray-400">Flow Rate</p>
                  <p className="font-medium">{tank.flowRate} L/hr</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
