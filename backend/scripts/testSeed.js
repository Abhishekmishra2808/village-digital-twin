import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tank from '../models/Tank.js';

dotenv.config();

async function testSeeding() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');
    
    console.log('🧹 Clearing tanks...');
    await Tank.deleteMany({});
    console.log('✅ Cleared');
    
    console.log('🏗️  Creating test tank...');
    const tank = await Tank.create({
      tankId: 'test-tank-1',
      name: 'Test Tank',
      capacityL: 10000,
      levelL: 5000,
      inletPumps: [],
      outletPipes: [],
      geo: { lat: 23.25, lng: 77.41 },
      lowThresholdPercent: 10,
      highThresholdPercent: 95
    });
    console.log('✅ Created tank:', tank.tankId);
    
    console.log('🔍 Reading tanks...');
    const tanks = await Tank.find({});
    console.log(`✅ Found ${tanks.length} tank(s)`);
    tanks.forEach(t => console.log(`   - ${t.name} (${t.tankId})`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
    process.exit(0);
  }
}

testSeeding();
