import { useVillageStore } from '../../store/villageStore';
import { Sprout, Thermometer, Droplets } from 'lucide-react';

export default function AgricultureView() {
  const { sensors, setSelectedAsset } = useVillageStore();

  const soilSensors = sensors.filter(s => s.type === 'soil_moisture');
  const avgMoisture = soilSensors.reduce((sum, s) => sum + s.value, 0) / soilSensors.length;
  const weatherSensor = sensors.find(s => s.type === 'weather');

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background to-gray-800">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Droplets className="text-blue-400" size={24} />
            <h3 className="text-sm text-gray-400">Avg Soil Moisture</h3>
          </div>
          <p className="text-3xl font-bold">{avgMoisture.toFixed(1)}%</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Thermometer className="text-red-400" size={24} />
            <h3 className="text-sm text-gray-400">Temperature</h3>
          </div>
          <p className="text-3xl font-bold">{weatherSensor?.value.toFixed(1) || 'N/A'}°C</p>
        </div>
        
        <div className="glass-dark p-5 rounded-xl">
          <div className="flex items-center space-x-3 mb-2">
            <Sprout className="text-success" size={24} />
            <h3 className="text-sm text-gray-400">Active Sensors</h3>
          </div>
          <p className="text-3xl font-bold">{soilSensors.length}</p>
        </div>
      </div>

      {/* Soil Sensors Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Soil Moisture Sensors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {soilSensors.map((sensor) => {
            const statusColor = sensor.value > 60 ? 'text-success' : 
                               sensor.value > 40 ? 'text-warning' : 'text-danger';

            return (
              <button
                key={sensor.id}
                onClick={() => setSelectedAsset({ type: 'sensor', data: sensor })}
                className="glass-dark p-5 rounded-xl hover:scale-105 transition-transform cursor-pointer text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">{sensor.name}</h3>
                    <p className={`text-xs ${statusColor} font-medium`}>
                      ● {sensor.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-3xl">🌱</div>
                </div>

                {/* Moisture Display */}
                <div className="text-center mb-3">
                  <p className="text-4xl font-bold text-cyan-400">{sensor.value.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400 mt-1">Moisture Level</p>
                </div>

                {/* Gauge */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      sensor.value > 60 ? 'bg-success' :
                      sensor.value > 40 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${sensor.value}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Info */}
      {weatherSensor && (
        <div className="glass-dark p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Weather Station</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Temperature</p>
              <p className="text-2xl font-bold">{weatherSensor.value.toFixed(1)}°C</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Humidity</p>
              <p className="text-2xl font-bold">{weatherSensor.humidity?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Wind Speed</p>
              <p className="text-2xl font-bold">{weatherSensor.windSpeed?.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-2xl font-bold text-success">● Active</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
