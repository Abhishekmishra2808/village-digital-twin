/**
 * GNN-based Impact Prediction Service for Village Infrastructure
 * 
 * This service uses Graph Neural Network concepts to predict cascading effects
 * when something goes wrong anywhere in the village infrastructure:
 * - Roads (damage, blockage, flooding, accidents)
 * - Buildings (collapse, fire, evacuation)
 * - Power Grid (outages, overloads)
 * - Water Network (leaks, contamination)
 * - Sensors (offline, malfunction)
 * 
 * The village infrastructure is modeled as a graph where:
 * - Nodes: Roads, Buildings, Power nodes, Water tanks, Pumps, Sensors
 * - Edges: Physical connections, dependencies, proximity relationships
 * 
 * When a failure occurs at any node, the GNN propagates the impact through
 * connected infrastructure to predict downstream effects.
 */

// Graph representation of the village infrastructure
class InfrastructureGraph {
  constructor() {
    this.nodes = new Map(); // nodeId -> { type, properties, embedding }
    this.edges = new Map(); // nodeId -> [{ target, weight, type, relationship }]
    this.adjacencyMatrix = null;
    this.featureMatrix = null;
    this.spatialIndex = new Map(); // For proximity-based connections
  }

  addNode(id, type, properties) {
    this.nodes.set(id, {
      id,
      type,
      properties,
      embedding: this.createNodeEmbedding(type, properties)
    });
    if (!this.edges.has(id)) {
      this.edges.set(id, []);
    }
    
    // Add to spatial index if coordinates available
    if (properties.coords || properties.geo || properties.path) {
      let coords = properties.coords;
      if (!coords && properties.geo) {
        coords = [properties.geo.lat, properties.geo.lng];
      }
      if (!coords && properties.path && properties.path.length > 0) {
        // Use middle point of path for roads
        coords = properties.path[Math.floor(properties.path.length / 2)];
      }
      if (coords && coords[0] && coords[1]) {
        this.spatialIndex.set(id, { coords, type });
      }
    }
  }

  addEdge(sourceId, targetId, weight = 1.0, edgeType = 'connection', relationship = 'connected', directional = false) {
    if (!this.edges.has(sourceId)) {
      this.edges.set(sourceId, []);
    }
    // Prevent duplicate edges
    const existing = this.edges.get(sourceId).find(e => e.target === targetId);
    if (!existing) {
      this.edges.get(sourceId).push({ 
        target: targetId, 
        weight, 
        type: edgeType,
        relationship,
        directional // For water flow, power supply direction
      });
    }
  }

  // Create a feature embedding for each node based on its type and properties
  createNodeEmbedding(type, properties) {
    const embedding = new Array(24).fill(0); // Extended embedding for more infrastructure types
    
    // Node type encoding (one-hot style) - expanded for all infrastructure
    const typeMap = { 
      road: 0, 
      building: 1, 
      power: 2, 
      tank: 3, 
      pump: 4, 
      pipe: 5,
      sensor: 6,
      cluster: 7,
      bridge: 8,
      school: 9,
      hospital: 10,
      market: 11
    };
    if (typeMap[type] !== undefined) {
      embedding[typeMap[type]] = 1;
    }

    // Infrastructure-specific features
    // Road features
    if (type === 'road') {
      const conditionMap = { 'good': 1, 'fair': 0.7, 'poor': 0.4, 'critical': 0.1 };
      embedding[12] = conditionMap[properties.condition] ?? 0.5;
      embedding[13] = Math.min((properties.width || 5) / 20, 1); // Road width normalized
      embedding[14] = 1 - Math.min((properties.potholes || 0) / 20, 1); // Pothole score inverted
      embedding[15] = properties.isMainRoad ? 1 : 0.3;
      embedding[16] = properties.trafficLevel ? Math.min(properties.trafficLevel / 100, 1) : 0.5;
    }
    
    // Building features
    if (type === 'building' || type === 'school' || type === 'hospital' || type === 'market') {
      embedding[12] = Math.min((properties.occupancy || 0) / 500, 1); // Population served
      embedding[13] = Math.min((properties.floors || 1) / 10, 1); // Building size
      embedding[14] = properties.type === 'critical' ? 1 : 0.5; // Critical infrastructure flag
      const buildingImportance = {
        'hospital': 1, 'school': 0.9, 'market': 0.8, 'government': 0.85,
        'residential': 0.6, 'commercial': 0.7, 'industrial': 0.75
      };
      embedding[15] = buildingImportance[properties.type] || 0.5;
    }
    
    // Power node features
    if (type === 'power') {
      embedding[12] = Math.min((properties.capacity || 0) / 1000, 1);
      embedding[13] = properties.currentLoad ? properties.currentLoad / (properties.capacity || 1) : 0.5;
      const statusMap = { 'good': 1, 'warning': 0.5, 'critical': 0.1 };
      embedding[14] = statusMap[properties.status] ?? 0.5;
      embedding[15] = Math.min((properties.voltage || 220) / 440, 1);
    }
    
    // Water infrastructure features
    if (type === 'tank' || type === 'pump' || type === 'pipe') {
      embedding[12] = properties.capacity ? Math.min(properties.capacity / 100000, 1) : 0.5;
      embedding[13] = properties.currentLevel ? properties.currentLevel / 100 : 0.5;
      embedding[14] = properties.flowRate ? Math.min(properties.flowRate / 100, 1) : 0.5;
      const statusMap = { 'ok': 1, 'good': 1, 'on': 1, 'warning': 0.5, 'critical': 0.1, 'failed': 0 };
      embedding[15] = statusMap[properties.status] ?? 0.5;
    }
    
    // Sensor features
    if (type === 'sensor') {
      embedding[12] = properties.status === 'active' ? 1 : 0;
      embedding[13] = properties.value ? Math.min(properties.value / 100, 1) : 0.5;
    }
    
    // Consumer cluster features
    if (type === 'cluster') {
      embedding[12] = properties.demand ? Math.min(properties.demand / 1000, 1) : 0.5;
      const supplyMap = { 'adequate': 1, 'low': 0.5, 'critical': 0.2, 'none': 0 };
      embedding[13] = supplyMap[properties.supplyStatus] ?? 0.5;
    }

    // Universal features
    embedding[17] = this.calculateCriticality(type, properties);
    embedding[18] = properties.populationServed ? Math.min(properties.populationServed / 1000, 1) : 0;
    embedding[19] = properties.economicValue ? Math.min(properties.economicValue / 1000000, 1) : 0;
    
    // Connectivity (will be updated after graph is built)
    embedding[20] = 0;
    
    // Age/maintenance factor
    embedding[21] = properties.lastMaintenance ? this.calculateMaintenanceScore(properties.lastMaintenance) : 0.5;
    
    // Weather vulnerability
    embedding[22] = properties.floodRisk ? properties.floodRisk : 0.3;
    
    // Historical failure rate
    embedding[23] = properties.failureHistory ? Math.min(properties.failureHistory / 10, 1) : 0.1;
    
    return embedding;
  }

  calculateMaintenanceScore(lastMaintenance) {
    const now = new Date();
    const lastDate = new Date(lastMaintenance);
    const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSince / 365));
  }

  calculateCriticality(type, properties) {
    let criticality = 0.5;
    
    switch (type) {
      case 'road':
        if (properties.isMainRoad) criticality += 0.3;
        if (properties.connectsCritical) criticality += 0.2;
        if (properties.condition === 'poor' || properties.condition === 'critical') criticality += 0.2;
        break;
        
      case 'building':
        if (properties.type === 'hospital') criticality = 1.0;
        else if (properties.type === 'school') criticality = 0.9;
        else if (properties.type === 'government') criticality = 0.85;
        else if (properties.occupancy > 100) criticality += 0.2;
        break;
        
      case 'hospital':
        criticality = 1.0;
        break;
        
      case 'school':
        criticality = 0.9;
        break;
        
      case 'market':
        criticality = 0.8;
        break;
        
      case 'power':
        if (properties.capacity > 500) criticality += 0.3;
        if (properties.servesCritical) criticality += 0.2;
        break;
        
      case 'tank':
        if (properties.capacity > 50000) criticality += 0.2;
        if (properties.currentLevel < 30) criticality += 0.2;
        break;
        
      case 'pump':
        if (properties.flowRate > 50) criticality += 0.3;
        break;
        
      case 'cluster':
        if (properties.demand > 500) criticality += 0.3;
        break;
    }
    
    return Math.min(criticality, 1);
  }

  // Calculate distance between two coordinate pairs
  calculateDistance(coords1, coords2) {
    if (!coords1 || !coords2) return Infinity;
    const dx = coords1[0] - coords2[0];
    const dy = coords1[1] - coords2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Build proximity-based connections between infrastructure
  buildProximityEdges(maxDistance = 0.005) { // ~500m in lat/lng
    const nodes = Array.from(this.spatialIndex.entries());
    
    for (let i = 0; i < nodes.length; i++) {
      const [id1, data1] = nodes[i];
      
      for (let j = i + 1; j < nodes.length; j++) {
        const [id2, data2] = nodes[j];
        
        const distance = this.calculateDistance(data1.coords, data2.coords);
        
        if (distance < maxDistance && distance > 0) {
          // Weight inversely proportional to distance
          const weight = Math.max(0.1, 1 - (distance / maxDistance));
          
          // Determine relationship type
          let relationship = 'proximity';
          if (data1.type === 'road' && data2.type === 'building') {
            relationship = 'road-access';
          } else if (data1.type === 'building' && data2.type === 'road') {
            relationship = 'road-access';
          } else if (data1.type === 'power' && data2.type !== 'power') {
            relationship = 'power-supply';
          } else if (data1.type !== 'power' && data2.type === 'power') {
            relationship = 'power-supply';
          } else if (data1.type === 'road' && data2.type === 'road') {
            relationship = 'road-network';
          }
          
          this.addEdge(id1, id2, weight * 0.7, 'proximity', relationship);
          this.addEdge(id2, id1, weight * 0.7, 'proximity', relationship);
        }
      }
    }
  }

  // Build adjacency matrix for GNN message passing
  buildAdjacencyMatrix() {
    const nodeIds = Array.from(this.nodes.keys());
    const n = nodeIds.length;
    const nodeIndex = new Map(nodeIds.map((id, i) => [id, i]));
    
    this.adjacencyMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (const [sourceId, edges] of this.edges) {
      const sourceIdx = nodeIndex.get(sourceId);
      for (const edge of edges) {
        const targetIdx = nodeIndex.get(edge.target);
        if (targetIdx !== undefined && sourceIdx !== undefined) {
          this.adjacencyMatrix[sourceIdx][targetIdx] = Math.max(
            this.adjacencyMatrix[sourceIdx][targetIdx], 
            edge.weight
          );
        }
      }
    }
    
    // Update connectivity in embeddings
    for (const [nodeId, node] of this.nodes) {
      const idx = nodeIndex.get(nodeId);
      if (idx !== undefined) {
        const connections = this.adjacencyMatrix[idx].filter(w => w > 0).length;
        node.embedding[20] = Math.min(connections / 15, 1);
      }
    }
    
    this.nodeIndex = nodeIndex;
    this.nodeIds = nodeIds;
    return this.adjacencyMatrix;
  }
}

// Simple GNN Layer implementation (Message Passing)
class GNNLayer {
  constructor(inputDim, outputDim) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.weights = this.initializeWeights(inputDim, outputDim);
    this.bias = new Array(outputDim).fill(0.1);
    this.attentionWeights = new Array(inputDim).fill(0).map(() => Math.random() * 0.2 + 0.9);
  }

  initializeWeights(inputDim, outputDim) {
    // Heuristic-based initialization prioritizing criticality dimensions
    const weights = Array(inputDim).fill(null).map(() => Array(outputDim).fill(0));
    
    for (let i = 0; i < inputDim; i++) {
      for (let j = 0; j < outputDim; j++) {
        // Criticality dimensions (type encoding 0-11, status 12-16) get higher weights
        let baseWeight = (i < 12 || (i >= 12 && i <= 16)) ? 0.5 : 0.3;
        
        // Add small random variation
        const variance = (Math.random() * 2 - 1) * 0.15;
        weights[i][j] = baseWeight + variance;
      }
    }
    return weights;
  }

  relu(x) {
    return Math.max(0, x);
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  forward(nodeFeatures, neighborFeatures, adjacencyWeights, relationshipGates = null) {
    const aggregated = new Array(this.inputDim).fill(0);
    let totalWeight = 0;
    
    for (let i = 0; i < neighborFeatures.length; i++) {
      let weight = adjacencyWeights[i] || 0;
      
      // Apply relationship gating if provided
      if (relationshipGates && relationshipGates[i] !== undefined) {
        weight *= relationshipGates[i];
      }
      
      if (weight > 0) {
        totalWeight += weight;
        for (let j = 0; j < this.inputDim; j++) {
          aggregated[j] += (neighborFeatures[i][j] || 0) * weight;
        }
      }
    }
    
    if (totalWeight > 0) {
      for (let j = 0; j < this.inputDim; j++) {
        aggregated[j] /= totalWeight;
      }
    }
    
    // Gated aggregation: reduce influence of irrelevant features
    const combined = nodeFeatures.map((f, i) => {
      const gate = this.attentionWeights[i] || 0.5;
      return f * gate + aggregated[i] * (1 - gate);
    });
    
    const output = new Array(this.outputDim).fill(0);
    for (let i = 0; i < this.outputDim; i++) {
      for (let j = 0; j < this.inputDim; j++) {
        output[i] += combined[j] * this.weights[j][i];
      }
      output[i] = this.relu(output[i] + this.bias[i]);
    }
    
    return output;
  }
}

// Impact Prediction GNN Model for Village Infrastructure
class ImpactPredictionGNN {
  constructor() {
    this.layer1 = new GNNLayer(24, 48);  // Expand features
    this.layer2 = new GNNLayer(48, 48);  // Message passing
    this.layer3 = new GNNLayer(48, 12);  // Impact prediction head
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  predictImpact(graph, failedNodeId, failureType, failureSeverity) {
    const adjacencyMatrix = graph.adjacencyMatrix || graph.buildAdjacencyMatrix();
    const nodeIds = graph.nodeIds;
    const nodeIndex = graph.nodeIndex;
    
    let embeddings = nodeIds.map(id => [...graph.nodes.get(id).embedding]);
    
    // Inject failure signal with severity encoding
    const failedIdx = nodeIndex.get(failedNodeId);
    const failedNode = graph.nodes.get(failedNodeId);
    if (failedIdx !== undefined) {
      // Encode severity: low=0.3, medium=0.5, high=0.75, critical=1.0
      const severityMap = { low: 0.3, medium: 0.5, high: 0.75, critical: 1.0 };
      const severityValue = severityMap[failureSeverity] || 0.5;
      
      // Zero out status and inject failure with severity
      for (let i = 12; i <= 16; i++) {
        embeddings[failedIdx][i] = 0;
      }
      embeddings[failedIdx][23] = severityValue; // Severity-aware failure indicator
      
      // Amplify failure signal based on node criticality
      const criticality = failedNode.properties.criticalityLevel || this.calculateCriticalityForType(failedNode.type);
      embeddings[failedIdx][17] = Math.min(1, criticality * 1.2);
    }
    
    // Compute relationship gating for each node
    const relationshipGates = nodeIds.map((targetId, i) => {
      return nodeIds.map((sourceId, j) => {
        if (i === j) return 1.0;
        const targetNode = graph.nodes.get(targetId);
        const sourceNode = graph.nodes.get(sourceId);
        return this.computeRelationshipGate(failedNode?.type, sourceNode?.type, targetNode?.type, failureType);
      });
    });
    
    // GNN forward passes with relationship gating
    let hidden1 = embeddings.map((emb, i) => {
      const neighborEmbs = nodeIds.map((_, j) => embeddings[j]);
      return this.layer1.forward(emb, neighborEmbs, adjacencyMatrix[i], relationshipGates[i]);
    });
    
    let hidden2 = hidden1.map((emb, i) => {
      return this.layer2.forward(emb, hidden1, adjacencyMatrix[i], relationshipGates[i]);
    });
    
    const impactScores = hidden2.map((emb, i) => {
      const output = this.layer3.forward(emb, hidden2, adjacencyMatrix[i], relationshipGates[i]);
      return this.interpretImpactOutput(output, graph.nodes.get(nodeIds[i]).type, failedNode?.type);
    });
    
    return this.analyzeImpact(graph, failedNodeId, failureType, failureSeverity, impactScores, nodeIds);
  }

  // Relationship gating: determine how much one type affects another
  computeRelationshipGate(failedType, sourceType, targetType, failureType) {
    // Define infrastructure dependency matrix
    const dependencyMatrix = {
      // Water failures
      tank: { pump: 0.9, pipe: 0.9, cluster: 0.8, building: 0.6, hospital: 0.7, school: 0.6, power: 0.0, road: 0.2 },
      pump: { tank: 0.3, pipe: 0.9, cluster: 0.7, building: 0.5, hospital: 0.6, school: 0.5, power: 0.0, road: 0.1 },
      pipe: { tank: 0.1, pump: 0.2, cluster: 0.8, building: 0.5, hospital: 0.6, school: 0.5, power: 0.0, road: 0.3 },
      
      // Power failures
      power: { pump: 0.9, tank: 0.3, building: 0.8, hospital: 0.9, school: 0.8, market: 0.7, road: 0.4, sensor: 0.9, cluster: 0.7, pipe: 0.0 },
      
      // Road failures
      road: { building: 0.7, hospital: 0.9, school: 0.8, market: 0.8, road: 0.6, cluster: 0.5, power: 0.1, tank: 0.2, pump: 0.2 },
      
      // Building failures
      hospital: { cluster: 0.6, building: 0.4, road: 0.5, school: 0.3, power: 0.0, tank: 0.0 },
      school: { cluster: 0.5, building: 0.3, road: 0.4, power: 0.0, tank: 0.0 },
      market: { cluster: 0.6, building: 0.4, road: 0.6, power: 0.2, tank: 0.0 },
      building: { cluster: 0.4, building: 0.3, road: 0.4, power: 0.0, tank: 0.0 },
      
      // Sensors and clusters (monitoring/consumption)
      sensor: { tank: 0.2, pump: 0.2, pipe: 0.2, cluster: 0.3, power: 0.0, road: 0.0 },
      cluster: { building: 0.3, hospital: 0.4, school: 0.3, market: 0.3, power: 0.0, road: 0.2, tank: 0.0 }
    };
    
    // Get base gating value
    let gate = 1.0;
    if (failedType && dependencyMatrix[failedType] && dependencyMatrix[failedType][targetType]) {
      gate = dependencyMatrix[failedType][targetType];
    } else if (failedType === targetType) {
      gate = 0.8; // Same type has moderate impact
    } else {
      gate = 0.3; // Default weak connection
    }
    
    // Failure-type specific modifiers
    if (failureType === 'leak' || failureType === 'contamination') {
      // Water issues don't affect power at all
      if (targetType === 'power') gate = 0.0;
    } else if (failureType === 'power_outage' || failureType === 'overload') {
      // Power issues heavily affect pumps and sensors
      if (targetType === 'pump' || targetType === 'sensor') gate *= 1.3;
      if (targetType === 'tank' || targetType === 'pipe') gate = 0.0; // Gravity-fed unaffected
    } else if (failureType === 'road_damage' || failureType === 'road_flood' || failureType === 'road_blockage') {
      // Road issues affect accessibility
      if (targetType === 'hospital' || targetType === 'school') gate *= 1.2;
      if (targetType === 'power' || targetType === 'tank') gate *= 0.5; // Infrastructure less affected
    }
    
    return Math.max(0, Math.min(1, gate));
  }

  interpretImpactOutput(output, nodeType, sourceType) {
    // Normalize output values to 0-1 range first (they come from ReLU, can be large)
    const maxOutput = Math.max(...output.map(Math.abs), 1);
    const normalizedOutput = output.map(v => v / maxOutput);
    
    // Apply type-specific scaling factors (but keep them moderate)
    const typeMultiplier = this.getTypeImpactMultiplier(nodeType, sourceType);
    
    // Use normalized values with gentle scaling - sigmoid will map to 0-1
    // Keep multipliers small (0.5-1.5 range) to avoid saturation
    const probInput = normalizedOutput[0] * (0.5 + typeMultiplier * 0.3);
    const probValue = this.sigmoid(probInput);
    
    const baseImpact = {
      impactProbability: probValue,
      severityScore: this.sigmoid(normalizedOutput[1] * (0.45 + typeMultiplier * 0.27)),
      timeToImpact: Math.max(0.5, Math.abs(normalizedOutput[2]) * 30), // Minutes
      accessDisruption: this.sigmoid(normalizedOutput[3] * 1.2),
      serviceDisruption: this.sigmoid(normalizedOutput[4] * 1.1),
      economicImpact: this.sigmoid(normalizedOutput[5] * 0.95),
      safetyRisk: this.sigmoid(normalizedOutput[6] * 1.15),
      populationAffected: this.sigmoid(normalizedOutput[7] * 1.0),
      cascadeRisk: this.sigmoid(normalizedOutput[8] * 1.1),
      recoveryDifficulty: this.sigmoid(normalizedOutput[9] * 0.9),
      alternativeAvailable: this.sigmoid(normalizedOutput[10] * 1.0),
      urgencyScore: this.sigmoid(normalizedOutput[11] * 1.05)
    };
    
    return baseImpact;
  }

  getTypeImpactMultiplier(nodeType, sourceType) {
    // Infrastructure types have different susceptibility to different failures
    const impactMatrix = {
      road: { road: 1.3, building: 0.8, power: 0.6, tank: 0.7, pump: 0.7 },
      building: { road: 1.2, building: 1.4, power: 1.0, tank: 0.8, pump: 0.7 },
      school: { road: 1.3, building: 1.2, power: 1.1, tank: 0.9, pump: 0.8 },
      hospital: { road: 1.4, building: 1.3, power: 1.3, tank: 1.0, pump: 1.0 },
      market: { road: 1.2, building: 1.1, power: 1.0, tank: 0.8, pump: 0.7 },
      power: { road: 0.7, building: 0.8, power: 1.5, tank: 0.9, pump: 1.2 },
      tank: { road: 0.6, building: 0.7, power: 1.0, tank: 1.3, pump: 1.2 },
      pump: { road: 0.7, building: 0.8, power: 1.3, tank: 1.1, pump: 1.4 },
      cluster: { road: 1.1, building: 1.0, power: 1.2, tank: 1.1, pump: 1.0 }
    };
    
    return impactMatrix[nodeType]?.[sourceType] || 1.0;
  }

  calculateCriticalityForType(type) {
    const criticalityMap = {
      hospital: 1.0, school: 0.9, market: 0.75,
      power: 0.85, road: 0.7, building: 0.6,
      tank: 0.75, pump: 0.8, cluster: 0.65
    };
    return criticalityMap[type] || 0.5;
  }

  analyzeImpact(graph, failedNodeId, failureType, failureSeverity, impactScores, nodeIds) {
    const failedNode = graph.nodes.get(failedNodeId);
    const affectedNodes = [];
    const visualizationEdges = [];
    let totalImpact = 0;

    nodeIds.forEach((nodeId, idx) => {
      if (nodeId === failedNodeId) return;
      
      const node = graph.nodes.get(nodeId);
      const score = impactScores[idx];
      
      // PHYSICS-BASED DECAY: Use inverse square law (1/d²)
      const distance = this.calculateNodeDistance(graph, failedNodeId, nodeId);
      const physicsDecay = distance > 0 ? 1 / Math.pow(distance, 2) : 1;
      
      // Normalize physics decay to reasonable range (0.1 to 1.0)
      const normalizedDecay = Math.max(0.1, Math.min(1.0, physicsDecay));
      
      const adjustedProbability = score.impactProbability * normalizedDecay;
      
      // NOISE FLOOR: Implement 30% threshold to avoid "impact leak"
      const NOISE_FLOOR = 0.30;
      
      // Dynamic threshold based on node criticality
      const criticalityThreshold = node.properties.criticalityLevel || 0.5;
      const threshold = NOISE_FLOOR * (1 - criticalityThreshold * 0.3);
      
      if (adjustedProbability > threshold) {
        score.impactProbability = Math.min(0.98, adjustedProbability); // Cap at 98%
        
        // Add edge for visualization (particle flow)
        visualizationEdges.push({
          source: failedNodeId,
          target: nodeId,
          strength: adjustedProbability,
          particleSpeed: 0.01 * (1 - distance / 10), // Slower for distant nodes
          particleWidth: 2 + Math.round(adjustedProbability * 3),
          color: this.getEdgeColor(adjustedProbability)
        });
        
        // Ensure probability is 0-1 range before displaying as percentage
        let displayProbability = score.impactProbability;
        if (displayProbability > 1) {
          displayProbability = displayProbability / 100; // Fix if somehow already percentage
        }
        
        const impact = {
          nodeId,
          nodeType: node.type,
          nodeName: node.properties.name || nodeId,
          probability: Math.min(98, Math.round(displayProbability * 100)),
          severity: this.getSeverityLevel(score.severityScore),
          severityScore: Math.round(score.severityScore * 100),
          timeToImpact: Math.round(score.timeToImpact * 10) / 10,
          effects: this.generateEffects(node.type, score, failureType, failedNode?.type),
          recommendations: this.generateRecommendations(node.type, score, failureType),
          metrics: {
            accessDisruption: Math.round(score.accessDisruption * 100),
            serviceDisruption: Math.round(score.serviceDisruption * 100),
            economicImpact: Math.round(score.economicImpact * 100),
            safetyRisk: Math.round(score.safetyRisk * 100),
            populationAffected: Math.round(score.populationAffected * 100),
            cascadeRisk: Math.round(score.cascadeRisk * 100)
          }
        };
        
        affectedNodes.push(impact);
        totalImpact += score.severityScore;
      }
    });

    affectedNodes.sort((a, b) => b.severityScore - a.severityScore);

    // Build propagation paths
    const propagationPath = this.buildPropagationPaths(graph, failedNodeId, affectedNodes);

    const overallAssessment = this.generateOverallAssessment(
      failedNode, failureType, failureSeverity, affectedNodes, totalImpact
    );

    // VISUALIZATION DATA STRUCTURE for react-force-graph
    const visualizationData = this.buildVisualizationData(
      graph, failedNodeId, affectedNodes, visualizationEdges, nodeIds
    );

    return {
      sourceFailure: {
        nodeId: failedNodeId,
        nodeType: failedNode?.type,
        nodeName: failedNode?.properties?.name || failedNodeId,
        failureType,
        severity: failureSeverity
      },
      affectedNodes,
      propagationPath,
      overallAssessment,
      totalAffected: affectedNodes.length,
      criticalCount: affectedNodes.filter(n => n.severity === 'critical').length,
      highCount: affectedNodes.filter(n => n.severity === 'high').length,
      timestamp: new Date().toISOString(),
      visualization: visualizationData // For graph rendering
    };
  }

  // Build visualization data for react-force-graph / D3.js
  buildVisualizationData(graph, failedNodeId, affectedNodes, visualizationEdges, nodeIds) {
    const nodes = [];
    const links = [];
    
    // Add all nodes with visual properties
    nodeIds.forEach(nodeId => {
      const graphNode = graph.nodes.get(nodeId);
      const isEpicenter = nodeId === failedNodeId;
      const affectedNode = affectedNodes.find(n => n.nodeId === nodeId);
      
      let nodeColor = '#4A5568'; // Default gray
      let nodeSize = 5;
      let pulseEffect = false;
      
      if (isEpicenter) {
        nodeColor = '#9F7AEA'; // Purple for epicenter
        nodeSize = 12;
        pulseEffect = true;
      } else if (affectedNode) {
        // Heat signature based on severity
        if (affectedNode.severity === 'critical') {
          nodeColor = '#FC8181'; // Red
          nodeSize = 10;
        } else if (affectedNode.severity === 'high') {
          nodeColor = '#F6AD55'; // Orange
          nodeSize = 8;
        } else {
          nodeColor = '#F6E05E'; // Yellow
          nodeSize = 6;
        }
      }
      
      nodes.push({
        id: nodeId,
        name: graphNode.properties.name || nodeId,
        type: graphNode.type,
        color: nodeColor,
        size: nodeSize,
        pulse: pulseEffect,
        severity: affectedNode?.severity || 'none',
        probability: affectedNode?.probability || 0,
        isEpicenter
      });
    });
    
    // Add edges from graph structure
    graph.edges.forEach((targets, sourceId) => {
      targets.forEach(edge => {
        links.push({
          source: sourceId,
          target: edge.target,
          weight: edge.weight,
          type: edge.type,
          relationship: edge.relationship,
          color: '#718096', // Default edge color
          width: edge.weight * 2
        });
      });
    });
    
    // Add impact flow edges (for particle animation)
    visualizationEdges.forEach(edge => {
      links.push({
        source: edge.source,
        target: edge.target,
        weight: edge.strength,
        type: 'impact-flow',
        color: edge.color,
        width: edge.particleWidth,
        particles: Math.ceil(edge.strength * 3), // Number of particles
        particleSpeed: edge.particleSpeed,
        animated: true
      });
    });
    
    return {
      nodes,
      links,
      layout: 'force-directed',
      config: {
        nodeRelSize: 4,
        linkWidth: link => link.width || 1,
        linkDirectionalParticles: link => link.animated ? link.particles : 0,
        linkDirectionalParticleSpeed: link => link.particleSpeed || 0.01,
        nodeCanvasObject: (node, ctx, globalScale) => {
          // Custom rendering for pulsing epicenter
          if (node.pulse) {
            const size = node.size * (1 + 0.3 * Math.sin(Date.now() * 0.005));
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            ctx.fillStyle = node.color;
            ctx.fill();
            ctx.strokeStyle = '#B794F4';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    };
  }

  // Helper to determine edge color based on impact strength
  getEdgeColor(strength) {
    if (strength > 0.7) return '#FC8181'; // Red - high impact
    if (strength > 0.5) return '#F6AD55'; // Orange - medium impact
    if (strength > 0.3) return '#F6E05E'; // Yellow - low impact
    return '#A0AEC0'; // Gray - minimal impact
  }
        failureType,
        severity: failureSeverity
      },
      affectedNodes,
      propagationPath,
      overallAssessment,
      totalAffected: affectedNodes.length,
      criticalCount: affectedNodes.filter(n => n.severity === 'critical').length,
      highCount: affectedNodes.filter(n => n.severity === 'high').length,
      timestamp: new Date().toISOString()
    };
  }

  buildPropagationPaths(graph, failedNodeId, affectedNodes) {
    const propagationPath = [];
    const visited = new Set([failedNodeId]);
    const queue = [{ nodeId: failedNodeId, depth: 0, path: [failedNodeId] }];
    
    while (queue.length > 0) {
      const { nodeId, depth, path } = queue.shift();
      if (depth > 5) continue;
      
      const edges = graph.edges.get(nodeId) || [];
      for (const edge of edges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          const newPath = [...path, edge.target];
          
          if (affectedNodes.find(n => n.nodeId === edge.target)) {
            propagationPath.push({
              from: nodeId,
              to: edge.target,
              depth: depth + 1,
              path: newPath,
              weight: edge.weight,
              relationship: edge.relationship
            });
          }
          
          queue.push({ nodeId: edge.target, depth: depth + 1, path: newPath });
        }
      }
    }
    
    return propagationPath;
  }

  getSeverityLevel(score) {
    if (score >= 0.75) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.25) return 'medium';
    return 'low';
  }

  generateEffects(nodeType, score, failureType, sourceType) {
    const effects = [];
    
    switch (nodeType) {
      case 'road':
        if (score.accessDisruption > 0.3) {
          effects.push(`Traffic disruption: ~${Math.round(score.accessDisruption * 100)}% capacity reduction`);
        }
        if (sourceType === 'road') {
          effects.push('Alternative routes may become congested');
        }
        if (score.safetyRisk > 0.4) {
          effects.push('⚠️ Potential safety hazard for commuters');
        }
        if (score.economicImpact > 0.3) {
          effects.push(`Economic impact on local businesses along route`);
        }
        break;
        
      case 'building':
      case 'school':
      case 'hospital':
      case 'market':
        if (score.serviceDisruption > 0.3) {
          effects.push(`Service disruption for ~${Math.round(score.populationAffected * 500)} people`);
        }
        if (score.accessDisruption > 0.4 && sourceType === 'road') {
          effects.push('Accessibility compromised due to road issues');
        }
        if (score.safetyRisk > 0.5) {
          effects.push('🚨 Evacuation may be required');
        }
        if (nodeType === 'hospital' && score.serviceDisruption > 0.2) {
          effects.push('⚕️ Critical healthcare services affected');
        }
        if (nodeType === 'school' && score.serviceDisruption > 0.2) {
          effects.push('📚 Educational activities disrupted');
        }
        if (nodeType === 'market' && score.economicImpact > 0.3) {
          effects.push('🏪 Commercial activities disrupted');
        }
        break;
        
      case 'power':
        if (score.serviceDisruption > 0.3) {
          effects.push(`Power outage affecting ${Math.round(score.populationAffected * 100)}% of connected area`);
        }
        if (score.cascadeRisk > 0.5) {
          effects.push('⚡ Risk of grid-wide cascading failure');
        }
        effects.push('Backup generators may need activation');
        break;
        
      case 'tank':
      case 'pump':
        if (score.serviceDisruption > 0.3) {
          effects.push(`Water supply reduced by ~${Math.round(score.serviceDisruption * 100)}%`);
        }
        if (sourceType === 'power') {
          effects.push('Pumping operations affected by power issues');
        }
        break;
        
      case 'cluster':
        if (score.serviceDisruption > 0.3) {
          effects.push(`~${Math.round(score.populationAffected * 200)} households affected`);
        }
        if (score.accessDisruption > 0.4) {
          effects.push('Residents may face difficulty commuting');
        }
        break;
        
      case 'sensor':
        effects.push('Monitoring capability reduced in this area');
        if (score.cascadeRisk > 0.4) {
          effects.push('Early warning system compromised');
        }
        break;
        
      default:
        effects.push(`Impact probability: ${Math.round(score.impactProbability * 100)}%`);
    }
    
    // Add time-based effect
    if (score.timeToImpact < 4) {
      effects.push(`⏰ Impact expected within ${Math.round(score.timeToImpact)} hours`);
    }
    
    return effects;
  }

  generateRecommendations(nodeType, score, failureType) {
    const recommendations = [];
    
    if (score.severityScore > 0.7) {
      recommendations.push('🚨 URGENT: Immediate response required');
    }
    
    switch (nodeType) {
      case 'road':
        recommendations.push('Set up traffic diversions and signage');
        if (score.safetyRisk > 0.4) {
          recommendations.push('Deploy traffic police/wardens');
        }
        if (failureType === 'flood' || failureType === 'damage') {
          recommendations.push('Assess structural integrity before reopening');
        }
        break;
        
      case 'building':
      case 'school':
      case 'hospital':
      case 'market':
        if (score.safetyRisk > 0.5) {
          recommendations.push('Prepare evacuation plan');
          recommendations.push('Alert emergency services');
        }
        if (score.serviceDisruption > 0.4) {
          recommendations.push('Arrange alternative service locations');
        }
        if (nodeType === 'hospital') {
          recommendations.push('Activate backup power systems');
          recommendations.push('Prepare patient transfer protocols');
        }
        if (nodeType === 'school') {
          recommendations.push('Notify parents and guardians');
        }
        break;
        
      case 'power':
        recommendations.push('Activate backup generators for critical facilities');
        recommendations.push('Notify utility repair teams');
        if (score.cascadeRisk > 0.5) {
          recommendations.push('Implement load shedding protocol');
        }
        break;
        
      case 'tank':
      case 'pump':
        recommendations.push('Monitor water levels closely');
        if (score.serviceDisruption > 0.5) {
          recommendations.push('Prepare water tanker deployment');
        }
        break;
        
      case 'cluster':
        if (score.serviceDisruption > 0.5) {
          recommendations.push('Issue community advisory');
        }
        if (score.accessDisruption > 0.5) {
          recommendations.push('Coordinate with transport authorities');
        }
        break;
    }
    
    if (score.timeToImpact < 2) {
      recommendations.push(`⏱️ Act within ${Math.round(score.timeToImpact * 60)} minutes`);
    }
    
    return recommendations;
  }

  generateOverallAssessment(failedNode, failureType, failureSeverity, affectedNodes, totalImpact) {
    const criticalCount = affectedNodes.filter(n => n.severity === 'critical').length;
    const highCount = affectedNodes.filter(n => n.severity === 'high').length;
    
    // Count affected infrastructure by type
    const affectedByType = {};
    affectedNodes.forEach(n => {
      affectedByType[n.nodeType] = (affectedByType[n.nodeType] || 0) + 1;
    });
    
    let riskLevel = 'low';
    if (criticalCount > 0 || totalImpact > 4) riskLevel = 'critical';
    else if (highCount > 1 || totalImpact > 2.5) riskLevel = 'high';
    else if (affectedNodes.length > 3 || totalImpact > 1.5) riskLevel = 'medium';
    
    // Build summary
    const typeDescription = Object.entries(affectedByType)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
    
    const summary = `A ${failureSeverity} ${failureType} at ${failedNode?.properties?.name || 'this location'} ` +
      `will potentially affect ${affectedNodes.length} infrastructure elements (${typeDescription || 'various types'}). ` +
      `${criticalCount} critical and ${highCount} high severity impacts predicted. ` +
      `Immediate attention ${riskLevel === 'critical' || riskLevel === 'high' ? 'is required' : 'may be needed'}.`;
    
    const priorityActions = [];
    
    // Road-specific priority actions
    if (failedNode?.type === 'road' || affectedByType['road'] > 0) {
      priorityActions.push('Establish traffic diversions and alternative routes');
    }
    
    // Building-related priority actions
    if (affectedByType['hospital'] || affectedByType['school']) {
      priorityActions.push('Ensure critical facilities have backup services');
    }
    
    // Power-related priority actions
    if (failedNode?.type === 'power' || affectedByType['power'] > 0) {
      priorityActions.push('Activate emergency power protocols');
    }
    
    // General priority actions based on severity
    if (criticalCount > 0) {
      priorityActions.unshift('Activate emergency response team');
    }
    if (highCount > 0) {
      priorityActions.push('Alert relevant department heads');
    }
    if (affectedNodes.some(n => n.nodeType === 'cluster' || n.nodeType === 'building')) {
      priorityActions.push('Prepare public advisory and communication');
    }
    
    return {
      riskLevel,
      summary,
      priorityActions,
      estimatedRecoveryTime: this.estimateRecoveryTime(failedNode?.type, failureType, failureSeverity, totalImpact),
      affectedPopulation: this.estimateAffectedPopulation(affectedNodes),
      affectedByType
    };
  }

  estimateRecoveryTime(nodeType, failureType, severity, totalImpact) {
    const baseTimeByType = {
      'road': { damage: 24, flood: 12, blockage: 4, accident: 6, maintenance: 8, failure: 16 },
      'building': { fire: 168, collapse: 336, evacuation: 12, maintenance: 24, failure: 48 },
      'power': { outage: 6, overload: 4, failure: 12, maintenance: 8 },
      'tank': { leak: 8, contamination: 48, failure: 12, maintenance: 4 },
      'pump': { failure: 8, maintenance: 4, overload: 3 },
      'school': { fire: 168, evacuation: 8, maintenance: 24, failure: 48 },
      'hospital': { fire: 168, evacuation: 24, maintenance: 24, failure: 72 },
      'market': { fire: 72, damage: 48, maintenance: 12, failure: 36 },
      'default': { failure: 8, maintenance: 4, damage: 12 }
    };
    
    const severityMultiplier = {
      'low': 0.5,
      'medium': 1,
      'high': 1.5,
      'critical': 2.5
    };
    
    const typeBase = baseTimeByType[nodeType] || baseTimeByType['default'];
    const baseHours = typeBase[failureType] || typeBase['failure'] || 8;
    const hours = baseHours * (severityMultiplier[severity] || 1) + totalImpact * 2;
    
    if (hours < 24) {
      return `${Math.round(hours)} - ${Math.round(hours * 1.5)} hours`;
    } else {
      const days = hours / 24;
      return `${Math.round(days)} - ${Math.round(days * 1.5)} days`;
    }
  }

  estimateAffectedPopulation(affectedNodes) {
    let population = 0;
    
    affectedNodes.forEach(node => {
      switch (node.nodeType) {
        case 'cluster':
          population += 200;
          break;
        case 'building':
          population += 50;
          break;
        case 'school':
          population += 300;
          break;
        case 'hospital':
          population += 500;
          break;
        case 'market':
          population += 150;
          break;
        case 'road':
          population += 100; // Commuters affected
          break;
        case 'power':
          population += 200; // Households affected
          break;
      }
    });
    
    return population;
  }
}

// Main service class for Village Infrastructure Impact Prediction
class GNNImpactService {
  constructor() {
    this.graph = new InfrastructureGraph();
    this.gnn = new ImpactPredictionGNN();
    this.isInitialized = false;
  }

  // Initialize graph from complete village state (roads, buildings, power, water, sensors)
  initializeFromVillageState(villageState) {
    this.graph = new InfrastructureGraph();
    
    // ============ ADD ROADS ============
    if (villageState.roads && villageState.roads.length > 0) {
      for (const road of villageState.roads) {
        this.graph.addNode(road.id, 'road', {
          name: road.name,
          condition: road.condition,
          width: road.width,
          potholes: road.potholes,
          lastMaintenance: road.lastMaintenance,
          path: road.path,
          coords: road.path ? road.path[Math.floor(road.path.length / 2)] : null,
          isMainRoad: road.width > 8,
          trafficLevel: 50
        });
      }
      
      // Build road network connections (intersections)
      this.buildRoadConnections(villageState.roads);
    }
    
    // ============ ADD BUILDINGS ============
    if (villageState.buildings && villageState.buildings.length > 0) {
      for (const building of villageState.buildings) {
        const buildingType = this.classifyBuilding(building);
        this.graph.addNode(building.id, buildingType, {
          name: building.name,
          type: building.type,
          coords: building.coords,
          floors: building.floors,
          height: building.height,
          occupancy: building.occupancy,
          color: building.color
        });
      }
    }
    
    // ============ ADD POWER NODES ============
    if (villageState.powerNodes && villageState.powerNodes.length > 0) {
      for (const power of villageState.powerNodes) {
        this.graph.addNode(power.id, 'power', {
          name: power.name,
          coords: power.coords,
          capacity: power.capacity,
          currentLoad: power.currentLoad,
          status: power.status,
          voltage: power.voltage,
          temperature: power.temperature
        });
      }
    }
    
    // ============ ADD WATER TANKS ============
    if (villageState.waterTanks && villageState.waterTanks.length > 0) {
      for (const tank of villageState.waterTanks) {
        this.graph.addNode(tank.id, 'tank', {
          name: tank.name,
          coords: tank.coords,
          capacity: tank.capacity,
          currentLevel: tank.currentLevel,
          status: tank.status,
          flowRate: tank.flowRate,
          elevation: tank.elevation
        });
      }
    }
    
    // ============ ADD SENSORS ============
    if (villageState.sensors && villageState.sensors.length > 0) {
      for (const sensor of villageState.sensors) {
        this.graph.addNode(sensor.id, 'sensor', {
          name: sensor.name,
          type: sensor.type,
          coords: sensor.coords,
          value: sensor.value,
          status: sensor.status,
          unit: sensor.unit
        });
      }
    }
    
    // ============ ADD WATER SIMULATION DATA (if available) ============
    // Tanks from water simulation
    if (villageState.tanks) {
      for (const tank of villageState.tanks) {
        const id = tank.tankId || tank.id;
        if (!this.graph.nodes.has(id)) {
          this.graph.addNode(id, 'tank', {
            name: tank.name,
            capacity: tank.capacityL || tank.capacity,
            currentLevel: tank.levelPercent || (tank.currentLevel ? tank.currentLevel / tank.capacity * 100 : 50),
            status: tank.status,
            geo: tank.geo,
            coords: tank.geo ? [tank.geo.lat, tank.geo.lng] : null
          });
        }
      }
    }
    
    // Pumps
    if (villageState.pumps) {
      for (const pump of villageState.pumps) {
        const id = pump.pumpId || pump.id;
        this.graph.addNode(id, 'pump', {
          name: pump.name,
          flowRate: pump.flowLpm || pump.flowRate,
          status: pump.state || pump.status,
          tankId: pump.tankId
        });
        
        if (pump.tankId) {
          this.graph.addEdge(id, pump.tankId, 0.9, 'mechanical', 'pump-tank');
          this.graph.addEdge(pump.tankId, id, 0.9, 'mechanical', 'tank-pump');
        }
      }
    }
    
    // Consumer clusters
    if (villageState.clusters) {
      for (const cluster of villageState.clusters) {
        const id = cluster.clusterId || cluster.id;
        this.graph.addNode(id, 'cluster', {
          name: cluster.name,
          demand: cluster.demandLpm || cluster.demand,
          supplyStatus: cluster.supplyStatus || cluster.status,
          geo: cluster.geo,
          coords: cluster.geo ? [cluster.geo.lat, cluster.geo.lng] : null
        });
      }
    }
    
    // Pipes
    if (villageState.pipes) {
      for (const pipe of villageState.pipes) {
        const id = pipe.pipeId || pipe.id;
        this.graph.addNode(id, 'pipe', {
          name: `Pipe ${id}`,
          flowRate: pipe.flowLpm || pipe.flow,
          pressure: pipe.pressurePsi || pipe.pressure,
          status: pipe.status,
          fromNode: pipe.fromNode,
          toNode: pipe.toNode
        });
        
        if (pipe.fromNode && pipe.toNode) {
          const weight = pipe.status === 'ok' ? 0.8 : 0.3;
          this.graph.addEdge(pipe.fromNode, id, weight, 'pipe', 'flow');
          this.graph.addEdge(id, pipe.toNode, weight, 'pipe', 'flow');
        }
      }
    }
    
    // ============ BUILD DEPENDENCY CONNECTIONS ============
    // Build power connections to buildings
    this.buildPowerConnections(villageState);
    
    // Build road access connections to buildings
    this.buildRoadAccessConnections(villageState);
    
    // Build proximity-based connections for everything else
    this.graph.buildProximityEdges(0.008); // ~800m radius
    
    // Build adjacency matrix
    this.graph.buildAdjacencyMatrix();
    this.isInitialized = true;
    
    const nodeTypes = {};
    for (const [id, node] of this.graph.nodes) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    }
    
    console.log(`🔗 GNN Infrastructure Graph initialized:`);
    console.log(`   Total nodes: ${this.graph.nodes.size}`);
    console.log(`   Node types:`, nodeTypes);
    console.log(`   Total edges: ${Array.from(this.graph.edges.values()).reduce((sum, e) => sum + e.length, 0)}`);
    
    return this;
  }

  // Classify building by type
  classifyBuilding(building) {
    const typeMap = {
      'hospital': 'hospital',
      'clinic': 'hospital',
      'health': 'hospital',
      'medical': 'hospital',
      'school': 'school',
      'college': 'school',
      'education': 'school',
      'university': 'school',
      'market': 'market',
      'shop': 'market',
      'commercial': 'market',
      'store': 'market',
      'mall': 'market'
    };
    
    const lowerType = (building.type || '').toLowerCase();
    const lowerName = (building.name || '').toLowerCase();
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (lowerType.includes(key) || lowerName.includes(key)) {
        return value;
      }
    }
    
    return 'building';
  }

  // Build road-to-road connections (intersections)
  buildRoadConnections(roads) {
    for (let i = 0; i < roads.length; i++) {
      for (let j = i + 1; j < roads.length; j++) {
        const road1 = roads[i];
        const road2 = roads[j];
        
        if (!road1.path || !road2.path) continue;
        
        // Check if any points are close enough to be an intersection
        let connected = false;
        for (const point1 of road1.path) {
          if (connected) break;
          for (const point2 of road2.path) {
            const dist = this.graph.calculateDistance(point1, point2);
            if (dist < 0.0008) { // Very close = intersection (~80m)
              this.graph.addEdge(road1.id, road2.id, 0.85, 'road-road', 'intersection');
              this.graph.addEdge(road2.id, road1.id, 0.85, 'road-road', 'intersection');
              connected = true;
              break;
            }
          }
        }
      }
    }
  }

  // Build power connections to buildings and other infrastructure
  buildPowerConnections(villageState) {
    const powerNodes = villageState.powerNodes || [];
    const buildings = villageState.buildings || [];
    const waterTanks = villageState.waterTanks || [];
    
    for (const power of powerNodes) {
      if (!power.coords) continue;
      
      // Connect to nearby buildings
      for (const building of buildings) {
        if (building.coords) {
          const dist = this.graph.calculateDistance(power.coords, building.coords);
          if (dist < 0.005) { // ~500m
            this.graph.addEdge(power.id, building.id, 0.75, 'power-supply', 'electricity');
            this.graph.addEdge(building.id, power.id, 0.4, 'power-demand', 'depends-on-power');
          }
        }
      }
      
      // Connect to water infrastructure (pumps need power)
      for (const tank of waterTanks) {
        if (tank.coords) {
          const dist = this.graph.calculateDistance(power.coords, tank.coords);
          if (dist < 0.004) { // ~400m
            this.graph.addEdge(power.id, tank.id, 0.7, 'power-supply', 'powers-pump');
            this.graph.addEdge(tank.id, power.id, 0.5, 'power-demand', 'depends-on-power');
          }
        }
      }
    }
  }

  // Build road access connections to buildings
  buildRoadAccessConnections(villageState) {
    const roads = villageState.roads || [];
    const buildings = villageState.buildings || [];
    
    for (const building of buildings) {
      if (!building.coords) continue;
      
      let nearestRoad = null;
      let nearestDist = Infinity;
      
      for (const road of roads) {
        if (!road.path) continue;
        
        // Find closest point on road to building
        for (const point of road.path) {
          const dist = this.graph.calculateDistance(building.coords, point);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestRoad = road;
          }
        }
      }
      
      // Connect building to nearest road if within reasonable distance
      if (nearestRoad && nearestDist < 0.003) { // ~300m
        const weight = Math.max(0.3, 1 - (nearestDist / 0.003));
        this.graph.addEdge(building.id, nearestRoad.id, weight, 'road-access', 'accessed-via');
        this.graph.addEdge(nearestRoad.id, building.id, weight, 'road-access', 'provides-access');
      }
    }
  }

  // Predict impact of a failure
  predictFailureImpact(nodeId, failureType = 'failure', severity = 'medium') {
    if (!this.isInitialized) {
      throw new Error('GNN not initialized. Call initializeFromVillageState first.');
    }
    
    if (!this.graph.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} not found in graph. Available nodes: ${Array.from(this.graph.nodes.keys()).slice(0, 10).join(', ')}...`);
    }
    
    return this.gnn.predictImpact(this.graph, nodeId, failureType, severity);
  }

  // Get all nodes for UI
  getGraphNodes() {
    const nodes = [];
    for (const [id, node] of this.graph.nodes) {
      nodes.push({
        id,
        type: node.type,
        name: node.properties.name,
        properties: node.properties
      });
    }
    return nodes;
  }

  // Get all edges for UI visualization
  getGraphEdges() {
    const edges = [];
    for (const [sourceId, edgeList] of this.graph.edges) {
      for (const edge of edgeList) {
        edges.push({
          source: sourceId,
          target: edge.target,
          weight: edge.weight,
          type: edge.type,
          relationship: edge.relationship
        });
      }
    }
    return edges;
  }

  // Get failure scenarios that can be simulated
  getFailureScenarios() {
    return [
      // Road scenarios
      { id: 'damage', name: 'Road Damage', description: 'Road surface damage, potholes, or cracks', applicableTo: ['road'] },
      { id: 'flood', name: 'Flooding', description: 'Road/area flooded due to rain or drainage failure', applicableTo: ['road', 'building', 'cluster', 'school', 'hospital', 'market'] },
      { id: 'blockage', name: 'Road Blockage', description: 'Road blocked due to accident or obstruction', applicableTo: ['road'] },
      { id: 'accident', name: 'Traffic Accident', description: 'Traffic accident causing disruption', applicableTo: ['road'] },
      
      // Building scenarios
      { id: 'fire', name: 'Fire', description: 'Building fire emergency', applicableTo: ['building', 'school', 'hospital', 'market'] },
      { id: 'collapse', name: 'Structural Collapse', description: 'Building structural failure', applicableTo: ['building', 'school', 'hospital', 'market'] },
      { id: 'evacuation', name: 'Evacuation Required', description: 'Building needs to be evacuated', applicableTo: ['building', 'school', 'hospital', 'market'] },
      
      // Power scenarios
      { id: 'outage', name: 'Power Outage', description: 'Complete power failure', applicableTo: ['power'] },
      { id: 'overload', name: 'Grid Overload', description: 'Power grid overloaded', applicableTo: ['power'] },
      
      // Water scenarios
      { id: 'leak', name: 'Water Leak', description: 'Pipe leak or tank damage', applicableTo: ['tank', 'pump', 'pipe'] },
      { id: 'contamination', name: 'Water Contamination', description: 'Water quality issue', applicableTo: ['tank', 'pipe'] },
      
      // General scenarios
      { id: 'failure', name: 'Component Failure', description: 'General equipment or infrastructure failure', applicableTo: ['road', 'building', 'power', 'tank', 'pump', 'pipe', 'sensor', 'school', 'hospital', 'market', 'cluster'] },
      { id: 'maintenance', name: 'Maintenance Required', description: 'Scheduled or emergency maintenance', applicableTo: ['road', 'building', 'power', 'tank', 'pump', 'pipe', 'sensor', 'school', 'hospital', 'market'] }
    ];
  }
}

// Export singleton instance
const gnnService = new GNNImpactService();

export { GNNImpactService, gnnService };
export default gnnService;
