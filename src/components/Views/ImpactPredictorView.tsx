import React, { useState } from 'react';
import { ImpactPredictionPanel } from '../Dashboard/ImpactPredictionPanel';
import { useVillageStore } from '../../store/villageStore';
import { sampleVillageInfrastructure, sampleFailureScenarios } from '../../data/sampleVillageInfrastructure';
import { 
  Database, 
  Play, 
  Info, 
  AlertTriangle, 
  Car, 
  Building, 
  Zap, 
  Droplet,
  MapPin,
  Network,
} from 'lucide-react';

/**
 * ImpactPredictorView - Village Analyzer with GNN-based Impact Prediction
 * 
 * This view shows the interactive network graph for infrastructure analysis.
 * Add nodes via right-click on the Map3D view.
 * Trigger failures by clicking on nodes in the Map3D view.
 */
const ImpactPredictorView: React.FC = () => {
  const villageStore = useVillageStore();
  const [useSampleData, setUseSampleData] = useState(true);
  const [showScenarios, setShowScenarios] = useState(false);
  
  // Build the village state - use sample data or real store data
  const villageState = React.useMemo(() => {
    if (useSampleData) {
      // Use comprehensive sample data
      return sampleVillageInfrastructure;
    }
    
    // Use real store data (may be incomplete)
    return {
      tanks: villageStore.waterTanks || [],
      pumps: [],
      pipes: [],
      clusters: [],
      sensors: villageStore.sensors || [],
      roads: villageStore.roads || [],
      buildings: villageStore.buildings || [],
      powerNodes: villageStore.powerNodes || [],
    };
  }, [useSampleData, villageStore]);
  
  const handleNodeSelect = (nodeId: string) => {
    console.log('Node selected:', nodeId);
  };

  // Infrastructure summary stats
  const stats = React.useMemo(() => ({
    roads: villageState.roads?.length || 0,
    buildings: villageState.buildings?.length || 0,
    powerNodes: villageState.powerNodes?.length || 0,
    waterNodes: (villageState.tanks?.length || 0) + (villageState.pumps?.length || 0),
    sensors: villageState.sensors?.length || 0,
    clusters: villageState.clusters?.length || 0,
  }), [villageState]);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950 border-b border-slate-700 px-4 pt-4">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            Village Analyzer
          </h1>
        </div>
        
        <p className="text-slate-400 text-sm pb-4">
          Analyze village infrastructure network and predict cascading failures with GNN
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Header with Data Source Toggle */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                Infrastructure Impact Predictor
              </h2>
              <p className="text-slate-400 mt-1 text-sm">
                Predict cascading effects when infrastructure fails using Graph Neural Networks
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Data Source Toggle */}
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                <Database className="w-4 h-4 text-slate-400" />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSampleData}
                    onChange={(e) => setUseSampleData(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  <span className="ms-2 text-sm text-slate-300">
                    {useSampleData ? 'Sample Data' : 'Live Data'}
                  </span>
                </label>
              </div>
              
              {/* Sample Scenarios Button */}
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-orange-300 flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Sample Scenarios
              </button>
            </div>
          </div>
          
          {/* Infrastructure Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-center">
              <Car className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.roads}</div>
              <div className="text-xs text-slate-400">Roads</div>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/30 rounded-lg p-2 text-center">
              <Building className="w-5 h-5 text-slate-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.buildings}</div>
              <div className="text-xs text-slate-400">Buildings</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
              <Zap className="w-5 h-5 text-yellow-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.powerNodes}</div>
              <div className="text-xs text-slate-400">Power</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center">
              <Droplet className="w-5 h-5 text-blue-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.waterNodes}</div>
              <div className="text-xs text-slate-400">Water</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-center">
              <Info className="w-5 h-5 text-cyan-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.sensors}</div>
              <div className="text-xs text-slate-400">Sensors</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
              <MapPin className="w-5 h-5 text-green-400 mx-auto" />
              <div className="text-lg font-bold text-white">{stats.clusters}</div>
              <div className="text-xs text-slate-400">Areas</div>
            </div>
          </div>
          
          {/* Tip */}
          <div className="mt-4 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">
              💡 <span className="text-cyan-400 font-medium">Tip:</span> Right-click on the Map to add nodes • Click on nodes to trigger failures • View cascading effects in real-time
            </p>
          </div>
        </div>

        {/* Sample Scenarios Panel */}
        {showScenarios && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Try These Sample Failure Scenarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {sampleFailureScenarios.map((scenario, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      scenario.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      scenario.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {scenario.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-white font-medium">
                    {scenario.failureType.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {scenario.description}
                  </div>
                  <div className="text-xs text-cyan-400 mt-2">
                    Node: {scenario.nodeId}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              💡 Go to the Map view and click on the corresponding node to trigger these scenarios
            </p>
          </div>
        )}

        {/* Main Impact Prediction Panel */}
        <ImpactPredictionPanel 
          villageState={villageState}
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
};

export default ImpactPredictorView;
