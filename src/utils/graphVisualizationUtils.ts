/**
 * GNN Graph Visualization Utilities
 * Helper functions for transforming and styling graph data
 */

import type { GraphNode, GraphLink, SeverityLevel } from '../types/graph-visualization';

/**
 * Color mappings for different severity levels
 */
export const SEVERITY_COLORS = {
  critical: '#FC8181',  // Red
  high: '#F6AD55',      // Orange
  medium: '#68D391',    // Green
  low: '#90CDF4',       // Light Blue
  none: '#cbd5e0',      // Gray
} as const;

/**
 * Get color for a given severity level
 */
export function getSeverityColor(severity: SeverityLevel): string {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.none;
}

/**
 * Determine severity level based on probability
 */
export function getSeverityFromProbability(probability: number): SeverityLevel {
  if (probability >= 75) return 'critical';
  if (probability >= 50) return 'high';
  if (probability >= 25) return 'medium';
  if (probability > 0) return 'low';
  return 'none';
}

/**
 * Calculate node size based on importance/centrality
 */
export function calculateNodeSize(
  probability: number,
  isEpicenter: boolean = false,
  baseSize: number = 5
): number {
  if (isEpicenter) return baseSize * 3;
  if (probability >= 75) return baseSize * 2.5;
  if (probability >= 50) return baseSize * 2;
  if (probability >= 25) return baseSize * 1.5;
  return baseSize;
}

/**
 * Calculate particle count for impact flow based on severity
 */
export function calculateParticleCount(probability: number): number {
  if (probability >= 75) return 8;
  if (probability >= 50) return 6;
  if (probability >= 25) return 4;
  return 2;
}

/**
 * Calculate particle speed based on urgency
 */
export function calculateParticleSpeed(
  probability: number,
  estimatedTime?: number
): number {
  // Faster particles = more urgent/severe impact
  const baseSpeed = 0.005;
  
  if (probability >= 75) return baseSpeed * 4;  // 0.02
  if (probability >= 50) return baseSpeed * 3;  // 0.015
  if (probability >= 25) return baseSpeed * 2;  // 0.01
  
  // If we have time estimate, use it (shorter time = faster particles)
  if (estimatedTime) {
    const maxTime = 60; // minutes
    const speedMultiplier = Math.max(1, (maxTime - Math.min(estimatedTime, maxTime)) / maxTime * 3);
    return baseSpeed * speedMultiplier;
  }
  
  return baseSpeed;
}

/**
 * Transform backend GNN result to visualization format
 */
export function transformGNNResultToVisualization(gnnResult: any): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const processedNodes = new Set<string>();

  // Add epicenter node
  if (gnnResult.epicenter) {
    const epicenter = gnnResult.epicenter;
    nodes.push({
      id: epicenter.id,
      name: epicenter.name,
      type: epicenter.type,
      color: '#9F7AEA', // Purple for epicenter
      size: 15,
      pulse: true,
      isEpicenter: true,
      probability: 100,
      severity: 'critical',
    });
    processedNodes.add(epicenter.id);
  }

  // Add impacted nodes
  if (gnnResult.impactedNodes && Array.isArray(gnnResult.impactedNodes)) {
    gnnResult.impactedNodes.forEach((node: any) => {
      if (processedNodes.has(node.id)) return;
      
      const severity = getSeverityFromProbability(node.probability);
      const color = getSeverityColor(severity);
      const size = calculateNodeSize(node.probability);

      nodes.push({
        id: node.id,
        name: node.name,
        type: node.type,
        color,
        size,
        probability: node.probability,
        severity,
        isEpicenter: false,
      });
      processedNodes.add(node.id);
    });
  }

  // Add physical connections from graph structure
  if (gnnResult.graph && gnnResult.graph.edges) {
    gnnResult.graph.edges.forEach((edge: any) => {
      links.push({
        source: edge.from,
        target: edge.to,
        type: 'physical',
        color: '#4A5568',
        width: 1,
      });
    });
  }

  // Add impact flow links
  if (gnnResult.impactedNodes && gnnResult.epicenter) {
    gnnResult.impactedNodes.forEach((node: any) => {
      if (node.probability > 10) { // Only show significant impacts
        const particles = calculateParticleCount(node.probability);
        const particleSpeed = calculateParticleSpeed(node.probability, node.estimatedTime);
        const severity = getSeverityFromProbability(node.probability);
        const color = getSeverityColor(severity);

        links.push({
          source: gnnResult.epicenter.id,
          target: node.id,
          type: 'impact-flow',
          color,
          width: Math.max(2, node.probability / 25),
          particles,
          particleSpeed,
        });
      }
    });
  }

  return { nodes, links };
}

/**
 * Format time duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Immediate';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours} hr`;
  return `${hours}h ${mins}m`;
}

/**
 * Format probability percentage
 */
export function formatProbability(probability: number): string {
  return `${Math.round(probability)}%`;
}

/**
 * Generate a unique color for a node type
 */
export function getNodeTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    power: '#FFD700',      // Gold
    water: '#4299E1',      // Blue
    road: '#718096',       // Gray
    building: '#A0AEC0',   // Light Gray
    pump: '#3182CE',       // Dark Blue
    hospital: '#E53E3E',   // Red
    school: '#D69E2E',     // Yellow
    tank: '#38B2AC',       // Teal
    transformer: '#805AD5', // Purple
    line: '#ED8936',       // Orange
  };
  
  return typeColors[type] || '#CBD5E0';
}

/**
 * Filter graph data by severity threshold
 */
export function filterGraphBySeverity(
  nodes: GraphNode[],
  links: GraphLink[],
  minSeverity: SeverityLevel = 'low'
): { nodes: GraphNode[]; links: GraphLink[] } {
  const severityOrder: SeverityLevel[] = ['critical', 'high', 'medium', 'low', 'none'];
  const minIndex = severityOrder.indexOf(minSeverity);
  
  const filteredNodes = nodes.filter(node => {
    if (node.isEpicenter) return true; // Always show epicenter
    const nodeIndex = severityOrder.indexOf(node.severity || 'none');
    return nodeIndex <= minIndex;
  });
  
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });
  
  return { nodes: filteredNodes, links: filteredLinks };
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStats(nodes: GraphNode[], links: GraphLink[]) {
  const totalNodes = nodes.length;
  const affectedNodes = nodes.filter(n => (n.probability || 0) > 0).length;
  const criticalNodes = nodes.filter(n => n.severity === 'critical').length;
  const highSeverityNodes = nodes.filter(n => n.severity === 'high').length;
  const impactFlows = links.filter(l => l.type === 'impact-flow').length;
  
  const avgProbability = nodes.reduce((sum, n) => sum + (n.probability || 0), 0) / totalNodes;
  
  return {
    totalNodes,
    affectedNodes,
    criticalNodes,
    highSeverityNodes,
    impactFlows,
    avgProbability,
    affectedPercentage: (affectedNodes / totalNodes) * 100,
  };
}
