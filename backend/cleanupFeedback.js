import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Feedback from './models/Feedback.js';
import Scheme from './models/Scheme.js';
import { processFeedbackWithAI } from './utils/geminiService.js';

dotenv.config();

async function cleanupFeedback() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all feedback with raw comments exposed
    const allFeedback = await Feedback.find().select('+rawComment');
    console.log(`📊 Found ${allFeedback.length} feedback entries to process`);

    let processed = 0;
    let failed = 0;

    for (const feedback of allFeedback) {
      try {
        console.log(`\n🔄 Processing feedback ${feedback._id}...`);
        
        // Get the scheme
        const scheme = await Scheme.findOne({ id: feedback.schemeId });
        if (!scheme) {
          console.log(`⚠️  Scheme not found for feedback ${feedback._id}`);
          continue;
        }

        // Re-process with AI
        const aiResult = await processFeedbackWithAI(
          feedback.rawComment || 'No comment provided',
          feedback.rating,
          scheme.name
        );

        // Update the feedback with new AI-processed data
        feedback.aiSummary = aiResult.analysis.summary;
        feedback.concerns = aiResult.analysis.concerns;
        feedback.sentiment = aiResult.analysis.sentiment;
        feedback.categories = aiResult.analysis.categories;
        feedback.urgency = aiResult.analysis.urgency;
        feedback.aiProcessed = aiResult.success;

        await feedback.save();
        
        console.log(`✅ Updated feedback ${feedback._id}`);
        console.log(`   Summary: ${aiResult.analysis.summary}`);
        processed++;

        // Wait 1 second between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing feedback ${feedback._id}:`, error.message);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Cleanup complete!`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Failed: ${failed}`);
    console.log('='.repeat(50));

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupFeedback();
