import { useState } from 'react';
import { 
  Wind, 
  Droplets, 
  Thermometer,
  Volume2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Cloud,
  Eye,
  Leaf
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function EnvironmentView() {
  const { setSelectedAsset } = useVillageStore();
  const [timeRange, setTimeRange] = useState('24h');

  // Mock environmental monitoring stations
  const monitoringStations = [
    {
      id: 1,
      name: 'Central Monitoring Station',
      location: 'Town Center',
      aqi: 45,
      aqiStatus: 'good',
      pm25: 12.5,
      pm10: 28.3,
      co2: 410,
      temperature: 28.5,
      humidity: 65,
      noise: 52,
      coords: [73.8567, 18.5204]
    },
    {
      id: 2,
      name: 'Industrial Zone Monitor',
      location: 'Industrial Area',
      aqi: 156,
      aqiStatus: 'unhealthy',
      pm25: 68.2,
      pm10: 142.5,
      co2: 520,
      temperature: 32.1,
      humidity: 58,
      noise: 78,
      coords: [73.8577, 18.5214]
    },
    {
      id: 3,
      name: 'School Area Monitor',
      location: 'School Campus',
      aqi: 88,
      aqiStatus: 'moderate',
      pm25: 35.7,
      pm10: 72.4,
      co2: 445,
      temperature: 27.8,
      humidity: 68,
      noise: 58,
      coords: [73.8557, 18.5194]
    },
    {
      id: 4,
      name: 'Residential Monitor',
      location: 'Block A',
      aqi: 52,
      aqiStatus: 'good',
      pm25: 18.4,
      pm10: 35.2,
      co2: 420,
      temperature: 26.9,
      humidity: 72,
      noise: 45,
      coords: [73.8587, 18.5224]
    },
  ];

  // Active alerts
  const environmentalAlerts = [
    { id: 1, type: 'warning', param: 'Air Quality', location: 'Industrial Zone', message: 'PM2.5 levels elevated - Sensitive groups advised to limit outdoor activity', time: '15 mins ago' },
    { id: 2, type: 'critical', param: 'Noise', location: 'Industrial Zone', message: 'Noise levels exceed safe limits (78 dB)', time: '32 mins ago' },
    { id: 3, type: 'info', param: 'Temperature', location: 'All Areas', message: 'Heat index rising - Stay hydrated', time: '1 hour ago' },
  ];

  const stats = {
    totalStations: monitoringStations.length,
    avgAQI: Math.round(monitoringStations.reduce((sum, s) => sum + s.aqi, 0) / monitoringStations.length),
    goodAir: monitoringStations.filter(s => s.aqiStatus === 'good').length,
    activeAlerts: environmentalAlerts.filter(a => a.type === 'critical' || a.type === 'warning').length,
    avgTemperature: Math.round(monitoringStations.reduce((sum, s) => sum + s.temperature, 0) / monitoringStations.length * 10) / 10,
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Moderate' };
    if (aqi <= 150) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Unhealthy (SG)' };
    if (aqi <= 200) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Unhealthy' };
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Hazardous' };
  };

  return (
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Environmental Monitoring</h1>
                <p className="text-gray-600">Real-time air quality, noise, and climate data with alerts</p>
              </div>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Wind size={20} className="text-blue-600" />
              <h3 className="text-gray-600 text-sm">Stations</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalStations}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Eye size={20} className="text-green-600" />
              <h3 className="text-gray-600 text-sm">Avg AQI</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgAQI}</p>
            <p className="text-xs text-green-600 mt-1">Moderate</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="text-gray-600 text-sm">Good Air Quality</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.goodAir}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-600" />
              <h3 className="text-gray-600 text-sm">Active Alerts</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeAlerts}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer size={20} className="text-orange-600" />
              <h3 className="text-gray-600 text-sm">Avg Temp</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgTemperature}°C</p>
          </div>
        </div>

        {/* Active Alerts */}
        {environmentalAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8 border border-red-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500 rounded-lg">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Environmental Alerts</h3>
                <div className="space-y-3">
                  {environmentalAlerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-100 border-red-300' :
                      alert.type === 'warning' ? 'bg-yellow-100 border-yellow-300' :
                      'bg-blue-100 border-blue-300'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              alert.type === 'critical' ? 'bg-red-600 text-white' :
                              alert.type === 'warning' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {alert.type}
                            </span>
                            <span className="font-semibold text-gray-900">{alert.param}</span>
                            <span className="text-sm text-gray-600">• {alert.location}</span>
                          </div>
                          <p className="text-sm text-gray-800">{alert.message}</p>
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap ml-4">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monitoring Stations */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Monitoring Stations</h2>
              
              <div className="space-y-4">
                {monitoringStations.map((station) => {
                  const aqiColor = getAQIColor(station.aqi);
                  return (
                    <div
                      key={station.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedAsset({ type: 'envStation', data: station })}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{station.name}</h3>
                          <p className="text-sm text-gray-600">{station.location}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${aqiColor.bg} ${aqiColor.text} border ${aqiColor.border}`}>
                          AQI: {station.aqi} - {aqiColor.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Wind size={14} className="text-blue-600" />
                            <p className="text-xs text-gray-600">PM2.5</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{station.pm25} μg/m³</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer size={14} className="text-orange-600" />
                            <p className="text-xs text-gray-600">Temp</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{station.temperature}°C</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Volume2 size={14} className="text-purple-600" />
                            <p className="text-xs text-gray-600">Noise</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{station.noise} dB</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Parameters */}
          <div className="space-y-6">
            {/* Air Quality Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Air Quality Breakdown</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">PM2.5 (Fine Particles)</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">32.4 μg/m³</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '65%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Moderate - Acceptable for most</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cloud size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">PM10 (Coarse Particles)</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">68.5 μg/m³</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '55%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Moderate levels detected</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700">CO2 (Carbon Dioxide)</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">445 ppm</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '35%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Good - Normal outdoor levels</p>
                </div>
              </div>
            </div>

            {/* Climate Parameters */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Climate Parameters</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={20} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Temperature</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">28.5°C</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                    <TrendingDown size={12} />
                    <span>-0.5°C from yesterday</span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Humidity</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">65%</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <TrendingUp size={12} />
                    <span>+3% from yesterday</span>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 size={20} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Avg Noise</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">58 dB</p>
                  <p className="text-xs text-gray-600 mt-1">Within acceptable limits</p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Visibility</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">8.5 km</p>
                  <p className="text-xs text-gray-600 mt-1">Good visibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
