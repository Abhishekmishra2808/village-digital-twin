import { X, ExternalLink, Wrench, Bell, Download, AlertTriangle, Clock } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { formatDistanceToNow } from 'date-fns';

export default function InfoPanel() {
  const { selectedAsset, setSelectedAsset } = useVillageStore();

  if (!selectedAsset) return null;

  const { type, data } = selectedAsset;

  return (
    <div className="h-full bg-slate-900/95 backdrop-blur-md border-l border-white/10 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between shadow-sm z-10">
        <h3 className="text-lg font-semibold text-white">Asset Details</h3>
        <button
          onClick={() => setSelectedAsset(null)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} className="text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {type === 'waterTank' && <WaterTankDetails data={data} />}
        {type === 'building' && <BuildingDetails data={data} />}
        {type === 'powerNode' && <PowerNodeDetails data={data} />}
        {type === 'sensor' && <SensorDetails data={data} />}
        {type === 'gnnNode' && <GNNNodeDetails data={data} />}
      </div>
    </div>
  );
}

function WaterTankDetails({ data }: { data: any }) {
  const statusColor = data.status === 'good' ? 'text-green-400' : 
                     data.status === 'warning' ? 'text-yellow-400' : 
                     'text-red-400';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">💧</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({data.currentLevel.toFixed(1)}% full)
        </p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity.toLocaleString()} liters`} />
        <DetailRow label="Current Level" value={`${(data.capacity * data.currentLevel / 100).toLocaleString()} liters`} />
        <DetailRow label="Flow Rate" value={`${data.flowRate} L/hr`} />
        <DetailRow label="Elevation" value={`${data.elevation}m`} />
        <DetailRow label="Last Refill" value={formatDistanceToNow(new Date(data.lastRefill), { addSuffix: true })} />
        <DetailRow label="Next Service" value={new Date(data.nextService).toLocaleDateString()} />
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
        <h5 className="font-semibold mb-3 text-white">Level Indicator</h5>
        <div className="h-32 bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
              data.status === 'good' ? 'bg-gradient-to-t from-green-500 to-green-300/50' :
              data.status === 'warning' ? 'bg-gradient-to-t from-yellow-500 to-yellow-300/50' :
              'bg-gradient-to-t from-red-500 to-red-300/50'
            }`}
            style={{ height: `${data.currentLevel}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white drop-shadow-lg">
            {data.currentLevel.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <ActionButton icon={<ExternalLink size={16} />} text="View Full History" />
        <ActionButton icon={<Bell size={16} />} text="Set Alert Threshold" />
        <ActionButton icon={<Wrench size={16} />} text="Schedule Maintenance" />
      </div>
    </div>
  );
}

function BuildingDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">🏢</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className="text-sm text-slate-400 capitalize">{data.type}</p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Details</h5>
        <DetailRow label="Type" value={data.type} />
        <DetailRow label="Height" value={`${data.height}m`} />
        <DetailRow label="Floors" value={data.floors} />
        <DetailRow label="Occupancy" value={data.occupancy > 0 ? `${data.occupancy} people` : 'N/A'} />
        <DetailRow label="Coordinates" value={`${data.coords[1].toFixed(4)}°N, ${data.coords[0].toFixed(4)}°E`} />
      </div>
    </div>
  );
}

function PowerNodeDetails({ data }: { data: any }) {
  const loadPercent = (data.currentLoad / data.capacity) * 100;
  const statusColor = loadPercent > 95 ? 'text-red-400' : loadPercent > 80 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">⚡</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className={`text-sm ${statusColor} font-medium`}>
          ● {data.status.toUpperCase()} ({loadPercent.toFixed(1)}% load)
        </p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Specifications</h5>
        <DetailRow label="Capacity" value={`${data.capacity} kW`} />
        <DetailRow label="Current Load" value={`${data.currentLoad} kW`} />
        <DetailRow label="Voltage" value={`${data.voltage} V`} />
        <DetailRow label="Temperature" value={`${data.temperature.toFixed(1)}°C`} />
      </div>

      {/* Load Bar */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
        <h5 className="font-semibold mb-3 text-white">Load Indicator</h5>
        <div className="h-8 bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${
              loadPercent > 95 ? 'bg-red-500' :
              loadPercent > 80 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${loadPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
            {loadPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function SensorDetails({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">📡</div>
        <h4 className="text-xl font-bold text-white">{data.name}</h4>
        <p className="text-sm text-slate-400 capitalize">{data.type.replace('_', ' ')}</p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Current Reading</h5>
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-cyan-400">
            {data.value.toFixed(1)} {data.unit}
          </div>
        </div>
        <DetailRow label="Status" value={data.status === 'active' ? '🟢 Active' : '🔴 Offline'} />
        <DetailRow label="Last Update" value={formatDistanceToNow(new Date(data.lastUpdate), { addSuffix: true })} />
        {data.humidity && <DetailRow label="Humidity" value={`${data.humidity.toFixed(1)}%`} />}
        {data.windSpeed && <DetailRow label="Wind Speed" value={`${data.windSpeed.toFixed(1)} km/h`} />}
        {data.tds && <DetailRow label="TDS" value={`${data.tds} ppm`} />}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function ActionButton({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <button className="w-full bg-slate-800/50 p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-slate-700 transition-colors border border-white/10">
      <span className="text-slate-300">{icon}</span>
      <span className="text-slate-300">{text}</span>
    </button>
  );
}

// GNN Infrastructure Node Details
function GNNNodeDetails({ data }: { data: any }) {
  const { gnnNodes, failedNodes, clearAllFailures, clearNodeImpacts, setSelectedAsset } = useVillageStore();
  
  // Get fresh node data from store instead of using stale props
  const freshNodeData = gnnNodes.find(n => n.id === data.id);
  const nodeData = freshNodeData ? { ...data, ...freshNodeData, isFailed: failedNodes.includes(data.id) } : data;
  
  const typeIcons: Record<string, string> = {
    tank: '💧',
    pump: '⚙️',
    pipe: '🔧',
    hospital: '🏥',
    school: '🏫',
    transformer: '⚡',
    power: '⚡',
    building: '🏢',
    market: '🛒',
    sensor: '📡',
    road: '🛣️',
    cluster: '👥',
  };

  const typeLabels: Record<string, string> = {
    tank: 'Water Tank',
    pump: 'Water Pump',
    pipe: 'Water Pipe',
    hospital: 'Hospital',
    school: 'School',
    transformer: 'Power Transformer',
    power: 'Power Node',
    building: 'Building',
    market: 'Market',
    sensor: 'Sensor',
    road: 'Road',
    cluster: 'Consumer Cluster',
  };

  const icon = typeIcons[nodeData.type] || '📍';
  const typeLabel = typeLabels[nodeData.type] || nodeData.type;
  const healthPercent = (nodeData.health * 100).toFixed(0);
  
  // Check if this node is currently failed (from store, not props)
  const isCurrentlyFailed = failedNodes.includes(nodeData.id);
  const hasCurrentImpact = nodeData.impactScore !== undefined && nodeData.impactScore > 0;
  
  const statusColor = isCurrentlyFailed ? 'text-red-400' : 
                      hasCurrentImpact ? 'text-yellow-400' :
                      nodeData.health > 0.7 ? 'text-green-400' : 
                      nodeData.health > 0.4 ? 'text-yellow-400' : 'text-red-400';

  const statusText = isCurrentlyFailed ? 'FAILED' : 
                     hasCurrentImpact ? 'IMPACTED' : 
                     nodeData.status?.toUpperCase() || 'OPERATIONAL';
  
  // Look up the source node name if impactFrom is provided
  const impactSourceNode = nodeData.impactFrom ? gnnNodes.find(n => n.id === nodeData.impactFrom) : null;
  const impactSourceName = impactSourceNode?.name || nodeData.impactFrom;
  
  // Get prediction result if available
  const prediction = nodeData.predictionResult;
  
  // Find dependent nodes (nodes that are impacted by or depend on this node)
  const dependentFailedNodes = gnnNodes.filter(n => 
    failedNodes.includes(n.id) && n.id !== nodeData.id
  );
  const nodesImpactedByCurrentFailure = gnnNodes.filter(n =>
    n.impactFrom === nodeData.id && n.impactScore && n.impactScore > 0
  );
  
  // Download report function
  const downloadReport = () => {
    // Get the latest state from the store to ensure we have current data
    const storeState = useVillageStore.getState();
    const allGnnNodes = storeState.gnnNodes;
    const allFailedNodes = storeState.failedNodes;
    
    // Re-calculate impacted nodes from current store state
    const currentImpactedNodes = allGnnNodes.filter(n =>
      n.impactFrom === nodeData.id && n.impactScore && n.impactScore > 0
    );
    
    // Also check for nodes that have impactScore set regardless of impactFrom (from prediction)
    const allImpactedNodes = allGnnNodes.filter(n =>
      (n.impactFrom === nodeData.id || allFailedNodes.includes(nodeData.id)) && 
      n.impactScore && n.impactScore > 0 &&
      n.id !== nodeData.id
    );
    
    const reportLines = [
      '='.repeat(70),
      'VILLAGE INFRASTRUCTURE IMPACT ANALYSIS REPORT',
      '='.repeat(70),
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '-'.repeat(70),
      'FAILURE SOURCE',
      '-'.repeat(70),
      '',
      `Node: ${nodeData.name}`,
      `Type: ${typeLabel}`,
      `Failure Type: ${nodeData.failureType || 'N/A'}`,
      `Severity: ${nodeData.severity?.toUpperCase() || 'N/A'}`,
      `Health: ${healthPercent}%`,
      '',
    ];
    
    if (prediction) {
      reportLines.push(
        '-'.repeat(70),
        'GNN IMPACT PREDICTION RESULTS',
        '-'.repeat(70),
        '',
        `Overall Risk: ${prediction.overallAssessment?.riskLevel?.toUpperCase() || 'N/A'}`,
        `Total Affected: ${prediction.totalAffected || prediction.affectedNodes?.length || 0} nodes`,
        `Critical Impacts: ${prediction.criticalCount || 0}`,
        `High Severity: ${prediction.highCount || 0}`,
        `Estimated Population Affected: ~${prediction.overallAssessment?.affectedPopulation || 0} people`,
        `Estimated Recovery Time: ${prediction.overallAssessment?.estimatedRecoveryTime || 'N/A'}`,
        '',
        `Summary: ${prediction.overallAssessment?.summary || 'N/A'}`,
        '',
        '-'.repeat(70),
        'AFFECTED NODES (GNN Prediction)',
        '-'.repeat(70),
        ''
      );
      
      if (prediction.affectedNodes && prediction.affectedNodes.length > 0) {
        prediction.affectedNodes.forEach((node: any, i: number) => {
          reportLines.push(
            `${i + 1}. ${node.nodeName} (${node.nodeType})`,
            `   Severity: ${node.severity?.toUpperCase() || 'N/A'}`,
            `   Impact Score: ${node.probability || node.severityScore || 0}%`,
            `   Time to Impact: ~${node.timeToImpact || 0}h`,
            `   Effects: ${node.effects?.join(', ') || 'N/A'}`,
            ''
          );
        });
      } else {
        reportLines.push('No nodes directly affected by prediction.');
        reportLines.push('');
      }
    }
    
    // Always include current impacted nodes from store
    if (currentImpactedNodes.length > 0 || allImpactedNodes.length > 0) {
      const nodesToReport = currentImpactedNodes.length > 0 ? currentImpactedNodes : allImpactedNodes;
      reportLines.push(
        '-'.repeat(70),
        'IMPACTED NODES (Current State)',
        '-'.repeat(70),
        ''
      );
      nodesToReport.forEach((node, i) => {
        const isCascadeFailed = allFailedNodes.includes(node.id);
        reportLines.push(
          `${i + 1}. ${node.name} (${node.type})`,
          `   Impact Score: ${node.impactScore || 0}%`,
          `   Status: ${isCascadeFailed ? 'CASCADE FAILURE' : 'IMPACTED'}`,
          `   Health: ${(node.health * 100).toFixed(0)}%`,
          ''
        );
      });
    } else if (!prediction) {
      reportLines.push(
        '-'.repeat(70),
        'IMPACT STATUS',
        '-'.repeat(70),
        '',
        'No cascading impacts detected.',
        ''
      );
    }
    
    // Include all failed nodes
    if (allFailedNodes.length > 1) {
      reportLines.push(
        '-'.repeat(70),
        'ALL FAILED NODES',
        '-'.repeat(70),
        ''
      );
      allFailedNodes.forEach((nodeId, i) => {
        const node = allGnnNodes.find(n => n.id === nodeId);
        if (node) {
          reportLines.push(
            `${i + 1}. ${node.name} (${node.type})`,
            `   Failure Type: ${node.failureType || 'cascade_effect'}`,
            ''
          );
        }
      });
    }
    
    reportLines.push(
      '-'.repeat(70),
      'Report generated by Village Infrastructure Impact Predictor',
      '='.repeat(70)
    );
    
    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact_report_${nodeData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Reset failures function
  const handleResetFailures = () => {
    clearAllFailures();
    clearNodeImpacts();
    // Close the info panel since the state has changed
    setSelectedAsset(null);
  };
  
  // Find other dependent nodes
  const dependentImpactedNodes = gnnNodes.filter(n => 
    n.impactFrom === nodeData.id && n.impactScore && n.impactScore > 0
  );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">{icon}</div>
        <h4 className="text-xl font-bold text-white">{nodeData.name}</h4>
        <p className="text-sm text-slate-400">{typeLabel}</p>
        <p className={`text-sm ${statusColor} font-medium mt-1`}>
          ● {statusText}
        </p>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-white/10">
        <h5 className="font-semibold border-b border-white/10 pb-2 text-white">Node Information</h5>
        <DetailRow label="ID" value={nodeData.id} />
        <DetailRow label="Type" value={typeLabel} />
        <DetailRow label="Health" value={`${healthPercent}%`} />
        <DetailRow label="Status" value={statusText} />
        {nodeData.coords && (
          <DetailRow 
            label="Location" 
            value={`${nodeData.coords[1]?.toFixed(4) || 'N/A'}°N, ${nodeData.coords[0]?.toFixed(4) || 'N/A'}°E`} 
          />
        )}
      </div>

      {/* Health Bar */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
        <h5 className="font-semibold mb-3 text-white">Health Indicator</h5>
        <div className="h-8 bg-slate-700 rounded-lg overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${
              isCurrentlyFailed ? 'bg-red-500' :
              hasCurrentImpact ? 'bg-yellow-500' :
              nodeData.health > 0.7 ? 'bg-green-500' :
              nodeData.health > 0.4 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${healthPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
            {healthPercent}%
          </div>
        </div>
      </div>

      {/* Impact Information */}
      {(isCurrentlyFailed || hasCurrentImpact) && (
        <div className={`p-4 rounded-lg border ${isCurrentlyFailed ? 'bg-red-500/20 border-red-500' : 'bg-yellow-500/20 border-yellow-500'}`}>
          <h5 className={`font-semibold mb-2 ${isCurrentlyFailed ? 'text-red-400' : 'text-yellow-400'}`}>
            {isCurrentlyFailed ? '⚠️ Failure Status' : '📊 Impact Analysis'}
          </h5>
          {isCurrentlyFailed && nodeData.failureType && (
            <p className="text-red-300 text-sm">Failure Type: {nodeData.failureType}</p>
          )}
          {hasCurrentImpact && nodeData.impactScore !== undefined && (
            <>
              <p className="text-yellow-300 text-sm mb-1">Impact Score: {nodeData.impactScore}%</p>
              {nodeData.impactFrom && (
                <p className="text-yellow-300 text-sm">Caused by failure of: <span className="font-semibold">{impactSourceName}</span></p>
              )}
            </>
          )}
        </div>
      )}

      {/* Dependent Nodes - Show failed/impacted nodes in the network */}
      {(dependentFailedNodes.length > 0 || dependentImpactedNodes.length > 0 || nodesImpactedByCurrentFailure.length > 0) && (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-white/10">
          <h5 className="font-semibold mb-3 text-white flex items-center gap-2">
            <span>🔗</span> Network Status
          </h5>
          <div className="space-y-2 text-sm">
            {dependentFailedNodes.length > 0 && (
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-red-400 font-semibold mb-1">⚠️ Failed Nodes in Network:</p>
                {dependentFailedNodes.map(node => (
                  <p key={node.id} className="text-red-300 ml-4">• {node.name}</p>
                ))}
              </div>
            )}
            {nodesImpactedByCurrentFailure.length > 0 && isCurrentlyFailed && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-yellow-400 font-semibold mb-1">📊 Nodes Affected by This Failure:</p>
                {nodesImpactedByCurrentFailure.map(node => (
                  <p key={node.id} className="text-yellow-300 ml-4">
                    • {node.name} ({node.impactScore}%)
                  </p>
                ))}
              </div>
            )}
            {dependentImpactedNodes.length > 0 && !isCurrentlyFailed && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <p className="text-yellow-400 font-semibold mb-1">📊 Downstream Impacted Nodes:</p>
                {dependentImpactedNodes.map(node => (
                  <p key={node.id} className="text-yellow-300 ml-4">
                    • {node.name} ({node.impactScore}%)
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GNN Prediction Results (if available) */}
      {prediction && (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/30">
          <h5 className="font-semibold mb-3 text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            GNN Impact Analysis
          </h5>
          
          {/* Overall Assessment */}
          <div className={`p-3 rounded-lg mb-3 ${
            prediction.overallAssessment?.riskLevel === 'critical' ? 'bg-red-500/20 border border-red-500/50' :
            prediction.overallAssessment?.riskLevel === 'high' ? 'bg-orange-500/20 border border-orange-500/50' :
            'bg-yellow-500/20 border border-yellow-500/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold text-sm">Risk Level</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                prediction.overallAssessment?.riskLevel === 'critical' ? 'bg-red-500 text-white' :
                prediction.overallAssessment?.riskLevel === 'high' ? 'bg-orange-500 text-white' :
                'bg-yellow-500 text-black'
              }`}>
                {prediction.overallAssessment?.riskLevel?.toUpperCase() || 'N/A'}
              </span>
            </div>
            <p className="text-slate-300 text-xs">{prediction.overallAssessment?.summary}</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-700/50 rounded p-2 text-center">
              <div className="text-white text-lg font-bold">{prediction.totalAffected || 0}</div>
              <div className="text-slate-400 text-xs">Nodes Affected</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2 text-center">
              <div className="text-red-400 text-lg font-bold">{prediction.criticalCount || 0}</div>
              <div className="text-slate-400 text-xs">Critical</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2 text-center">
              <div className="text-cyan-400 text-lg font-bold">~{prediction.overallAssessment?.affectedPopulation || 0}</div>
              <div className="text-slate-400 text-xs">People Affected</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2 text-center flex flex-col items-center justify-center">
              <Clock className="w-4 h-4 text-slate-400 mb-1" />
              <div className="text-slate-300 text-xs">{prediction.overallAssessment?.estimatedRecoveryTime || 'N/A'}</div>
            </div>
          </div>
          
          {/* Affected Nodes List */}
          {prediction.affectedNodes && prediction.affectedNodes.length > 0 && (
            <div className="max-h-40 overflow-y-auto">
              <p className="text-slate-400 text-xs mb-2">Affected Infrastructure:</p>
              {prediction.affectedNodes.slice(0, 5).map((affected: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/50 last:border-0">
                  <span className="text-white">{affected.nodeName}</span>
                  <span className={`font-medium ${
                    affected.severity === 'critical' ? 'text-red-400' :
                    affected.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>{affected.probability || affected.severityScore || 0}%</span>
                </div>
              ))}
              {prediction.affectedNodes.length > 5 && (
                <p className="text-slate-500 text-xs mt-1 text-center">
                  +{prediction.affectedNodes.length - 5} more nodes...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(isCurrentlyFailed || failedNodes.length > 0 || prediction) && (
        <div className="space-y-2">
          <button
            onClick={downloadReport}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download size={16} />
            <span>Download Impact Report</span>
          </button>
          
          {failedNodes.length > 0 && (
            <button
              onClick={handleResetFailures}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <X size={16} />
              <span>Reset All Failures ({failedNodes.length})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
