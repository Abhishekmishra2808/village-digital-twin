import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function StatusBar() {
  const { wsConnected, sensors, lastUpdate } = useVillageStore();
  
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const offlineSensors = sensors.filter(s => s.status === 'offline').length;

  return (
    <div className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-3 md:px-6 text-xs overflow-x-auto">
      {/* Left side */}
      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600 whitespace-nowrap">
            <span className="hidden sm:inline">{wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}</span>
            <span className="sm:hidden">{wsConnected ? 'WS OK' : 'WS Down'}</span>
          </span>
        </div>
        
        <div className="text-gray-600 whitespace-nowrap">
          <span className="hidden sm:inline">Active Sensors: </span>
          <span className="sm:hidden">Sensors: </span>
          <span className="text-green-600 font-medium">{activeSensors}</span>
          {offlineSensors > 0 && (
            <span className="ml-1 md:ml-2 text-red-600">
              ({offlineSensors} <span className="hidden sm:inline">offline</span><span className="sm:hidden">off</span>)
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {lastUpdate && (
          <div className="hidden md:block text-gray-600">
            Last Update: <span className="text-gray-900 font-medium">
              {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}
            </span>
          </div>
        )}
        
        <div className="text-gray-600 whitespace-nowrap">
          <span className="hidden lg:inline">Coordinates: </span>
          <span className="text-gray-900 font-mono text-[10px] md:text-xs">18.52°N, 73.86°E</span>
        </div>
      </div>
    </div>
  );
}
