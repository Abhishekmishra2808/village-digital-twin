import express from 'express';
import gnnService from '../utils/gnnImpactService.js';

const router = express.Router();

/**
 * @route GET /api/gnn/status
 * @desc Get GNN service status
 */
router.get('/status', (req, res) => {
  res.json({
    initialized: gnnService.isInitialized,
    nodeCount: gnnService.graph?.nodes?.size || 0,
    edgeCount: Array.from(gnnService.graph?.edges?.values() || []).reduce((sum, edges) => sum + edges.length, 0),
    scenarios: gnnService.getFailureScenarios()
  });
});

/**
 * @route POST /api/gnn/initialize
 * @desc Initialize GNN with complete village infrastructure state
 */
router.post('/initialize', (req, res) => {
  try {
    const { villageState, waterState } = req.body;
    
    // Accept either villageState or waterState for backward compatibility
    const state = villageState || waterState;
    
    if (!state) {
      return res.status(400).json({ error: 'villageState or waterState is required' });
    }
    
    gnnService.initializeFromVillageState(state);
    
    res.json({
      success: true,
      message: 'GNN initialized successfully with village infrastructure',
      nodeCount: gnnService.graph.nodes.size,
      nodes: gnnService.getGraphNodes(),
      edges: gnnService.getGraphEdges()
    });
  } catch (error) {
    console.error('GNN initialization error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/gnn/predict-impact
 * @desc Predict cascading effects of a failure
 */
router.post('/predict-impact', (req, res) => {
  try {
    const { nodeId, failureType = 'failure', severity = 'medium', waterState } = req.body;
    
    if (!nodeId) {
      return res.status(400).json({ error: 'nodeId is required' });
    }
    
    // Auto-initialize if state provided and not initialized
    if (waterState && !gnnService.isInitialized) {
      gnnService.initializeFromWaterState(waterState);
    }
    
    if (!gnnService.isInitialized) {
      return res.status(400).json({ 
        error: 'GNN not initialized. Please provide waterState or call /initialize first.' 
      });
    }
    
    const impact = gnnService.predictFailureImpact(nodeId, failureType, severity);
    
    res.json({
      success: true,
      impact
    });
  } catch (error) {
    console.error('Impact prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/gnn/graph
 * @desc Get the current graph structure for visualization
 */
router.get('/graph', (req, res) => {
  if (!gnnService.isInitialized) {
    return res.status(400).json({ error: 'GNN not initialized' });
  }
  
  res.json({
    nodes: gnnService.getGraphNodes(),
    edges: gnnService.getGraphEdges()
  });
});

/**
 * @route GET /api/gnn/scenarios
 * @desc Get available failure scenarios
 */
router.get('/scenarios', (req, res) => {
  res.json({
    scenarios: gnnService.getFailureScenarios()
  });
});

/**
 * @route POST /api/gnn/what-if
 * @desc Run a "what-if" analysis for multiple failure scenarios
 */
router.post('/what-if', (req, res) => {
  try {
    const { scenarios, waterState } = req.body;
    
    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({ error: 'scenarios array is required' });
    }
    
    // Auto-initialize if state provided
    if (waterState) {
      gnnService.initializeFromWaterState(waterState);
    }
    
    if (!gnnService.isInitialized) {
      return res.status(400).json({ 
        error: 'GNN not initialized. Please provide waterState or call /initialize first.' 
      });
    }
    
    const results = scenarios.map(scenario => {
      try {
        const impact = gnnService.predictFailureImpact(
          scenario.nodeId, 
          scenario.failureType || 'failure', 
          scenario.severity || 'medium'
        );
        return {
          scenario,
          impact,
          success: true
        };
      } catch (error) {
        return {
          scenario,
          error: error.message,
          success: false
        };
      }
    });
    
    // Calculate combined risk
    const successfulResults = results.filter(r => r.success);
    const combinedRisk = {
      totalScenariosAnalyzed: scenarios.length,
      successfulAnalyses: successfulResults.length,
      highestRiskScenario: successfulResults.reduce((max, r) => {
        const currentRisk = r.impact?.affectedNodes?.length || 0;
        const maxRisk = max?.impact?.affectedNodes?.length || 0;
        return currentRisk > maxRisk ? r : max;
      }, null),
      totalUniqueNodesAffected: new Set(
        successfulResults.flatMap(r => r.impact?.affectedNodes?.map(n => n.nodeId) || [])
      ).size
    };
    
    res.json({
      success: true,
      results,
      combinedRisk
    });
  } catch (error) {
    console.error('What-if analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/gnn/vulnerable-nodes
 * @desc Get nodes ranked by vulnerability/criticality
 */
router.get('/vulnerable-nodes', (req, res) => {
  if (!gnnService.isInitialized) {
    return res.status(400).json({ error: 'GNN not initialized' });
  }
  
  const nodes = gnnService.getGraphNodes();
  const edges = gnnService.getGraphEdges();
  
  // Calculate vulnerability score for each node
  const vulnerableNodes = nodes.map(node => {
    // Count connections (higher = more critical)
    const incomingEdges = edges.filter(e => e.target === node.id).length;
    const outgoingEdges = edges.filter(e => e.source === node.id).length;
    const totalConnections = incomingEdges + outgoingEdges;
    
    // Base criticality from node type
    const typeCriticality = {
      'tank': 0.8,
      'pump': 0.9,
      'cluster': 0.7,
      'pipe': 0.5,
      'power': 0.95,
      'sensor': 0.3
    };
    
    // Calculate vulnerability score
    const connectivityScore = Math.min(totalConnections / 10, 1);
    const typeScore = typeCriticality[node.type] || 0.5;
    const statusPenalty = node.properties?.status === 'ok' || node.properties?.status === 'good' ? 0 : 0.3;
    
    const vulnerabilityScore = (connectivityScore * 0.4 + typeScore * 0.4 + statusPenalty * 0.2);
    
    return {
      ...node,
      vulnerabilityScore: Math.round(vulnerabilityScore * 100),
      connections: totalConnections,
      incomingEdges,
      outgoingEdges,
      riskLevel: vulnerabilityScore > 0.7 ? 'high' : vulnerabilityScore > 0.4 ? 'medium' : 'low'
    };
  });
  
  // Sort by vulnerability
  vulnerableNodes.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
  
  res.json({
    nodes: vulnerableNodes,
    criticalNodes: vulnerableNodes.filter(n => n.riskLevel === 'high'),
    summary: {
      totalNodes: nodes.length,
      highRisk: vulnerableNodes.filter(n => n.riskLevel === 'high').length,
      mediumRisk: vulnerableNodes.filter(n => n.riskLevel === 'medium').length,
      lowRisk: vulnerableNodes.filter(n => n.riskLevel === 'low').length
    }
  });
});

export default router;
