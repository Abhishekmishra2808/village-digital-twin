/**
 * Sample Village Infrastructure Data for GNN Impact Predictor
 * This represents a typical Indian village with roads, buildings, water, and power infrastructure
 */

export const sampleVillageInfrastructure = {
  // ============ ROADS ============
  roads: [
    {
      id: 'road-main-1',
      name: 'NH-44 Highway Connection',
      type: 'main' as const,
      from: { lat: 17.3850, lng: 78.4867 },
      to: { lat: 17.3950, lng: 78.4967 },
      length: 1200,
      condition: 0.85,
      trafficLevel: 0.7,
    },
    {
      id: 'road-main-2',
      name: 'Village Main Road',
      type: 'main' as const,
      from: { lat: 17.3900, lng: 78.4900 },
      to: { lat: 17.3920, lng: 78.5000 },
      length: 800,
      condition: 0.75,
      trafficLevel: 0.6,
    },
    {
      id: 'road-secondary-1',
      name: 'Market Street',
      type: 'secondary' as const,
      from: { lat: 17.3910, lng: 78.4920 },
      to: { lat: 17.3930, lng: 78.4950 },
      length: 400,
      condition: 0.65,
      trafficLevel: 0.8,
    },
    {
      id: 'road-secondary-2',
      name: 'School Road',
      type: 'secondary' as const,
      from: { lat: 17.3895, lng: 78.4910 },
      to: { lat: 17.3915, lng: 78.4935 },
      length: 350,
      condition: 0.7,
      trafficLevel: 0.5,
    },
    {
      id: 'road-secondary-3',
      name: 'Hospital Access Road',
      type: 'secondary' as const,
      from: { lat: 17.3905, lng: 78.4880 },
      to: { lat: 17.3925, lng: 78.4900 },
      length: 300,
      condition: 0.8,
      trafficLevel: 0.4,
    },
    {
      id: 'road-tertiary-1',
      name: 'Residential Lane A',
      type: 'tertiary' as const,
      from: { lat: 17.3912, lng: 78.4925 },
      to: { lat: 17.3918, lng: 78.4940 },
      length: 200,
      condition: 0.55,
      trafficLevel: 0.3,
    },
    {
      id: 'road-tertiary-2',
      name: 'Residential Lane B',
      type: 'tertiary' as const,
      from: { lat: 17.3908, lng: 78.4915 },
      to: { lat: 17.3920, lng: 78.4930 },
      length: 180,
      condition: 0.5,
      trafficLevel: 0.25,
    },
    {
      id: 'road-tertiary-3',
      name: 'Farm Access Road',
      type: 'tertiary' as const,
      from: { lat: 17.3880, lng: 78.4890 },
      to: { lat: 17.3900, lng: 78.4870 },
      length: 500,
      condition: 0.4,
      trafficLevel: 0.2,
    },
    {
      id: 'road-path-1',
      name: 'Temple Path',
      type: 'path' as const,
      from: { lat: 17.3915, lng: 78.4945 },
      to: { lat: 17.3925, lng: 78.4960 },
      length: 150,
      condition: 0.6,
      trafficLevel: 0.15,
    },
    {
      id: 'road-path-2',
      name: 'Field Pathway',
      type: 'path' as const,
      from: { lat: 17.3885, lng: 78.4860 },
      to: { lat: 17.3870, lng: 78.4850 },
      length: 250,
      condition: 0.35,
      trafficLevel: 0.1,
    },
  ],

  // ============ BUILDINGS ============
  buildings: [
    // Schools
    {
      id: 'school-primary',
      name: 'Government Primary School',
      type: 'school' as const,
      position: { lat: 17.3912, lng: 78.4932 },
      occupancy: 250,
      criticalityLevel: 0.9,
    },
    {
      id: 'school-secondary',
      name: 'Zilla Parishad High School',
      type: 'school' as const,
      position: { lat: 17.3918, lng: 78.4940 },
      occupancy: 400,
      criticalityLevel: 0.85,
    },
    // Hospitals
    {
      id: 'hospital-phc',
      name: 'Primary Health Center',
      type: 'hospital' as const,
      position: { lat: 17.3920, lng: 78.4895 },
      occupancy: 50,
      criticalityLevel: 1.0,
    },
    {
      id: 'hospital-subcentre',
      name: 'Health Sub-Centre',
      type: 'hospital' as const,
      position: { lat: 17.3908, lng: 78.4905 },
      occupancy: 15,
      criticalityLevel: 0.8,
    },
    // Markets
    {
      id: 'market-main',
      name: 'Weekly Haat (Market)',
      type: 'market' as const,
      position: { lat: 17.3925, lng: 78.4945 },
      occupancy: 500,
      criticalityLevel: 0.7,
    },
    {
      id: 'market-daily',
      name: 'Daily Vegetable Market',
      type: 'market' as const,
      position: { lat: 17.3915, lng: 78.4925 },
      occupancy: 100,
      criticalityLevel: 0.6,
    },
    // Government Buildings
    {
      id: 'govt-panchayat',
      name: 'Gram Panchayat Office',
      type: 'government' as const,
      position: { lat: 17.3910, lng: 78.4920 },
      occupancy: 20,
      criticalityLevel: 0.85,
    },
    {
      id: 'govt-ration',
      name: 'Fair Price Shop (Ration)',
      type: 'government' as const,
      position: { lat: 17.3905, lng: 78.4918 },
      occupancy: 30,
      criticalityLevel: 0.75,
    },
    // Residential
    {
      id: 'residential-cluster-1',
      name: 'Housing Colony A',
      type: 'residential' as const,
      position: { lat: 17.3900, lng: 78.4910 },
      occupancy: 150,
      criticalityLevel: 0.5,
    },
    {
      id: 'residential-cluster-2',
      name: 'Housing Colony B',
      type: 'residential' as const,
      position: { lat: 17.3895, lng: 78.4925 },
      occupancy: 200,
      criticalityLevel: 0.5,
    },
    {
      id: 'residential-cluster-3',
      name: 'SC/ST Colony',
      type: 'residential' as const,
      position: { lat: 17.3888, lng: 78.4900 },
      occupancy: 180,
      criticalityLevel: 0.55,
    },
    // Commercial
    {
      id: 'commercial-shops',
      name: 'Main Street Shops',
      type: 'commercial' as const,
      position: { lat: 17.3908, lng: 78.4928 },
      occupancy: 40,
      criticalityLevel: 0.4,
    },
    // Industrial
    {
      id: 'industrial-mill',
      name: 'Rice Mill',
      type: 'industrial' as const,
      position: { lat: 17.3875, lng: 78.4880 },
      occupancy: 25,
      criticalityLevel: 0.6,
    },
  ],

  // ============ POWER NODES ============
  powerNodes: [
    {
      id: 'power-transformer-main',
      name: 'Main Distribution Transformer',
      type: 'transformer' as const,
      position: { lat: 17.3905, lng: 78.4915 },
      powerCapacity: 500,
      powerOutput: 380,
    },
    {
      id: 'power-transformer-2',
      name: 'Secondary Transformer',
      type: 'transformer' as const,
      position: { lat: 17.3920, lng: 78.4935 },
      powerCapacity: 250,
      powerOutput: 180,
    },
    {
      id: 'power-substation',
      name: 'Village Substation',
      type: 'substation' as const,
      position: { lat: 17.3890, lng: 78.4900 },
      powerCapacity: 1000,
      powerOutput: 650,
    },
    {
      id: 'power-solar-1',
      name: 'Solar Micro-Grid',
      type: 'solar' as const,
      position: { lat: 17.3885, lng: 78.4870 },
      powerCapacity: 100,
      powerOutput: 75,
    },
    {
      id: 'power-generator-backup',
      name: 'PHC Backup Generator',
      type: 'generator' as const,
      position: { lat: 17.3921, lng: 78.4896 },
      powerCapacity: 50,
      powerOutput: 0,
    },
  ],

  // ============ WATER INFRASTRUCTURE ============
  tanks: [
    {
      id: 'tank-overhead-main',
      name: 'Main Overhead Tank',
      position: { lat: 17.3915, lng: 78.4910 },
      capacity: 50000,
      currentLevel: 35000,
      elevation: 15,
    },
    {
      id: 'tank-ground-1',
      name: 'Ground Level Reservoir',
      position: { lat: 17.3895, lng: 78.4895 },
      capacity: 100000,
      currentLevel: 75000,
      elevation: 0,
    },
    {
      id: 'tank-mini-1',
      name: 'Mini Tank - Colony A',
      position: { lat: 17.3902, lng: 78.4912 },
      capacity: 10000,
      currentLevel: 6500,
      elevation: 8,
    },
  ],

  pumps: [
    {
      id: 'pump-main',
      name: 'Main Pumping Station',
      position: { lat: 17.3893, lng: 78.4893 },
      flowRate: 500,
      pressure: 4.5,
      status: 'active',
    },
    {
      id: 'pump-booster-1',
      name: 'Booster Pump - Market Area',
      position: { lat: 17.3918, lng: 78.4938 },
      flowRate: 200,
      pressure: 3.0,
      status: 'active',
    },
    {
      id: 'pump-borewell-1',
      name: 'Borewell Pump 1',
      position: { lat: 17.3880, lng: 78.4885 },
      flowRate: 100,
      pressure: 2.5,
      status: 'active',
    },
  ],

  pipes: [
    { id: 'pipe-1', sourceId: 'tank-ground-1', targetId: 'pump-main', length: 50, diameter: 200 },
    { id: 'pipe-2', sourceId: 'pump-main', targetId: 'tank-overhead-main', length: 100, diameter: 150 },
    { id: 'pipe-3', sourceId: 'tank-overhead-main', targetId: 'tank-mini-1', length: 80, diameter: 100 },
    { id: 'pipe-4', sourceId: 'pump-borewell-1', targetId: 'tank-ground-1', length: 200, diameter: 100 },
    { id: 'pipe-5', sourceId: 'tank-mini-1', targetId: 'pump-booster-1', length: 150, diameter: 75 },
  ],

  // ============ SENSORS ============
  sensors: [
    {
      id: 'sensor-water-quality-1',
      name: 'Water Quality Sensor - Main Tank',
      type: 'water_quality',
      position: { lat: 17.3915, lng: 78.4911 },
    },
    {
      id: 'sensor-flow-1',
      name: 'Flow Meter - Main Pipeline',
      type: 'flow',
      position: { lat: 17.3900, lng: 78.4905 },
    },
    {
      id: 'sensor-pressure-1',
      name: 'Pressure Sensor - Distribution',
      type: 'pressure',
      position: { lat: 17.3910, lng: 78.4925 },
    },
    {
      id: 'sensor-power-1',
      name: 'Power Monitor - Transformer',
      type: 'power',
      position: { lat: 17.3905, lng: 78.4916 },
    },
  ],

  // ============ CONSUMER CLUSTERS ============
  clusters: [
    {
      id: 'cluster-north',
      name: 'North Village Area',
      position: { lat: 17.3930, lng: 78.4950 },
      population: 450,
      demand: 150,
    },
    {
      id: 'cluster-south',
      name: 'South Village Area',
      position: { lat: 17.3880, lng: 78.4890 },
      population: 380,
      demand: 120,
    },
    {
      id: 'cluster-central',
      name: 'Central Market Area',
      position: { lat: 17.3910, lng: 78.4920 },
      population: 600,
      demand: 200,
    },
    {
      id: 'cluster-east',
      name: 'East Farm Area',
      position: { lat: 17.3900, lng: 78.4970 },
      population: 280,
      demand: 180,
    },
  ],
};

// Sample failure scenarios with descriptions
export const sampleFailureScenarios = [
  {
    nodeId: 'road-main-1',
    failureType: 'road_flood',
    severity: 'high',
    description: 'NH-44 Highway flooded due to heavy monsoon rains - affects all incoming traffic and supplies',
  },
  {
    nodeId: 'road-secondary-3',
    failureType: 'road_damage',
    severity: 'critical',
    description: 'Hospital Access Road damaged - emergency vehicles cannot reach PHC',
  },
  {
    nodeId: 'hospital-phc',
    failureType: 'building_fire',
    severity: 'critical',
    description: 'Fire at Primary Health Center - medical services disrupted',
  },
  {
    nodeId: 'power-transformer-main',
    failureType: 'power_outage',
    severity: 'high',
    description: 'Main transformer failure - widespread power outage in village',
  },
  {
    nodeId: 'tank-overhead-main',
    failureType: 'leak',
    severity: 'medium',
    description: 'Main overhead tank leak - reduced water supply to central area',
  },
  {
    nodeId: 'school-primary',
    failureType: 'building_evacuation',
    severity: 'high',
    description: 'School evacuation due to structural concerns',
  },
  {
    nodeId: 'market-main',
    failureType: 'building_fire',
    severity: 'high',
    description: 'Fire at weekly market - economic impact and safety risk',
  },
  {
    nodeId: 'road-tertiary-3',
    failureType: 'road_blockage',
    severity: 'medium',
    description: 'Farm access road blocked - affects agricultural transport',
  },
];

export default sampleVillageInfrastructure;
