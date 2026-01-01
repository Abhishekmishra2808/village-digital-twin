import { create } from 'zustand';
import { API_URL } from '../config/api';

export interface WaterTank {
  id: string;
  name: string;
  coords: [number, number];
  elevation: number;
  capacity: number;
  currentLevel: number;
  status: 'good' | 'warning' | 'critical';
  flowRate: number;
  lastRefill: string;
  nextService: string;
}

export interface Building {
  id: string;
  name: string;
  type: string;
  coords: [number, number];
  height: number;
  floors: number;
  color: string;
  occupancy: number;
}

export interface PowerNode {
  id: string;
  name: string;
  coords: [number, number];
  capacity: number;
  currentLoad: number;
  status: 'good' | 'warning' | 'critical';
  voltage: number;
  temperature: number;
}

export interface Road {
  id: string;
  name: string;
  path: [number, number][];
  width: number;
  condition: 'good' | 'fair' | 'poor' | 'critical';
  potholes: number;
  lastMaintenance: string;
}

export interface Sensor {
  id: string;
  type: string;
  name: string;
  coords: [number, number];
  value: number;
  unit: string;
  status: 'active' | 'offline';
  lastUpdate: string;
  humidity?: number;
  windSpeed?: number;
  tds?: number;
}

export interface SchemePhase {
  id: number;
  name: string;
  progress: number;
  status: 'completed' | 'on-track' | 'delayed' | 'not-started';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
}

export interface VendorReport {
  id: number;
  vendorName: string;
  submittedDate: string;
  phase: number;
  workCompleted: string;
  expenseClaimed: number;
  verificationStatus: 'verified' | 'pending' | 'rejected' | 'under-review' | 'approved';
  documents: string[];
  pdfFileName?: string;
  complianceAnalysis?: {
    overallCompliance: number;
    matchingItems?: string[];
    discrepancies?: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      plannedWork?: string;
      actualWork?: string;
    }>;
    overdueWork?: Array<{
      task: string;
      plannedDate: string;
      status: string;
      delayDays: number;
    }>;
    budgetAnalysis?: {
      plannedBudget: number;
      actualSpent: number;
      variance: number;
      variancePercentage: number;
    };
    aiSummary?: string;
    aiProcessed?: boolean;
  };
}

export interface SchemeDiscrepancy {
  id?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedDate?: string;
  date?: string;
  reportedBy?: string;
  categories?: string[];
  concerns?: string[];
  status?: string;
}

export interface FeedbackHistory {
  id: string;
  rating: number;
  aiSummary: string;
  concerns: string[];
  sentiment: string;
  categories: string[];
  urgency: string;
  timestamp: string;
  isUrgent: boolean;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  category: string;
  village: string;
  district: string;
  totalBudget: number;
  budgetUtilized: number;
  startDate: string;
  endDate: string;
  overallProgress: number;
  status: 'on-track' | 'delayed' | 'completed' | 'discrepant';
  description: string;
  phases: SchemePhase[];
  vendorReports: VendorReport[];
  discrepancies: SchemeDiscrepancy[];
  citizenRating: number;
  feedbackCount: number;
  feedbackHistory?: FeedbackHistory[];
  lastUpdated: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  category: string;
}

// GNN Infrastructure Node (for Impact Generator)
export interface GNNInfraNode {
  id: string;
  name: string;
  type: 'tank' | 'pump' | 'pipe' | 'hospital' | 'school' | 'power' | 'cluster' | 'road' | 'building' | 'sensor' | 'market' | 'transformer';
  health: number;
  coords: [number, number];
  status: 'operational' | 'warning' | 'failed';
  failedAt?: string;
  failureType?: string;
  impactScore?: number; // Impact received from a failure (0-100)
  impactFrom?: string;  // Node ID that caused the impact
}

export interface GNNInfraEdge {
  source: string;
  target: string;
}

export interface KPIs {
  infrastructureHealth: number;
  activeSensors: number;
  offlineSensors: number;
  pendingReports: number;
  avgResponseTime: number;
}

interface VillageState {
  waterTanks: WaterTank[];
  buildings: Building[];
  powerNodes: PowerNode[];
  roads: Road[];
  sensors: Sensor[];
  schemes: GovernmentScheme[];
  alerts: Alert[];
  kpis: KPIs;
  selectedAsset: any | null;
  activeView: string;
  wsConnected: boolean;
  lastUpdate: string | null;
  sidebarCollapsed: boolean;
  infoPanelOpen: boolean;
  
  // GNN Infrastructure (Impact Generator)
  gnnNodes: GNNInfraNode[];
  gnnEdges: GNNInfraEdge[];
  failedNodes: string[]; // IDs of currently failed nodes
  
  // Authentication
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | 'field_worker' | null;
  username: string | null;
  
  // Actions
  setVillageData: (data: any) => void;
  setSelectedAsset: (asset: any) => void;
  setActiveView: (view: string) => void;
  setWsConnected: (connected: boolean) => void;
  setLastUpdate: (timestamp: string) => void;
  toggleSidebar: () => void;
  toggleInfoPanel: () => void;
  addAlert: (alert: Alert) => void;
  login: (role: 'user' | 'admin' | 'field_worker', username: string) => void;
  logout: () => void;
  fetchSchemes: () => Promise<void>;
  deleteScheme: (schemeId: string) => Promise<void>;
  
  // GNN Actions
  addGNNNode: (node: GNNInfraNode) => void;
  removeGNNNode: (nodeId: string) => void;
  addGNNEdge: (edge: GNNInfraEdge) => void;
  removeGNNEdge: (source: string, target: string) => void;
  setGNNNetwork: (nodes: GNNInfraNode[], edges: GNNInfraEdge[]) => void;
  clearGNNNetwork: () => void;
  setNodeFailed: (nodeId: string, failureType: string) => void;
  setNodeRecovered: (nodeId: string) => void;
  clearAllFailures: () => void;
  setNodeImpact: (nodeId: string, impactScore: number, impactFrom: string) => void;
  clearNodeImpacts: () => void;
  initializeRealNetwork: () => void;
}
export const useVillageStore = create<VillageState>((set) => ({
  waterTanks: [],
  buildings: [],
  powerNodes: [],
  roads: [],
  sensors: [],
  schemes: [],
  alerts: [],
  kpis: {
    infrastructureHealth: 0,
    activeSensors: 0,
    offlineSensors: 0,
    pendingReports: 0,
    avgResponseTime: 0,
  },
  selectedAsset: null,
  activeView: 'dashboard',
  wsConnected: false,
  lastUpdate: null,
  sidebarCollapsed: true, // START COLLAPSED - fixes mobile sidebar glitch
  infoPanelOpen: false,
  
  // GNN Infrastructure initial state
  gnnNodes: [],
  gnnEdges: [],
  failedNodes: [],
  
  // Authentication
  isAuthenticated: false,
  userRole: null,
  username: null,
  
  setVillageData: (data) => set((state) => {
    const waterTanks = data.waterTanks || [];
    const waterPumps = data.waterPumps || [];
    const waterPipes = data.waterPipes || [];
    const buildings = data.buildings || [];
    const powerNodes = data.powerNodes || [];
    const sensors = data.sensors || [];
    const roads = data.roads || [];
    
    // Auto-initialize GNN network from real infrastructure
    // Only GNN-supported types: Tank, Pump, Pipe, Hospital, School, Market, Power, Sensor, Road, Building
    const nodes: GNNInfraNode[] = [];
    const edges: GNNInfraEdge[] = [];
    
    // Convert Water Tanks to GNN nodes (Type: Tank)
    waterTanks.forEach((tank: any) => {
      // Normalize coords to [lng, lat] array format
      const coords: [number, number] = Array.isArray(tank.coords) 
        ? tank.coords 
        : [tank.coords?.lng || 73.8567, tank.coords?.lat || 18.5204];
      nodes.push({
        id: tank.id,
        name: tank.name,
        type: 'tank',
        health: (tank.currentLevel || 75) / 100,
        coords,
        status: tank.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Convert Water Pumps to GNN nodes (Type: Pump)
    waterPumps.forEach((pump: any) => {
      const coords: [number, number] = Array.isArray(pump.coords) 
        ? pump.coords 
        : [pump.coords?.lng || 73.8567, pump.coords?.lat || 18.5204];
      nodes.push({
        id: pump.id,
        name: pump.name,
        type: 'pump',
        health: (pump.currentFlow || 0) / (pump.capacity || 100),
        coords,
        status: pump.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Convert Water Pipes to GNN nodes (Type: Pipe)
    waterPipes.forEach((pipe: any) => {
      const coords: [number, number] = Array.isArray(pipe.coords) 
        ? pipe.coords 
        : [pipe.coords?.lng || 73.8567, pipe.coords?.lat || 18.5204];
      nodes.push({
        id: pipe.id,
        name: pipe.name,
        type: 'pipe',
        health: pipe.status === 'operational' ? 0.9 : 0.5,
        coords,
        status: pipe.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Convert Power Nodes to GNN nodes (Type: Power/Transformer)
    powerNodes.forEach((pn: any) => {
      const coords: [number, number] = Array.isArray(pn.coords) 
        ? pn.coords 
        : [pn.coords?.lng || 73.8567, pn.coords?.lat || 18.5204];
      nodes.push({
        id: pn.id,
        name: pn.name,
        type: 'transformer', // GNN type: Power
        health: 1 - ((pn.currentLoad || 0) / (pn.capacity || 100)),
        coords,
        status: pn.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Only include GNN-supported building types: School, Hospital, Market
    const gnnSupportedBuildingTypes = ['school', 'health', 'market', 'commercial'];
    buildings.forEach((b: any) => {
      // Skip non-GNN building types (residential, government, religious, etc)
      if (!gnnSupportedBuildingTypes.includes(b.type)) return;
      
      let nodeType: GNNInfraNode['type'] = 'building';
      if (b.type === 'school') nodeType = 'school';
      else if (b.type === 'health') nodeType = 'hospital';
      else if (b.type === 'market' || b.type === 'commercial') nodeType = 'market';
      
      const coords: [number, number] = Array.isArray(b.coords) 
        ? b.coords 
        : [b.coords?.lng || 73.8567, b.coords?.lat || 18.5204];
      nodes.push({
        id: b.id,
        name: b.name,
        type: nodeType,
        health: 0.95,
        coords,
        status: 'operational',
      });
    });
    
    // Convert Sensors to GNN nodes (Type: Sensor)
    sensors.forEach((s: any) => {
      const coords: [number, number] = Array.isArray(s.coords) 
        ? s.coords 
        : [s.coords?.lng || 73.8567, s.coords?.lat || 18.5204];
      nodes.push({
        id: s.id,
        name: s.name,
        type: 'sensor',
        health: s.status === 'operational' || s.status === 'active' ? 0.95 : 0.5,
        coords,
        status: 'operational',
      });
    });
    
    // Convert Roads to GNN nodes (Type: Road)
    roads.forEach((r: any) => {
      // For roads, use center point if from/to provided, or coords if available
      let coords: [number, number];
      if (r.coords) {
        coords = Array.isArray(r.coords) ? r.coords : [r.coords.lng || 73.8567, r.coords.lat || 18.5204];
      } else if (r.from && r.to) {
        coords = [(r.from[0] + r.to[0]) / 2, (r.from[1] + r.to[1]) / 2];
      } else {
        coords = [73.8567, 18.5204];
      }
      nodes.push({
        id: r.id,
        name: r.name,
        type: 'road',
        health: r.condition === 'good' ? 0.95 : r.condition === 'fair' ? 0.7 : 0.4,
        coords,
        status: 'operational',
      });
    });
    
    // Create edges based on LOGICAL water infrastructure connections
    // More realistic: proximity-based and type-appropriate connections
    
    // Each tank connects to 1-2 nearest pumps (not all pumps)
    waterTanks.forEach((tank: any, tankIdx: number) => {
      const pumpsToConnect = waterPumps.slice(0, Math.min(2, waterPumps.length));
      pumpsToConnect.forEach((pump: any) => {
        edges.push({ source: tank.id, target: pump.id });
      });
    });
    
    // Each pump connects to 1-2 pipes (distribution network)
    waterPumps.forEach((pump: any, pumpIdx: number) => {
      // Connect pump to pipes based on index (simulate sequential flow)
      const pipesToConnect = waterPipes.slice(pumpIdx, pumpIdx + 2).length > 0 
        ? waterPipes.slice(pumpIdx, pumpIdx + 2)
        : waterPipes.slice(0, Math.min(2, waterPipes.length));
      pipesToConnect.forEach((pipe: any) => {
        edges.push({ source: pump.id, target: pipe.id });
      });
    });
    
    // Pipes connect to nearby buildings (not all buildings - spread the load)
    const gnnBuildings = buildings.filter((b: any) => gnnSupportedBuildingTypes.includes(b.type));
    waterPipes.forEach((pipe: any, pipeIdx: number) => {
      // Each pipe serves ~3 buildings
      const startIdx = (pipeIdx * 3) % gnnBuildings.length;
      const buildingsToConnect = gnnBuildings.slice(startIdx, startIdx + 3);
      buildingsToConnect.forEach((b: any) => {
        edges.push({ source: pipe.id, target: b.id });
      });
    });
    
    // Power nodes connect to pumps (pumps need power) - each pump needs power
    const primaryPower = powerNodes[0];
    if (primaryPower) {
      waterPumps.forEach((pump: any) => {
        edges.push({ source: primaryPower.id, target: pump.id });
      });
      // Critical buildings get power directly
      gnnBuildings.filter((b: any) => ['hospital', 'school'].includes(b.type)).forEach((b: any) => {
        edges.push({ source: primaryPower.id, target: b.id });
      });
    }
    
    // Sensors connect to what they monitor (1 sensor per infrastructure type)
    sensors.forEach((s: any, idx: number) => {
      // Alternate sensors between pipes and tanks
      if (idx % 2 === 0 && waterPipes.length > 0) {
        const pipeIdx = Math.floor(idx / 2) % waterPipes.length;
        edges.push({ source: s.id, target: waterPipes[pipeIdx].id });
      } else if (waterTanks.length > 0) {
        const tankIdx = Math.floor(idx / 2) % waterTanks.length;
        edges.push({ source: s.id, target: waterTanks[tankIdx].id });
      }
    });
    
    // Roads connect to adjacent buildings (access routes, not all)
    roads.forEach((r: any, roadIdx: number) => {
      // Each road provides access to ~2-3 buildings
      const startIdx = (roadIdx * 2) % gnnBuildings.length;
      const accessibleBuildings = gnnBuildings.slice(startIdx, startIdx + 2);
      accessibleBuildings.forEach((b: any) => {
        edges.push({ source: r.id, target: b.id });
      });
    });
    
    return {
      waterTanks,
      buildings,
      powerNodes,
      roads,
      sensors,
      schemes: data.schemes || [],
      alerts: data.alerts || [],
      kpis: data.kpis || {},
      gnnNodes: nodes,
      gnnEdges: edges,
      // Preserve existing failedNodes - don't reset them
    };
  }),
  
  setSelectedAsset: (asset) => set({ 
    selectedAsset: asset,
    infoPanelOpen: asset !== null 
  }),
  
  setActiveView: (view) => set({ activeView: view }),
  
  setWsConnected: (connected) => set({ wsConnected: connected }),
  
  setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  toggleInfoPanel: () => set((state) => ({ 
    infoPanelOpen: !state.infoPanelOpen 
  })),
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, alert].slice(-20) // Keep last 20
  })),
  
  login: (role, username) => set({
    isAuthenticated: true,
    userRole: role,
    username: username,
  }),
  
  logout: () => set({
    isAuthenticated: false,
    userRole: null,
    username: null,
    activeView: 'dashboard',
  }),

  fetchSchemes: async () => {
    try {
      const response = await fetch(`${API_URL}/api/schemes`);
      const data = await response.json();
      if (data.schemes) {
        set({ schemes: data.schemes });
      }
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    }
  },

  deleteScheme: async (schemeId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/schemes/${schemeId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        set((state) => ({
          schemes: state.schemes.filter((s) => s.id !== schemeId),
        }));
      } else {
        throw new Error(data.error || 'Failed to delete scheme');
      }
    } catch (error) {
      console.error('Failed to delete scheme:', error);
      throw error;
    }
  },
  
  // GNN Infrastructure Actions
  addGNNNode: (node) => set((state) => ({
    gnnNodes: [...state.gnnNodes, node],
  })),
  
  removeGNNNode: (nodeId) => set((state) => ({
    gnnNodes: state.gnnNodes.filter((n) => n.id !== nodeId),
    gnnEdges: state.gnnEdges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    failedNodes: state.failedNodes.filter((id) => id !== nodeId),
  })),
  
  addGNNEdge: (edge) => set((state) => ({
    gnnEdges: [...state.gnnEdges, edge],
  })),
  
  removeGNNEdge: (source, target) => set((state) => ({
    gnnEdges: state.gnnEdges.filter(
      (e) => !(e.source === source && e.target === target) && 
             !(e.source === target && e.target === source)
    ),
  })),
  
  setGNNNetwork: (nodes, edges) => set({
    gnnNodes: nodes,
    gnnEdges: edges,
    failedNodes: [],
  }),
  
  clearGNNNetwork: () => set({
    gnnNodes: [],
    gnnEdges: [],
    failedNodes: [],
  }),
  
  setNodeFailed: (nodeId, failureType) => set((state) => ({
    failedNodes: [...new Set([...state.failedNodes, nodeId])],
    gnnNodes: state.gnnNodes.map((n) =>
      n.id === nodeId
        ? { ...n, status: 'failed' as const, failedAt: new Date().toISOString(), failureType }
        : n
    ),
  })),
  
  setNodeRecovered: (nodeId) => set((state) => ({
    failedNodes: state.failedNodes.filter((id) => id !== nodeId),
    gnnNodes: state.gnnNodes.map((n) =>
      n.id === nodeId
        ? { ...n, status: 'operational' as const, failedAt: undefined, failureType: undefined }
        : n
    ),
  })),
  
  clearAllFailures: () => set((state) => ({
    failedNodes: [],
    gnnNodes: state.gnnNodes.map((n) => ({
      ...n,
      status: 'operational' as const,
      failedAt: undefined,
      failureType: undefined,
      impactScore: undefined,
      impactFrom: undefined,
    })),
  })),
  
  setNodeImpact: (nodeId, impactScore, impactFrom) => set((state) => ({
    gnnNodes: state.gnnNodes.map((n) =>
      n.id === nodeId
        ? { ...n, impactScore, impactFrom }
        : n
    ),
  })),
  
  clearNodeImpacts: () => set((state) => ({
    gnnNodes: state.gnnNodes.map((n) => ({
      ...n,
      impactScore: undefined,
      impactFrom: undefined,
    })),
  })),
  
  // Initialize GNN network from real village infrastructure
  initializeRealNetwork: () => set((state) => {
    const nodes: GNNInfraNode[] = [];
    const edges: GNNInfraEdge[] = [];
    
    // Convert Water Tanks to GNN nodes
    state.waterTanks.forEach((tank) => {
      nodes.push({
        id: tank.id,
        name: tank.name,
        type: 'tank',
        health: tank.currentLevel / 100,
        coords: tank.coords,
        status: tank.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Convert Power Nodes (Transformers) to GNN nodes
    state.powerNodes.forEach((pn) => {
      nodes.push({
        id: pn.id,
        name: pn.name,
        type: 'transformer',
        health: 1 - (pn.currentLoad / pn.capacity),
        coords: pn.coords,
        status: pn.status === 'critical' ? 'warning' : 'operational',
      });
    });
    
    // Convert Buildings to GNN nodes (schools, hospitals, etc)
    state.buildings.forEach((b) => {
      let nodeType: GNNInfraNode['type'] = 'building';
      if (b.type === 'school') nodeType = 'school';
      else if (b.type === 'health') nodeType = 'hospital';
      else if (b.type === 'market' || b.type === 'commercial') nodeType = 'market';
      
      nodes.push({
        id: b.id,
        name: b.name,
        type: nodeType,
        health: 0.95,
        coords: b.coords,
        status: 'operational',
      });
    });
    
    // Create edges based on proximity and logical connections
    // Water tanks connect to nearby transformers and buildings
    state.waterTanks.forEach((tank) => {
      // Connect to nearby power nodes
      state.powerNodes.slice(0, 3).forEach((pn) => {
        edges.push({ source: tank.id, target: pn.id });
      });
      // Connect tanks to each other (water network)
      state.waterTanks.forEach((otherTank) => {
        if (tank.id !== otherTank.id && !edges.find(e => 
          (e.source === tank.id && e.target === otherTank.id) ||
          (e.source === otherTank.id && e.target === tank.id)
        )) {
          edges.push({ source: tank.id, target: otherTank.id });
        }
      });
    });
    
    // Power nodes connect to buildings they serve
    state.powerNodes.forEach((pn, idx) => {
      if (state.buildings[idx]) {
        edges.push({ source: pn.id, target: state.buildings[idx].id });
      }
    });
    
    // Connect main transformer to all other transformers
    const mainTransformer = state.powerNodes.find(p => p.name.includes('Main'));
    if (mainTransformer) {
      state.powerNodes.forEach((pn) => {
        if (pn.id !== mainTransformer.id) {
          edges.push({ source: mainTransformer.id, target: pn.id });
        }
      });
    }
    
    return {
      gnnNodes: nodes,
      gnnEdges: edges,
      // Preserve existing failedNodes - don't reset them
    };
  }),}));