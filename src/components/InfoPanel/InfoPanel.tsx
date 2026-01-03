import { X, ExternalLink, Wrench, Bell } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function InfoPanel() {
  const { selectedAsset, setSelectedAsset } = useVillageStore();

  if (!selectedAsset) return null;

  const { type, data } = selectedAsset;

  return (
    <div className="h-full bg-slate-900/95 backdrop-blur-md border-l border-white/10 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between shadow-sm z-10">
        <h3 className="text-lg font-semibold text-white">Asset Details</h3>
        <button
          onClick={() => setSelectedAsset(null)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} className="text-slate-400 hover:text-white" />
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
  const statusColor = data.status === 'good' ? 'text-green-400' : 
                     data.status === 'warning' ? 'text-yellow-400' : 
                     'text-red-400';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">💧</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({data.currentLevel.toFixed(1)}% full)
        </p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity.toLocaleString()} liters`} />
        <DetailRow label="Current Level" value={`${(data.capacity * data.currentLevel / 100).toLocaleString()} liters`} />
        <DetailRow label="Flow Rate" value={`${data.flowRate} L/hr`} />
        <DetailRow label="Elevation" value={`${data.elevation}m`} />
        <DetailRow label="Last Refill" value={formatDistanceToNow(new Date(data.lastRefill), { addSuffix: true })} />
        <DetailRow label="Next Service" value={new Date(data.nextService).toLocaleDateString()} />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
        <h5 className="font-semibold mb-3 text-white">Level Indicator</h5>
        <div className="h-32 bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
              data.status === 'good' ? 'bg-gradient-to-t from-green-500 to-green-300/50' :
              data.status === 'warning' ? 'bg-gradient-to-t from-yellow-500 to-yellow-300/50' :
              'bg-gradient-to-t from-red-500 to-red-300/50'
            }`}
            style={{ height: `${data.currentLevel}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white drop-shadow-lg">
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
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className="text-sm text-slate-400 capitalize">{data.type}</p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Details</h5>
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
  const statusColor = loadPercent > 95 ? 'text-red-400' : loadPercent > 80 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">⚡</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({loadPercent.toFixed(1)}% load)
        </p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity} kW`} />
        <DetailRow label="Current Load" value={`${data.currentLoad} kW`} />
        <DetailRow label="Voltage" value={`${data.voltage} V`} />
        <DetailRow label="Temperature" value={`${data.temperature.toFixed(1)}°C`} />
      </div>

      {/* Load Bar */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
        <h5 className="font-semibold mb-3 text-white">Load Indicator</h5>
        <div className="h-8 bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${
              loadPercent > 95 ? 'bg-red-500' :
              loadPercent > 80 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${loadPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
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
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className="text-sm text-slate-400 capitalize">{data.type.replace('_', ' ')}</p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Current Reading</h5>
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-cyan-400">
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
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function ActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="w-full bg-slate-800/50 p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors border border-white/10">
      <span className="text-slate-300">{icon}</span>
      <span className="text-slate-300">{text}</span>
    </button>
  );
}
