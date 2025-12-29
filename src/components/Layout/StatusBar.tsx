import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function StatusBar() {
  const { wsConnected, sensors, lastUpdate } = useVillageStore();
  
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  return (
    <div className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-6 text-xs">
      {/* Left side */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600">
            {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          </span>
        </div>
        
        <div className="text-gray-600">
          Active Sensors: <span className="text-green-600 font-medium">{activeSensors}</span>
          {offlineSensors > 0 && (
            <span className="ml-2 text-red-600">
              ({offlineSensors} offline)
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {lastUpdate && (
          <div className="text-gray-600">
            Last Update: <span className="text-gray-900 font-medium">
              {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
            </span>
          </div>
        )}
        
        <div className="text-gray-600">
          Coordinates: <span className="text-gray-900 font-mono">18.5204°N, 73.8567°E</span>
        </div>
      </div>
    </div>
  );
}
