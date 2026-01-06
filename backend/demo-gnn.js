/**
 * GNN Impact Predictor Demo Script
 * Run this to see a demonstration of cascading failure predictions
 * 
 * Usage: node demo-gnn.js
 */

import { GNNImpactService } from './utils/gnnImpactService.js';

// Sample village infrastructure
const sampleVillageData = {
  roads: [
    { id: 'road-main-1', name: 'NH-44 Highway Connection', type: 'main', from: { lat: 17.385, lng: 78.4867 }, to: { lat: 17.395, lng: 78.4967 }, length: 1200, condition: 0.85 },
    { id: 'road-main-2', name: 'Village Main Road', type: 'main', from: { lat: 17.39, lng: 78.49 }, to: { lat: 17.392, lng: 78.5 }, length: 800, condition: 0.75 },
    { id: 'road-secondary-1', name: 'Market Street', type: 'secondary', from: { lat: 17.391, lng: 78.492 }, to: { lat: 17.393, lng: 78.495 }, length: 400, condition: 0.65 },
    { id: 'road-secondary-2', name: 'Hospital Access Road', type: 'secondary', from: { lat: 17.3905, lng: 78.488 }, to: { lat: 17.3925, lng: 78.49 }, length: 300, condition: 0.8 },
    { id: 'road-tertiary-1', name: 'Residential Lane A', type: 'tertiary', from: { lat: 17.3912, lng: 78.4925 }, to: { lat: 17.3918, lng: 78.494 }, length: 200, condition: 0.55 },
  ],
  buildings: [
    { id: 'school-primary', name: 'Government Primary School', type: 'school', position: { lat: 17.3912, lng: 78.4932 }, occupancy: 250 },
    { id: 'hospital-phc', name: 'Primary Health Center', type: 'hospital', position: { lat: 17.392, lng: 78.4895 }, occupancy: 50 },
    { id: 'market-main', name: 'Weekly Haat (Market)', type: 'market', position: { lat: 17.3925, lng: 78.4945 }, occupancy: 500 },
    { id: 'govt-panchayat', name: 'Gram Panchayat Office', type: 'government', position: { lat: 17.391, lng: 78.492 }, occupancy: 20 },
    { id: 'residential-1', name: 'Housing Colony A', type: 'residential', position: { lat: 17.39, lng: 78.491 }, occupancy: 150 },
    { id: 'residential-2', name: 'Housing Colony B', type: 'residential', position: { lat: 17.3895, lng: 78.4925 }, occupancy: 200 },
  ],
  powerNodes: [
    { id: 'power-transformer-main', name: 'Main Distribution Transformer', type: 'transformer', position: { lat: 17.3905, lng: 78.4915 }, powerCapacity: 500, powerOutput: 380 },
    { id: 'power-substation', name: 'Village Substation', type: 'substation', position: { lat: 17.389, lng: 78.49 }, powerCapacity: 1000, powerOutput: 650 },
    { id: 'power-solar-1', name: 'Solar Micro-Grid', type: 'solar', position: { lat: 17.3885, lng: 78.487 }, powerCapacity: 100, powerOutput: 75 },
  ],
  tanks: [
    { id: 'tank-overhead-main', name: 'Main Overhead Tank', position: { lat: 17.3915, lng: 78.491 }, capacity: 50000, currentLevel: 35000 },
    { id: 'tank-ground-1', name: 'Ground Level Reservoir', position: { lat: 17.3895, lng: 78.4895 }, capacity: 100000, currentLevel: 75000 },
  ],
  pumps: [
    { id: 'pump-main', name: 'Main Pumping Station', position: { lat: 17.3893, lng: 78.4893 }, flowRate: 500, pressure: 4.5, status: 'active' },
    { id: 'pump-booster-1', name: 'Booster Pump - Market Area', position: { lat: 17.3918, lng: 78.4938 }, flowRate: 200, pressure: 3.0, status: 'active' },
  ],
  pipes: [
    { id: 'pipe-1', sourceId: 'tank-ground-1', targetId: 'pump-main', length: 50, diameter: 200 },
    { id: 'pipe-2', sourceId: 'pump-main', targetId: 'tank-overhead-main', length: 100, diameter: 150 },
  ],
  sensors: [
    { id: 'sensor-water-1', name: 'Water Quality Sensor', type: 'water_quality', position: { lat: 17.3915, lng: 78.4911 } },
    { id: 'sensor-flow-1', name: 'Flow Meter Main', type: 'flow', position: { lat: 17.39, lng: 78.4905 } },
  ],
  clusters: [
    { id: 'cluster-north', name: 'North Village Area', position: { lat: 17.393, lng: 78.495 }, population: 450, demand: 150 },
    { id: 'cluster-south', name: 'South Village Area', position: { lat: 17.388, lng: 78.489 }, population: 380, demand: 120 },
    { id: 'cluster-central', name: 'Central Market Area', position: { lat: 17.391, lng: 78.492 }, population: 600, demand: 200 },
  ],
};

// Demo scenarios
const demoScenarios = [
  { nodeId: 'road-secondary-2', failureType: 'road_damage', severity: 'critical', title: '🚗 Hospital Road Damaged' },
  { nodeId: 'power-transformer-main', failureType: 'power_outage', severity: 'high', title: '⚡ Main Transformer Failure' },
  { nodeId: 'hospital-phc', failureType: 'building_fire', severity: 'critical', title: '🔥 Fire at Health Center' },
  { nodeId: 'road-main-1', failureType: 'road_flood', severity: 'high', title: '🌊 Highway Flooded' },
  { nodeId: 'tank-overhead-main', failureType: 'leak', severity: 'medium', title: '💧 Water Tank Leak' },
];

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m',
};

function printHeader(text) {
  console.log('\n' + colors.cyan + '═'.repeat(70) + colors.reset);
  console.log(colors.bright + colors.cyan + '  ' + text + colors.reset);
  console.log(colors.cyan + '═'.repeat(70) + colors.reset + '\n');
}

function printSubHeader(text) {
  console.log(colors.yellow + '\n  ▶ ' + text + colors.reset);
  console.log(colors.yellow + '  ' + '─'.repeat(50) + colors.reset);
}

function getSeverityColor(severity) {
  switch (severity) {
    case 'critical': return colors.bgRed + colors.white;
    case 'high': return colors.red;
    case 'medium': return colors.yellow;
    case 'low': return colors.green;
    default: return colors.white;
  }
}

function printAffectedNode(node, index) {
  const sevColor = getSeverityColor(node.severity);
  console.log(`    ${colors.white}${index + 1}. ${colors.bright}${node.nodeName}${colors.reset}`);
  // Fix probability display - ensure it's a percentage between 0-100
  const probPercent = node.probability > 100 ? Math.min(98, node.probability / 100) : Math.min(98, node.probability);
  
  console.log(`       Type: ${colors.cyan}${node.nodeType}${colors.reset} | Severity: ${sevColor}${node.severity.toUpperCase()}${colors.reset} | Probability: ${probPercent.toFixed(0)}%`);
  console.log(`       Time to Impact: ${colors.magenta}${node.timeToImpact} mins${colors.reset}`);
  if (node.effects && node.effects.length > 0) {
    console.log(`       Effects: ${colors.yellow}${node.effects.slice(0, 2).join(', ')}${colors.reset}`);
  }
  console.log('');
}

async function runDemo() {
  printHeader('🌐 GNN VILLAGE INFRASTRUCTURE IMPACT PREDICTOR - DEMO');
  
  console.log(colors.white + '  This demo shows how the Graph Neural Network predicts');
  console.log('  cascading failures across village infrastructure.' + colors.reset);
  
  // Initialize GNN
  printSubHeader('Step 1: Initializing GNN with Village Infrastructure');
  
  const gnnService = new GNNImpactService();
  gnnService.initializeFromVillageState(sampleVillageData);
  
  console.log(`    ${colors.green}✓${colors.reset} GNN Initialized Successfully`);
  console.log(`    ${colors.white}• Total Nodes: ${colors.cyan}${gnnService.graph.nodes.size}${colors.reset}`);
  console.log(`    ${colors.white}• Total Edges: ${colors.cyan}${gnnService.graph.edges.length}${colors.reset}`);
  
  // Show node breakdown
  const nodeTypes = {};
  gnnService.graph.nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
  });
  console.log(`    ${colors.white}• Node Types:${colors.reset}`);
  Object.entries(nodeTypes).forEach(([type, count]) => {
    const icon = type === 'road' ? '🚗' : type === 'building' ? '🏢' : type === 'power' ? '⚡' : 
                 type === 'tank' ? '💧' : type === 'pump' ? '🔧' : type === 'school' ? '🏫' : 
                 type === 'hospital' ? '🏥' : type === 'market' ? '🛒' : '📍';
    console.log(`      ${icon} ${type}: ${colors.cyan}${count}${colors.reset}`);
  });
  
  // Run demo scenarios
  printSubHeader('Step 2: Running Failure Scenarios');
  
  for (let i = 0; i < demoScenarios.length; i++) {
    const scenario = demoScenarios[i];
    
    console.log(`\n  ${colors.bright}${colors.magenta}━━━ Scenario ${i + 1}: ${scenario.title} ━━━${colors.reset}\n`);
    
    try {
      const result = gnnService.predictFailureImpact(
        scenario.nodeId,
        scenario.failureType,
        scenario.severity
      );
      
      if (result) {
        // Source failure info
        console.log(`    ${colors.red}⚠ FAILURE SOURCE:${colors.reset}`);
        console.log(`      Node: ${colors.bright}${result.sourceFailure.nodeName}${colors.reset}`);
        console.log(`      Type: ${result.sourceFailure.nodeType} | Failure: ${result.sourceFailure.failureType}`);
        console.log(`      Severity: ${getSeverityColor(result.sourceFailure.severity)}${result.sourceFailure.severity.toUpperCase()}${colors.reset}`);
        
        // Overall assessment
        console.log(`\n    ${colors.yellow}📊 IMPACT ASSESSMENT:${colors.reset}`);
        console.log(`      Risk Level: ${getSeverityColor(result.overallAssessment.riskLevel)}${result.overallAssessment.riskLevel.toUpperCase()}${colors.reset}`);
        console.log(`      Total Affected: ${colors.cyan}${result.totalAffected} nodes${colors.reset}`);
        console.log(`      Critical: ${colors.red}${result.criticalCount}${colors.reset} | High: ${colors.yellow}${result.highCount}${colors.reset}`);
        console.log(`      Population Affected: ${colors.magenta}~${result.overallAssessment.affectedPopulation} people${colors.reset}`);
        console.log(`      Est. Recovery: ${colors.blue}${result.overallAssessment.estimatedRecoveryTime}${colors.reset}`);
        
        // Summary
        console.log(`\n    ${colors.white}📝 Summary: ${result.overallAssessment.summary}${colors.reset}`);
        
        // Affected nodes (top 5)
        if (result.affectedNodes.length > 0) {
          console.log(`\n    ${colors.cyan}🔗 CASCADING EFFECTS (Top ${Math.min(5, result.affectedNodes.length)}):${colors.reset}\n`);
          result.affectedNodes.slice(0, 5).forEach((node, idx) => {
            printAffectedNode(node, idx);
          });
        }
        
        // Priority actions
        if (result.overallAssessment.priorityActions.length > 0) {
          console.log(`    ${colors.green}✅ PRIORITY ACTIONS:${colors.reset}`);
          result.overallAssessment.priorityActions.slice(0, 3).forEach((action, idx) => {
            console.log(`      ${idx + 1}. ${action}`);
          });
        }
      }
    } catch (error) {
      console.log(`    ${colors.red}Error: ${error.message}${colors.reset}`);
    }
    
    // Pause between scenarios
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Vulnerable nodes analysis
  printSubHeader('Step 3: Vulnerability Analysis');
  
  const vulnerableNodes = gnnService.getVulnerableNodes();
  console.log(`\n    ${colors.yellow}⚠ TOP 5 MOST VULNERABLE NODES:${colors.reset}\n`);
  
  vulnerableNodes.slice(0, 5).forEach((node, idx) => {
    const riskColor = node.riskLevel === 'high' ? colors.red : node.riskLevel === 'medium' ? colors.yellow : colors.green;
    console.log(`    ${idx + 1}. ${colors.bright}${node.name}${colors.reset} (${node.type})`);
    console.log(`       Vulnerability: ${riskColor}${node.vulnerabilityScore.toFixed(0)}%${colors.reset} | Connections: ${node.connections}`);
    console.log(`       Risk Level: ${riskColor}${node.riskLevel.toUpperCase()}${colors.reset}\n`);
  });
  
  printHeader('🎉 DEMO COMPLETE');
  
  console.log(colors.white + '  The GNN Impact Predictor successfully analyzed:');
  console.log(`  • ${demoScenarios.length} failure scenarios`);
  console.log(`  • ${gnnService.graph.nodes.size} infrastructure nodes`);
  console.log(`  • ${gnnService.graph.edges.length} connections\n`);
  console.log('  To use in your app, navigate to "Impact Predictor" in the sidebar!' + colors.reset + '\n');
}

// Run the demo
runDemo().catch(console.error);
