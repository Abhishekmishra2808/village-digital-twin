import { Trash2, MapPin, TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function WasteView() {
  const { setSelectedAsset } = useVillageStore();

  // Mock waste collection points data
  const wastePoints = [
    { id: 1, name: 'Market Zone Bin', location: 'Near Main Market', fillLevel: 85, status: 'critical', lastCollection: '2025-10-23', type: 'mixed', capacity: 240 },
    { id: 2, name: 'School Area Bin', location: 'School Campus', fillLevel: 45, status: 'good', lastCollection: '2025-10-24', type: 'recyclable', capacity: 240 },
    { id: 3, name: 'Temple Street Bin', location: 'Temple Road', fillLevel: 72, status: 'warning', lastCollection: '2025-10-24', type: 'mixed', capacity: 120 },
    { id: 4, name: 'Industrial Waste', location: 'Industrial Area', fillLevel: 95, status: 'critical', lastCollection: '2025-10-22', type: 'hazardous', capacity: 1100 },
    { id: 5, name: 'Park Bin', location: 'Community Park', fillLevel: 30, status: 'good', lastCollection: '2025-10-25', type: 'organic', capacity: 120 },
    { id: 6, name: 'Residential Zone A', location: 'Block A', fillLevel: 68, status: 'warning', lastCollection: '2025-10-24', type: 'mixed', capacity: 240 },
  ];

  const stats = {
    totalBins: wastePoints.length,
    critical: wastePoints.filter(w => w.status === 'critical').length,
    avgFillLevel: wastePoints.reduce((sum, w) => sum + w.fillLevel, 0) / wastePoints.length,
    collected: 4,
    pending: wastePoints.filter(w => w.status === 'critical').length,
  };

  return (
    <div className="h-full w-full overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Trash2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Waste Management</h1>
              <p className="text-slate-400">Monitor waste collection points and schedules</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 size={20} className="text-slate-400" />
              <h3 className="text-slate-400 text-sm">Total Bins</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalBins}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-slate-400 text-sm">Critical</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.critical}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-blue-400" />
              <h3 className="text-slate-400 text-sm">Avg Fill Level</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.avgFillLevel.toFixed(0)}%</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={20} className="text-green-400" />
              <h3 className="text-slate-400 text-sm">Collected Today</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.collected}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={20} className="text-orange-400" />
              <h3 className="text-slate-400 text-sm">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>
        </div>

        {/* Waste Collection Points Grid */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6">Waste Collection Points</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wastePoints.map((point) => (
              <div
                key={point.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-white/5 hover:bg-slate-800 transition-all cursor-pointer"
                onClick={() => setSelectedAsset({ type: 'wasteBin', data: point })}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{point.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        point.status === 'good' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        point.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {point.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <MapPin size={14} />
                      <span>{point.location}</span>
                    </div>
                  </div>

                  <div className={`ml-4 p-3 rounded-lg ${
                    point.status === 'good' ? 'bg-green-500/10' :
                    point.status === 'warning' ? 'bg-yellow-500/10' :
                    'bg-red-500/10'
                  }`}>
                    {point.status === 'good' && <CheckCircle size={24} className="text-green-400" />}
                    {point.status === 'warning' && <Clock size={24} className="text-yellow-400" />}
                    {point.status === 'critical' && <AlertTriangle size={24} className="text-red-400" />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Type</p>
                    <p className="text-sm font-semibold text-white capitalize">{point.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Capacity</p>
                    <p className="text-sm font-semibold text-white">{point.capacity}L</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Last Collection</p>
                    <p className="text-sm font-semibold text-white">{new Date(point.lastCollection).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Fill Level Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Fill Level</span>
                    <span className={`text-xs font-semibold ${
                      point.fillLevel > 80 ? 'text-red-400' :
                      point.fillLevel > 60 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {point.fillLevel}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        point.fillLevel > 80 ? 'bg-red-500' :
                        point.fillLevel > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${point.fillLevel}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Schedule */}
        <div className="mt-6 bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-4">Weekly Collection Schedule</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className={`p-3 rounded-lg text-center ${
                idx === 4 ? 'bg-blue-500/10 border-2 border-blue-500/50' : 'bg-slate-800/50 border border-white/10'
              }`}>
                <p className={`text-xs font-semibold ${idx === 4 ? 'text-blue-400' : 'text-slate-400'}`}>{day}</p>
                <p className={`text-lg font-bold mt-1 ${idx === 4 ? 'text-blue-400' : 'text-white'}`}>
                  {idx === 4 ? '✓' : idx % 2 === 0 ? '✓' : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
