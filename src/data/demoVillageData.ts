/**
 * Demo Village Data for offline/development mode
 * Uses Pune coordinates (Village Center: 73.8567, 18.5204)
 * 
 * REDUCED TO 8 NODES for clean visualization:
 * 1. Main Water Tank (North)
 * 2. Main Pump Station (North-West)
 * 3. Main Transformer (Center)
 * 4. Village School (East)
 * 5. Primary Health Center (South)
 * 6. Village Market (South-East)
 * 7. Main Village Road (West)
 * 8. Flow Sensor (Center-East)
 */

export const demoVillageData = {
  // Water Infrastructure - 1 Tank only
  waterTanks: [
    {
      id: 'tank-main',
      name: 'Main Water Tank',
      coords: [73.8567, 18.5240], // North of village center
      capacity: 50000,
      currentLevel: 75,
      status: 'operational',
      lastMaintenance: '2025-12-15',
    },
  ],

  // Water Pumps - 1 Pump only
  waterPumps: [
    {
      id: 'pump-main',
      name: 'Main Pump Station',
      coords: [73.8537, 18.5230], // North-West
      capacity: 1000,
      currentFlow: 750,
      status: 'operational',
    },
  ],

  // No pipes - removed for cleaner view
  waterPipes: [],

  // Key Buildings - School, Hospital, Market (3 nodes)
  buildings: [
    {
      id: 'school-main',
      name: 'Village School',
      type: 'school',
      coords: [73.8607, 18.5220], // East
      occupancy: 250,
      status: 'operational',
    },
    {
      id: 'hospital-main',
      name: 'Primary Health Center',
      type: 'health',
      coords: [73.8567, 18.5168], // South
      occupancy: 50,
      status: 'operational',
    },
    {
      id: 'market-main',
      name: 'Village Market',
      type: 'market',
      coords: [73.8597, 18.5178], // South-East
      occupancy: 500,
      status: 'operational',
    },
  ],

  // Power Infrastructure - 1 Transformer only
  powerNodes: [
    {
      id: 'power-main',
      name: 'Main Transformer',
      type: 'transformer',
      coords: [73.8567, 18.5204], // Center of village
      capacity: 500,
      currentLoad: 380,
      status: 'operational',
    },
  ],

  // Sensors - 1 sensor only
  sensors: [
    {
      id: 'sensor-flow-1',
      name: 'Flow Sensor Main',
      type: 'flow',
      coords: [73.8587, 18.5204], // Center-East
      value: 120,
      unit: 'L/min',
      status: 'operational',
    },
  ],

  // Roads - 1 road
  roads: [
    {
      id: 'road-main',
      name: 'Main Village Road',
      coords: [73.8527, 18.5204], // West side - use coords instead of from/to
      from: [73.8507, 18.5204],
      to: [73.8627, 18.5204],
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
