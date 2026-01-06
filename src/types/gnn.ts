// GNN Impact Prediction Types for Village Infrastructure

export type InfrastructureType = 
  | 'tank' 
  | 'pump' 
  | 'cluster' 
  | 'pipe' 
  | 'power' 
  | 'sensor'
  | 'road'
  | 'building'
  | 'school'
  | 'hospital'
  | 'market';

export interface GNNNode {
  id: string;
  type: InfrastructureType;
  name: string;
  properties: {
    name?: string;
    // Water infrastructure
    capacity?: number;
    currentLevel?: number;
    flowRate?: number;
    pressure?: number;
    demand?: number;
    elevation?: number;
    status?: string;
    // Road infrastructure
    roadType?: 'main' | 'secondary' | 'tertiary' | 'path';
    length?: number;
    condition?: number;
    trafficLevel?: number;
    // Building infrastructure
    buildingType?: 'residential' | 'commercial' | 'industrial' | 'school' | 'hospital' | 'market' | 'government';
    occupancy?: number;
    criticalityLevel?: number;
    // Power infrastructure
    powerCapacity?: number;
    powerOutput?: number;
    // Location
    geo?: { lat: number; lng: number } | [number, number];
    from?: { lat: number; lng: number };
    to?: { lat: number; lng: number };
    [key: string]: any;
  };
}

export interface GNNEdge {
  source: string;
  target: string;
  weight: number;
  type: 'water_flow' | 'power' | 'road_connection' | 'road_access' | 'proximity' | 'dependency' | string;
}

export interface ImpactMetrics {
  // Water-related
  supplyDisruption: number;
  pressureDrop: number;
  qualityRisk: number;
  // General
  cascadeRisk: number;
  // Road/mobility
  accessDisruption?: number;
  mobilityImpact?: number;
  // Economic
  economicImpact?: number;
  // Safety
  safetyRisk?: number;
  // Services
  serviceDisruption?: number;
  // Power
  powerImpact?: number;
  // Recovery
  recoveryTime?: number;
  // Population
  populationAffected?: number;
}

export interface AffectedNode {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severityScore: number;
  timeToImpact: number;
  effects: string[];
  recommendations: string[];
  metrics: ImpactMetrics;
}

export interface PropagationPath {
  from: string;
  to: string;
  depth: number;
  path: string[];
  weight: number;
}

export interface OverallAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  priorityActions: string[];
  estimatedRecoveryTime: string;
  affectedPopulation: number;
}

export interface SourceFailure {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  failureType: string;
  severity: string;
}

export interface ImpactPrediction {
  sourceFailure: SourceFailure;
  affectedNodes: AffectedNode[];
  propagationPath: PropagationPath[];
  overallAssessment: OverallAssessment;
  totalAffected: number;
  criticalCount: number;
  highCount: number;
  timestamp: string;
}

export interface FailureScenario {
  id: string;
  name: string;
  description: string;
  applicableTo: string[];
}

export interface VulnerableNode extends GNNNode {
  vulnerabilityScore: number;
  connections: number;
  incomingEdges: number;
  outgoingEdges: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface GNNGraphResponse {
  nodes: GNNNode[];
  edges: GNNEdge[];
}

export interface GNNStatusResponse {
  initialized: boolean;
  nodeCount: number;
  edgeCount: number;
  scenarios: FailureScenario[];
}

export interface ImpactPredictionResponse {
  success: boolean;
  impact: ImpactPrediction;
}

export interface VulnerableNodesResponse {
  nodes: VulnerableNode[];
  criticalNodes: VulnerableNode[];
  summary: {
    totalNodes: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
  };
}

export interface WhatIfScenario {
  nodeId: string;
  failureType?: string;
  severity?: string;
}

export interface WhatIfResult {
  scenario: WhatIfScenario;
  impact?: ImpactPrediction;
  error?: string;
  success: boolean;
}

export interface WhatIfResponse {
  success: boolean;
  results: WhatIfResult[];
  combinedRisk: {
    totalScenariosAnalyzed: number;
    successfulAnalyses: number;
    highestRiskScenario: WhatIfResult | null;
    totalUniqueNodesAffected: number;
  };
}
