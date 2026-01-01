import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVillageData, updateSensorData, simulateScenario } from './utils/dataGenerator.js';
import { processFeedbackWithLocalLLM } from './utils/localLLMService.js';
import { connectDatabase, seedDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import schemesRoutes from './routes/schemes.js';
import llmStatusRoutes from './routes/llmStatus.js';
import ragRoutes from './routes/rag.js';
import anonymousReportsRoutes from './routes/anonymousReports.js';
import gnnRoutes from './routes/gnn.js';
import Scheme from './models/Scheme.js';
import Feedback from './models/Feedback.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database and server
async function startServer() {
  await connectDatabase();
  await seedDatabase();

  const server = app.listen(PORT, () => {
    console.log(`🚀 RuraLens Server running on port ${PORT}`);
  });

  return server;
}

const server = await startServer();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/llm', llmStatusRoutes);
app.use('/api/rag-query', ragRoutes);
app.use('/api/anonymous-reports', anonymousReportsRoutes);
app.use('/api/gnn', gnnRoutes);

// Initialize village data (in-memory for real-time sensors, schemes from DB)
let villageState = generateVillageData();

// Load schemes from database on startup
async function loadSchemesFromDB() {
  const schemes = await Scheme.find();
  villageState.schemes = schemes.map(s => s.toObject());
  console.log(`📊 Loaded ${schemes.length} schemes from database`);
}

await loadSchemesFromDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Get current state
app.get('/api/state', async (req, res) => {
  // Refresh schemes from database
  const schemes = await Scheme.find();
  villageState.schemes = schemes.map(s => s.toObject());
  
  res.json(villageState);
});

// Legacy feedback endpoint (redirect to new endpoint)
app.post('/api/feedback', async (req, res) => {
  try {
    const { schemeId, rating, comment, isUrgent } = req.body;
    
    // Find scheme
    const scheme = await Scheme.findOne({ id: schemeId });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    console.log(`🤖 Processing feedback with LOCAL LLM (privacy-first)...`);
    
    // Process with LOCAL LLM (not Gemini)
    const aiResult = await processFeedbackWithLocalLLM(
      comment || 'No comment provided',
      rating,
      scheme.name
    );

    const aiAnalysis = aiResult.analysis;

    // Save feedback to database
    const feedback = await Feedback.create({
      schemeId,
      rating,
      rawComment: comment,
      aiSummary: aiAnalysis.summary,
      concerns: aiAnalysis.concerns,
      sentiment: aiAnalysis.sentiment,
      categories: aiAnalysis.categories,
      urgency: aiAnalysis.urgency,
      isUrgent: isUrgent || (aiAnalysis.urgency === 'Critical' || aiAnalysis.urgency === 'High'),
      aiProcessed: aiResult.success
    });

    // Update scheme
    scheme.feedbackCount += 1;
    const currentRating = scheme.citizenRating || 0;
    const currentCount = scheme.feedbackCount - 1;
    scheme.citizenRating = currentCount > 0
      ? ((currentRating * currentCount) + rating) / scheme.feedbackCount
      : rating;
    scheme.citizenRating = Math.round(scheme.citizenRating * 10) / 10;

    // Add discrepancy if urgent
    if (feedback.isUrgent) {
      scheme.discrepancies.push({
        id: `disc-${Date.now()}`,
        type: 'citizen_reported',
        description: `${aiAnalysis.urgency} Issue: ${aiAnalysis.summary}`,
        severity: aiAnalysis.urgency === 'Critical' ? 'critical' : 'high',
        reportedBy: 'Citizen (Anonymous)',
        categories: aiAnalysis.categories,
        concerns: aiAnalysis.concerns,
        date: new Date().toISOString(),
        status: 'pending'
      });
    }

    await scheme.save();

    console.log(`✅ Feedback processed with LOCAL LLM and saved to database`);

    // Reload schemes from database
    await loadSchemesFromDB();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully (processed locally)',
      aiProcessed: aiResult.success,
      scheme: {
        id: scheme.id,
        name: scheme.name,
        citizenRating: scheme.citizenRating,
        feedbackCount: scheme.feedbackCount
      },
      analysis: {
        sentiment: aiAnalysis.sentiment,
        urgency: aiAnalysis.urgency
      }
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'Internal server error while processing feedback' });
  }
});
