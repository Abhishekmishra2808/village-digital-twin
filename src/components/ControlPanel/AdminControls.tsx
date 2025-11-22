import { useState } from 'react';
import { Settings2, X, Zap, Droplet, CloudRain } from 'lucide-react';
import useWebSocket from '../../hooks/useWebSocket';

export default function AdminControls() {
  const [isOpen, setIsOpen] = useState(false);
  const { sendMessage } = useWebSocket();

  const handleSliderChange = (category: string, id: string, field: string, value: number) => {
    sendMessage({
      type: 'manual_update',
      payload: { category, id, field, value }
    });
  };

  const simulateScenario = (scenario: string) => {
    sendMessage({
      type: 'simulate_scenario',
      scenario
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all duration-300 z-20 text-white"
        title="Admin Controls"
      >
        <Settings2 size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-20 max-h-[600px] overflow-y-auto text-white">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings2 size={20} className="text-blue-400" />
          <h3 className="font-semibold">Admin Control Panel</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Manual Sensor Controls */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-400">Manual Sensor Control</h4>
          <div className="space-y-4">
            <SliderControl
              icon={<Droplet size={16} className="text-blue-400" />}
              label="Central Tank Level"
              value={85.5}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleSliderChange('waterTanks', 'wt001', 'currentLevel', v)}
            />
            <SliderControl
              icon={<Droplet size={16} className="text-blue-400" />}
              label="East Tank Level"
              value={45.8}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => handleSliderChange('waterTanks', 'wt004', 'currentLevel', v)}
            />
            <SliderControl
              icon={<Zap size={16} className="text-yellow-400" />}
              label="Main Transformer Load"
              value={425}
              min={0}
              max={500}
              unit="kW"
              onChange={(v) => handleSliderChange('powerNodes', 'pt001', 'currentLoad', v)}
            />
          </div>
        </div>

        {/* Scenario Simulations */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-400">Scenario Simulations</h4>
          <div className="space-y-2">
            <ScenarioButton
              onClick={() => simulateScenario('water_crisis')}
              icon={<Droplet size={16} />}
              text="Simulate Water Crisis"
              color="bg-red-600 hover:bg-red-500"
            />
            <ScenarioButton
              onClick={() => simulateScenario('power_outage')}
              icon={<Zap size={16} />}
              text="Simulate Power Outage"
              color="bg-yellow-600 hover:bg-yellow-500"
            />
            <ScenarioButton
              onClick={() => simulateScenario('heavy_rain')}
              icon={<CloudRain size={16} />}
              text="Simulate Heavy Rainfall"
              color="bg-blue-600 hover:bg-blue-500"
            />
          </div>
        </div>

        {/* Demo Mode */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-slate-400">Demo Mode</h4>
          <div className="bg-slate-800/50 border border-white/5 p-3 rounded-lg text-sm text-slate-400">
            <p>Adjust sliders above to manually control sensor values in real-time.</p>
            <p className="mt-2">Click scenario buttons to trigger predefined events.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({ 
  icon, 
  label, 
  value, 
  min, 
  max, 
  unit, 
  onChange 
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  return (
    <div className="bg-slate-800/50 border border-white/5 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-sm text-slate-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-sm font-mono font-bold text-white">
          {localValue.toFixed(1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider accent-blue-500"
      />
    </div>
  );
}

function ScenarioButton({ 
  onClick, 
  icon, 
  text, 
  color 
}: { 
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full ${color} text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] shadow-lg`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  );
}
