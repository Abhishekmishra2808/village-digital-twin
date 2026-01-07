/**
 * GNN Impact Visualization - Main Exports
 * 
 * Import everything you need from this single entry point:
 * 
 * import {
 *   ImpactGraphVisualizer,
 *   gnnService,
 *   getSeverityFromProbability,
 *   transformGNNResultToVisualization
 * } from './gnn-visualization';
 */

// Main Component
export { default as ImpactGraphVisualizer } from './components/ImpactGraphVisualizer';

// Demo Page
export { default as GNNImpactDemo } from './pages/GNNImpactDemo';

// Services
export { default as GNNImpactService, gnnService } from './services/gnnImpactService';
export type { ImpactAnalysisRequest, ImpactAnalysisResponse } from './services/gnnImpactService';

// Types
export type {
  GraphNode,
  GraphLink,
  GraphVisualizationData,
  ImpactGraphVisualizerProps,
  NodeType,
  SeverityLevel
} from './types/graph-visualization';

// Utilities
export {
  getSeverityColor,
  getSeverityFromProbability,
  calculateNodeSize,
  calculateParticleCount,
  calculateParticleSpeed,
  transformGNNResultToVisualization,
  formatDuration,
  formatProbability,
  getNodeTypeColor,
  filterGraphBySeverity,
  calculateGraphStats,
  SEVERITY_COLORS
} from './utils/graphVisualizationUtils';
