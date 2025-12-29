import { 
  TrafficCone, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Navigation,
  Clock,
  Car,
  Zap,
  Brain,
  Activity
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function TrafficView() {
  const { setSelectedAsset } = useVillageStore();

  // Mock traffic signals data with AI control
  const trafficSignals = [
    { 
      id: 1, 
      name: 'Main Street & Market Road', 
      location: 'Junction 1',
      status: 'optimal', 
      mode: 'AI-Adaptive',
      greenTime: 45, 
      redTime: 35,
      vehicleCount: 142,
      congestionLevel: 'low',
      aiOptimization: 95,
      coords: [73.8567, 18.5204]
    },
    { 
      id: 2, 
      name: 'School Road & Temple Street', 
      location: 'Junction 2',
      status: 'warning', 
      mode: 'AI-Adaptive',
      greenTime: 60, 
      redTime: 20,
      vehicleCount: 218,
      congestionLevel: 'medium',
      aiOptimization: 78,
      coords: [73.8577, 18.5214]
    },
    { 
      id: 3, 
      name: 'Industrial Road & Link Road', 
      location: 'Junction 3',
      status: 'critical', 
      mode: 'Manual Override',
      greenTime: 30, 
      redTime: 50,
      vehicleCount: 347,
      congestionLevel: 'high',
      aiOptimization: 45,
      coords: [73.8557, 18.5194]
    },
    { 
      id: 4, 
      name: 'Village Link & Highway', 
      location: 'Junction 4',
      status: 'optimal', 
      mode: 'AI-Adaptive',
      greenTime: 50, 
      redTime: 30,
      vehicleCount: 98,
      congestionLevel: 'low',
      aiOptimization: 92,
      coords: [73.8587, 18.5224]
    },
  ];

  // Traffic routes with congestion data
  const trafficRoutes = [
    { id: 1, name: 'Main Street', congestion: 25, avgSpeed: 42, vehicles: 156, trend: 'down' },
    { id: 2, name: 'School Road', congestion: 68, avgSpeed: 18, vehicles: 289, trend: 'up' },
    { id: 3, name: 'Industrial Road', congestion: 82, avgSpeed: 12, vehicles: 412, trend: 'up' },
    { id: 4, name: 'Market Road', congestion: 45, avgSpeed: 28, vehicles: 203, trend: 'stable' },
  ];

  const stats = {
    totalSignals: trafficSignals.length,
    aiControlled: trafficSignals.filter(s => s.mode === 'AI-Adaptive').length,
    avgOptimization: Math.round(trafficSignals.reduce((sum, s) => sum + s.aiOptimization, 0) / trafficSignals.length),
    activeVehicles: trafficSignals.reduce((sum, s) => sum + s.vehicleCount, 0),
    congestionReduction: 34,
  };

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
              <TrafficCone size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Intelligent Traffic Management</h1>
              <p className="text-gray-600">AI-based traffic signal control and adaptive routing</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrafficCone size={20} className="text-blue-600" />
              <h3 className="text-gray-600 text-sm">Total Signals</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSignals}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={20} className="text-purple-600" />
              <h3 className="text-gray-600 text-sm">AI Controlled</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.aiControlled}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={20} className="text-yellow-600" />
              <h3 className="text-gray-600 text-sm">Avg Optimization</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgOptimization}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Car size={20} className="text-green-600" />
              <h3 className="text-gray-600 text-sm">Active Vehicles</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeVehicles}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown size={20} className="text-green-600" />
              <h3 className="text-gray-600 text-sm">Congestion ↓</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">-{stats.congestionReduction}%</p>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Brain size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Traffic Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Adaptive Signal Timing</p>
                    <p className="text-gray-700">Real-time adjustments reduce wait time by 23%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Congestion Prediction</p>
                    <p className="text-gray-700">School Road: High congestion expected at 4:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Route Optimization</p>
                    <p className="text-gray-700">Alternative routes suggested for 156 vehicles</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Incident Detection</p>
                    <p className="text-gray-700">Traffic slowdown detected on Industrial Road</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Signals Grid */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Smart Traffic Signals</h2>
            
            <div className="space-y-4">
              {trafficSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedAsset({ type: 'trafficSignal', data: signal });
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{signal.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          signal.status === 'optimal' ? 'bg-green-50 text-green-700 border border-green-200' :
                          signal.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {signal.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{signal.location}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          signal.mode === 'AI-Adaptive' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {signal.mode}
                        </span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      signal.status === 'optimal' ? 'bg-green-50' :
                      signal.status === 'warning' ? 'bg-yellow-50' :
                      'bg-red-50'
                    }`}>
                      {signal.status === 'optimal' && <CheckCircle size={24} className="text-green-600" />}
                      {signal.status === 'warning' && <Clock size={24} className="text-yellow-600" />}
                      {signal.status === 'critical' && <AlertTriangle size={24} className="text-red-600" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Vehicles</p>
                      <p className="text-sm font-semibold text-gray-900">{signal.vehicleCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Green Time</p>
                      <p className="text-sm font-semibold text-gray-900">{signal.greenTime}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">AI Score</p>
                      <p className="text-sm font-semibold text-purple-600">{signal.aiOptimization}%</p>
                    </div>
                  </div>

                  {/* Congestion Level Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Congestion Level</span>
                      <span className="text-xs font-semibold text-gray-900 capitalize">{signal.congestionLevel}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          signal.congestionLevel === 'low' ? 'bg-green-500' :
                          signal.congestionLevel === 'medium' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ 
                          width: signal.congestionLevel === 'low' ? '30%' : 
                                 signal.congestionLevel === 'medium' ? '60%' : '90%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Routes */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Route Congestion Analysis</h2>
            
            <div className="space-y-4">
              {trafficRoutes.map((route) => (
                <div
                  key={route.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Navigation size={20} className="text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {route.trend === 'up' && <TrendingUp size={16} className="text-red-600" />}
                      {route.trend === 'down' && <TrendingDown size={16} className="text-green-600" />}
                      {route.trend === 'stable' && <Activity size={16} className="text-gray-600" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Vehicles</p>
                      <p className="text-sm font-semibold text-gray-900">{route.vehicles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Avg Speed</p>
                      <p className="text-sm font-semibold text-gray-900">{route.avgSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Congestion</p>
                      <p className={`text-sm font-semibold ${
                        route.congestion < 40 ? 'text-green-600' :
                        route.congestion < 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {route.congestion}%
                      </p>
                    </div>
                  </div>

                  {/* Congestion Bar */}
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        route.congestion < 40 ? 'bg-green-500' :
                        route.congestion < 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${route.congestion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap Placeholder */}
            <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 text-center">
              <Activity size={40} className="mx-auto text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Real-Time Traffic Heatmap</h4>
              <p className="text-sm text-gray-600">Live congestion visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
