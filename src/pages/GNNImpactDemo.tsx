/**
 * GNN Impact Visualization Demo Page
 * 
 * This page demonstrates the interactive graph visualization of infrastructure
 * failure impact predictions using the Graph Neural Network backend.
 * 
 * Features:
 * - Real-time impact prediction visualization
 * - Interactive node selection for failure scenarios
 * - Animated particle flows showing impact propagation
 * - Severity-based color coding and alerts
 */

import React, { useState, useEffect } from 'react';
import ImpactGraphVisualizer from '../components/ImpactGraphVisualizer';
import { gnnService } from '../services/gnnImpactService';
import type { GraphVisualizationData, GraphNode } from '../types/graph-visualization';

// Mock data for testing without backend
const MOCK_VISUALIZATION_DATA: GraphVisualizationData = {
  nodes: [
    { 
      id: 'power-substation-1', 
      name: 'Main Substation', 
      type: 'power', 
      color: '#9F7AEA', 
      size: 15, 
      pulse: true, 
      isEpicenter: true,
      probability: 100,
      severity: 'critical'
    },
    { 
      id: 'pump-main', 
      name: 'Central Pump Station', 
      type: 'pump', 
      color: '#FC8181', 
      size: 12, 
      severity: 'critical', 
      probability: 87.5 
    },
    { 
      id: 'hospital-main', 
      name: 'Village Hospital', 
      type: 'hospital', 
      color: '#F6AD55', 
      size: 10, 
      severity: 'high', 
      probability: 62.3 
    },
    { 
      id: 'school-central', 
      name: 'Central School', 
      type: 'school', 
      color: '#F6AD55', 
      size: 9, 
      severity: 'high', 
      probability: 58.1 
    },
    { 
      id: 'road-main', 
      name: 'Main Road', 
      type: 'road', 
      color: '#68D391', 
      size: 7, 
      severity: 'medium', 
      probability: 34.2 
    },
    { 
      id: 'tank-north', 
      name: 'North Water Tank', 
      type: 'tank', 
      color: '#68D391', 
      size: 8, 
      severity: 'medium', 
      probability: 41.8 
    },
    { 
      id: 'building-1', 
      name: 'Residential Block A', 
      type: 'building', 
      color: '#cbd5e0', 
      size: 5, 
      severity: 'low', 
      probability: 12.5 
    },
    { 
      id: 'building-2', 
      name: 'Residential Block B', 
      type: 'building', 
      color: '#cbd5e0', 
      size: 5, 
      severity: 'none', 
      probability: 5.2 
    },
  ],
  links: [
    // Physical infrastructure connections
    { 
      source: 'power-substation-1', 
      target: 'pump-main', 
      width: 2, 
      color: '#4A5568',
      type: 'physical'
    },
    { 
      source: 'power-substation-1', 
      target: 'hospital-main', 
      width: 2, 
      color: '#4A5568',
      type: 'physical'
    },
    { 
      source: 'pump-main', 
      target: 'tank-north', 
      width: 1.5, 
      color: '#4A5568',
      type: 'physical'
    },
    
    // Impact flow animations (the magic particles!)
    { 
      source: 'power-substation-1', 
      target: 'pump-main', 
      type: 'impact-flow', 
      color: '#FC8181', 
      width: 4, 
      particles: 8, 
      particleSpeed: 0.02 
    },
    { 
      source: 'power-substation-1', 
      target: 'hospital-main', 
      type: 'impact-flow', 
      color: '#F6AD55', 
      width: 3, 
      particles: 6, 
      particleSpeed: 0.015 
    },
    { 
      source: 'power-substation-1', 
      target: 'school-central', 
      type: 'impact-flow', 
      color: '#F6AD55', 
      width: 3, 
      particles: 5, 
      particleSpeed: 0.012 
    },
    { 
      source: 'pump-main', 
      target: 'tank-north', 
      type: 'impact-flow', 
      color: '#68D391', 
      width: 2, 
      particles: 3, 
      particleSpeed: 0.008 
    },
    { 
      source: 'hospital-main', 
      target: 'road-main', 
      type: 'impact-flow', 
      color: '#68D391', 
      width: 2, 
      particles: 3, 
      particleSpeed: 0.007 
    },
  ],
};

const GNNImpactDemo: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  
  // Available failure scenarios for testing
  const scenarios = [
    { id: 'power-substation-1', name: 'Main Substation Failure', severity: 1.0 },
    { id: 'pump-main', name: 'Central Pump Failure', severity: 0.8 },
    { id: 'tank-north', name: 'Water Tank Leak', severity: 0.6 },
    { id: 'road-main', name: 'Main Road Blocked', severity: 0.5 },
  ];

  // Load initial graph data
  useEffect(() => {
    loadGraphData();
  }, [useMockData]);

  const loadGraphData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for demonstration (no backend needed!)
        setTimeout(() => {
          setGraphData(MOCK_VISUALIZATION_DATA);
          setLoading(false);
        }, 500);
      } else {
        // Fetch from real backend
        try {
          const data = await gnnService.getInfrastructureGraph();
          setGraphData(data);
          setLoading(false);
        } catch (backendError) {
          console.warn('Backend not available, falling back to mock data:', backendError);
          setError('Backend not available. Using mock data.');
          setUseMockData(true); // Auto-switch to mock data
          setGraphData(MOCK_VISUALIZATION_DATA);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading graph:', err);
      setError('Using mock data (backend not required).');
      setGraphData(MOCK_VISUALIZATION_DATA);
      setLoading(false);
    }
  };

  const handleScenarioClick = async (nodeId: string, severity: number) => {
    setLoading(true);
    setSelectedNode(nodeId);
    setError(null);
    
    try {
      if (useMockData) {
        // Simulate API delay and show scenario-specific data
        setTimeout(() => {
          setGraphData(MOCK_VISUALIZATION_DATA);
          setLoading(false);
        }, 800);
      } else {
        // Call real backend
        try {
          const result = await gnnService.predictImpact({
            nodeId,
            severity,
            timestamp: new Date(),
          });
          setGraphData(result.visualization);
          setLoading(false);
        } catch (backendError) {
          console.warn('Backend not available:', backendError);
          setError('Backend not available. Showing mock data.');
          setUseMockData(true); // Auto-switch to mock
          setGraphData(MOCK_VISUALIZATION_DATA);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error predicting impact:', err);
      setError('Showing mock data (backend not required).');
      setGraphData(MOCK_VISUALIZATION_DATA);
      setLoading(false);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node);
    // You can trigger impact prediction from clicked node
    if (!node.isEpicenter) {
      handleScenarioClick(node.id, 0.7);
    }
  };

  const handleNodeHover = (node: GraphNode | null) => {
    // Optional: Add custom hover behavior
    if (node) {
      console.log('Hovering:', node.name);
    }
  };

  if (loading && !graphData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#1A202C',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧠</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Initializing GNN Brain...</div>
          <div style={{ marginTop: '10px', color: '#a0aec0' }}>Loading infrastructure graph</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: '#0f1419',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          🧠 Village Infrastructure Impact Brain
        </h1>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '16px' }}>
          Graph Neural Network powered failure prediction and impact visualization
        </p>
      </div>

      {/* Controls Panel */}
      <div style={{
        marginBottom: '20px',
        background: '#1A202C',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h3 style={{ color: 'white', margin: '0 0 15px 0', fontSize: '16px' }}>
              Test Failure Scenarios
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => handleScenarioClick(scenario.id, scenario.severity)}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: selectedNode === scenario.id 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && selectedNode !== scenario.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNode !== scenario.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Use Mock Data
            </label>
            <button
              onClick={loadGraphData}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.5 : 1,
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: 'rgba(252, 129, 129, 0.1)',
            border: '1px solid #FC8181',
            borderRadius: '8px',
            color: '#FC8181',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Graph Visualization */}
      {graphData && (
        <ImpactGraphVisualizer
          visualizationData={graphData}
          height={700}
          backgroundColor="#1A202C"
          showLegend={true}
          enableInteraction={true}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
        />
      )}

      {/* Info Panel */}
      <div style={{
        marginTop: '20px',
        background: '#1A202C',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>How to Use</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: '#a0aec0' }}>
          <li><strong style={{ color: 'white' }}>Select a scenario</strong> - Click any button above to simulate a failure</li>
          <li><strong style={{ color: 'white' }}>Watch the propagation</strong> - Red/orange particles show impact flowing through the network</li>
          <li><strong style={{ color: 'white' }}>Interact with nodes</strong> - Hover over nodes for details, click to center view</li>
          <li><strong style={{ color: 'white' }}>Zoom and pan</strong> - Use mouse wheel to zoom, drag to pan the canvas</li>
          <li><strong style={{ color: 'white' }}>Pulsing nodes</strong> - The breathing purple node is the failure epicenter</li>
        </ul>
      </div>
    </div>
  );
};

export default GNNImpactDemo;
