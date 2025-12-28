import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { generateVillageData, updateSensorData, simulateScenario } from './utils/dataGenerator.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = app.listen(PORT, () => {
  console.log(`🚀 Sundarpur Digital Twin Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

// Initialize village data
let villageState = generateVillageData();

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
setInterval(() => {
  villageState = updateSensorData(villageState);
  
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
    timestamp: new Date().toISOString()
  });
});

// Get current state
app.get('/api/state', (req, res) => {
  res.json(villageState);
});

console.log(`📡 WebSocket server ready at ws://localhost:${PORT}`);
