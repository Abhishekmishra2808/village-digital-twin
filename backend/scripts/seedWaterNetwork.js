import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tank from '../models/Tank.js';
import Pipe from '../models/Pipe.js';
import ConsumerCluster from '../models/ConsumerCluster.js';
import Pump from '../models/Pump.js';
import WaterAlert from '../models/WaterAlert.js';

dotenv.config();

// Connect to database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing water data
async function clearWaterData() {
  console.log('🧹 Clearing existing water simulation data...');
  await Promise.all([
    Tank.deleteMany({}),
    Pipe.deleteMany({}),
    ConsumerCluster.deleteMany({}),
    Pump.deleteMany({}),
    WaterAlert.deleteMany({})
  ]);
  console.log('✅ Cleared existing data');
}

// Scenario A: Normal Day - Stable operation
async function seedNormalScenario() {
  console.log('\n📊 Seeding Scenario A: Normal Day...');
  
  // Create 2 tanks
  const tanks = await Tank.insertMany([
    {
      tankId: 'tank-1',
      name: 'Village Tank A (North)',
      capacityL: 50000,
      levelL: 35000, // 70%
      inletPumps: [],
      outletPipes: ['pipe-1', 'pipe-2'],
      geo: { lat: 23.2599, lng: 77.4126 },
      lowThresholdPercent: 10,
      highThresholdPercent: 95
    },
    {
      tankId: 'tank-2',
      name: 'Village Tank B (South)',
      capacityL: 30000,
      levelL: 21000, // 70%
      inletPumps: [],
      outletPipes: ['pipe-3', 'pipe-4'],
      geo: { lat: 23.2589, lng: 77.4136 },
      lowThresholdPercent: 10,
      highThresholdPercent: 95
    }
  ]);
  
  // Create 2 pumps
  const pumps = await Pump.insertMany([
    {
      pumpId: 'pump-1',
      tankId: 'tank-1',
      name: 'Main Pump A',
      maxFlowLpm: 200,
      state: 'off',
      schedule: {
        start: '06:00',
        end: '09:00',
        repeat: 'daily'
      },
      powerSource: 'grid',
      efficiency: 0.8
    },
    {
      pumpId: 'pump-2',
      tankId: 'tank-2',
      name: 'Main Pump B',
      maxFlowLpm: 150,
      state: 'off',
      schedule: {
        start: '06:00',
        end: '09:00',
        repeat: 'daily'
      },
      powerSource: 'solar',
      efficiency: 0.75
    }
  ]);
  
  // Create 6 junctions (nodes)
  const junctions = ['junction-1', 'junction-2', 'junction-3', 'junction-4', 'junction-5', 'junction-6'];
  
  // Create 6 pipes
  const pipes = await Pipe.insertMany([
    {
      pipeId: 'pipe-1',
      fromNode: 'tank-1',
      toNode: 'junction-1',
      lengthM: 400,
      diameterMm: 100,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 25,
      flowLpm: 120,
      valveOpen: true
    },
    {
      pipeId: 'pipe-2',
      fromNode: 'tank-1',
      toNode: 'junction-2',
      lengthM: 350,
      diameterMm: 100,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 26,
      flowLpm: 100,
      valveOpen: true
    },
    {
      pipeId: 'pipe-3',
      fromNode: 'tank-2',
      toNode: 'junction-3',
      lengthM: 300,
      diameterMm: 80,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 24,
      flowLpm: 80,
      valveOpen: true
    },
    {
      pipeId: 'pipe-4',
      fromNode: 'tank-2',
      toNode: 'junction-4',
      lengthM: 450,
      diameterMm: 80,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 22,
      flowLpm: 70,
      valveOpen: true
    },
    {
      pipeId: 'pipe-5',
      fromNode: 'junction-1',
      toNode: 'junction-5',
      lengthM: 200,
      diameterMm: 75,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 23,
      flowLpm: 60,
      valveOpen: true
    },
    {
      pipeId: 'pipe-6',
      fromNode: 'junction-2',
      toNode: 'junction-6',
      lengthM: 250,
      diameterMm: 75,
      roughness: 0.02,
      status: 'ok',
      leakRateLpm: 0,
      pressurePsi: 24,
      flowLpm: 50,
      valveOpen: true
    }
  ]);
  
  // Create 10 consumer clusters
  const clusters = await ConsumerCluster.insertMany([
    {
      clusterId: 'cluster-1',
      nodeId: 'junction-1',
      name: 'North Residential Area',
      averageDemandLph: 180, // 3 L/min
      priority: 'normal',
      populationServed: 150,
      connectionType: 'household',
      geo: { lat: 23.2601, lng: 77.4128 }
    },
    {
      clusterId: 'cluster-2',
      nodeId: 'junction-2',
      name: 'Central Market',
      averageDemandLph: 240, // 4 L/min
      priority: 'critical',
      populationServed: 80,
      connectionType: 'commercial',
      geo: { lat: 23.2595, lng: 77.4130 }
    },
    {
      clusterId: 'cluster-3',
      nodeId: 'junction-3',
      name: 'South Residential Area',
      averageDemandLph: 210, // 3.5 L/min
      priority: 'normal',
      populationServed: 180,
      connectionType: 'household',
      geo: { lat: 23.2587, lng: 77.4138 }
    },
    {
      clusterId: 'cluster-4',
      nodeId: 'junction-4',
      name: 'Agricultural Field A',
      averageDemandLph: 300, // 5 L/min
      priority: 'agricultural',
      populationServed: 0,
      connectionType: 'agricultural',
      geo: { lat: 23.2583, lng: 77.4142 }
    },
    {
      clusterId: 'cluster-5',
      nodeId: 'junction-5',
      name: 'School & Community Center',
      averageDemandLph: 150, // 2.5 L/min
      priority: 'critical',
      populationServed: 200,
      connectionType: 'public',
      geo: { lat: 23.2603, lng: 77.4132 }
    },
    {
      clusterId: 'cluster-6',
      nodeId: 'junction-6',
      name: 'East Residential Area',
      averageDemandLph: 180, // 3 L/min
      priority: 'normal',
      populationServed: 140,
      connectionType: 'household',
      geo: { lat: 23.2593, lng: 77.4135 }
    },
    {
      clusterId: 'cluster-7',
      nodeId: 'junction-1',
      name: 'Health Center',
      averageDemandLph: 120, // 2 L/min
      priority: 'critical',
      populationServed: 50,
      connectionType: 'public',
      geo: { lat: 23.2602, lng: 77.4127 }
    },
    {
      clusterId: 'cluster-8',
      nodeId: 'junction-3',
      name: 'Agricultural Field B',
      averageDemandLph: 360, // 6 L/min
      priority: 'agricultural',
      populationServed: 0,
      connectionType: 'agricultural',
      geo: { lat: 23.2585, lng: 77.4140 }
    },
    {
      clusterId: 'cluster-9',
      nodeId: 'junction-2',
      name: 'West Residential Area',
      averageDemandLph: 200, // 3.3 L/min
      priority: 'normal',
      populationServed: 160,
      connectionType: 'household',
      geo: { lat: 23.2596, lng: 77.4124 }
    },
    {
      clusterId: 'cluster-10',
      nodeId: 'junction-4',
      name: 'Anganwadi & Panchayat',
      averageDemandLph: 90, // 1.5 L/min
      priority: 'scheme',
      populationServed: 100,
      connectionType: 'public',
      geo: { lat: 23.2584, lng: 77.4141 }
    }
  ]);
  
  console.log(`✅ Created ${tanks.length} tanks, ${pumps.length} pumps, ${pipes.length} pipes, ${clusters.length} clusters`);
  return { tanks, pumps, pipes, clusters };
}

// Scenario B: Leak Event
async function injectLeakScenario() {
  console.log('\n🚨 Injecting Scenario B: Leak Event on pipe-1...');
  
  const pipe = await Pipe.findOne({ pipeId: 'pipe-1' });
  if (pipe) {
    pipe.status = 'leak';
    pipe.leakRateLpm = 180; // 180 L/min = 10,800 L/hour
    await pipe.save();
    console.log('✅ Leak injected on pipe-1 (180 L/min loss)');
  }
}

// Scenario C: Monsoon Overflow Risk
async function injectMonsoonScenario() {
  console.log('\n🌧️ Injecting Scenario C: Monsoon - Heavy Rainfall...');
  
  const tanks = await Tank.find({});
  for (const tank of tanks) {
    // Fill tanks to 92% (overflow risk)
    tank.levelL = tank.capacityL * 0.92;
    await tank.save();
  }
  
  // Turn on all pumps to simulate continued inflow
  const pumps = await Pump.find({});
  for (const pump of pumps) {
    pump.state = 'on';
    pump.runtimeSince = new Date();
    pump.schedule.repeat = 'manual';
    await pump.save();
  }
  
  console.log('✅ Tanks filled to 92%, pumps running (overflow risk scenario)');
}

// Scenario D: Power Outage - Pump Failure
async function injectPowerOutageScenario() {
  console.log('\n⚡ Injecting Scenario D: Power Outage - Pump Failure...');
  
  const pump = await Pump.findOne({ pumpId: 'pump-1' });
  if (pump) {
    pump.state = 'failed';
    pump.runtimeSince = null;
    await pump.save();
    console.log('✅ Pump-1 set to failed state (power outage simulation)');
  }
  
  // Reduce tank level to create urgency
  const tank = await Tank.findOne({ tankId: 'tank-1' });
  if (tank) {
    tank.levelL = tank.capacityL * 0.08; // 8% - critical level
    await tank.save();
    console.log('✅ Tank-1 reduced to critical level (8%)');
  }
}

// Scenario E: Tanker Refill
async function injectTankerRefillScenario() {
  console.log('\n🚛 Injecting Scenario E: Tanker Refill Event...');
  
  const tank = await Tank.findOne({ tankId: 'tank-2' });
  if (tank) {
    const refillAmount = 10000; // 10,000 liters
    tank.levelL = Math.min(tank.capacityL, tank.levelL + refillAmount);
    await tank.save();
    console.log(`✅ Tanker refilled tank-2 with ${refillAmount}L (new level: ${tank.levelL}L)`);
  }
}

// Main seed function
async function seedWaterNetwork() {
  try {
    console.log('🚀 STARTING SEED SCRIPT...');
    await connectDB();
    console.log('🔗 DATABASE CONNECTED');
    
    // Ask for scenario selection
    const scenario = process.argv[2] || 'normal';
    
    console.log(`\n🌊 Water Network Seeding - Scenario: ${scenario.toUpperCase()}`);
    console.log('='.repeat(60));
    
    // Always clear and create base scenario
    await clearWaterData();
    await seedNormalScenario();
    
    // Apply specific scenario modifications
    switch (scenario.toLowerCase()) {
      case 'leak':
        await injectLeakScenario();
        break;
      case 'monsoon':
        await injectMonsoonScenario();
        break;
      case 'poweroutage':
      case 'power-outage':
        await injectPowerOutageScenario();
        break;
      case 'tanker':
        await injectTankerRefillScenario();
        break;
      case 'normal':
      default:
        console.log('\n✅ Normal scenario loaded (no events injected)');
        break;
    }
    
    console.log('\n✅ Water network seeding completed successfully!');
    console.log('\nAvailable scenarios:');
    console.log('  - normal       : Stable operation');
    console.log('  - leak         : Leak on pipe-1 (180 L/min)');
    console.log('  - monsoon      : Overflow risk scenario');
    console.log('  - poweroutage  : Pump failure + low tank');
    console.log('  - tanker       : Emergency tanker refill');
    console.log('\nUsage: node seedWaterNetwork.js [scenario]');
    console.log('Example: node seedWaterNetwork.js leak\n');
    
  } catch (error) {
    console.error('❌ Error seeding water network:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  console.log('📌 Running as main module');
  seedWaterNetwork();
} else {
  console.log('📦 Imported as module');
}

export {
  seedWaterNetwork,
  seedNormalScenario,
  injectLeakScenario,
  injectMonsoonScenario,
  injectPowerOutageScenario,
  injectTankerRefillScenario,
  clearWaterData
};
