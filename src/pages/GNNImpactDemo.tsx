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

// Mock data for testing without backend - 8 nodes matching map layout
const MOCK_VISUALIZATION_DATA: GraphVisualizationData = {
  nodes: [
    { 
      id: 'tank-main', 
      name: 'Main Water Tank', 
      type: 'tank', 
      color: '#4299E1', 
      size: 12, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: -100,
      fy: -120
    },
    { 
      id: 'pump-main', 
      name: 'Main Pump Station', 
      type: 'pump', 
      color: '#4FD1C5', 
      size: 11, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: -150,
      fy: -60
    },
    { 
      id: 'power-main', 
      name: 'Main Transformer', 
      type: 'power', 
      color: '#F6E05E', 
      size: 14, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: 0,
      fy: 0
    },
    { 
      id: 'school-main', 
      name: 'Village School', 
      type: 'school', 
      color: '#90CDF4', 
      size: 10, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: 150,
      fy: -40
    },
    { 
      id: 'hospital-main', 
      name: 'Primary Health Center', 
      type: 'hospital', 
      color: '#FC8181', 
      size: 10, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: 0,
      fy: 120
    },
    { 
      id: 'market-main', 
      name: 'Village Market', 
      type: 'market', 
      color: '#9AE6B4', 
      size: 10, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: 120,
      fy: 80
    },
    { 
      id: 'road-main', 
      name: 'Main Village Road', 
      type: 'road', 
      color: '#CBD5E0', 
      size: 8, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: -150,
      fy: 40
    },
    { 
      id: 'sensor-flow-1', 
      name: 'Flow Sensor Main', 
      type: 'sensor', 
      color: '#68D391', 
      size: 8, 
      isEpicenter: false,
      probability: 0,
      severity: 'none',
      fx: 80,
      fy: 0
    },
  ],
  links: [
    // Physical infrastructure connections - connecting the 8 nodes logically
    { source: 'power-main', target: 'pump-main', width: 2, color: '#4A5568', type: 'physical' },
    { source: 'power-main', target: 'hospital-main', width: 2, color: '#4A5568', type: 'physical' },
    { source: 'power-main', target: 'school-main', width: 2, color: '#4A5568', type: 'physical' },
    { source: 'power-main', target: 'market-main', width: 1.5, color: '#4A5568', type: 'physical' },
    { source: 'pump-main', target: 'tank-main', width: 2, color: '#4A5568', type: 'physical' },
    { source: 'tank-main', target: 'sensor-flow-1', width: 1.5, color: '#4A5568', type: 'physical' },
    { source: 'road-main', target: 'market-main', width: 1.5, color: '#4A5568', type: 'physical' },
    { source: 'road-main', target: 'hospital-main', width: 1.5, color: '#4A5568', type: 'physical' },
  ],
};

const GNNImpactDemo: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  const [accumulatedFailures, setAccumulatedFailures] = useState<Set<string>>(new Set());
  const [combinedGraphData, setCombinedGraphData] = useState<GraphVisualizationData | null>(null);
  
  // Available failure scenarios for testing - matching the 8 node IDs
  const scenarios = [
    { id: 'power-main', name: 'Transformer Failure', severity: 1.0 },
    { id: 'pump-main', name: 'Pump Station Failure', severity: 0.9 },
    { id: 'tank-main', name: 'Water Tank Leak', severity: 0.8 },
    { id: 'hospital-main', name: 'Health Center Issue', severity: 0.7 },
    { id: 'school-main', name: 'School Power Outage', severity: 0.6 },
    { id: 'market-main', name: 'Market Disruption', severity: 0.5 },
    { id: 'road-main', name: 'Road Blocked', severity: 0.4 },
    { id: 'sensor-flow-1', name: 'Sensor Malfunction', severity: 0.3 },
  ];

  // Load initial graph data - only on first mount, not when useMockData changes
  useEffect(() => {
    // Only load if we don't have data yet
    if (!graphData) {
      loadGraphData();
    }
  }, []); // Empty dependency - only run once on mount

  const loadGraphData = async () => {
    setLoading(true);
    setError(null);
    // Clear accumulated failures when explicitly reloading
    setAccumulatedFailures(new Set());
    setCombinedGraphData(null);
    
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
        // Simulate API delay and accumulate failures
        setTimeout(() => {
          // Add the new failure to accumulated failures
          const newAccumulatedFailures = new Set(accumulatedFailures);
          newAccumulatedFailures.add(nodeId);
          setAccumulatedFailures(newAccumulatedFailures);
          
          // Use existing combined data or start from MOCK data
          const baseData = combinedGraphData || MOCK_VISUALIZATION_DATA;
          
          // Update nodes to mark all accumulated failures as epicenters
          // Also increase probability for accumulated failures
          const combinedData = {
            ...baseData,
            nodes: baseData.nodes.map(node => {
              const isFailed = newAccumulatedFailures.has(node.id);
              return {
                ...node,
                isEpicenter: isFailed,
                pulse: isFailed,
                probability: isFailed ? 100 : (node.probability || 0),
                severity: isFailed ? 'critical' : (node.severity || 'none'),
                color: isFailed ? '#9F7AEA' : node.color,
              };
            })
          };
          
          setCombinedGraphData(combinedData);
          setGraphData(combinedData);
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
          const newAccumulatedFailures = new Set(accumulatedFailures);
          newAccumulatedFailures.add(nodeId);
          setAccumulatedFailures(newAccumulatedFailures);
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
            <button
              onClick={() => {
                setAccumulatedFailures(new Set());
                setCombinedGraphData(null);
                setGraphData(MOCK_VISUALIZATION_DATA);
                setSelectedNode(null);
              }}
              disabled={loading || accumulatedFailures.size === 0}
              style={{
                padding: '10px 20px',
                background: accumulatedFailures.size > 0 ? 'rgba(252, 129, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: (loading || accumulatedFailures.size === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: (loading || accumulatedFailures.size === 0) ? 0.5 : 1,
              }}
            >
              🔄 Reset Failures ({accumulatedFailures.size})
            </button>
          </div>
        </div>

        {/* Show accumulated failures count */}
        {accumulatedFailures.size > 0 && (
          <div style={{
            marginTop: '15px',
            padding: '12px 16px',
            background: 'rgba(159, 122, 234, 0.15)',
            border: '1px solid #9F7AEA',
            borderRadius: '8px',
            color: '#D6BCFA',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <span>
              <strong>{accumulatedFailures.size} node(s) failed:</strong>{' '}
              {Array.from(accumulatedFailures).map(id => {
                const node = MOCK_VISUALIZATION_DATA.nodes.find(n => n.id === id);
                return node?.name || id;
              }).join(', ')}
            </span>
          </div>
        )}

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
