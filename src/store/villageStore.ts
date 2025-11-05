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
  schemes: GovernmentScheme[];
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
  fetchSchemes: () => Promise<void>;
}

export const useVillageStore = create<VillageState>((set) => ({
  waterTanks: [],
  buildings: [],
  powerNodes: [],
  roads: [],
  sensors: [],
  citizenReports: [],
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
    schemes: data.schemes || [],
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
}));
