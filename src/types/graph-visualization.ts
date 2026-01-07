/**
 * Type definitions for GNN Impact Graph Visualization
 * These types match the output structure from the backend GNN service
 */

export type NodeType = 'power' | 'water' | 'road' | 'building' | 'pump' | 'hospital' | 'school' | 'tank' | 'transformer' | 'line' | 'market' | 'cluster' | 'pipe' | 'sensor' | 'residential' | 'commercial' | 'industrial';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  
  // Visual properties
  color?: string;
  size?: number;
  
  // Impact analysis properties
  probability?: number;
  severity?: SeverityLevel;
  isEpicenter?: boolean;
  pulse?: boolean;
  timeToImpact?: number;
  
  // Additional metadata
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;  // Fixed x position
  fy?: number;  // Fixed y position
  
  // For hover/selection features
  neighbors?: GraphNode[];
  links?: GraphLink[];
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  
  // Visual properties
  type?: 'physical' | 'impact-flow' | 'dependency';
  color?: string;
  width?: number;
  
  // Particle animation properties
  particles?: number;
  particleSpeed?: number;
  particleWidth?: number;
}

export interface GraphVisualizationData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ImpactGraphVisualizerProps {
  visualizationData: GraphVisualizationData;
  height?: number;
  width?: number;
  backgroundColor?: string;
  showLegend?: boolean;
  enableInteraction?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}
