import { Navigation, MapPin, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function RoadsView() {
  const { setSelectedAsset } = useVillageStore();

  // Mock road segments data
  const roadSegments = [
    { id: 1, name: 'Main Street', length: 2.5, condition: 'good', lastMaintenance: '2025-09-15', potholes: 0, trafficLevel: 'medium' },
    { id: 2, name: 'School Road', length: 1.8, condition: 'warning', lastMaintenance: '2025-06-20', potholes: 3, trafficLevel: 'high' },
    { id: 3, name: 'Market Road', length: 3.2, condition: 'critical', lastMaintenance: '2025-03-10', potholes: 12, trafficLevel: 'high' },
    { id: 4, name: 'Village Link Road', length: 4.1, condition: 'good', lastMaintenance: '2025-10-01', potholes: 0, trafficLevel: 'low' },
    { id: 5, name: 'Temple Street', length: 1.2, condition: 'good', lastMaintenance: '2025-08-18', potholes: 1, trafficLevel: 'low' },
    { id: 6, name: 'Industrial Road', length: 5.5, condition: 'warning', lastMaintenance: '2025-05-12', potholes: 5, trafficLevel: 'medium' },
  ];

  const stats = {
    totalRoads: roadSegments.length,
    totalLength: roadSegments.reduce((sum, r) => sum + r.length, 0),
    good: roadSegments.filter(r => r.condition === 'good').length,
    needsRepair: roadSegments.filter(r => r.condition === 'warning' || r.condition === 'critical').length,
    totalPotholes: roadSegments.reduce((sum, r) => sum + r.potholes, 0),
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Navigation size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Roads & Transport</h1>
              <p className="text-slate-400">Monitor road conditions and maintenance schedules</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Navigation size={20} className="text-blue-400" />
              <h3 className="text-slate-400 text-sm">Total Roads</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalRoads}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-purple-400" />
              <h3 className="text-slate-400 text-sm">Total Length</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalLength.toFixed(1)} km</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <h3 className="text-slate-400 text-sm">Good Condition</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.good}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Wrench size={20} className="text-yellow-400" />
              <h3 className="text-slate-400 text-sm">Needs Repair</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.needsRepair}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-slate-400 text-sm">Total Potholes</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalPotholes}</p>
          </div>
        </div>

        {/* Road Segments Grid */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6">Road Segments</h2>
          
          <div className="space-y-4">
            {roadSegments.map((road) => (
              <div
                key={road.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-white/5 hover:bg-slate-800 transition-all cursor-pointer"
                onClick={() => setSelectedAsset({ type: 'road', data: road })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{road.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        road.condition === 'good' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        road.condition === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {road.condition.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-slate-400">Length</p>
                        <p className="text-sm font-semibold text-white">{road.length} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Potholes</p>
                        <p className={`text-sm font-semibold ${road.potholes > 5 ? 'text-red-400' : road.potholes > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {road.potholes}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Traffic Level</p>
                        <p className="text-sm font-semibold text-white capitalize">{road.trafficLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Last Maintenance</p>
                        <p className="text-sm font-semibold text-white">{new Date(road.lastMaintenance).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`ml-4 p-3 rounded-lg ${
                    road.condition === 'good' ? 'bg-green-500/10' :
                    road.condition === 'warning' ? 'bg-yellow-500/10' :
                    'bg-red-500/10'
                  }`}>
                    {road.condition === 'good' && <CheckCircle size={24} className="text-green-400" />}
                    {road.condition === 'warning' && <Clock size={24} className="text-yellow-400" />}
                    {road.condition === 'critical' && <AlertTriangle size={24} className="text-red-400" />}
                  </div>
                </div>

                {/* Progress Bar for Condition */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Road Condition Score</span>
                    <span className="text-xs font-semibold text-white">
                      {road.condition === 'good' ? '85%' : road.condition === 'warning' ? '60%' : '35%'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        road.condition === 'good' ? 'bg-green-500' :
                        road.condition === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: road.condition === 'good' ? '85%' : road.condition === 'warning' ? '60%' : '35%' 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
