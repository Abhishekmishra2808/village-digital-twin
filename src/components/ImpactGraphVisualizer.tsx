/**
 * ImpactGraphVisualizer - Command Center Style GNN Visualization
 * 
 * Features:
 * - Spatial layout: Roads on central spine, Water West, Power East
 * - Heat signature glowing for affected nodes
 * - Pulsing epicenter animation
 * - Dimmed unrelated nodes for focus
 * - Smart labels (only when important or zoomed)
 * - Directional particle flows showing cascade
 * - Real-time HUD overlay
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { 
  GraphNode, 
  GraphLink, 
  ImpactGraphVisualizerProps 
} from '../types/graph-visualization';

// Command Center Color Scheme
const SYSTEM_THEME = {
  power: '#F6E05E',      // Yellow
  water: '#63B3ED',      // Blue
  road: '#CBD5E0',       // Light Gray
  hospital: '#FC8181',   // Urgent Red
  school: '#90CDF4',     // Light Blue
  market: '#9AE6B4',     // Green
  building: '#A0AEC0',   // Gray
  tank: '#4299E1',       // Deep Blue
  pump: '#4FD1C5',       // Teal
  epicenter: '#9F7AEA',  // Failure Purple
  affected: '#FC8181',   // Red for affected
  cluster: '#68D391'     // Green
};

const ImpactGraphVisualizer: React.FC<ImpactGraphVisualizerProps> = ({
  visualizationData,
  height = 600,
  width,
  backgroundColor = '#0F172A',
  showLegend = true,
  enableInteraction = true,
  onNodeClick,
  onNodeHover: externalNodeHover,
}) => {
  const fgRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState<Set<GraphNode>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [hasFailure, setHasFailure] = useState(false);

  // Detect if there's an active failure scenario
  useEffect(() => {
    const epicenter = visualizationData.nodes.find(n => n.isEpicenter);
    setHasFailure(!!epicenter);
  }, [visualizationData]);

  // Apply spatial layout based on node types
  const enrichedData = useMemo(() => {
    const nodesById = new Map<string, GraphNode>();
    
    // Apply coordinate stitching for structured layout
    visualizationData.nodes.forEach((node, idx) => {
      const enrichedNode = { ...node, neighbors: [], links: [] };
      
      // Spatial positioning based on infrastructure type (Coordinate Stitching)
      if (!enrichedNode.fx && !enrichedNode.fy) {
        const totalNodes = visualizationData.nodes.length;
        // Roads: Central spine (X=0)
        if (node.type === 'road') {
          enrichedNode.fx = 0;
          enrichedNode.fy = (idx - totalNodes / 2) * 40;
        }
        // Water infrastructure: West cluster (negative X)
        else if (node.type === 'water' || node.type === 'tank' || node.type === 'pump') {
          enrichedNode.fx = -180 + (Math.random() - 0.5) * 60;
          enrichedNode.fy = (idx - totalNodes / 2) * 35;
        }
        // Power infrastructure: East cluster (positive X)
        else if (node.type === 'power') {
          enrichedNode.fx = 180 + (Math.random() - 0.5) * 60;
          enrichedNode.fy = (idx - totalNodes / 2) * 35;
        }
        // Social infrastructure: Far East (consumption layer)
        else if (node.type === 'hospital' || node.type === 'school' || node.type === 'market') {
          enrichedNode.fx = 280 + (Math.random() - 0.5) * 70;
          enrichedNode.fy = (idx - totalNodes / 2) * 45;
        }
        // Buildings: Scattered near roads
        else if (node.type === 'building') {
          enrichedNode.fx = (Math.random() - 0.5) * 120;
          enrichedNode.fy = (idx - totalNodes / 2) * 40;
        }
        // Default: allow natural positioning
      }
      
      nodesById.set(node.id, enrichedNode);
    });

    visualizationData.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      const sourceNode = nodesById.get(sourceId);
      const targetNode = nodesById.get(targetId);
      
      if (sourceNode && targetNode) {
        sourceNode.neighbors!.push(targetNode);
        sourceNode.links!.push(link);
        targetNode.neighbors!.push(sourceNode);
        targetNode.links!.push(link);
      }
    });

    return {
      nodes: Array.from(nodesById.values()),
      links: visualizationData.links,
    };
  }, [visualizationData]);

  // Handle node hover with highlighting
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (!enableInteraction) return;
    
    if (node) {
      setHighlightNodes(new Set([node, ...(node.neighbors || [])]));
      setHighlightLinks(new Set(node.links || []));
    } else {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
    
    setHoverNode(node);
    externalNodeHover?.(node);
  }, [enableInteraction, externalNodeHover]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    if (!enableInteraction) return;
    onNodeClick?.(node);
    
    // Optional: Center the camera on clicked node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 1000);
    }
  }, [enableInteraction, onNodeClick]);

  // Custom node rendering with command center styling
  const paintNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (!node.x || !node.y) return;

    // Determine if node is affected (probability > 30% matches noise floor)
    const isAffected = (node.probability || 0) > 30;
    const isEpicenter = node.isEpicenter || false;
    const isHighlighted = highlightNodes.has(node);

    // Dim non-affected nodes when there's an active failure scenario
    ctx.globalAlpha = (hasFailure && !isAffected && !isEpicenter) ? 0.2 : 1;

    // Base size with dynamic scaling for affected/epicenter
    const baseSize = node.size || 5;
    let drawSize = isAffected ? baseSize * 1.2 : baseSize;
    
    // Pulsing epicenter animation (breathing effect)
    if (isEpicenter) {
      const pulseAmplitude = 0.2;
      drawSize = baseSize * (1 + pulseAmplitude * Math.sin(Date.now() * 0.005));
    }

    // Heat signature glow for affected nodes
    if (isAffected || isEpicenter) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = isEpicenter ? SYSTEM_THEME.epicenter : SYSTEM_THEME.affected;
      
      // Additional outer glow ring
      const glowRadius = drawSize * 2;
      const gradient = ctx.createRadialGradient(node.x, node.y, drawSize, node.x, node.y, glowRadius);
      gradient.addColorStop(0, isEpicenter ? 'rgba(159, 122, 234, 0.6)' : 'rgba(252, 129, 129, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Main node circle with system-specific colors
    ctx.beginPath();
    ctx.arc(node.x, node.y, drawSize, 0, 2 * Math.PI);
    
    const nodeColor = isEpicenter 
      ? SYSTEM_THEME.epicenter 
      : (SYSTEM_THEME[node.type as keyof typeof SYSTEM_THEME] || '#718096');
    
    ctx.fillStyle = nodeColor;
    ctx.fill();
    
    // Border for better visibility
    ctx.strokeStyle = isHighlighted ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = (isHighlighted ? 2 : 1) / globalScale;
    ctx.stroke();
    
    // Reset shadow effects
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Smart labels: Only show if important or zoomed in
    const shouldDrawLabel = (globalScale > 3 || isAffected || isEpicenter || isHighlighted);
    
    if (shouldDrawLabel) {
      // Label with probability percentage for affected nodes
      const label = isAffected 
        ? `${node.name} (${Math.round(node.probability || 0)}%)`
        : node.name;
      
      const fontSize = (isHighlighted ? 14 : 12) / globalScale;
      ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Measure text for background
      const textWidth = ctx.measureText(label).width;
      const padding = fontSize * 0.4;
      const boxWidth = textWidth + padding * 2;
      const boxHeight = fontSize + padding * 2;
      const yOffset = drawSize + boxHeight / 2 + padding * 2;
      
      // Draw text background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(
        node.x - boxWidth / 2,
        node.y + yOffset - boxHeight / 2,
        boxWidth,
        boxHeight
      );
      
      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, node.x, node.y + yOffset);
    }
  }, [highlightNodes, hasFailure]);

  // Node pointer area for hover detection
  const nodePointerArea = useCallback((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
    if (!node.x || !node.y) return;
    
    ctx.fillStyle = color;
    const size = node.size || 5;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  // Custom node label
  const nodeLabel = useCallback((node: GraphNode) => {
    const parts = [
      `<strong>${node.name}</strong>`,
      `Type: ${node.type}`,
    ];
    
    if (node.probability !== undefined && node.probability > 0) {
      parts.push(`Impact: ${node.probability.toFixed(1)}%`);
    }
    
    if (node.severity && node.severity !== 'none') {
      parts.push(`Severity: ${node.severity}`);
    }
    
    return parts.join('<br/>');
  }, []);

  // Link width based on importance
  const linkWidth = useCallback((link: GraphLink) => {
    if (highlightLinks.has(link)) return 4;
    return link.width || 1;
  }, [highlightLinks]);

  // Link color
  const linkColor = useCallback((link: GraphLink) => {
    if (link.type === 'impact-flow') return link.color || '#FC8181';
    if (highlightLinks.has(link)) return '#FFD700';
    return link.color || '#4A5568';
  }, [highlightLinks]);

  // Particle configuration for impact flow
  const linkParticles = useCallback((link: GraphLink) => {
    return link.type === 'impact-flow' ? (link.particles || 4) : 0;
  }, []);

  const linkParticleSpeed = useCallback((link: GraphLink) => {
    return link.particleSpeed || 0.005;
  }, []);

  const linkParticleWidth = useCallback((link: GraphLink) => {
    return link.particleWidth || (link.width ? link.width * 1.5 : 3);
  }, []);

  return (
    <div style={{ 
      background: backgroundColor, 
      borderRadius: '12px', 
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
    }}>
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={enrichedData}
        
        // Node configuration
        nodeLabel={nodeLabel}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={nodePointerArea}
        
        // Link configuration
        linkWidth={linkWidth}
        linkColor={linkColor}
        linkDirectionalParticles={linkParticles}
        linkDirectionalParticleSpeed={linkParticleSpeed}
        linkDirectionalParticleWidth={linkParticleWidth}
        linkCurvature={0.2}
        
        // Interaction
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        
        // Physics simulation
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        
        // Performance
        enableNodeDrag={enableInteraction}
        enableZoomInteraction={enableInteraction}
        enablePanInteraction={enableInteraction}
      />
      
      {/* Legend */}
      {showLegend && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.85)',
          padding: '16px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '220px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '13px' }}>
            Impact Legend
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              backgroundColor: '#9F7AEA',
              borderRadius: '50%',
              marginRight: '10px',
              boxShadow: '0 0 8px rgba(159, 122, 234, 0.6)'
            }}></span>
            <span>Failure Source (Pulsing)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              backgroundColor: '#FC8181',
              borderRadius: '50%',
              marginRight: '10px'
            }}></span>
            <span>Critical Impact (&gt;75%)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              backgroundColor: '#F6AD55',
              borderRadius: '50%',
              marginRight: '10px'
            }}></span>
            <span>High Impact (&gt;50%)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              backgroundColor: '#68D391',
              borderRadius: '50%',
              marginRight: '10px'
            }}></span>
            <span>Medium Impact (&gt;25%)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              backgroundColor: '#cbd5e0',
              borderRadius: '50%',
              marginRight: '10px'
            }}></span>
            <span>No/Low Impact</span>
          </div>
          
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)', 
            paddingTop: '10px',
            marginTop: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                display: 'inline-block',
                width: '24px',
                height: '3px',
                background: 'linear-gradient(to right, #FC8181, transparent)',
                marginRight: '10px'
              }}></span>
              <span>Impact Flow Path</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Hover Info Panel */}
      {hoverNode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '16px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '13px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: '200px',
          maxWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>
            {hoverNode.name}
          </div>
          <div style={{ color: '#a0aec0', marginBottom: '4px' }}>
            Type: <span style={{ color: 'white' }}>{hoverNode.type}</span>
          </div>
          {hoverNode.probability !== undefined && hoverNode.probability > 0 && (
            <div style={{ color: '#a0aec0', marginBottom: '4px' }}>
              Impact: <span style={{ 
                color: hoverNode.severity === 'critical' ? '#FC8181' : 
                       hoverNode.severity === 'high' ? '#F6AD55' : '#68D391',
                fontWeight: 'bold'
              }}>{hoverNode.probability.toFixed(1)}%</span>
            </div>
          )}
          {hoverNode.severity && hoverNode.severity !== 'none' && (
            <div style={{ color: '#a0aec0' }}>
              Severity: <span style={{ 
                color: hoverNode.severity === 'critical' ? '#FC8181' : 
                       hoverNode.severity === 'high' ? '#F6AD55' : '#68D391',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '11px'
              }}>{hoverNode.severity}</span>
            </div>
          )}
          {hoverNode.isEpicenter && (
            <div style={{ 
              marginTop: '8px', 
              padding: '6px 10px', 
              background: 'rgba(159, 122, 234, 0.2)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#9F7AEA',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              ⚡ FAILURE EPICENTER
            </div>
          )}
        </div>
      )}

      {/* Real-time HUD Overlay - Command Center Style */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '12px',
        fontSize: '11px',
        color: 'white',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '200px'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '12px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          color: '#6366F1',
          fontSize: '10px'
        }}>
          GNN Forecast Engine
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#9F7AEA',
            display: 'inline-block',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <span>Epicenter</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#FC8181',
            display: 'inline-block'
          }} />
          <span>Critical Risk</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#68D391',
            display: 'inline-block'
          }} />
          <span>Normal</span>
        </div>
        
        <div style={{ 
          marginTop: '12px',
          paddingTop: '12px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
          Layout: Coordinate Stitching<br/>
          Physics: Inverse Square (1/d²)
        </div>
      </div>
    </div>
  );
};

export default ImpactGraphVisualizer;
