import { useState, useCallback } from 'react';
import { API_URL } from '../config/api';
import type {
  GNNNode,
  GNNEdge,
  ImpactPrediction,
  FailureScenario,
  VulnerableNode,
  WhatIfScenario,
  WhatIfResponse,
  VulnerableNodesResponse,
} from '../types/gnn';
import type { WaterSimulationState } from '../types/water';

// Extended village state that includes all infrastructure
interface VillageState {
  // Water infrastructure
  tanks?: Array<{ id: string; name: string; position: { lat: number; lng: number }; [key: string]: any }>;
  pumps?: Array<{ id: string; name: string; position: { lat: number; lng: number }; [key: string]: any }>;
  pipes?: Array<{ id: string; sourceId: string; targetId: string; [key: string]: any }>;
  
  // Roads and paths
  roads?: Array<{ 
    id: string; 
    name: string; 
    type: 'main' | 'secondary' | 'tertiary' | 'path';
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    [key: string]: any 
  }>;
  
  // Buildings
  buildings?: Array<{
    id: string;
    name: string;
    type: 'residential' | 'commercial' | 'industrial' | 'school' | 'hospital' | 'market' | 'government';
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Power infrastructure
  powerNodes?: Array<{
    id: string;
    name: string;
    type: 'generator' | 'transformer' | 'substation' | 'solar';
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Sensors
  sensors?: Array<{
    id: string;
    name: string;
    type: string;
    position: { lat: number; lng: number };
    [key: string]: any
  }>;
  
  // Consumer clusters
  clusters?: Array<{
    id: string;
    name: string;
    position: { lat: number; lng: number };
    population?: number;
    [key: string]: any
  }>;
  
  // Legacy water state for backward compatibility
  [key: string]: any;
}

interface UseGNNReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  nodes: GNNNode[];
  edges: GNNEdge[];
  vulnerableNodes: VulnerableNode[];
  scenarios: FailureScenario[];
  currentPrediction: ImpactPrediction | null;
  
  // Actions
  initializeGNN: (villageState: VillageState | WaterSimulationState) => Promise<boolean>;
  predictImpact: (nodeId: string, failureType?: string, severity?: string) => Promise<ImpactPrediction | null>;
  getVulnerableNodes: () => Promise<VulnerableNode[]>;
  runWhatIfAnalysis: (scenarios: WhatIfScenario[]) => Promise<WhatIfResponse | null>;
  getGraph: () => Promise<{ nodes: GNNNode[]; edges: GNNEdge[] } | null>;
  clearPrediction: () => void;
}

export function useGNN(): UseGNNReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GNNNode[]>([]);
  const [edges, setEdges] = useState<GNNEdge[]>([]);
  const [vulnerableNodes, setVulnerableNodes] = useState<VulnerableNode[]>([]);
  const [scenarios, setScenarios] = useState<FailureScenario[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<ImpactPrediction | null>(null);

  const initializeGNN = useCallback(async (villageState: VillageState | WaterSimulationState): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ⚠️ MOCK MODE: Simulate GNN initialization without backend
      // To use real backend, uncomment the fetch calls below
      
      console.log('🧠 Initializing GNN with mock data (no backend required)');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Build mock nodes from village state
      const mockNodes: any[] = [];
      const mockEdges: any[] = [];
      
      // Add nodes from village state
      if ('roads' in villageState && villageState.roads) {
        villageState.roads.forEach((road: any, i: number) => {
          mockNodes.push({
            id: road.id || `road-${i}`,
            name: road.name || `Road ${i + 1}`,
            type: 'road',
            status: road.condition || 'good'
          });
        });
      }
      
      if ('buildings' in villageState && villageState.buildings) {
        villageState.buildings.forEach((building: any, i: number) => {
          mockNodes.push({
            id: building.id || `building-${i}`,
            name: building.name || `Building ${i + 1}`,
            type: building.type || 'building',
            status: 'operational'
          });
        });
      }
      
      if (villageState.tanks) {
        villageState.tanks.forEach((tank: any, i: number) => {
          mockNodes.push({
            id: tank.id || `tank-${i}`,
            name: tank.name || `Tank ${i + 1}`,
            type: 'tank',
            status: tank.status || 'good'
          });
        });
      }
      
      if (villageState.pumps) {
        villageState.pumps.forEach((pump: any, i: number) => {
          mockNodes.push({
            id: pump.id || `pump-${i}`,
            name: pump.name || `Pump ${i + 1}`,
            type: 'pump',
            status: pump.status || 'operational'
          });
        });
      }
      
      // If no nodes from state, use sample data
      if (mockNodes.length === 0) {
        mockNodes.push(
          { id: 'road-1', name: 'Main Road', type: 'road', status: 'good' },
          { id: 'building-1', name: 'Hospital', type: 'hospital', status: 'operational' },
          { id: 'tank-1', name: 'Water Tank', type: 'tank', status: 'good' },
          { id: 'pump-1', name: 'Main Pump', type: 'pump', status: 'operational' }
        );
      }
      
      setIsInitialized(true);
      setNodes(mockNodes);
      setEdges(mockEdges);
      setScenarios([
        // Road scenarios
        { 
          id: 'road-blockage', 
          name: 'Road Blockage/Collapse', 
          description: 'Physical blockage or structural failure of road',
          applicableTo: ['road']
        },
        // Water scenarios
        { 
          id: 'tank-failure', 
          name: 'Tank Rupture/Contamination', 
          description: 'Water storage tank failure or contamination',
          applicableTo: ['tank']
        },
        { 
          id: 'pump-failure', 
          name: 'Pump Malfunction', 
          description: 'Water pump motor failure or electrical issue',
          applicableTo: ['pump']
        },
        { 
          id: 'pipe-burst', 
          name: 'Pipe Burst/Leak', 
          description: 'Water pipe rupture or major leak',
          applicableTo: ['pipe']
        },
        // Power scenarios
        { 
          id: 'power-outage', 
          name: 'Grid Failure/Blackout', 
          description: 'Electrical grid failure causing widespread outage',
          applicableTo: ['power']
        },
        { 
          id: 'transformer-failure', 
          name: 'Transformer Explosion', 
          description: 'Transformer overload or catastrophic failure',
          applicableTo: ['power']
        },
        // Building scenarios (generic)
        { 
          id: 'building-fire', 
          name: 'Building Fire', 
          description: 'Fire emergency requiring evacuation',
          applicableTo: ['building', 'residential', 'commercial', 'industrial']
        },
        { 
          id: 'structural-damage', 
          name: 'Structural Damage', 
          description: 'Building structural compromise or collapse risk',
          applicableTo: ['building', 'residential', 'commercial', 'industrial']
        },
        // Residential building scenarios
        { 
          id: 'residential-fire', 
          name: 'Residential Fire Emergency', 
          description: 'Fire in residential building requiring evacuation',
          applicableTo: ['residential']
        },
        { 
          id: 'residential-gas-leak', 
          name: 'Gas Leak', 
          description: 'Natural gas leak posing explosion risk',
          applicableTo: ['residential']
        },
        { 
          id: 'residential-flooding', 
          name: 'Residential Flooding', 
          description: 'Plumbing failure or water damage',
          applicableTo: ['residential']
        },
        // Commercial building scenarios
        { 
          id: 'commercial-closure', 
          name: 'Commercial Facility Closure', 
          description: 'Business shutdown due to infrastructure failure',
          applicableTo: ['commercial', 'market']
        },
        { 
          id: 'commercial-hvac-failure', 
          name: 'HVAC System Failure', 
          description: 'Climate control system breakdown',
          applicableTo: ['commercial', 'market']
        },
        { 
          id: 'commercial-security-breach', 
          name: 'Security System Failure', 
          description: 'Access control or surveillance system down',
          applicableTo: ['commercial', 'market']
        },
        { 
          id: 'commercial-inventory-loss', 
          name: 'Inventory/Stock Damage', 
          description: 'Refrigeration failure or storage compromise',
          applicableTo: ['commercial', 'market']
        },
        { 
          id: 'commercial-pos-failure', 
          name: 'Payment System Outage', 
          description: 'Point-of-sale and payment systems offline',
          applicableTo: ['commercial', 'market']
        },
        { 
          id: 'commercial-customer-injury', 
          name: 'Customer Safety Incident', 
          description: 'Accident requiring facility closure and investigation',
          applicableTo: ['commercial', 'market']
        },
        // Industrial building scenarios
        { 
          id: 'industrial-hazmat', 
          name: 'Hazardous Material Incident', 
          description: 'Chemical spill or toxic release',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-equipment-failure', 
          name: 'Critical Equipment Failure', 
          description: 'Major machinery or production line breakdown',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-explosion', 
          name: 'Industrial Explosion Risk', 
          description: 'High-pressure system or combustible material threat',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-boiler-failure', 
          name: 'Boiler/Pressure Vessel Failure', 
          description: 'Steam system or pressure vessel malfunction',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-conveyor-jam', 
          name: 'Material Handling Failure', 
          description: 'Conveyor, crane, or logistics system breakdown',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-ventilation-failure', 
          name: 'Ventilation System Failure', 
          description: 'Air quality control or fume extraction failure',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-cooling-failure', 
          name: 'Industrial Cooling System Failure', 
          description: 'Process cooling or chiller system breakdown',
          applicableTo: ['industrial']
        },
        { 
          id: 'industrial-electrical-arc', 
          name: 'Electrical Arc Flash', 
          description: 'High-voltage electrical incident',
          applicableTo: ['industrial']
        },
        // Medical scenarios
        { 
          id: 'hospital-emergency', 
          name: 'Hospital System Failure', 
          description: 'Critical hospital equipment or power failure',
          applicableTo: ['hospital']
        },
        { 
          id: 'mass-casualty', 
          name: 'Mass Casualty Event', 
          description: 'Overwhelming influx of patients',
          applicableTo: ['hospital']
        },
        // Education scenarios
        { 
          id: 'school-evacuation', 
          name: 'School Evacuation', 
          description: 'Emergency requiring immediate school evacuation',
          applicableTo: ['school']
        },
        // Market/Economic scenarios
        { 
          id: 'market-disruption', 
          name: 'Supply Chain Disruption', 
          description: 'Market access or supply chain failure',
          applicableTo: ['market']
        },
        // Sensor scenarios
        { 
          id: 'sensor-failure', 
          name: 'Monitoring System Failure', 
          description: 'Loss of critical infrastructure monitoring',
          applicableTo: ['sensor']
        },
        // Cluster scenarios
        { 
          id: 'cluster-isolation', 
          name: 'Community Isolation', 
          description: 'Residential area cut off from services',
          applicableTo: ['cluster']
        }
      ]);
      
      console.log('✅ GNN initialized with', mockNodes.length, 'nodes (mock mode)');
      
      return true;
      
      /* 
      // REAL BACKEND CODE (uncomment to use actual backend):
      const response = await fetch(`${API_URL}/api/gnn/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villageState }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize GNN');
      }
      
      setIsInitialized(true);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      
      // Fetch scenarios
      const scenariosResponse = await fetch(`${API_URL}/api/gnn/scenarios`);
      const scenariosData = await scenariosResponse.json();
      setScenarios(scenariosData.scenarios || []);
      
      return true;
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize GNN');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const predictImpact = useCallback(async (
    nodeId: string,
    failureType: string = 'failure',
    severity: string = 'medium'
  ): Promise<ImpactPrediction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ⚠️ MOCK MODE: Simulate impact prediction without backend
      console.log(`🔮 Predicting impact for node ${nodeId} (mock mode)`);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Find source node
      const sourceNode = nodes.find(n => n.id === nodeId);
      if (!sourceNode) {
        throw new Error('Source node not found');
      }
      
      // Define scenario-specific cascade logic
      const getCascadeTargets = (sourceType: string): string[] => {
        const cascadeMap: Record<string, string[]> = {
          // Road failures affect access to all services
          'road': ['building', 'school', 'hospital', 'market', 'cluster', 'residential', 'commercial', 'industrial'],
          
          // Water failures cascade through water infrastructure then to consumers
          'tank': ['pump', 'pipe', 'cluster', 'building', 'hospital', 'residential', 'commercial', 'industrial'],
          'pump': ['pipe', 'cluster', 'building', 'tank', 'residential', 'commercial', 'industrial'],
          'pipe': ['cluster', 'building', 'residential', 'commercial', 'industrial'],
          
          // Power failures affect electrical dependencies
          'power': ['pump', 'sensor', 'hospital', 'building', 'school', 'market', 'residential', 'commercial', 'industrial'],
          
          // Residential building failures affect nearby areas and utilities
          'residential': ['road', 'cluster', 'power', 'pipe', 'residential', 'commercial'],
          
          // Commercial failures cascade to supply chains and local economy
          'commercial': ['road', 'cluster', 'market', 'power', 'residential', 'commercial', 'industrial'],
          
          // Industrial failures have wide-reaching impacts
          'industrial': ['road', 'cluster', 'power', 'pipe', 'hospital', 'residential', 'commercial', 'industrial', 'market'],
          
          // Generic building failures affect nearby infrastructure
          'building': ['road', 'cluster', 'residential', 'commercial'],
          
          // Medical emergencies strain healthcare system and access
          'hospital': ['cluster', 'road', 'power', 'residential', 'commercial'],
          
          // School evacuations affect transportation and communities
          'school': ['road', 'cluster', 'residential'],
          
          // Market disruptions affect supply chains and commercial activity
          'market': ['cluster', 'road', 'commercial', 'residential', 'industrial'],
          
          // Sensor failures reduce monitoring capability
          'sensor': ['power', 'pump', 'tank', 'industrial'],
          
          // Cluster isolation affects all services to that area
          'cluster': ['school', 'hospital', 'market', 'residential', 'commercial', 'industrial']
        };
        return cascadeMap[sourceType] || [];
      };

      const getScenarioEffects = (targetType: string, failureScenario: string, sourceType: string): string[] => {
        // Road blockage effects
        if (sourceType === 'road') {
          if (targetType === 'hospital') return ['Emergency vehicle access blocked', 'Patient transport delayed', 'Medical supply delivery disrupted'];
          if (targetType === 'school') return ['Student transportation disrupted', 'Staff unable to reach facility', 'Emergency evacuation routes blocked'];
          if (targetType === 'market') return ['Goods delivery impossible', 'Customer access restricted', 'Supply chain interrupted'];
          return ['Access route blocked', 'Alternative routes overloaded', 'Service delivery disrupted'];
        }
        // Water system failures
        if (['tank', 'pump', 'pipe'].includes(sourceType)) {
          if (targetType === 'hospital') return ['Medical water supply compromised', 'Sanitation systems failing', 'Critical procedures at risk'];
          if (targetType === 'cluster') return ['Residential water loss', 'Sanitation emergency', 'Drinking water unavailable'];
          return ['Water pressure dropped', 'Supply interrupted', 'Contamination risk'];
        }
        // Power failures
        if (sourceType === 'power') {
          if (targetType === 'hospital') return ['Life support systems at risk', 'Emergency generators activated', 'Critical equipment offline'];
          if (targetType === 'pump') return ['Water pumps offline', 'Pressure loss imminent', 'Backup power required'];
          if (targetType === 'school') return ['Lighting and HVAC offline', 'Security systems down', 'Classes suspended'];
          return ['Electrical systems offline', 'Emergency lighting only', 'Equipment shutdown'];
        }
        // Building failure effects (residential/commercial/industrial)
        if (sourceType === 'building' || sourceType === 'residential' || sourceType === 'commercial' || sourceType === 'industrial' || sourceType === 'market') {
          // Residential scenarios
          if (failureScenario.includes('residential') || sourceType === 'residential') {
            if (failureScenario.includes('fire')) return ['Resident evacuation required', 'Smoke affecting nearby buildings', 'Firefighting resources deployed'];
            if (failureScenario.includes('gas')) return ['Gas supply isolation needed', 'Explosion risk to adjacent structures', 'Emergency evacuation zone established'];
            if (failureScenario.includes('flood')) return ['Water damage spreading', 'Utility connections compromised', 'Structural integrity at risk'];
            return ['Residential units affected', 'Occupant safety at risk', 'Utility services compromised'];
          }
          // Commercial scenarios
          if (failureScenario.includes('commercial') || sourceType === 'commercial' || sourceType === 'market') {
            if (failureScenario.includes('inventory')) return ['Perishable goods spoiling', 'Product contamination risk', 'Financial losses mounting'];
            if (failureScenario.includes('pos') || failureScenario.includes('payment')) return ['Cash-only operations', 'Customer transactions blocked', 'Revenue generation stopped'];
            if (failureScenario.includes('security')) return ['Unauthorized access possible', 'Theft risk increased', 'Customer safety concerns'];
            if (targetType === 'road') return ['Parking lot congestion', 'Delivery traffic rerouted', 'Employee exodus affecting traffic'];
            if (targetType === 'cluster') return ['Local employment disrupted', 'Service availability reduced', 'Economic activity suspended'];
            if (targetType === 'market') return ['Supply chain disruption', 'Distribution network affected', 'Regional commerce impacted'];
            return ['Business operations ceased', 'Customer services unavailable', 'Economic losses escalating'];
          }
          // Industrial scenarios
          if (failureScenario.includes('industrial') || sourceType === 'industrial') {
            if (failureScenario.includes('hazmat')) {
              if (targetType === 'cluster' || targetType === 'residential') return ['Toxic exposure risk', 'Mandatory shelter-in-place', 'Air quality compromised'];
              if (targetType === 'hospital') return ['Decontamination teams dispatched', 'Chemical exposure treatment surge', 'Emergency protocols activated'];
              if (targetType === 'commercial') return ['Downwind businesses closed', 'Contamination control measures', 'Environmental cleanup required'];
              return ['Contamination zone expanding', 'Environmental hazard declared', 'Emergency response mobilized'];
            }
            if (failureScenario.includes('explosion')) {
              if (targetType === 'residential') return ['Residential blast damage', 'Window/structure damage', 'Mass evacuation needed'];
              return ['Blast radius safety perimeter', 'Structural damage to surroundings', 'Secondary fire risk'];
            }
            if (failureScenario.includes('equipment')) return ['Production line halted', 'Output quota missed', 'Supply chain delayed'];
            if (failureScenario.includes('ventilation')) return ['Worker exposure to fumes', 'OSHA violation risk', 'Production temporarily ceased'];
            if (failureScenario.includes('cooling')) return ['Equipment overheating', 'Process temperature critical', 'Thermal runaway risk'];
            if (failureScenario.includes('boiler')) return ['Steam supply interrupted', 'Pressure systems unstable', 'Manufacturing processes stopped'];
            return ['Production halt affecting supply', 'Workforce safety concerns', 'Industrial park impact'];
          }
          // Generic building effects
          if (targetType === 'road') return ['Emergency vehicle access needed', 'Traffic flow disrupted', 'Debris clearance required'];
          if (targetType === 'cluster') return ['Nearby residents at risk', 'Community services interrupted', 'Evacuation may be needed'];
          return ['Structural safety assessment needed', 'Utility connections severed', 'Adjacent properties at risk'];
        }
        // Default effects
        return [`${sourceType} failure affecting ${targetType}`, 'Service degradation expected', 'Cascade risk increasing'];
      };

      const getScenarioRecommendations = (targetType: string, sourceType: string, failureScenario: string): string[] => {
        if (sourceType === 'road' && targetType === 'hospital') {
          return ['Activate emergency helicopter transport', 'Establish alternate ambulance routes', 'Stockpile critical supplies'];
        }
        if (sourceType === 'power' && targetType === 'hospital') {
          return ['Verify generator fuel levels', 'Switch to emergency power', 'Prioritize life-critical equipment'];
        }
        if (['tank', 'pump', 'pipe'].includes(sourceType) && targetType === 'cluster') {
          return ['Deploy water tankers', 'Establish distribution points', 'Test water quality'];
        }
        // Building-specific recommendations
        if (sourceType === 'building' || sourceType === 'residential' || sourceType === 'commercial' || sourceType === 'industrial') {
          if (failureScenario.includes('residential-fire')) {
            return ['Evacuate adjacent units', 'Deploy fire suppression teams', 'Establish safe assembly points'];
          }
          if (failureScenario.includes('gas-leak') || failureScenario.includes('gas')) {
            return ['Shut off gas main immediately', 'Evacuate 100m radius', 'Deploy gas detection equipment'];
          }
          if (failureScenario.includes('industrial-hazmat') || failureScenario.includes('hazmat')) {
            return ['Activate HAZMAT response team', 'Establish decontamination zones', 'Monitor air quality continuously'];
          }
          if (failureScenario.includes('industrial-explosion') || failureScenario.includes('explosion')) {
            return ['Evacuate blast radius', 'Deploy structural engineers', 'Coordinate mass casualty response'];
          }
          if (failureScenario.includes('commercial') || sourceType === 'commercial') {
            if (failureScenario.includes('inventory')) return ['Salvage perishable inventory', 'Contact insurance adjusters', 'Secure alternate cold storage'];
            if (failureScenario.includes('pos') || failureScenario.includes('payment')) return ['Switch to manual transactions', 'Contact IT support', 'Implement backup payment methods'];
            if (failureScenario.includes('security')) return ['Deploy security personnel', 'Lock down facility', 'Review access logs'];
            return ['Notify building occupants', 'Secure alternate work sites', 'Assess business continuity needs'];
          }
          if (failureScenario.includes('industrial') || sourceType === 'industrial') {
            if (failureScenario.includes('equipment')) return ['Activate maintenance teams', 'Source replacement parts', 'Implement production workarounds'];
            if (failureScenario.includes('ventilation')) return ['Evacuate affected areas', 'Deploy air quality monitors', 'Activate emergency ventilation'];
            if (failureScenario.includes('cooling')) return ['Implement emergency cooling', 'Reduce process loads', 'Monitor temperature continuously'];
            if (failureScenario.includes('boiler')) return ['Secure pressure systems', 'Deploy boiler technicians', 'Implement steam bypass procedures'];
            return ['Halt production safely', 'Secure hazardous materials', 'Coordinate with OSHA'];
          }
        }
        return [`Monitor ${targetType} status closely`, 'Activate contingency plans', 'Prepare backup systems'];
      };

      // Generate affected nodes based on logical cascades
      const cascadeTargetTypes = getCascadeTargets(sourceNode.type);
      const affectedNodesList = nodes
        .filter(n => n.id !== nodeId && cascadeTargetTypes.includes(n.type))
        .slice(0, Math.floor(Math.random() * 4) + 4) // 4-7 affected nodes
        .map(node => {
          // Severity depends on node type criticality and distance
          const isCritical = ['hospital', 'power', 'tank'].includes(node.type);
          const isDirect = cascadeTargetTypes.indexOf(node.type) < 3;
          
          let severityLevel: 'low' | 'medium' | 'high' | 'critical';
          if (isCritical && isDirect) severityLevel = 'critical';
          else if (isCritical || isDirect) severityLevel = 'high';
          else if (Math.random() > 0.5) severityLevel = 'medium';
          else severityLevel = 'low';
          
          const probability = isCritical ? (Math.random() * 30 + 70) : (Math.random() * 40 + 40); // 70-100% or 40-80%
          const severityScore = { low: 25, medium: 50, high: 75, critical: 100 }[severityLevel];
          
          return {
            nodeId: node.id,
            nodeType: node.type,
            nodeName: node.name,
            probability,
            severity: severityLevel,
            severityScore,
            timeToImpact: isDirect ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 8) + 4,
            effects: getScenarioEffects(node.type, failureType, sourceNode.type),
            recommendations: getScenarioRecommendations(node.type, sourceNode.type, failureType),
            metrics: {
              supplyDisruption: sourceNode.type.includes('tank') || sourceNode.type.includes('pump') ? Math.floor(Math.random() * 70) + 30 : Math.floor(Math.random() * 50),
              pressureDrop: ['tank', 'pump', 'pipe'].includes(sourceNode.type) ? Math.floor(Math.random() * 80) + 20 : Math.floor(Math.random() * 30),
              qualityRisk: node.type === 'hospital' ? Math.floor(Math.random() * 60) + 40 : Math.floor(Math.random() * 40),
              cascadeRisk: isCritical ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 40) + 20,
              accessDisruption: sourceNode.type === 'road' ? Math.floor(Math.random() * 80) + 20 : Math.floor(Math.random() * 40),
              economicImpact: ['market', 'road'].includes(node.type) ? Math.floor(Math.random() * 70) + 30 : Math.floor(Math.random() * 50),
              populationAffected: ['cluster', 'hospital', 'school'].includes(node.type) ? Math.floor(Math.random() * 800) + 200 : Math.floor(Math.random() * 300) + 50,
              powerImpact: sourceNode.type === 'power' ? Math.floor(Math.random() * 90) + 10 : undefined
            }
          };
        });
      
      // Count severities
      const criticalCount = affectedNodesList.filter(n => n.severity === 'critical').length;
      const highCount = affectedNodesList.filter(n => n.severity === 'high').length;
      
      // Generate propagation paths
      const propagationPath = affectedNodesList.slice(0, 3).map((node, idx) => ({
        from: idx === 0 ? nodeId : affectedNodesList[idx - 1].nodeId,
        to: node.nodeId,
        depth: idx + 1,
        path: [nodeId, ...affectedNodesList.slice(0, idx + 1).map(n => n.nodeId)],
        weight: Math.random() * 0.5 + 0.5
      }));
      
      // Overall assessment
      const totalPop = affectedNodesList.reduce((sum, n) => sum + (n.metrics.populationAffected || 0), 0);
      const avgSeverity = affectedNodesList.reduce((sum, n) => sum + n.severityScore, 0) / affectedNodesList.length;
      const riskLevel = avgSeverity > 75 ? 'critical' : avgSeverity > 50 ? 'high' : avgSeverity > 25 ? 'medium' : 'low';
      
      const mockPrediction: ImpactPrediction = {
        sourceFailure: {
          nodeId: sourceNode.id,
          nodeType: sourceNode.type,
          nodeName: sourceNode.name,
          failureType,
          severity
        },
        affectedNodes: affectedNodesList,
        propagationPath,
        overallAssessment: {
          riskLevel: riskLevel as 'low' | 'medium' | 'high' | 'critical',
          summary: `Failure at ${sourceNode.name} will cascade to ${affectedNodesList.length} connected infrastructure nodes, affecting approximately ${totalPop} people. ${criticalCount > 0 ? `${criticalCount} nodes at critical risk.` : 'No critical nodes identified.'}`,
          priorityActions: [
            `Immediately secure ${sourceNode.name}`,
            `Deploy backup systems for critical nodes`,
            `Alert affected communities`,
            `Coordinate emergency response teams`
          ],
          estimatedRecoveryTime: `${Math.floor(Math.random() * 48) + 12} hours`,
          affectedPopulation: totalPop
        },
        totalAffected: affectedNodesList.length,
        criticalCount,
        highCount,
        timestamp: new Date().toISOString()
      };
      
      setCurrentPrediction(mockPrediction);
      console.log('✅ Impact prediction complete:', mockPrediction.totalAffected, 'nodes affected');
      return mockPrediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to predict impact');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [nodes]);

  const getVulnerableNodes = useCallback(async (): Promise<VulnerableNode[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/vulnerable-nodes`);
      const data: VulnerableNodesResponse = await response.json();
      
      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to get vulnerable nodes');
      }
      
      setVulnerableNodes(data.nodes);
      return data.nodes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get vulnerable nodes');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runWhatIfAnalysis = useCallback(async (
    scenariosList: WhatIfScenario[]
  ): Promise<WhatIfResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/gnn/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: scenariosList }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run what-if analysis');
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run what-if analysis');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getGraph = useCallback(async (): Promise<{ nodes: GNNNode[]; edges: GNNEdge[] } | null> => {
    try {
      const response = await fetch(`${API_URL}/api/gnn/graph`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get graph');
      }
      
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get graph');
      return null;
    }
  }, []);

  const clearPrediction = useCallback(() => {
    setCurrentPrediction(null);
    setError(null);
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    nodes,
    edges,
    vulnerableNodes,
    scenarios,
    currentPrediction,
    initializeGNN,
    predictImpact,
    getVulnerableNodes,
    runWhatIfAnalysis,
    getGraph,
    clearPrediction,
  };
}

export default useGNN;
