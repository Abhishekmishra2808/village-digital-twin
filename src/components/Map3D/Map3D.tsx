import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useVillageStore, type GNNInfraNode } from '../../store/villageStore';
import { Capacitor } from '@capacitor/core';

const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204]; // Pune coordinates
const GNN_API_URL = 'http://localhost:7876';

// Node types for adding
const NODE_TYPES = [
  { value: 'tank', label: 'Water Tank', icon: '💧' },
  { value: 'pump', label: 'Water Pump', icon: '⚙️' },
  { value: 'pipe', label: 'Water Pipe', icon: '🔧' },
  { value: 'hospital', label: 'Hospital', icon: '🏥' },
  { value: 'school', label: 'School', icon: '🏫' },
  { value: 'power', label: 'Power Node', icon: '⚡' },
  { value: 'market', label: 'Market', icon: '🛒' },
  { value: 'sensor', label: 'Sensor', icon: '📡' },
  { value: 'road', label: 'Road', icon: '🛣️' },
];

// Failure types and severity levels
const FAILURE_TYPES = [
  'Supply Disruption',
  'Contamination Alert',
  'Power Failure',
  'Infrastructure Damage',
  'Complete Failure',
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

// Add Node Popup Component
interface AddNodePopupProps {
  position: { x: number; y: number };
  mapCoords: [number, number];
  onClose: () => void;
  onAddNode: (name: string, type: string, coords: [number, number]) => void;
}

function AddNodePopup({ position, mapCoords, onClose, onAddNode }: AddNodePopupProps) {
  const [nodeName, setNodeName] = useState('');
  const [nodeType, setNodeType] = useState('tank');

  const handleAdd = () => {
    if (!nodeName.trim()) return;
    onAddNode(nodeName.trim(), nodeType, mapCoords);
    onClose();
  };

  return (
    <div 
      className="fixed z-[9999] bg-slate-900/98 border-2 border-emerald-500 rounded-xl shadow-2xl p-4 min-w-[280px]"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 300), 
        top: Math.min(position.y, window.innerHeight - 320),
        maxWidth: '320px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">➕</span>
          <span className="text-white font-bold text-sm">Add New Node</span>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Location Info */}
      <div className="bg-slate-800/50 rounded-lg p-2 mb-3 text-xs text-slate-400">
        📍 {mapCoords[1].toFixed(5)}°N, {mapCoords[0].toFixed(5)}°E
      </div>

      {/* Node Name */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Node Name</label>
        <input
          type="text"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          placeholder="Enter node name..."
          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Node Type */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1">Node Type</label>
        <select
          value={nodeType}
          onChange={(e) => setNodeType(e.target.value)}
          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
        >
          {NODE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        disabled={!nodeName.trim()}
        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
      >
        ➕ Add to Network
      </button>

      <p className="text-[10px] text-slate-500 mt-2 text-center">
        Node will auto-connect based on type
      </p>
    </div>
  );
}

// Failure Popup Component
interface FailurePopupProps {
  node: GNNInfraNode;
  position: { x: number; y: number };
  onClose: () => void;
  onTriggerFailure: (failureType: string, severity: string) => void;
  isLoading: boolean;
}

function FailurePopup({ node, position, onClose, onTriggerFailure, isLoading }: FailurePopupProps) {
  const [failureType, setFailureType] = useState('Supply Disruption');
  const [severity, setSeverity] = useState('medium');

  return (
    <div 
      className="fixed z-[9999] bg-slate-900/98 border-2 border-cyan-500 rounded-xl shadow-2xl p-4 min-w-[280px]"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 300), 
        top: Math.min(position.y, window.innerHeight - 350),
        maxWidth: '320px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="text-white font-bold text-sm">Trigger Failure</span>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Node Info */}
      <div className="bg-slate-800/50 rounded-lg p-2 mb-3">
        <div className="text-white font-semibold">{node.name}</div>
        <div className="text-slate-400 text-xs">{node.type} • Health: {(node.health * 100).toFixed(0)}%</div>
      </div>

      {/* Failure Type */}
      <div className="mb-3">
        <label className="block text-xs text-slate-400 mb-1">Failure Type</label>
        <select
          value={failureType}
          onChange={(e) => setFailureType(e.target.value)}
          className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
        >
          {FAILURE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Severity */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1">Severity</label>
        <div className="flex gap-1">
          {SEVERITY_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => setSeverity(level.value)}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                severity === level.value
                  ? `${level.color} text-white`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={() => onTriggerFailure(failureType, severity)}
        disabled={isLoading}
        className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Running GNN...
          </>
        ) : (
          <>
            💥 Trigger Failure
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-500 mt-2 text-center">
        Impact will show on map & InfoPanel
      </p>
    </div>
  );
}

export default function Map3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userInteractedRef = useRef(false);
  const lastViewRef = useRef<string>('');
  const [currentZoom, setCurrentZoom] = useState(16.6);
  const [currentPitch, setCurrentPitch] = useState(45);
  const [failureCount, setFailureCount] = useState(0);
  
  // Failure popup state
  const [failurePopup, setFailurePopup] = useState<{
    node: GNNInfraNode;
    position: { x: number; y: number };
  } | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  
  // Add node popup state
  const [addNodePopup, setAddNodePopup] = useState<{
    position: { x: number; y: number };
    mapCoords: [number, number];
  } | null>(null);
  
  const isMobile = Capacitor.isNativePlatform() || window.innerWidth < 768;
  
  const { 
    waterTanks, 
    powerNodes, 
    gnnNodes,
    failedNodes,
    setSelectedAsset,
    setNodeFailed,
    setNodeImpact,
    clearAllFailures,
    clearNodeImpacts,
    addGNNNode,
    addGNNEdge,
    activeView 
  } = useVillageStore();

  // Handle adding a new node
  const handleAddNode = useCallback((name: string, type: string, coords: [number, number]) => {
    const newNodeId = `${type}-${Date.now()}`;
    console.log('Adding new node:', { newNodeId, name, type, coords });
    
    // Ensure type is valid
    const validTypes = ['tank', 'pump', 'pipe', 'hospital', 'school', 'power', 'cluster', 'road', 'building', 'sensor', 'market', 'transformer'] as const;
    const nodeType = validTypes.includes(type as any) ? type as typeof validTypes[number] : 'building';
    
    // Add the new node
    addGNNNode({
      id: newNodeId,
      name: name,
      type: nodeType,
      coords: coords,
      health: 1.0,
      status: 'operational',
    });
    
    console.log('Node added, getting existing nodes...');
    
    // Auto-connect based on type and proximity
    const existingNodes = useVillageStore.getState().gnnNodes;
    console.log('Existing nodes:', existingNodes.length);
    
    // Find nearby nodes by distance
    const getDistance = (c1: [number, number], c2: [number, number]) => {
      return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
    };
    
    // Sort existing nodes by distance to new node
    const sortedByDistance = existingNodes
      .filter(n => n.id !== newNodeId)
      .map(n => ({ node: n, distance: getDistance(coords, n.coords) }))
      .sort((a, b) => a.distance - b.distance);
    
    // Connect based on node type
    const connectionRules: Record<string, { targetTypes: string[], maxConnections: number }> = {
      tank: { targetTypes: ['pump'], maxConnections: 2 },
      pump: { targetTypes: ['tank', 'pipe'], maxConnections: 3 },
      pipe: { targetTypes: ['pump', 'hospital', 'school', 'market', 'residential'], maxConnections: 3 },
      hospital: { targetTypes: ['pipe', 'power'], maxConnections: 2 },
      school: { targetTypes: ['pipe', 'power'], maxConnections: 2 },
      market: { targetTypes: ['pipe', 'road'], maxConnections: 2 },
      power: { targetTypes: ['pump', 'hospital', 'school'], maxConnections: 3 },
      sensor: { targetTypes: ['pipe', 'tank', 'pump'], maxConnections: 2 },
      road: { targetTypes: ['market', 'hospital', 'school'], maxConnections: 3 },
    };
    
    const rules = connectionRules[type] || { targetTypes: [], maxConnections: 2 };
    let connections = 0;
    
    // First try to connect to preferred types
    for (const { node } of sortedByDistance) {
      if (connections >= rules.maxConnections) break;
      if (rules.targetTypes.includes(node.type)) {
        addGNNEdge({
          source: newNodeId,
          target: node.id,
        });
        connections++;
      }
    }
    
    // If no preferred connections, connect to nearest nodes
    if (connections === 0) {
      for (const { node } of sortedByDistance.slice(0, 2)) {
        addGNNEdge({
          source: newNodeId,
          target: node.id,
        });
      }
    }
  }, [addGNNNode, addGNNEdge]);

  // Handle triggering a failure from the popup
  const handleTriggerFailure = async (failureType: string, severity: string) => {
    if (!failurePopup) return;
    
    const node = failurePopup.node;
    setIsLoadingPrediction(true);
    
    // INCREMENT COUNTER
    setFailureCount(prev => prev + 1);
    
    // DO NOT CLEAR PREVIOUS FAILURES - ACCUMULATE THEM
    // clearAllFailures();
    // clearNodeImpacts();
    
    try {
      // Try to call API, but expect it might fail in dev mode
      const response = await fetch(`${GNN_API_URL}/api/gnn/predict-structured`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node_name: node.name,
          failure_type: failureType,
          severity: severity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Prediction failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mark the primary failed node
        setNodeFailed(node.id, failureType);
        
        // Get current nodes from store for matching
        const currentGnnNodes = useVillageStore.getState().gnnNodes;
        
        // Mark affected nodes with their impact scores
        if (data.affectedNodes) {
          data.affectedNodes.forEach((affected: any) => {
            if (affected.nodeName !== node.name) {
              // Try multiple matching strategies
              let nodeMatch = currentGnnNodes.find(n => 
                n.name === affected.nodeName || 
                n.id === affected.nodeId ||
                n.name.toLowerCase() === affected.nodeName?.toLowerCase() ||
                n.id.toLowerCase() === affected.nodeName?.toLowerCase() ||
                n.name.toLowerCase().includes(affected.nodeName?.toLowerCase()) ||
                affected.nodeName?.toLowerCase().includes(n.name.toLowerCase())
              );
              
              // If still no match, try matching by type from the affectedNodes
              if (!nodeMatch && affected.nodeType) {
                const sameTypeNodes = currentGnnNodes.filter(n => 
                  n.type === affected.nodeType && n.id !== node.id
                );
                if (sameTypeNodes.length > 0) {
                  // Pick the first unaffected node of that type
                  nodeMatch = sameTypeNodes[0];
                }
              }
              
              if (nodeMatch) {
                // ACCUMULATE IMPACT
                const currentImpact = nodeMatch.impactScore || 0;
                const newImpact = affected.probability || affected.severityScore || 50;
                const totalImpact = Math.min(100, currentImpact + (newImpact * 0.5)); // Add 50% of new impact to existing
                
                setNodeImpact(nodeMatch.id, totalImpact, node.id);
                
                if (totalImpact > 80) {
                  setNodeFailed(nodeMatch.id, 'cascade_effect');
                }
              } else {
                console.warn(`Could not find matching node for: ${affected.nodeName}`);
              }
            }
          });
        }
        
        // Also mark connected nodes using edges (more reliable than API names)
        const gnnEdges = useVillageStore.getState().gnnEdges;
        const connectedNodeIds = gnnEdges
          .filter(e => e.source === node.id || e.target === node.id)
          .map(e => e.source === node.id ? e.target : e.source);
        
        connectedNodeIds.forEach((nodeId, idx) => {
          const existingNode = currentGnnNodes.find(n => n.id === nodeId);
          if (existingNode) {
            // ACCUMULATE IMPACT
            const currentImpact = existingNode.impactScore || 0;
            const additionalImpact = Math.max(10, 40 - (idx * 10));
            const totalImpact = Math.min(100, currentImpact + additionalImpact);
            
            setNodeImpact(nodeId, totalImpact, node.id);
          }
        });
        
        // Show in InfoPanel with detailed prediction data
        setSelectedAsset({ 
          type: 'gnnNode', 
          data: { 
            ...node, 
            isFailed: true, 
            failureType,
            severity,
            predictionResult: data 
          } 
        });
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (err) {
      // Fallback: local simulation
      console.warn('GNN API offline, using local simulation:', err);
      
      // Mark the primary failed node
      setNodeFailed(node.id, failureType);
      
      // Find connected nodes and mark them as impacted
      const gnnEdges = useVillageStore.getState().gnnEdges;
      const currentGnnNodes = useVillageStore.getState().gnnNodes;
      
      const connectedNodes = gnnEdges
        .filter(e => e.source === node.id || e.target === node.id)
        .map(e => e.source === node.id ? e.target : e.source);
      
      connectedNodes.forEach((nodeId, idx) => {
        const existingNode = currentGnnNodes.find(n => n.id === nodeId);
        if (existingNode) {
             // ACCUMULATE IMPACT LOGIC
             // "1 node is damaged 10 percent then by another failure it is damaged 6 percent"
             const currentImpact = existingNode.impactScore || 0;
             const additionalImpact = Math.max(5, 20 - (idx * 5)); // Add 5-20% damage
             const totalImpact = Math.min(100, currentImpact + additionalImpact);
             
             console.log(`Accumulating Impact for ${existingNode.name}: ${currentImpact}% + ${additionalImpact}% = ${totalImpact}%`);
             
             setNodeImpact(nodeId, totalImpact, node.id);
             
             if (totalImpact > 90) {
               setNodeFailed(nodeId, 'cascade_effect');
             }
        }
      });
      
      setSelectedAsset({ 
        type: 'gnnNode', 
        data: { 
          ...node, 
          isFailed: true, 
          failureType,
          severity,
          localSimulation: true,
          affectedCount: connectedNodes.length + 1
        } 
      });
    } finally {
      setIsLoadingPrediction(false);
      setFailurePopup(null);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 22,
        }],
      },
      center: VILLAGE_CENTER,
  zoom: 16.6, // 16.6x view
      minZoom: 12,
      maxZoom: 20,
      pitch: 45,
      bearing: 0,
      antialias: true,
      // Better performance and smoother animations
      refreshExpiredTiles: false,
      fadeDuration: 200,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });
    
    // Update zoom and pitch state
    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(Math.round(map.current.getZoom() * 10) / 10);
      }
    });
    
    map.current.on('pitch', () => {
      if (map.current) {
        setCurrentPitch(Math.round(map.current.getPitch()));
      }
    });

    // Add navigation controls with zoom buttons
    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }), 
      'top-right'
    );
    
    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    
    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    
    // Prevent zoom conflicts - disable double-click zoom to avoid interference
    map.current.doubleClickZoom.disable();
    
    // Right-click to add node
    map.current.on('contextmenu', (e) => {
      e.preventDefault();
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      setAddNodePopup({
        position: { x: e.point.x + mapContainer.current!.getBoundingClientRect().left, y: e.point.y + mapContainer.current!.getBoundingClientRect().top },
        mapCoords: coords,
      });
    });
    
    // Add custom double-click handler for smoother zoom
    map.current.on('dblclick', (e) => {
      e.preventDefault();
      const currentZoom = map.current!.getZoom();
      map.current!.easeTo({
        zoom: currentZoom + 1,
        duration: 300,
        easing: (t) => t,
      });
    });
    
    // Track user interactions to prevent auto-fly interference
    map.current.on('mousedown', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('touchstart', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('wheel', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('dragstart', () => {
      userInteractedRef.current = true;
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // DISABLED: Building markers are now handled by GNN nodes
  // Buildings are represented in the GNN network as school/hospital/market nodes
  /*
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing building markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('building-marker'))
      .forEach(marker => {
        marker.remove();
        markersRef.current = markersRef.current.filter(m => m !== marker);
      });

    // Building type icons and colors
    const buildingConfig: Record<string, { icon: string; color: string; label: string }> = {
      school: { icon: '🏫', color: '#8b5cf6', label: 'School' },
      health: { icon: '🏥', color: '#ef4444', label: 'Health' },
      hospital: { icon: '🏥', color: '#ef4444', label: 'Hospital' },
      market: { icon: '🛒', color: '#f59e0b', label: 'Market' },
      commercial: { icon: '🏪', color: '#f59e0b', label: 'Shop' },
      government: { icon: '🏛️', color: '#3b82f6', label: 'Govt' },
      residential: { icon: '🏘️', color: '#10b981', label: 'Homes' },
      religious: { icon: '🛕', color: '#ec4899', label: 'Temple' },
      industrial: { icon: '🏭', color: '#6b7280', label: 'Industry' },
      default: { icon: '🏢', color: '#64748b', label: 'Building' },
    };

    // Add building markers with icons and labels
    buildings.forEach(building => {
      const config = buildingConfig[building.type] || buildingConfig.default;
      
      const el = document.createElement('div');
      el.className = 'building-marker';
      
      // Create marker with icon and label
      el.innerHTML = `
        <div class="building-icon">${config.icon}</div>
        <div class="building-label">${building.name.length > 15 ? building.name.substring(0, 15) + '...' : building.name}</div>
      `;
      
      Object.assign(el.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      });
      
      const iconEl = el.querySelector('.building-icon') as HTMLElement;
      if (iconEl) {
        Object.assign(iconEl.style, {
          width: '40px',
          height: '40px',
          background: config.color,
          borderRadius: '8px',
          border: '3px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
        });
      }
      
      const labelEl = el.querySelector('.building-label') as HTMLElement;
      if (labelEl) {
        Object.assign(labelEl.style, {
          marginTop: '4px',
          padding: '2px 6px',
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        });
      }
      
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.1)';
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
      };

      el.onclick = () => {
        setSelectedAsset({ type: 'building', data: building });
      };

      // Handle different coordinate formats
      const coords = building.coords || (building as any).position;
      if (!coords) return;
      
      const lngLat: [number, number] = Array.isArray(coords) 
        ? [coords[0], coords[1]] 
        : [coords.lng, coords.lat];

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(lngLat)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add 3D building extrusions for visual depth
    if (!map.current.getSource('buildings')) {
      map.current.addSource('buildings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: buildings.map(b => {
            const coords = b.coords || (b as any).position;
            if (!coords) return null;
            const lng = Array.isArray(coords) ? coords[0] : coords.lng;
            const lat = Array.isArray(coords) ? coords[1] : coords.lat;
            
            return {
              type: 'Feature',
              properties: {
                id: b.id,
                name: b.name,
                type: b.type,
                height: b.height || 15,
                color: buildingConfig[b.type]?.color || buildingConfig.default.color,
              },
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [lng - 0.0001, lat - 0.0001],
                    [lng + 0.0001, lat - 0.0001],
                    [lng + 0.0001, lat + 0.0001],
                    [lng - 0.0001, lat + 0.0001],
                    [lng - 0.0001, lat - 0.0001],
                  ],
                ],
              },
            };
          }).filter(Boolean),
        },
      });

      map.current.addLayer({
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'buildings',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.6,
        },
      });

      // Add click handler for 3D buildings
      map.current.on('click', 'buildings-3d', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const building = buildings.find(b => b.id === feature.properties.id);
          if (building) {
            setSelectedAsset({ type: 'building', data: building });
          }
        }
      });
    }
  }, [mapLoaded, buildings, setSelectedAsset]);
  */

  // DISABLED: Water tank markers are now handled by GNN nodes
  /*
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing water tank markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('water-tank-marker'))
      .forEach(marker => marker.remove());

    waterTanks.slice(0, 5).forEach(tank => {
      const el = document.createElement('div');
      el.className = 'water-tank-marker';
      el.textContent = '💧';
      
      const statusColor = tank.status === 'good' ? '#10b981' : 
                          tank.status === 'warning' ? '#f59e0b' : '#ef4444';
      
      Object.assign(el.style, {
        width: '36px',
        height: '36px',
        background: statusColor,
        borderRadius: '50%',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      });

      el.onclick = () => {
        setSelectedAsset({ type: 'waterTank', data: tank });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(tank.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, waterTanks, setSelectedAsset]);
  */

  // DISABLED: Power node markers are now handled by GNN nodes
  /*
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing power node markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('power-node-marker'))
      .forEach(marker => marker.remove());

    powerNodes.slice(0, 8).forEach(node => {
      const el = document.createElement('div');
      el.className = 'power-node-marker';
      el.textContent = '⚡';
      
      const loadPercent = (node.currentLoad / node.capacity) * 100;
      const statusColor = loadPercent > 95 ? '#ef4444' : 
                          loadPercent > 80 ? '#f59e0b' : '#10b981';
      
      Object.assign(el.style, {
        width: '32px',
        height: '32px',
        background: statusColor,
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        borderRadius: '4px',
        transform: 'rotate(45deg)',
      });
      
      el.onclick = () => {
        setSelectedAsset({ type: 'powerNode', data: node });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(node.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, powerNodes, setSelectedAsset]);
  */

  // DISABLED: Sensor markers are now handled by GNN nodes
  /*
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing sensor markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('sensor-marker'))
      .forEach(marker => marker.remove());

    const sensorIcons: Record<string, string> = {
      soil_moisture: '🌱',
      air_quality: '💨',
      weather: '🌡️',
      water_quality: '💧',
      noise: '🔊',
      energy: '☀️',
      waste: '🗑️',
    };

    // Only show 15 sensors to reduce clutter
    sensors.slice(0, 15).forEach(sensor => {
      const el = document.createElement('div');
      el.className = 'sensor-marker';
      
      const icon = sensorIcons[sensor.type] || '📡';
      el.textContent = icon;
      
      Object.assign(el.style, {
        width: '24px',
        height: '24px',
        background: sensor.status === 'active' ? '#06b6d4' : '#6b7280',
        borderRadius: '50%',
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      });

      el.onclick = () => {
        setSelectedAsset({ type: 'sensor', data: sensor });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(sensor.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, sensors, setSelectedAsset]);
  */

  // Add GNN infrastructure nodes from Impact Generator
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing GNN markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('gnn-node-marker'))
      .forEach(marker => {
        marker.remove();
        markersRef.current = markersRef.current.filter(m => m !== marker);
      });

    const gnnIcons: Record<string, string> = {
      tank: '💧',
      pump: '⚙️',
      pipe: '🔧',
      hospital: '🏥',
      school: '🏫',
      transformer: '⚡',
      power: '⚡',
      building: '🏢',
      market: '🛒',
      sensor: '📡',
      road: '🛣️',
      cluster: '👥',
      residential: '🏠',
      commercial: '🏢',
      industrial: '🏭',
      agricultural: '🌾',
      default: '📍',
    };

    gnnNodes.forEach(node => {
      const isFailed = failedNodes.includes(node.id);
      const hasImpact = node.impactScore !== undefined && node.impactScore > 0;
      const icon = gnnIcons[node.type] || gnnIcons.default;
      
      // Determine color based on health, failure, and impact status
      let bgColor = '#10b981'; // Green for healthy
      let borderColor = 'white';
      let statusText = '';
      
      if (isFailed) {
        bgColor = '#dc2626'; // Bright red for failed
        borderColor = '#fca5a5';
        statusText = ' ❌ FAILED';
      } else if (hasImpact) {
        // Orange/yellow gradient based on impact severity
        bgColor = node.impactScore! > 70 ? '#ea580c' : node.impactScore! > 40 ? '#d97706' : '#ca8a04';
        borderColor = '#fde68a';
        statusText = ` ⚠️ ${node.impactScore}%`;
      } else if (node.health < 0.4) {
        bgColor = '#ef4444'; // Red for low health
      } else if (node.health < 0.7) {
        bgColor = '#f59e0b'; // Orange for medium health
      }
      
      // Create unified marker with icon + name as identification
      const wrapper = document.createElement('div');
      wrapper.className = 'gnn-node-marker';
      wrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        position: relative;
      `;
      
      // Main identification badge with icon + name
      const badge = document.createElement('div');
      badge.innerHTML = `<span style="font-size:18px;margin-right:6px;">${icon}</span><span>${node.name}${statusText}</span>`;
      badge.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px 14px;
        background: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: ${isFailed ? '8px' : '20px'};
        font-size: 13px;
        font-weight: 700;
        color: white;
        white-space: nowrap;
        box-shadow: ${isFailed 
          ? '0 0 30px rgba(220, 38, 38, 0.9), 0 6px 20px rgba(0,0,0,0.6)' 
          : hasImpact 
            ? '0 0 25px rgba(251, 191, 36, 0.8), 0 5px 15px rgba(0,0,0,0.5)' 
            : '0 4px 12px rgba(0,0,0,0.4)'};
        animation: ${isFailed ? 'pulse 1s infinite' : hasImpact ? 'glow 2s infinite' : 'none'};
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        z-index: ${isFailed ? '1000' : hasImpact ? '500' : '100'};
      `;
      
      // Hover tooltip with detailed info
      const tooltip = document.createElement('div');
      tooltip.className = 'gnn-tooltip';
      // Set tooltip styles explicitly to avoid template parsing issues
      tooltip.style.position = 'absolute';
      tooltip.style.bottom = '100%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.marginBottom = '10px';
      tooltip.style.padding = '12px 16px';
      tooltip.style.background = 'rgba(15, 23, 42, 0.98)';
      tooltip.style.border = `2px solid ${isFailed ? '#ef4444' : hasImpact ? '#f59e0b' : '#475569'}`;
      tooltip.style.borderRadius = '10px';
      tooltip.style.fontSize = '12px';
      tooltip.style.color = 'white';
      tooltip.style.whiteSpace = 'nowrap';
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
      tooltip.style.transition = 'opacity 0.2s, visibility 0.2s';
      tooltip.style.zIndex = '2000';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)';
      
      // Build tooltip content with detailed info
      let tooltipContent = `<div style="font-weight:700;margin-bottom:8px;font-size:14px;">${icon} ${node.name}</div>`;
      tooltipContent += `<div style="color:#94a3b8;margin-bottom:3px;">Type: ${node.type}</div>`;
      tooltipContent += `<div style="color:#94a3b8;margin-bottom:3px;">Health: ${(node.health * 100).toFixed(0)}%</div>`;
      
      if (isFailed) {
        tooltipContent += `<div style="color:#f87171;font-weight:700;margin-top:8px;font-size:13px;">🔴 NODE FAILED</div>`;
        if (node.failureType) {
          tooltipContent += `<div style="color:#fca5a5;">Failure: ${node.failureType}</div>`;
        }
      } else if (hasImpact) {
        tooltipContent += `<div style="color:#fbbf24;font-weight:700;margin-top:8px;font-size:13px;">⚠️ IMPACTED: ${node.impactScore}%</div>`;
        if (node.impactFrom) {
          const sourceNode = gnnNodes.find(n => n.id === node.impactFrom);
          tooltipContent += `<div style="color:#fde68a;">Caused by: ${sourceNode?.name || node.impactFrom}</div>`;
        }
      }
      
      tooltip.innerHTML = tooltipContent;
      
      // Assemble marker
      wrapper.appendChild(tooltip);
      wrapper.appendChild(badge);
      
      // Show tooltip on hover
      wrapper.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      });
      wrapper.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      });

      // Click handler - show failure popup or info panel
      badge.onclick = (e: MouseEvent) => {
        if (isFailed || hasImpact) {
          // If already failed/impacted, show info panel
          setSelectedAsset({ 
            type: 'gnnNode', 
            data: { ...node, isFailed, hasImpact } 
          });
        } else {
          // Show failure popup for healthy nodes
          setFailurePopup({
            node,
            position: { x: e.clientX, y: e.clientY }
          });
        }
      };

      const marker = new maplibregl.Marker({ 
        element: wrapper,
        anchor: 'bottom',
      })
        .setLngLat(node.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Add CSS animations for pulsing failed nodes and glowing impacted nodes
    if (!document.getElementById('gnn-animations')) {
      const style = document.createElement('style');
      style.id = 'gnn-animations';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 4px 12px rgba(0,0,0,0.4);
          }
          50% { 
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(239, 68, 68, 1), 0 6px 16px rgba(0,0,0,0.5);
          }
        }
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(251, 191, 36, 0.6), 0 3px 10px rgba(0,0,0,0.3);
          }
          50% { 
            box-shadow: 0 0 25px rgba(251, 191, 36, 0.9), 0 5px 14px rgba(0,0,0,0.4);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, [mapLoaded, gnnNodes, failedNodes, setSelectedAsset]);

  // Fly to different views based on activeView - only if user hasn't interacted
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Don't auto-fly if user has manually interacted with the map
    if (userInteractedRef.current) return;
    
    // Don't fly if we're already on this view
    if (lastViewRef.current === activeView) return;
    
    lastViewRef.current = activeView;

    switch (activeView) {
      case 'map':
        // Reset to overview when switching to map view
        map.current.flyTo({
          center: VILLAGE_CENTER,
          zoom: 16.6,
          pitch: 45,
          duration: 1500,
          essential: true,
        });
        // Reset interaction flag when returning to map view
        userInteractedRef.current = false;
        break;
      default:
        // Don't auto-fly for other views
        break;
    }
  }, [activeView, waterTanks, powerNodes, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Info Panel - Mobile Optimized */}
      <div className={`absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md rounded-lg shadow-lg border border-white/10 ${
        isMobile ? 'p-2' : 'p-3'
      }`}>
        <div className={`flex items-center gap-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">🔍</span>
            <span className="font-semibold text-white">{currentZoom}x</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">📐</span>
            <span className="font-semibold text-white">{currentPitch}°</span>
          </div>
        </div>
      </div>
      
      {/* Quick Action Buttons - Mobile Optimized */}
      <div className={`absolute flex gap-2 ${
        isMobile 
          ? 'top-2 right-2 flex-row' 
          : 'top-4 right-20 flex-col'
      }`}>
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: VILLAGE_CENTER,
                zoom: 16.6,
                pitch: 45,
                bearing: 0,
                duration: 1000,
              });
            }
          }}
          className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10 font-medium transition-all ${
            isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
          }`}
          title="Reset to village center"
        >
          🏠 {isMobile ? 'Reset' : 'Reset View'}
        </button>
        <button
          onClick={() => {
            if (map.current) {
              const currentPitch = map.current.getPitch();
              map.current.easeTo({
                pitch: currentPitch === 0 ? 60 : 0,
                duration: 500,
              });
            }
          }}
          className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 backdrop-blur-md text-white rounded-lg shadow-lg border border-white/10 font-medium transition-all ${
            isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
          }`}
          title="Toggle 3D view"
        >
          🔄 3D
        </button>
      </div>

      {/* Failure Counter Display */}
      {failureCount > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-lg shadow-lg border border-red-500/50 px-4 py-2 flex items-center gap-3 z-10">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Failure Events</div>
            <div className="text-xl font-bold text-white">{failureCount} <span className="text-sm font-normal text-slate-400">accumulated</span></div>
          </div>
          <button 
            onClick={() => {
              setFailureCount(0);
              clearAllFailures();
              clearNodeImpacts();
            }}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Reset Failures"
          >
            🔄
          </button>
        </div>
      )}


      {/* Failure Popup */}
      {failurePopup && (
        <FailurePopup
          node={failurePopup.node}
          position={failurePopup.position}
          onClose={() => setFailurePopup(null)}
          onTriggerFailure={handleTriggerFailure}
          isLoading={isLoadingPrediction}
        />
      )}

      {/* Add Node Popup */}
      {addNodePopup && (
        <AddNodePopup
          position={addNodePopup.position}
          mapCoords={addNodePopup.mapCoords}
          onClose={() => setAddNodePopup(null)}
          onAddNode={handleAddNode}
        />
      )}
      
      {/* Add Node Hint */}
      {!addNodePopup && !failurePopup && gnnNodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-slate-400 border border-white/10">
          💡 Right-click on map to add a new node
        </div>
      )}
    </div>
  );
}
