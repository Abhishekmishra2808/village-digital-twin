/**
 * TEST FILE - Quick Visualization Test
 * 
 * This is a minimal standalone test component to verify the visualization works.
 * Copy this to test the visualizer independently.
 */

import React from 'react';
import ImpactGraphVisualizer from '../components/ImpactGraphVisualizer';
import type { GraphVisualizationData } from '../types/graph-visualization';

// Realistic test scenario: Power Substation Failure
const TEST_DATA: GraphVisualizationData = {
  nodes: [
    // Epicenter - Failed Power Substation
    {
      id: 'power-substation-main',
      name: 'Main Power Substation',
      type: 'power',
      color: '#9F7AEA',
      size: 16,
      pulse: true,
      isEpicenter: true,
      probability: 100,
      severity: 'critical'
    },
    
    // Critical Impact - Water Pump (depends on power)
    {
      id: 'pump-central',
      name: 'Central Water Pump',
      type: 'pump',
      color: '#FC8181',
      size: 13,
      probability: 92.3,
      severity: 'critical'
    },
    
    // Critical Impact - Hospital
    {
      id: 'hospital-main',
      name: 'Village Hospital',
      type: 'hospital',
      color: '#FC8181',
      size: 12,
      probability: 88.7,
      severity: 'critical'
    },
    
    // High Impact - School
    {
      id: 'school-primary',
      name: 'Primary School',
      type: 'school',
      color: '#F6AD55',
      size: 10,
      probability: 67.4,
      severity: 'high'
    },
    
    // High Impact - Water Tank (indirect via pump)
    {
      id: 'tank-north',
      name: 'North Water Tank',
      type: 'tank',
      color: '#F6AD55',
      size: 9,
      probability: 61.2,
      severity: 'high'
    },
    
    // Medium Impact - Roads
    {
      id: 'road-main',
      name: 'Main Village Road',
      type: 'road',
      color: '#68D391',
      size: 7,
      probability: 34.8,
      severity: 'medium'
    },
    
    // Medium Impact - Residential
    {
      id: 'building-residential-a',
      name: 'Residential Block A',
      type: 'building',
      color: '#68D391',
      size: 7,
      probability: 41.2,
      severity: 'medium'
    },
    
    // Low Impact - Secondary Road
    {
      id: 'road-secondary',
      name: 'East Access Road',
      type: 'road',
      color: '#90CDF4',
      size: 5,
      probability: 18.5,
      severity: 'low'
    },
    
    // Unaffected
    {
      id: 'building-solar',
      name: 'Solar Powered House',
      type: 'building',
      color: '#CBD5E0',
      size: 5,
      probability: 2.1,
      severity: 'none'
    }
  ],
  
  links: [
    // Physical Infrastructure Connections (gray lines)
    { source: 'power-substation-main', target: 'pump-central', 
      type: 'physical', color: '#4A5568', width: 2 },
    { source: 'power-substation-main', target: 'hospital-main', 
      type: 'physical', color: '#4A5568', width: 2 },
    { source: 'power-substation-main', target: 'school-primary', 
      type: 'physical', color: '#4A5568', width: 1.5 },
    { source: 'pump-central', target: 'tank-north', 
      type: 'physical', color: '#4A5568', width: 1.5 },
    { source: 'tank-north', target: 'building-residential-a', 
      type: 'physical', color: '#4A5568', width: 1 },
    
    // Impact Flow Animations (colored particles showing cascading failure)
    
    // CRITICAL impacts - Fast, many red particles
    { source: 'power-substation-main', target: 'pump-central',
      type: 'impact-flow', color: '#FC8181', width: 5,
      particles: 10, particleSpeed: 0.025 },
    { source: 'power-substation-main', target: 'hospital-main',
      type: 'impact-flow', color: '#FC8181', width: 4.5,
      particles: 9, particleSpeed: 0.022 },
    
    // HIGH impacts - Medium speed, orange particles
    { source: 'power-substation-main', target: 'school-primary',
      type: 'impact-flow', color: '#F6AD55', width: 3.5,
      particles: 6, particleSpeed: 0.016 },
    { source: 'pump-central', target: 'tank-north',
      type: 'impact-flow', color: '#F6AD55', width: 3,
      particles: 5, particleSpeed: 0.014 },
    
    // MEDIUM impacts - Slower, green particles
    { source: 'hospital-main', target: 'road-main',
      type: 'impact-flow', color: '#68D391', width: 2,
      particles: 3, particleSpeed: 0.008 },
    { source: 'tank-north', target: 'building-residential-a',
      type: 'impact-flow', color: '#68D391', width: 2,
      particles: 3, particleSpeed: 0.009 },
    
    // LOW impacts - Very slow, blue particles
    { source: 'road-main', target: 'road-secondary',
      type: 'impact-flow', color: '#90CDF4', width: 1.5,
      particles: 2, particleSpeed: 0.005 }
  ]
};

/**
 * Simple test component - paste this into any page to test
 */
const VisualizerTest: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#0f1419', 
      minHeight: '100vh' 
    }}>
      <div style={{
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, marginBottom: '10px' }}>
          🧠 GNN Impact Visualizer - Test
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Scenario: Main Power Substation Failure
        </p>
      </div>

      <ImpactGraphVisualizer
        visualizationData={TEST_DATA}
        height={700}
        showLegend={true}
        enableInteraction={true}
        onNodeClick={(node) => {
          console.log('Clicked node:', node);
          alert(`Node: ${node.name}\nImpact: ${node.probability}%\nSeverity: ${node.severity}`);
        }}
        onNodeHover={(node) => {
          if (node) {
            console.log('Hovering:', node.name);
          }
        }}
      />

      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: '#1A202C',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h3 style={{ marginTop: 0 }}>What You Should See:</h3>
        <ul style={{ lineHeight: '1.8', color: '#a0aec0' }}>
          <li>✅ <strong style={{ color: 'white' }}>Purple pulsing node</strong> - The failed power substation (breathing animation)</li>
          <li>✅ <strong style={{ color: 'white' }}>Red nodes</strong> - Critical impacts (hospital, pump)</li>
          <li>✅ <strong style={{ color: 'white' }}>Animated particles</strong> - Red/orange dots flowing from epicenter to victims</li>
          <li>✅ <strong style={{ color: 'white' }}>Fast particles</strong> = Critical impact, <strong style={{ color: 'white' }}>slow particles</strong> = Low impact</li>
          <li>✅ <strong style={{ color: 'white' }}>Hover</strong> - Node highlights with neighbors, info panel appears</li>
          <li>✅ <strong style={{ color: 'white' }}>Click</strong> - Alert with node details</li>
          <li>✅ <strong style={{ color: 'white' }}>Zoom/Pan</strong> - Mouse wheel zoom, drag to pan</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualizerTest;

// ============================================
// QUICK TEST IN CONSOLE (Browser DevTools)
// ============================================
// If you want to test data transformation:
/*
import { transformGNNResultToVisualization } from './utils/graphVisualizationUtils';

const mockBackendResponse = {
  epicenter: { id: 'power-1', name: 'Substation', type: 'power' },
  impactedNodes: [
    { id: 'pump-1', name: 'Pump', type: 'pump', probability: 85, estimatedTime: 2.5 }
  ]
};

const vizData = transformGNNResultToVisualization(mockBackendResponse);
console.log(vizData);
*/
