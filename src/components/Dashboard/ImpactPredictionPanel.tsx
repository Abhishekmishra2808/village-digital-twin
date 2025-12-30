import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Activity,
  Zap,
  Droplet,
  Users,
  Clock,
  ArrowRight,
  RefreshCw,
  Network,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Car,
  Building,
  GraduationCap,
  Heart,
  ShoppingCart,
  Radio,
  X,
  Zap as PowerIcon,
  Gauge,
} from 'lucide-react';
import useGNN from '../../hooks/useGNN';
import type { 
  GNNNode, 
  AffectedNode, 
  ImpactPrediction,
  VulnerableNode 
} from '../../types/gnn';
import type { WaterSimulationState } from '../../types/water';
import ImpactGraphVisualizer from '../ImpactGraphVisualizer';
import type { GraphVisualizationData, GraphNode, GraphLink, SeverityLevel } from '../../types/graph-visualization';

// Extended village state interface for all infrastructure
interface VillageState {
  tanks?: any[];
  pumps?: any[];
  pipes?: any[];
  roads?: any[];
  buildings?: any[];
  powerNodes?: any[];
  sensors?: any[];
  clusters?: any[];
  [key: string]: any;
}

interface ImpactPredictionPanelProps {
  waterState?: WaterSimulationState;
  villageState?: VillageState;
  onNodeSelect?: (nodeId: string) => void;
}

const severityColors = {
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' },
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
};

const nodeTypeIcons: Record<string, React.ElementType> = {
  tank: Droplet,
  pump: Activity,
  cluster: Users,
  pipe: Network,
  power: Zap,
  sensor: Radio,
  road: Car,
  building: Building,
  school: GraduationCap,
  hospital: Heart,
  market: ShoppingCart,
};

const nodeTypeColors: Record<string, string> = {
  tank: 'bg-blue-500',
  pump: 'bg-purple-500',
  cluster: 'bg-green-500',
  pipe: 'bg-gray-500',
  power: 'bg-yellow-500',
  sensor: 'bg-cyan-500',
  road: 'bg-amber-500',
  building: 'bg-slate-500',
  school: 'bg-indigo-500',
  hospital: 'bg-red-500',
  market: 'bg-emerald-500',
};

const nodeTypeLabels: Record<string, string> = {
  tank: 'Water Tank',
  pump: 'Water Pump',
  cluster: 'Consumer Area',
  pipe: 'Water Pipe',
  power: 'Power Node',
  sensor: 'Sensor',
  road: 'Road',
  building: 'Building',
  school: 'School',
  hospital: 'Hospital',
  market: 'Market',
};

export const ImpactPredictionPanel: React.FC<ImpactPredictionPanelProps> = ({
  waterState,
  villageState,
  onNodeSelect,
}) => {
  const {
    isInitialized,
    isLoading,
    error,
    nodes,
    vulnerableNodes,
    scenarios,
    currentPrediction,
    initializeGNN,
    predictImpact,
    getVulnerableNodes,
    clearPrediction,
  } = useGNN();

  const [selectedNode, setSelectedNode] = useState<string>('');
  const [selectedFailureType, setSelectedFailureType] = useState<string>('failure');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('medium');
  const [showVulnerabilities, setShowVulnerabilities] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>('all');
  const [selectedNodeForDetails, setSelectedNodeForDetails] = useState<AffectedNode | null>(null);

  // Get combined state - prefer villageState, fall back to waterState
  const combinedState = useMemo(() => {
    return villageState || waterState;
  }, [villageState, waterState]);

  // Initialize GNN when state changes
  useEffect(() => {
    if (combinedState && !isInitialized) {
      initializeGNN(combinedState);
    }
  }, [combinedState, isInitialized, initializeGNN]);

  // Get unique node types for filter
  const nodeTypes = useMemo(() => {
    const types = new Set(nodes.map(n => n.type));
    return Array.from(types).sort();
  }, [nodes]);

  // Filter nodes by type
  const filteredNodes = useMemo(() => {
    if (nodeTypeFilter === 'all') return nodes;
    return nodes.filter(n => n.type === nodeTypeFilter);
  }, [nodes, nodeTypeFilter]);

  // Get applicable scenarios for selected node
  const applicableScenarios = useMemo(() => {
    if (!selectedNode) return scenarios;
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return scenarios;
    return scenarios.filter(s => s.applicableTo && Array.isArray(s.applicableTo) && s.applicableTo.includes(node.type));
  }, [selectedNode, nodes, scenarios]);

  const handleRunPrediction = async () => {
    if (!selectedNode) return;
    await predictImpact(selectedNode, selectedFailureType, selectedSeverity);
  };

  const handleShowVulnerabilities = async () => {
    if (!showVulnerabilities) {
      await getVulnerableNodes();
    }
    setShowVulnerabilities(!showVulnerabilities);
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (!isInitialized && !isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Village Infrastructure Impact Predictor</h2>
        </div>
        <p className="text-slate-400 mb-4">
          Initialize the Graph Neural Network to predict cascading effects of failures across roads, buildings, water, power, and other infrastructure.
        </p>
        <button
          onClick={() => combinedState && initializeGNN(combinedState)}
          disabled={!combinedState || isLoading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Initialize GNN
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4">
      <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Network className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Village Infrastructure Impact Predictor</h2>
              <p className="text-sm text-slate-400">
                Predict cascading effects across roads, buildings, power, and water systems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Node type summary */}
            <div className="flex gap-1">
              {nodeTypes.slice(0, 5).map(type => {
                const Icon = nodeTypeIcons[type] || Activity;
                const count = nodes.filter(n => n.type === type).length;
                return (
                  <div 
                    key={type}
                    className={`px-2 py-1 rounded text-xs ${nodeTypeColors[type]} bg-opacity-20 text-white flex items-center gap-1`}
                    title={`${nodeTypeLabels[type] || type}: ${count}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {nodes.length} nodes | {isInitialized ? 'Ready' : 'Not initialized'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Node Type Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Infrastructure Type</label>
            <select
              value={nodeTypeFilter}
              onChange={(e) => {
                setNodeTypeFilter(e.target.value);
                setSelectedNode(''); // Reset node selection when filter changes
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Types ({nodes.length})</option>
              {nodeTypes.map((type) => (
                <option key={type} value={type}>
                  {nodeTypeLabels[type] || type} ({nodes.filter(n => n.type === type).length})
                </option>
              ))}
            </select>
          </div>

          {/* Node Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Select Node</label>
            <select
              value={selectedNode}
              onChange={(e) => setSelectedNode(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Choose a node...</option>
              {filteredNodes.map((node) => {
                return (
                  <option key={node.id} value={node.id}>
                    [{nodeTypeLabels[node.type] || node.type}] {node.name || node.id}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Failure Type */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Failure Scenario</label>
            <select
              value={selectedFailureType}
              onChange={(e) => setSelectedFailureType(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              {applicableScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRunPrediction}
            disabled={!selectedNode || isLoading}
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            Predict Impact
          </button>
          <button
            onClick={handleShowVulnerabilities}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {showVulnerabilities ? 'Hide' : 'Show'} Vulnerabilities
          </button>
          {currentPrediction && (
            <button
              onClick={clearPrediction}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Vulnerability Overview */}
      {showVulnerabilities && vulnerableNodes.length > 0 && (
        <VulnerabilityOverview 
          vulnerableNodes={vulnerableNodes} 
          onSelectNode={(nodeId) => {
            setSelectedNode(nodeId);
            onNodeSelect?.(nodeId);
          }}
        />
      )}

      {/* Impact Prediction Results */}
      {currentPrediction && (
        <ImpactResults 
          prediction={currentPrediction}
          expandedNodes={expandedNodes}
          onToggleNode={toggleNodeExpansion}
          onNodeSelect={onNodeSelect}
        />
      )}

      {/* Interactive Graph Visualization */}
      {currentPrediction && (
        <ImpactGraphVisualizationWrapper 
          prediction={currentPrediction}
          nodes={nodes}
          onNodeClick={setSelectedNodeForDetails}
        />
      )}
      </div>

      {/* Right Sidebar for Node Details */}
      {selectedNodeForDetails && (
        <NodeDetailsSidebar
          node={selectedNodeForDetails}
          onClose={() => setSelectedNodeForDetails(null)}
        />
      )}
    </div>
  );
};

// Vulnerability Overview Component
const VulnerabilityOverview: React.FC<{
  vulnerableNodes: VulnerableNode[];
  onSelectNode: (nodeId: string) => void;
}> = ({ vulnerableNodes, onSelectNode }) => {
  const topVulnerable = vulnerableNodes.slice(0, 5);
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Vulnerability Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Summary Cards */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-400">
            {vulnerableNodes.filter(n => n.riskLevel === 'high').length}
          </div>
          <div className="text-sm text-slate-400">High Risk Nodes</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {vulnerableNodes.filter(n => n.riskLevel === 'medium').length}
          </div>
          <div className="text-sm text-slate-400">Medium Risk Nodes</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">
            {vulnerableNodes.filter(n => n.riskLevel === 'low').length}
          </div>
          <div className="text-sm text-slate-400">Low Risk Nodes</div>
        </div>
      </div>

      {/* Top Vulnerable Nodes */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-slate-400 mb-2">Most Critical Nodes</h4>
        <div className="space-y-2">
          {topVulnerable.map((node) => {
            const Icon = nodeTypeIcons[node.type] || Activity;
            const colors = severityColors[node.riskLevel === 'high' ? 'critical' : node.riskLevel];
            
            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${colors.bg} border ${colors.border} hover:opacity-80`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded ${nodeTypeColors[node.type]}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{node.name || node.id}</div>
                    <div className="text-xs text-slate-400">
                      {node.type} • {node.connections} connections
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${colors.text}`}>
                    {node.vulnerabilityScore}%
                  </div>
                  <div className="text-xs text-slate-400">vulnerability</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Impact Results Component
const ImpactResults: React.FC<{
  prediction: ImpactPrediction;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onNodeSelect?: (nodeId: string) => void;
}> = ({ prediction, expandedNodes, onToggleNode, onNodeSelect }) => {
  const { sourceFailure, affectedNodes, overallAssessment } = prediction;
  const riskColors = severityColors[overallAssessment.riskLevel];

  return (
    <div className="space-y-4">
      {/* Overall Assessment */}
      <div className={`rounded-xl p-4 border ${riskColors.bg} ${riskColors.border}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-6 h-6 ${riskColors.text} flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Impact Assessment</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors.bg} ${riskColors.text} border ${riskColors.border}`}>
                {overallAssessment.riskLevel.toUpperCase()} RISK
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-3">{overallAssessment.summary}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-white">{prediction.totalAffected}</div>
                <div className="text-xs text-slate-400">Affected Nodes</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-red-400">{prediction.criticalCount}</div>
                <div className="text-xs text-slate-400">Critical</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-orange-400">{prediction.highCount}</div>
                <div className="text-xs text-slate-400">High Severity</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <div className="text-xl font-bold text-cyan-400">
                  ~{overallAssessment.affectedPopulation}
                </div>
                <div className="text-xs text-slate-400">People Affected</div>
              </div>
            </div>

            {/* Priority Actions */}
            {overallAssessment.priorityActions.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">Priority Actions</h4>
                <ul className="space-y-1">
                  {overallAssessment.priorityActions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recovery Time */}
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              Estimated Recovery: {overallAssessment.estimatedRecoveryTime}
            </div>
          </div>
        </div>
      </div>

      {/* Source Failure */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-400" />
          Failure Source
        </h3>
        <div className="flex items-center gap-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className={`p-2 rounded ${nodeTypeColors[sourceFailure.nodeType]}`}>
            {React.createElement(nodeTypeIcons[sourceFailure.nodeType] || Activity, { 
              className: "w-6 h-6 text-white" 
            })}
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">{sourceFailure.nodeName}</div>
            <div className="text-sm text-slate-400">
              {sourceFailure.nodeType} • {sourceFailure.failureType} ({sourceFailure.severity})
            </div>
          </div>
        </div>
      </div>

      {/* Affected Nodes */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Cascading Effects ({affectedNodes.length} nodes)
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {affectedNodes.map((node) => (
            <AffectedNodeCard
              key={node.nodeId}
              node={node}
              isExpanded={expandedNodes.has(node.nodeId)}
              onToggle={() => onToggleNode(node.nodeId)}
              onSelect={() => onNodeSelect?.(node.nodeId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Affected Node Card
const AffectedNodeCard: React.FC<{
  node: AffectedNode;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}> = ({ node, isExpanded, onToggle, onSelect }) => {
  const colors = severityColors[node.severity];
  const Icon = nodeTypeIcons[node.nodeType] || Activity;

  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer ${colors.bg}`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded ${nodeTypeColors[node.nodeType]}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-white">{node.nodeName}</div>
            <div className="text-xs text-slate-400">
              {node.nodeType} • Impact in ~{node.timeToImpact}h
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-sm font-bold ${colors.text}`}>
              {node.probability}% likely
            </div>
            <div className="text-xs text-slate-400">{node.severity} severity</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 bg-slate-800/50 border-t border-slate-700 space-y-3">
          {/* Effects */}
          <div>
            <h5 className="text-xs font-medium text-slate-400 mb-1">Expected Effects</h5>
            <ul className="space-y-1">
              {node.effects.map((effect, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertCircle className="w-3 h-3 text-orange-400 mt-1 flex-shrink-0" />
                  {effect}
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400">Supply Disruption</div>
              <div className="text-sm font-medium text-white">{node.metrics.supplyDisruption}%</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400">Pressure Drop</div>
              <div className="text-sm font-medium text-white">{node.metrics.pressureDrop}%</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400">Quality Risk</div>
              <div className="text-sm font-medium text-white">{node.metrics.qualityRisk}%</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400">Cascade Risk</div>
              <div className="text-sm font-medium text-white">{node.metrics.cascadeRisk}%</div>
            </div>
          </div>

          {/* Recommendations */}
          {node.recommendations.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-slate-400 mb-1">Recommendations</h5>
              <ul className="space-y-1">
                {node.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-400">
                    <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded text-sm transition-colors"
          >
            View on Map
          </button>
        </div>
      )}
    </div>
  );
};

// Interactive Graph Visualization Wrapper
const ImpactGraphVisualizationWrapper: React.FC<{
  prediction: ImpactPrediction;
  nodes: GNNNode[];
  onNodeClick: (node: AffectedNode) => void;
}> = ({ prediction, onNodeClick }) => {
  const { sourceFailure, affectedNodes, propagationPath } = prediction;
  const [currentTime, setCurrentTime] = useState(0);

  // Start cascade animation
  useEffect(() => {
    // Reset animation when prediction changes
    setCurrentTime(0);
    
    const maxTime = Math.max(...affectedNodes.map(n => n.timeToImpact), 1);
    const startTime = Date.now();
    const duration = maxTime * 500; // 500ms per hour
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCurrentTime(progress * maxTime);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [prediction, affectedNodes]);

  // Transform prediction data to graph visualization format
  const graphData = useMemo((): GraphVisualizationData => {
    // Create graph nodes
    const graphNodes: GraphNode[] = [];
    
    // Add source node (epicenter)
    graphNodes.push({
      id: sourceFailure.nodeId,
      name: sourceFailure.nodeName,
      type: sourceFailure.nodeType as any,
      isEpicenter: true,
      severity: 'critical' as SeverityLevel,
      probability: 100,
      pulse: true
    });
    
    // Add affected nodes with timeToImpact for sequential animation
    affectedNodes.forEach(node => {
      graphNodes.push({
        id: node.nodeId,
        name: node.nodeName,
        type: node.nodeType as any,
        severity: node.severity as SeverityLevel,
        probability: node.probability,
        isEpicenter: false,
        timeToImpact: node.timeToImpact
      });
    });
    
    // Create links from propagation paths
    const graphLinks: GraphLink[] = [];
    
    if (propagationPath && propagationPath.length > 0) {
      propagationPath.forEach(path => {
        const targetNode = affectedNodes.find(n => n.nodeId === path.to);
        const shouldShow = !targetNode || currentTime >= targetNode.timeToImpact;
        
        graphLinks.push({
          source: path.from,
          target: path.to,
          type: 'impact-flow',
          particles: shouldShow ? Math.floor(path.weight * 5) + 1 : 0,
          particleSpeed: 0.01,
          particleWidth: 3
        });
      });
    } else {
      // Sequential direct links from source to affected nodes based on timeToImpact
      affectedNodes.forEach(node => {
        const shouldShow = currentTime >= node.timeToImpact;
        
        graphLinks.push({
          source: sourceFailure.nodeId,
          target: node.nodeId,
          type: 'impact-flow',
          particles: shouldShow ? (node.severity === 'critical' ? 5 : node.severity === 'high' ? 3 : 2) : 0,
          particleSpeed: 0.01,
          particleWidth: 3
        });
      });
    }
    
    return { nodes: graphNodes, links: graphLinks };
  }, [prediction, sourceFailure, affectedNodes, propagationPath]);

  const handleNodeClick = (graphNode: any) => {
    // Find the corresponding affected node with full details
    const affectedNode = affectedNodes.find(n => n.nodeId === graphNode.id);
    if (affectedNode) {
      onNodeClick(affectedNode);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Slow-Motion Cascade Visualization
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Watch impacts cascade in sequence. Click nodes for detailed metrics →
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Animation Time</div>
          <div className="text-lg font-mono text-cyan-400">{currentTime.toFixed(1)}h</div>
        </div>
      </div>
      <ImpactGraphVisualizer
        visualizationData={graphData}
        height={600}
        backgroundColor="#0f1419"
        showLegend={true}
        enableInteraction={true}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
};

// Node Details Sidebar Component
const NodeDetailsSidebar: React.FC<{
  node: AffectedNode;
  onClose: () => void;
}> = ({ node, onClose }) => {
  const Icon = nodeTypeIcons[node.nodeType] || Activity;
  const colors = severityColors[node.severity];

  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 p-6 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${nodeTypeColors[node.nodeType]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{node.nodeName}</h3>
            <p className="text-sm text-slate-400">{nodeTypeLabels[node.nodeType] || node.nodeType}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Risk Overview */}
      <div className={`rounded-lg p-4 mb-6 ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Impact Probability</span>
          <span className={`text-2xl font-bold ${colors.text}`}>{node.probability.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Severity Level</span>
          <span className={`text-lg font-semibold ${colors.text} uppercase`}>{node.severity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          Impact expected in ~{node.timeToImpact} hours
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Key Performance Metrics
        </h4>
        <div className="space-y-3">
          {/* Pressure/Supply */}
          {node.metrics.pressureDrop !== undefined && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Pressure Drop</span>
                <span className="text-lg font-bold text-white">{node.metrics.pressureDrop}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${node.metrics.pressureDrop}%` }}
                />
              </div>
            </div>
          )}

          {/* Power/Voltage */}
          {node.metrics.powerImpact !== undefined && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <PowerIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-400">Power Impact</span>
                </div>
                <span className="text-lg font-bold text-white">{node.metrics.powerImpact}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${node.metrics.powerImpact}%` }}
                />
              </div>
            </div>
          )}

          {/* Supply Disruption */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-400">Supply Disruption</span>
              <span className="text-lg font-bold text-white">{node.metrics.supplyDisruption}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${node.metrics.supplyDisruption}%` }}
              />
            </div>
          </div>

          {/* Population Affected */}
          {node.metrics.populationAffected !== undefined && (
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Population Affected</span>
                </div>
                <span className="text-lg font-bold text-white">{node.metrics.populationAffected}</span>
              </div>
            </div>
          )}

          {/* Cascade Risk */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-400">Cascade Risk</span>
              <span className="text-lg font-bold text-white">{node.metrics.cascadeRisk}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${node.metrics.cascadeRisk}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expected Effects */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Expected Effects
        </h4>
        <ul className="space-y-2">
          {node.effects.map((effect, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              {effect}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      {node.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Recommended Actions
          </h4>
          <ul className="space-y-2">
            {node.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-400">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImpactPredictionPanel;
