import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import Scheme from './models/Scheme.js';
import User from './models/User.js';
import Feedback from './models/Feedback.js';

dotenv.config();

async function clearDatabase() {
  try {
    await connectDatabase();
    
    console.log('🗑️  Dropping all collections to clear schema cache...');
    
    // Drop entire collections (this clears schema cache)
    try {
      await mongoose.connection.db.dropCollection('schemes');
      console.log('✅ Schemes collection dropped');
    } catch (err) {
      if (err.message.includes('ns not found')) {
        console.log('ℹ️  Schemes collection does not exist');
      }
    }

    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('✅ Users collection dropped');
    } catch (err) {
      if (err.message.includes('ns not found')) {
        console.log('ℹ️  Users collection does not exist');
      }
    }

    try {
      await mongoose.connection.db.dropCollection('feedbacks');
      console.log('✅ Feedbacks collection dropped');
    } catch (err) {
      if (err.message.includes('ns not found')) {
        console.log('ℹ️  Feedbacks collection does not exist');
      }
    }
    
    console.log('✅ Database cleared successfully');
    console.log('ℹ️  Run "npm run dev" to reseed with fresh data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
