import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateVillageData, updateSensorData, simulateScenario } from './utils/dataGenerator.js';
import { processFeedbackWithAI } from './utils/geminiService.js';
import { connectDatabase, seedDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import schemesRoutes from './routes/schemes.js';
import Scheme from './models/Scheme.js';
import Feedback from './models/Feedback.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemesRoutes);

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

const wss = new WebSocketServer({ server });

// Initialize village data (in-memory for real-time sensors, schemes from DB)
let villageState = generateVillageData();

// Load schemes from database on startup
async function loadSchemesFromDB() {
  const schemes = await Scheme.find();
  villageState.schemes = schemes.map(s => s.toObject());
  console.log(`📊 Loaded ${schemes.length} schemes from database`);
}

await loadSchemesFromDB();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('✅ New client connected');
  
  // Send initial state
  ws.send(JSON.stringify({
    type: 'initial_state',
    data: villageState,
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'manual_update') {
        // Handle manual sensor updates from admin panel
        const { category, id, field, value } = data.payload;
        if (villageState[category]) {
          const item = villageState[category].find(i => i.id === id);
          if (item) {
            item[field] = value;
            broadcast({
              type: 'sensor_update',
              data: villageState,
              timestamp: new Date().toISOString()
            });
          }
        }
      } else if (data.type === 'simulate_scenario') {
        // Handle scenario simulations
        villageState = simulateScenario(villageState, data.scenario);
        broadcast({
          type: 'scenario_update',
          scenario: data.scenario,
          data: villageState,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Real-time data simulation - Update every 5 seconds
setInterval(async () => {
  villageState = updateSensorData(villageState);
  
  // Refresh schemes from database
  const schemes = await Scheme.find();
  villageState.schemes = schemes.map(s => s.toObject());
  
  // Attach recent feedback to each scheme
  for (const scheme of villageState.schemes) {
    const feedback = await Feedback.find({ schemeId: scheme.id })
      .select('-rawComment')
      .sort({ createdAt: -1 })
      .limit(5);
    scheme.feedbackHistory = feedback;
  }
  
  broadcast({
    type: 'sensor_update',
    data: villageState,
    timestamp: new Date().toISOString()
  });
}, 5000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: wss.clients.size,
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

    console.log(`🤖 Processing feedback with Gemini AI...`);
    
    // Process with AI
    const aiResult = await processFeedbackWithAI(
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

    console.log(`✅ Feedback processed and saved to database`);

    // Broadcast update
    await loadSchemesFromDB();
    broadcast({
      type: 'feedback_update',
      schemeId,
      data: villageState,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
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

console.log(`📡 WebSocket server ready at ws://localhost:${PORT}`);
