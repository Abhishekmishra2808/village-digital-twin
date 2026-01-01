/**
 * Demo Village Data for offline/development mode
 * Uses Pune coordinates (Village Center: 73.8567, 18.5204)
 * 
 * GNN-Supported Node Types: Tank, Pump, Pipe, Hospital, School, Market, Power, Sensor, Road, Building
 * This data is optimized for GNN impact prediction with complete infrastructure network
 */

const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204];

// Helper to generate coords near village center - returns [lng, lat] array format
const offsetCoords = (lngOffset: number, latOffset: number): [number, number] => [
  VILLAGE_CENTER[0] + lngOffset,
  VILLAGE_CENTER[1] + latOffset,
];

export const demoVillageData = {
  // Water Infrastructure - GNN Type: Tank
  waterTanks: [
    {
      id: 'tank-main',
      name: 'Main Water Tank',
      coords: offsetCoords(0.001, 0.002),
      capacity: 50000,
      currentLevel: 75,
      status: 'operational',
      lastMaintenance: '2025-12-15',
    },
    {
      id: 'tank-reserve',
      name: 'Reserve Tank',
      coords: offsetCoords(-0.002, 0.001),
      capacity: 30000,
      currentLevel: 82,
      status: 'operational',
      lastMaintenance: '2025-12-10',
    },
  ],

  // Water Pumps - GNN Type: Pump
  waterPumps: [
    {
      id: 'pump-main',
      name: 'Main Pump Station',
      coords: offsetCoords(0.0005, 0.0025),
      capacity: 1000, // L/min
      currentFlow: 750,
      status: 'operational',
    },
    {
      id: 'pump-distribution',
      name: 'Distribution Pump',
      coords: offsetCoords(-0.001, 0.0015),
      capacity: 500,
      currentFlow: 320,
      status: 'operational',
    },
  ],

  // Water Pipes - GNN Type: Pipe
  waterPipes: [
    {
      id: 'pipe-main',
      name: 'Main Supply Pipe',
      coords: offsetCoords(0.0008, 0.0018), // Center of pipe
      diameter: 300, // mm
      length: 500, // meters
      status: 'operational',
    },
    {
      id: 'pipe-distribution',
      name: 'Distribution Pipe Network',
      coords: offsetCoords(-0.0005, 0.001),
      diameter: 150,
      length: 1200,
      status: 'operational',
    },
  ],

  // Key Buildings Only - GNN Types: School, Hospital, Market
  buildings: [
    // School - GNN Type: School
    {
      id: 'school-main',
      name: 'Village School',
      type: 'school',
      coords: offsetCoords(0.002, 0.003),
      occupancy: 250,
      status: 'operational',
    },
    // Hospital - GNN Type: Hospital
    {
      id: 'hospital-main',
      name: 'Primary Health Center',
      type: 'health',
      coords: offsetCoords(0.001, -0.003),
      occupancy: 50,
      status: 'operational',
    },
    // Market - GNN Type: Market
    {
      id: 'market-main',
      name: 'Village Market',
      type: 'market',
      coords: offsetCoords(0.003, 0.001),
      occupancy: 500,
      status: 'operational',
    },
  ],

  // Power Infrastructure - GNN Type: Power
  powerNodes: [
    {
      id: 'power-main',
      name: 'Main Transformer',
      type: 'transformer',
      coords: offsetCoords(0.001, 0.001),
      capacity: 500,
      currentLoad: 380,
      status: 'operational',
    },
    {
      id: 'power-secondary',
      name: 'Secondary Transformer',
      type: 'transformer',
      coords: offsetCoords(-0.002, -0.001),
      capacity: 250,
      currentLoad: 180,
      status: 'operational',
    },
  ],

  // Sensors - GNN Type: Sensor
  sensors: [
    {
      id: 'sensor-flow-1',
      name: 'Flow Sensor Main',
      type: 'flow',
      coords: offsetCoords(0.0005, 0.0015),
      value: 120,
      unit: 'L/min',
      status: 'operational',
    },
    {
      id: 'sensor-pressure-1',
      name: 'Pressure Sensor',
      type: 'pressure',
      coords: offsetCoords(-0.001, 0.0005),
      value: 2.5,
      unit: 'bar',
      status: 'operational',
    },
  ],

  // Roads for context (optional GNN nodes)
  roads: [
    {
      id: 'road-main',
      name: 'Main Village Road',
      from: offsetCoords(-0.003, 0),
      to: offsetCoords(0.003, 0),
      type: 'main',
      condition: 'good',
    },
  ],

  schemes: [],
  alerts: [],
  kpis: {
    waterAvailability: 85,
    powerUptime: 98,
    serviceDelivery: 92,
  },
};

export default demoVillageData;
