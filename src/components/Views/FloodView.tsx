import { useState } from 'react';
import { 
  CloudRain, 
  AlertTriangle, 
  Droplets,
  Wind,
  CheckCircle,
  Brain,
  Waves,
  MapPin
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function FloodView() {
  const { setSelectedAsset } = useVillageStore();
  const [forecastDays, setForecastDays] = useState(7);

  // Mock drainage system data
  const drainagePoints = [
    { 
      id: 1, 
      name: 'Main Drain - North', 
      location: 'Sector A',
      capacity: 5000, 
      currentFlow: 1200,
      status: 'good',
      blockageRisk: 15,
      lastMaintenance: '2025-09-20',
      coords: [73.8567, 18.5204]
    },
    { 
      id: 2, 
      name: 'Central Drainage Hub', 
      location: 'Market Area',
      capacity: 8000, 
      currentFlow: 6400,
      status: 'warning',
      blockageRisk: 68,
      lastMaintenance: '2025-07-15',
      coords: [73.8577, 18.5214]
    },
    { 
      id: 3, 
      name: 'Industrial Drain', 
      location: 'Industrial Zone',
      capacity: 6500, 
      currentFlow: 6100,
      status: 'critical',
      blockageRisk: 92,
      lastMaintenance: '2025-06-10',
      coords: [73.8557, 18.5194]
    },
    { 
      id: 4, 
      name: 'Residential Drain - East', 
      location: 'Block B',
      capacity: 4000, 
      currentFlow: 1800,
      status: 'good',
      blockageRisk: 22,
      lastMaintenance: '2025-10-01',
      coords: [73.8587, 18.5224]
    },
  ];

  // Rainfall forecast
  const rainfallForecast = [
    { day: 'Today', rainfall: 12, probability: 85, floodRisk: 'low' },
    { day: 'Tomorrow', rainfall: 45, probability: 92, floodRisk: 'medium' },
    { day: 'Day 3', rainfall: 78, probability: 95, floodRisk: 'high' },
    { day: 'Day 4', rainfall: 62, probability: 88, floodRisk: 'high' },
    { day: 'Day 5', rainfall: 25, probability: 70, floodRisk: 'low' },
    { day: 'Day 6', rainfall: 8, probability: 45, floodRisk: 'low' },
    { day: 'Day 7', rainfall: 5, probability: 30, floodRisk: 'low' },
  ];

  // Flood risk zones
  const floodRiskZones = [
    { id: 1, name: 'Market Area', riskLevel: 'high', elevation: 122, population: 2500, drainage: 'poor' },
    { id: 2, name: 'Industrial Zone', riskLevel: 'high', elevation: 118, population: 800, drainage: 'critical' },
    { id: 3, name: 'Residential Block A', riskLevel: 'medium', elevation: 135, population: 4200, drainage: 'fair' },
    { id: 4, name: 'School Campus', riskLevel: 'low', elevation: 145, population: 1200, drainage: 'good' },
  ];

  const stats = {
    totalDrains: drainagePoints.length,
    criticalDrains: drainagePoints.filter(d => d.status === 'critical').length,
    avgCapacity: Math.round(drainagePoints.reduce((sum, d) => sum + (d.currentFlow / d.capacity * 100), 0) / drainagePoints.length),
    highRiskZones: floodRiskZones.filter(z => z.riskLevel === 'high').length,
    forecastRainfall: rainfallForecast.slice(0, 3).reduce((sum, f) => sum + f.rainfall, 0),
  };

  return (
    <div className="h-full w-full overflow-auto bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                <CloudRain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Flood Prediction & Management</h1>
                <p className="text-slate-400">AI-based flood warnings and drainage system monitoring</p>
              </div>
            </div>
            <select
              value={forecastDays}
              onChange={(e) => setForecastDays(Number(e.target.value))}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3-Day Forecast</option>
              <option value={7}>7-Day Forecast</option>
              <option value={14}>14-Day Forecast</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Waves size={20} className="text-blue-400" />
              <h3 className="text-slate-400 text-sm">Drainage Points</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalDrains}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400" />
              <h3 className="text-slate-400 text-sm">Critical Drains</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.criticalDrains}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Droplets size={20} className="text-blue-400" />
              <h3 className="text-slate-400 text-sm">Avg Capacity</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.avgCapacity}%</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={20} className="text-orange-400" />
              <h3 className="text-slate-400 text-sm">High Risk Zones</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.highRiskZones}</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CloudRain size={20} className="text-blue-400" />
              <h3 className="text-slate-400 text-sm">3-Day Rainfall</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.forecastRainfall} mm</p>
          </div>
        </div>

        {/* AI Flood Prediction Panel */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 mb-8 border border-orange-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Brain size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">AI Flood Risk Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">High Rainfall Alert (Day 3-4)</p>
                    <p className="text-slate-300">Expected 78mm rainfall on Day 3 with 95% probability</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Critical Drainage Blockage</p>
                    <p className="text-slate-300">Industrial Drain at 92% blockage risk - immediate action required</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Evacuation Routes Prepared</p>
                    <p className="text-slate-300">Safe zones identified for Market Area and Industrial Zone</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wind size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Weather Pattern Analysis</p>
                    <p className="text-slate-300">Monsoon system moving southeast - reduce risk by Day 5</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-semibold">
                  Issue Early Warning
                </button>
                <button className="px-4 py-2 bg-transparent text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/10 transition-all text-sm font-semibold">
                  View Response Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Drainage System */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6">Drainage System Status</h2>
            
            <div className="space-y-4">
              {drainagePoints.map((drain) => {
                const utilizationPercent = (drain.currentFlow / drain.capacity) * 100;
                return (
                  <div
                    key={drain.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:bg-slate-800 transition-all cursor-pointer"
                    onClick={() => setSelectedAsset({ type: 'drainage', data: drain })}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{drain.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            drain.status === 'good' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            drain.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {drain.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{drain.location}</p>
                      </div>

                      <div className={`ml-4 p-3 rounded-lg ${
                        drain.status === 'good' ? 'bg-green-500/10' :
                        drain.status === 'warning' ? 'bg-yellow-500/10' :
                        'bg-red-500/10'
                      }`}>
                        {drain.status === 'good' && <CheckCircle size={24} className="text-green-400" />}
                        {drain.status === 'warning' && <AlertTriangle size={24} className="text-yellow-400" />}
                        {drain.status === 'critical' && <AlertTriangle size={24} className="text-red-400" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-slate-400">Capacity</p>
                        <p className="text-sm font-semibold text-white">{drain.capacity} L/min</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Current Flow</p>
                        <p className="text-sm font-semibold text-white">{drain.currentFlow} L/min</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Blockage Risk</p>
                        <p className={`text-sm font-semibold ${
                          drain.blockageRisk > 70 ? 'text-red-400' :
                          drain.blockageRisk > 40 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {drain.blockageRisk}%
                        </p>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Utilization</span>
                        <span className="text-xs font-semibold text-white">{utilizationPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            utilizationPercent > 90 ? 'bg-red-500' :
                            utilizationPercent > 70 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${utilizationPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rainfall Forecast */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-6">Rainfall Forecast & Flood Risk</h2>
            
            <div className="space-y-3">
              {rainfallForecast.map((forecast, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    forecast.floodRisk === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    forecast.floodRisk === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <CloudRain size={20} className={
                        forecast.floodRisk === 'high' ? 'text-red-400' :
                        forecast.floodRisk === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      } />
                      <div>
                        <h4 className="font-semibold text-white">{forecast.day}</h4>
                        <p className="text-xs text-slate-400">{forecast.probability}% probability</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{forecast.rainfall} mm</p>
                      <span className={`text-xs font-semibold uppercase ${
                        forecast.floodRisk === 'high' ? 'text-red-400' :
                        forecast.floodRisk === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {forecast.floodRisk} risk
                      </span>
                    </div>
                  </div>
                  
                  {/* Rainfall intensity bar */}
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${
                        forecast.floodRisk === 'high' ? 'bg-red-500' :
                        forecast.floodRisk === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(forecast.rainfall, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flood Risk Zones */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
          <h2 className="text-xl font-bold text-white mb-6">Flood Risk Zones</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {floodRiskZones.map((zone) => (
              <div
                key={zone.id}
                className={`p-4 rounded-lg border ${
                  zone.riskLevel === 'high' ? 'bg-red-500/10 border-red-500/30' :
                  zone.riskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <MapPin size={20} className={
                    zone.riskLevel === 'high' ? 'text-red-400' :
                    zone.riskLevel === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  } />
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                    zone.riskLevel === 'high' ? 'bg-red-500 text-white' :
                    zone.riskLevel === 'medium' ? 'bg-yellow-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {zone.riskLevel}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-3">{zone.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevation:</span>
                    <span className="font-semibold text-white">{zone.elevation}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Population:</span>
                    <span className="font-semibold text-white">{zone.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Drainage:</span>
                    <span className={`font-semibold capitalize ${
                      zone.drainage === 'critical' || zone.drainage === 'poor' ? 'text-red-400' :
                      zone.drainage === 'fair' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {zone.drainage}
                    </span>
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
