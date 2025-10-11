import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function StatusBar() {
  const { wsConnected, sensors, lastUpdate } = useVillageStore();
  
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  return (
    <div className="h-8 glass-dark border-t border-gray-700 flex items-center justify-between px-6 text-xs">
      {/* Left side */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-success' : 'bg-danger'}`} />
          <span className="text-gray-400">
            {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          </span>
        </div>
        
        <div className="text-gray-400">
          Active Sensors: <span className="text-success font-medium">{activeSensors}</span>
          {offlineSensors > 0 && (
            <span className="ml-2 text-danger">
              ({offlineSensors} offline)
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {lastUpdate && (
          <div className="text-gray-400">
            Last Update: <span className="text-white font-medium">
              {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
            </span>
          </div>
        )}
        
        <div className="text-gray-400">
          Coordinates: <span className="text-white font-mono">18.5204°N, 73.8567°E</span>
        </div>
      </div>
    </div>
  );
}
