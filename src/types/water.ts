// Water simulation types
export interface WaterTank {
  tankId: string;
  name: string;
  capacityL: number;
  levelL: number;
  levelPercent: number;
  geo: { lat: number; lng: number };
  status: 'ok' | 'critical' | 'overflow_risk';
}

export interface WaterPipe {
  pipeId: string;
  fromNode: string;
  toNode: string;
  status: 'ok' | 'leak' | 'closed' | 'maintenance';
  leakRateLpm: number;
  pressurePsi: number;
  flowLpm: number;
}

export interface WaterCluster {
  clusterId: string;
  nodeId: string;
  name: string;
  demandLpm: number;
  currentDemandLpm: number;
  supplyStatus: 'adequate' | 'low' | 'critical' | 'none';
  geo: { lat: number; lng: number };
}

export interface WaterPump {
  pumpId: string;
  tankId: string;
  name: string;
  state: 'on' | 'off' | 'failed' | 'maintenance';
  flowLpm: number;
}

export interface WaterAlert {
  alertId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  related: {
    tankId?: string;
    pipeId?: string;
    clusterId?: string;
    pumpId?: string;
  };
  createdAt: string;
  status?: 'active' | 'acknowledged' | 'resolved';
  recommendedAction?: string;
  aiSuggestion?: {
    suggestion: string;
    route: any;
    confidence: number;
    citations: string[];
  };
}

export interface WaterSimulationState {
  time: number;
  tick: number;
  isRunning: boolean;
  tanks: WaterTank[];
  pipes: WaterPipe[];
  clusters: WaterCluster[];
  pumps: WaterPump[];
  alerts: WaterAlert[];
}
