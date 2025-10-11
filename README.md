# Sundarpur Digital Twin - Village Infrastructure Management System

A comprehensive 3D digital replica of Sundarpur Village, Maharashtra, featuring real-time monitoring, predictive analytics, and interactive visualization for village infrastructure management.

![Dashboard Preview](docs/dashboard-preview.png)
![3D Map Preview](docs/map-preview.png)

## 🌟 Features

- **Interactive 3D Map** - WebGL-based terrain rendering with MapLibre GL JS
- **Real-time Data** - WebSocket connection for live sensor updates
- **Infrastructure Monitoring**
  - 5 Water Tanks with level monitoring
  - 12 Power Transformers with load tracking
  - 8 Key Buildings with occupancy data
  - 18+ IoT Sensors (soil moisture, air quality, weather, etc.)
  - Road network with condition monitoring
- **Citizen Reports** - Community-driven issue reporting system
- **Predictive Analytics** - AI-powered insights and forecasting
- **Admin Controls** - Manual sensor override and scenario simulation
- **Responsive Design** - Works on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGL support
- 4GB RAM minimum

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start the Backend Server

```bash
cd backend
npm start
```

The WebSocket server will start on `http://localhost:3001`

### 3. Start the Frontend

Open a new terminal:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
sundarpur-digital-twin/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map3D/          # 3D map with layers
│   │   │   ├── Dashboard/      # KPIs, charts, activity feed
│   │   │   ├── Sidebar/        # Navigation menu
│   │   │   ├── InfoPanel/      # Asset details panel
│   │   │   ├── ControlPanel/   # Admin controls
│   │   │   └── Layout/         # TopNav, StatusBar
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts # WebSocket connection hook
│   │   ├── store/
│   │   │   └── villageStore.ts # Zustand state management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── server.js               # Express + WebSocket server
│   ├── utils/
│   │   └── dataGenerator.js    # Realistic data simulation
│   └── package.json
└── README.md
```

## 🎮 Usage Guide

### Navigation

- **Left Sidebar**: Click icons to switch between views (Dashboard, Water, Power, Roads, etc.)
- **3D Map**: 
  - Click and drag to pan
  - Scroll to zoom
  - Click markers to view details
  - Right panel shows asset information

### Admin Control Panel

Click the gear icon (bottom-right) to access:

1. **Manual Sensor Controls**: Adjust sensor values in real-time
2. **Scenario Simulations**:
   - Water Crisis: Drops all tank levels
   - Power Outage: Shuts down transformers
   - Heavy Rainfall: Increases tank levels

### Dashboard View

- **KPI Cards**: Infrastructure health, active sensors, citizen reports
- **Live Charts**: Water levels, power load distribution
- **Activity Feed**: Real-time events and alerts

## 🔧 Configuration

### Backend Port

Edit `backend/server.js`:

```javascript
const PORT = 3001; // Change this
```

### WebSocket URL

Edit `src/hooks/useWebSocket.ts`:

```typescript
const WS_URL = 'ws://localhost:3001'; // Update if backend port changes
```

### Map Center Coordinates

Edit `src/components/Map3D/Map3D.tsx`:

```typescript
const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204]; // [longitude, latitude]
```

## 📊 Data Simulation

The backend generates realistic sensor data with:

- **Diurnal Cycles**: Temperature and power load follow time-of-day patterns
- **Water Consumption**: Gradual decrease with random refill events
- **Traffic Patterns**: Peak hours (7-9 AM, 5-7 PM)
- **Noise Levels**: Higher during daytime
- **Air Quality**: Better at night

All updates broadcast via WebSocket every 5 seconds.

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

### Backend (Render.com)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `node backend/server.js`
5. Add environment variable: `PORT=3001`
6. Deploy!

**Important**: Update `WS_URL` in frontend to your deployed backend URL.

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **MapLibre GL JS** - 3D map rendering
- **Zustand** - State management
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime
- **Express** - HTTP server
- **ws** - WebSocket library

## 📸 Screenshots

### Dashboard
![Dashboard](docs/dashboard.png)

*KPI cards, live charts, and activity feed*

### 3D Map View
![3D Map](docs/3d-map.png)

*Interactive terrain with water tanks, buildings, and sensors*

### Asset Details
![Asset Panel](docs/asset-panel.png)

*Detailed information panel for selected infrastructure*

### Admin Controls
![Admin Panel](docs/admin-controls.png)

*Manual sensor overrides and scenario simulations*

## 🧪 Testing Checklist

- [ ] 3D map loads within 3 seconds
- [ ] 60fps rendering with all layers visible
- [ ] WebSocket connects and updates data
- [ ] Click any asset to view details panel
- [ ] Admin controls modify sensor values
- [ ] Scenario simulations trigger alerts
- [ ] Charts update smoothly
- [ ] Responsive on mobile/tablet

## 🐛 Troubleshooting

### Map Not Loading
- Check browser console for errors
- Ensure WebGL is enabled in browser settings
- Try clearing browser cache

### WebSocket Connection Failed
- Verify backend server is running
- Check `WS_URL` in `useWebSocket.ts`
- Ensure port 3001 is not blocked by firewall

### Slow Performance
- Reduce number of visible sensors in Map3D
- Lower map pitch (less 3D angle)
- Check browser's hardware acceleration settings

## 📝 License

MIT License - Free to use and modify

## 👥 Contributors

Built with ❤️ for smart village initiatives

## 🔗 Links

- [Live Demo](#) (Coming soon)
- [Documentation](#)
- [Issue Tracker](#)

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Coordinates**: 18.5204°N, 73.8567°E  
**Village**: Sundarpur, Maharashtra, India  
**Population**: ~5,000 residents  
**Elevation**: 650-680m above sea level
