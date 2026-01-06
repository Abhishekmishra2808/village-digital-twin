import { useState, useCallback } from 'react';
import { API_URL } from '../config/api';
import type {
  GNNNode,
  GNNEdge,
  ImpactPrediction,
  FailureScenario,
  VulnerableNode,
  WhatIfScenario,
  WhatIfResponse,
  GNNStatusResponse,
  VulnerableNodesResponse,
} from '../types/gnn';
import type { WaterSimulationState } from '../types/water';

// Extended village state that includes all infrastructure
interface VillageState {
  // Water infrastructure
  tanks?: Array<{ id: string; name: string; position: { lat: number; lng: number }; [key: string]: any }>;
  pumps?: Array<{ id: string; name: string; position: { lat: number; lng: number }; [key: string]: any }>;
  pipes?: Array<{ id: string; sourceId: string; targetId: string; [key: string]: any }>;
  
  // Roads and paths
  roads?: Array<{ 
    id: string; 
    name: string; 
    type: 'main' | 'secondary' | 'tertiary' | 'path';
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    [key: string]: any 
  }>;
  
  // Buildings
  buildings?: Array<{
    id: string;
    name: string;
    type: 'residential' | 'commercial' | 'industrial' | 'school' | 'hospital' | 'market' | 'government';
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Power infrastructure
  powerNodes?: Array<{
    id: string;
    name: string;
    type: 'generator' | 'transformer' | 'substation' | 'solar';
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Sensors
  sensors?: Array<{
    id: string;
    name: string;
    type: string;
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Consumer clusters
  clusters?: Array<{
    id: string;
    name: string;
    position: { lat: number; lng: number };
    population?: number;
    [key: string]: any
  }>;
  
  // Legacy water state for backward compatibility
  [key: string]: any;
}

interface UseGNNReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  nodes: GNNNode[];
  edges: GNNEdge[];
  vulnerableNodes: VulnerableNode[];
  scenarios: FailureScenario[];
  currentPrediction: ImpactPrediction | null;
  
  // Actions
  initializeGNN: (villageState: VillageState | WaterSimulationState) => Promise<boolean>;
  predictImpact: (nodeId: string, failureType?: string, severity?: string) => Promise<ImpactPrediction | null>;
  getVulnerableNodes: () => Promise<VulnerableNode[]>;
  runWhatIfAnalysis: (scenarios: WhatIfScenario[]) => Promise<WhatIfResponse | null>;
  getGraph: () => Promise<{ nodes: GNNNode[]; edges: GNNEdge[] } | null>;
  clearPrediction: () => void;
}

export function useGNN(): UseGNNReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GNNNode[]>([]);
  const [edges, setEdges] = useState<GNNEdge[]>([]);
  const [vulnerableNodes, setVulnerableNodes] = useState<VulnerableNode[]>([]);
  const [scenarios, setScenarios] = useState<FailureScenario[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<ImpactPrediction | null>(null);

  const initializeGNN = useCallback(async (villageState: VillageState | WaterSimulationState): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villageState }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize GNN');
      }
      
      setIsInitialized(true);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      
      // Fetch scenarios
      const scenariosResponse = await fetch(`${API_URL}/api/gnn/scenarios`);
      const scenariosData = await scenariosResponse.json();
      setScenarios(scenariosData.scenarios || []);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize GNN');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictImpact = useCallback(async (
    nodeId: string,
    failureType: string = 'failure',
    severity: string = 'medium'
  ): Promise<ImpactPrediction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/predict-impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId, failureType, severity }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to predict impact');
      }
      
      setCurrentPrediction(data.impact);
      return data.impact;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict impact');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVulnerableNodes = useCallback(async (): Promise<VulnerableNode[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/vulnerable-nodes`);
      const data: VulnerableNodesResponse = await response.json();
      
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to get vulnerable nodes');
      }
      
      setVulnerableNodes(data.nodes);
      return data.nodes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get vulnerable nodes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runWhatIfAnalysis = useCallback(async (
    scenariosList: WhatIfScenario[]
  ): Promise<WhatIfResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: scenariosList }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run what-if analysis');
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run what-if analysis');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGraph = useCallback(async (): Promise<{ nodes: GNNNode[]; edges: GNNEdge[] } | null> => {
    try {
      const response = await fetch(`${API_URL}/api/gnn/graph`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get graph');
      }
      
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get graph');
      return null;
    }
  }, []);

  const clearPrediction = useCallback(() => {
    setCurrentPrediction(null);
    setError(null);
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    nodes,
    edges,
    vulnerableNodes,
    scenarios,
    currentPrediction,
    initializeGNN,
    predictImpact,
    getVulnerableNodes,
    runWhatIfAnalysis,
    getGraph,
    clearPrediction,
  };
}

export default useGNN;
