import { create } from 'zustand';

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

export interface CitizenReport {
  id: string;
  category: 'road' | 'water' | 'power' | 'waste' | 'other';
  title: string;
  coords: [number, number];
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  assignedTo: string | null;
  photos: number;
  description: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  category: string;
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
  citizenReports: CitizenReport[];
  alerts: Alert[];
  kpis: KPIs;
  selectedAsset: any | null;
  activeView: string;
  wsConnected: boolean;
  lastUpdate: string | null;
  sidebarCollapsed: boolean;
  infoPanelOpen: boolean;
  
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
}

export const useVillageStore = create<VillageState>((set) => ({
  waterTanks: [],
  buildings: [],
  powerNodes: [],
  roads: [],
  sensors: [],
  citizenReports: [],
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
  sidebarCollapsed: false,
  infoPanelOpen: false,
  
  // Authentication
  isAuthenticated: false,
  userRole: null,
  username: null,
  
  setVillageData: (data) => set({
    waterTanks: data.waterTanks || [],
    buildings: data.buildings || [],
    powerNodes: data.powerNodes || [],
    roads: data.roads || [],
    sensors: data.sensors || [],
    citizenReports: data.citizenReports || [],
    alerts: data.alerts || [],
    kpis: data.kpis || {},
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
}));
