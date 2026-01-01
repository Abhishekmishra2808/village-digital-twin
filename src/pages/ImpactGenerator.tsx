import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Activity,
  Zap,
  Droplet,
  Users,
  Plus,
  RefreshCw,
  Network,
  Heart,
  GraduationCap,
  Building,
  Car,
  Radio,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { useVillageStore, type GNNInfraNode } from '../store/villageStore';

// API base URL for GNN wrapper
const GNN_API_URL = 'http://localhost:7876';

// Village center coordinates (Pune)
const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204];

// Constants matching Gradio
const NODE_TYPES = [
  { value: 'Tank', label: 'Water Tank', icon: Droplet, color: 'bg-blue-500' },
  { value: 'Pump', label: 'Water Pump', icon: Activity, color: 'bg-purple-500' },
  { value: 'Pipe', label: 'Water Pipe', icon: Network, color: 'bg-slate-500' },
  { value: 'Hospital', label: 'Hospital', icon: Heart, color: 'bg-red-500' },
  { value: 'School', label: 'School', icon: GraduationCap, color: 'bg-indigo-500' },
  { value: 'Power', label: 'Power Node', icon: Zap, color: 'bg-yellow-500' },
  { value: 'Cluster', label: 'Consumer Area', icon: Users, color: 'bg-green-500' },
  { value: 'Road', label: 'Road', icon: Car, color: 'bg-amber-500' },
  { value: 'Building', label: 'Building', icon: Building, color: 'bg-slate-600' },
  { value: 'Sensor', label: 'Sensor', icon: Radio, color: 'bg-cyan-500' },
  { value: 'Market', label: 'Market', icon: ShoppingCart, color: 'bg-emerald-500' },
];

// Generate random coordinates near village center
const generateCoords = (index: number): [number, number] => {
  const angle = (index * 72) * (Math.PI / 180); // Spread nodes in a circle
  const radius = 0.002 + (index * 0.0005); // Increasing radius
  return [
    VILLAGE_CENTER[0] + radius * Math.cos(angle),
    VILLAGE_CENTER[1] + radius * Math.sin(angle),
  ];
};

export const ImpactGenerator: React.FC = () => {
  // Get store state and actions
  const {
    gnnNodes,
    gnnEdges,
    failedNodes,
    waterTanks,
    powerNodes,
    buildings,
    addGNNNode,
    addGNNEdge,
    clearAllFailures,
    clearNodeImpacts,
    initializeRealNetwork,
  } = useVillageStore();
  
  // Form state for adding nodes
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('Tank');
  const [newNodeHealth, setNewNodeHealth] = useState(0.9);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState('');
  
  // API status
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Initialize real network on mount if empty
  useEffect(() => {
    if (gnnNodes.length === 0 && (waterTanks.length > 0 || powerNodes.length > 0 || buildings.length > 0)) {
      initializeRealNetwork();
      setStatusMessage('✅ Loaded real village infrastructure network - visible on 3D Map!');
    }
  }, [waterTanks, powerNodes, buildings, gnnNodes.length, initializeRealNetwork]);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${GNN_API_URL}/api/gnn/status`);
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status === 'online' ? 'online' : 'offline');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
  };

  // Add node with auto-connection based on type
  const addNode = useCallback(() => {
    if (!newNodeName.trim()) {
      setStatusMessage('❌ Please enter a node name');
      return;
    }
    
    if (gnnNodes.find(n => n.name === newNodeName.trim())) {
      setStatusMessage('❌ Node already exists');
      return;
    }
    
    const newNode: GNNInfraNode = {
      id: newNodeName.trim(),
      name: newNodeName.trim(),
      type: newNodeType.toLowerCase() as GNNInfraNode['type'],
      health: newNodeHealth,
      coords: generateCoords(gnnNodes.length),
      status: 'operational',
    };
    
    // Add to store (will show on 3D map)
    addGNNNode(newNode);
    
    // Auto-connect to existing network based on node type
    const nodeTypeLower = newNodeType.toLowerCase();
    let connectionsAdded = 0;
    
    // Logic: Connect new node to relevant existing nodes based on type
    if (nodeTypeLower === 'tank') {
      // Tanks connect to pumps
      gnnNodes.filter(n => n.type === 'pump').slice(0, 2).forEach(pump => {
        addGNNEdge({ source: newNode.id, target: pump.id });
        connectionsAdded++;
      });
    } else if (nodeTypeLower === 'pump') {
      // Pumps connect to tanks and pipes
      gnnNodes.filter(n => n.type === 'tank').slice(0, 1).forEach(tank => {
        addGNNEdge({ source: tank.id, target: newNode.id });
        connectionsAdded++;
      });
      gnnNodes.filter(n => n.type === 'pipe').slice(0, 1).forEach(pipe => {
        addGNNEdge({ source: newNode.id, target: pipe.id });
        connectionsAdded++;
      });
    } else if (nodeTypeLower === 'pipe') {
      // Pipes connect to pumps and buildings
      gnnNodes.filter(n => n.type === 'pump').slice(0, 1).forEach(pump => {
        addGNNEdge({ source: pump.id, target: newNode.id });
        connectionsAdded++;
      });
      gnnNodes.filter(n => ['school', 'hospital', 'market', 'building'].includes(n.type)).slice(0, 2).forEach(b => {
        addGNNEdge({ source: newNode.id, target: b.id });
        connectionsAdded++;
      });
    } else if (['school', 'hospital', 'market', 'building'].includes(nodeTypeLower)) {
      // Buildings connect to pipes and power
      gnnNodes.filter(n => n.type === 'pipe').slice(0, 1).forEach(pipe => {
        addGNNEdge({ source: pipe.id, target: newNode.id });
        connectionsAdded++;
      });
      gnnNodes.filter(n => n.type === 'transformer' || n.type === 'power').slice(0, 1).forEach(power => {
        addGNNEdge({ source: power.id, target: newNode.id });
        connectionsAdded++;
      });
    } else if (nodeTypeLower === 'power' || nodeTypeLower === 'transformer') {
      // Power connects to pumps and buildings
      gnnNodes.filter(n => n.type === 'pump').slice(0, 2).forEach(pump => {
        addGNNEdge({ source: newNode.id, target: pump.id });
        connectionsAdded++;
      });
    } else if (nodeTypeLower === 'sensor') {
      // Sensors connect to tanks and pipes
      gnnNodes.filter(n => n.type === 'tank').slice(0, 1).forEach(tank => {
        addGNNEdge({ source: newNode.id, target: tank.id });
        connectionsAdded++;
      });
      gnnNodes.filter(n => n.type === 'pipe').slice(0, 1).forEach(pipe => {
        addGNNEdge({ source: newNode.id, target: pipe.id });
        connectionsAdded++;
      });
    } else if (nodeTypeLower === 'road') {
      // Roads connect to buildings
      gnnNodes.filter(n => ['school', 'hospital', 'market', 'building'].includes(n.type)).slice(0, 2).forEach(b => {
        addGNNEdge({ source: newNode.id, target: b.id });
        connectionsAdded++;
      });
    }
    
    if (connectionsAdded > 0) {
      setStatusMessage(`✅ Added "${newNodeName}" with ${connectionsAdded} auto-connections - visible on 3D Map!`);
    } else {
      setStatusMessage(`✅ Added: ${newNodeName} (${newNodeType}) - Now visible on 3D Map!`);
    }
    
    setNewNodeName('');
  }, [newNodeName, newNodeType, newNodeHealth, gnnNodes, addGNNNode, addGNNEdge]);

  // Reset network to original village infrastructure
  const resetNetwork = () => {
    initializeRealNetwork();
    clearAllFailures();
    clearNodeImpacts();
    setStatusMessage('🔄 Reset to real village infrastructure');
  };

  // Get node icon component
  const getNodeIcon = (type: string) => {
    const nodeType = NODE_TYPES.find(t => t.value.toLowerCase() === type.toLowerCase());
    return nodeType?.icon || Building;
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Network className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Infrastructure Impact Simulator
            </h1>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              apiStatus === 'online' ? 'bg-green-500/20 text-green-400' :
              apiStatus === 'offline' ? 'bg-amber-500/20 text-amber-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {apiStatus === 'online' ? '● GNN Online' :
               apiStatus === 'offline' ? '◐ Local Mode' : '◌ Checking...'}
            </div>
            {gnnNodes.length > 0 && (
              <div className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400">
                🗺️ {gnnNodes.length} nodes on map
              </div>
            )}
          </div>
          <p className="text-slate-400">
            Real village infrastructure network • Add nodes • Simulate failures • See impacts on 3D map
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            statusMessage.startsWith('✅') ? 'bg-green-500/20 text-green-400' :
            statusMessage.startsWith('❌') ? 'bg-red-500/20 text-red-400' :
            statusMessage.startsWith('⚠️') ? 'bg-amber-500/20 text-amber-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Build Network */}
          <div className="space-y-4">
            {/* Add Node Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Add New Infrastructure
              </h2>
              
              {/* Node Name */}
              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">Node Name</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g., New Pump Station..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              
              {/* Node Type */}
              <div className="mb-3">
                <label className="block text-sm text-slate-400 mb-1">Node Type</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  {NODE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Node will auto-connect based on type</p>
              </div>
              
              {/* Health Slider */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-1">
                  Health: {(newNodeHealth * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={newNodeHealth}
                  onChange={(e) => setNewNodeHealth(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              
              <button
                onClick={addNode}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Network
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={resetNetwork}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Village Infrastructure
                </button>
                {failedNodes.length > 0 && (
                  <button
                    onClick={() => {
                      clearAllFailures();
                      clearNodeImpacts();
                      setStatusMessage('🔄 All failures cleared - nodes restored on 3D Map');
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset All Failures ({failedNodes.length})
                  </button>
                )}
              </div>
            </div>

            {/* Network Display */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" />
                Village Network
                {gnnNodes.length > 0 && (
                  <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                    🗺️ Live on Map
                  </span>
                )}
              </h2>
              
              {gnnNodes.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Loading village infrastructure...</p>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">📍 Infrastructure ({gnnNodes.length})</h3>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {gnnNodes.map(node => {
                        const Icon = getNodeIcon(node.type);
                        const isFailed = failedNodes.includes(node.id);
                        const hasImpact = node.impactScore !== undefined && node.impactScore > 0;
                        return (
                          <div 
                            key={node.id} 
                            className={`flex items-center gap-2 text-sm rounded px-2 py-1 ${
                              isFailed ? 'bg-red-500/20' : hasImpact ? 'bg-amber-500/10' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isFailed ? 'bg-red-500 animate-pulse' :
                              hasImpact ? 'bg-amber-500' :
                              node.health >= 0.7 ? 'bg-green-500' :
                              node.health >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className={`font-medium truncate ${
                              isFailed ? 'text-red-400' : hasImpact ? 'text-amber-400' : 'text-white'
                            }`}>{node.name}</span>
                            {isFailed && <span className="text-red-400 text-xs font-medium ml-auto">⚠️ FAILED</span>}
                            {hasImpact && !isFailed && (
                              <span className="text-amber-400 text-xs font-medium ml-auto">
                                📊 {node.impactScore}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">🔗 Connections ({gnnEdges.length})</h3>
                    {gnnEdges.length === 0 ? (
                      <p className="text-slate-400 text-sm italic">No connections</p>
                    ) : (
                      <div className="text-xs text-slate-500">
                        {gnnEdges.length} connections in network
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                How to Trigger Failures
              </h2>
              
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <p className="font-semibold text-white">Add Nodes (Optional)</p>
                    <p className="text-sm text-slate-400">Use the form on the left to add new infrastructure nodes. They'll auto-connect to the network based on type.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <p className="font-semibold text-white">Go to 3D Map</p>
                    <p className="text-sm text-slate-400">Navigate to the 3D Map view to see all infrastructure nodes with their identification badges.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <p className="font-semibold text-white">Click on Any Node</p>
                    <p className="text-sm text-slate-400">Click on a node badge to open the failure panel. Select failure type and severity, then trigger the failure.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <p className="font-semibold text-white">View Impact & Download Report</p>
                    <p className="text-sm text-slate-400">The InfoPanel will show detailed impact analysis with affected nodes. Download the full report from there.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-400 text-sm">
                  💡 <strong>Tip:</strong> Failed nodes appear in <span className="text-red-400 font-bold">RED</span> and impacted nodes appear in <span className="text-yellow-400 font-bold">YELLOW</span> on the map.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactGenerator;
