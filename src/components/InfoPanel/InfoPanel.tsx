import { X, ExternalLink, Wrench, Bell } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function InfoPanel() {
  const { selectedAsset, setSelectedAsset } = useVillageStore();

  if (!selectedAsset) return null;

  const { type, data } = selectedAsset;

  return (
    <div className="h-full bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Asset Details</h3>
        <button
          onClick={() => setSelectedAsset(null)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {type === 'waterTank' && <WaterTankDetails data={data} />}
        {type === 'building' && <BuildingDetails data={data} />}
        {type === 'powerNode' && <PowerNodeDetails data={data} />}
        {type === 'sensor' && <SensorDetails data={data} />}
      </div>
    </div>
  );
}

function WaterTankDetails({ data }: { data: any }) {
  const statusColor = data.status === 'good' ? 'text-green-600' : 
                     data.status === 'warning' ? 'text-yellow-600' : 
                     'text-red-600';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">💧</div>
        <h4 className="text-xl font-bold text-gray-900">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({data.currentLevel.toFixed(1)}% full)
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
        <h5 className="font-semibold border-b border-gray-300 pb-2 text-gray-900">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity.toLocaleString()} liters`} />
        <DetailRow label="Current Level" value={`${(data.capacity * data.currentLevel / 100).toLocaleString()} liters`} />
        <DetailRow label="Flow Rate" value={`${data.flowRate} L/hr`} />
        <DetailRow label="Elevation" value={`${data.elevation}m`} />
        <DetailRow label="Last Refill" value={formatDistanceToNow(new Date(data.lastRefill), { addSuffix: true })} />
        <DetailRow label="Next Service" value={new Date(data.nextService).toLocaleDateString()} />
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h5 className="font-semibold mb-3 text-gray-900">Level Indicator</h5>
        <div className="h-32 bg-gray-200 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
              data.status === 'good' ? 'bg-gradient-to-t from-green-500 to-green-300' :
              data.status === 'warning' ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
              'bg-gradient-to-t from-red-500 to-red-300'
            }`}
            style={{ height: `${data.currentLevel}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900 drop-shadow-lg">
            {data.currentLevel.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <ActionButton icon={<ExternalLink size={16} />} text="View Full History" />
        <ActionButton icon={<Bell size={16} />} text="Set Alert Threshold" />
        <ActionButton icon={<Wrench size={16} />} text="Schedule Maintenance" />
      </div>
    </div>
  );
}

function BuildingDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🏢</div>
        <h4 className="text-xl font-bold text-gray-900">{data.name}</h4>
        <p className="text-sm text-gray-600 capitalize">{data.type}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
        <h5 className="font-semibold border-b border-gray-300 pb-2 text-gray-900">Details</h5>
        <DetailRow label="Type" value={data.type} />
        <DetailRow label="Height" value={`${data.height}m`} />
        <DetailRow label="Floors" value={data.floors} />
        <DetailRow label="Occupancy" value={data.occupancy > 0 ? `${data.occupancy} people` : 'N/A'} />
        <DetailRow label="Coordinates" value={`${data.coords[1].toFixed(4)}°N, ${data.coords[0].toFixed(4)}°E`} />
      </div>
    </div>
  );
}

function PowerNodeDetails({ data }: { data: any }) {
  const loadPercent = (data.currentLoad / data.capacity) * 100;
  const statusColor = loadPercent > 95 ? 'text-red-600' : loadPercent > 80 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">⚡</div>
        <h4 className="text-xl font-bold text-gray-900">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({loadPercent.toFixed(1)}% load)
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
        <h5 className="font-semibold border-b border-gray-300 pb-2 text-gray-900">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity} kW`} />
        <DetailRow label="Current Load" value={`${data.currentLoad} kW`} />
        <DetailRow label="Voltage" value={`${data.voltage} V`} />
        <DetailRow label="Temperature" value={`${data.temperature.toFixed(1)}°C`} />
      </div>

      {/* Load Bar */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h5 className="font-semibold mb-3 text-gray-900">Load Indicator</h5>
        <div className="h-8 bg-gray-200 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${
              loadPercent > 95 ? 'bg-red-500' :
              loadPercent > 80 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${loadPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 drop-shadow-lg">
            {loadPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">📡</div>
        <h4 className="text-xl font-bold text-gray-900">{data.name}</h4>
        <p className="text-sm text-gray-600 capitalize">{data.type.replace('_', ' ')}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
        <h5 className="font-semibold border-b border-gray-300 pb-2 text-gray-900">Current Reading</h5>
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-cyan-600">
            {data.value.toFixed(1)} {data.unit}
          </div>
        </div>
        <DetailRow label="Status" value={data.status === 'active' ? '🟢 Active' : '🔴 Offline'} />
        <DetailRow label="Last Update" value={formatDistanceToNow(new Date(data.lastUpdate), { addSuffix: true })} />
        {data.humidity && <DetailRow label="Humidity" value={`${data.humidity.toFixed(1)}%`} />}
        {data.windSpeed && <DetailRow label="Wind Speed" value={`${data.windSpeed.toFixed(1)} km/h`} />}
        {data.tds && <DetailRow label="TDS" value={`${data.tds} ppm`} />}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="w-full bg-gray-50 p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors border border-gray-200">
      <span className="text-gray-700">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </button>
  );
}
