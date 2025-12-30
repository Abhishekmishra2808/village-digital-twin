# 🌾 RuraLens - Digital Twin for Rural India# RuraLens - Smart Village Infrastructure Management System



> **Transforming rural infrastructure management through real-time monitoring, AI-powered analytics, and blockchain-backed transparency.**A comprehensive 3D digital replica featuring real-time monitoring, predictive analytics, and interactive visualization for village infrastructure management.



A comprehensive digital twin platform designed for India's 600,000+ villages, managing ₹2.4 lakh crore in infrastructure budgets. RuraLens combines IoT sensors, satellite data, and citizen reports to provide predictive maintenance, transparent fund allocation, and real-time monitoring.![Dashboard Preview](docs/dashboard-preview.png)

![3D Map Preview](docs/map-preview.png)

---

## 🌟 Features

## 🎯 The Problem We Solve

- **Interactive 3D Map** - WebGL-based terrain rendering with MapLibre GL JS

India's rural infrastructure faces **"infrastructure blindness"**:- **Real-time Data** - WebSocket connection for live sensor updates

- **Delayed Repairs**: Critical failures go unnoticed until too late- **Infrastructure Monitoring**

- **Inefficient Funding**: Reactive maintenance instead of proactive planning  - 5 Water Tanks with level monitoring

- **Inequitable Allocation**: Political connections over performance metrics  - 12 Power Transformers with load tracking

  - 8 Key Buildings with occupancy data

**Impact**: ₹2.4 lakh crore managed with limited visibility, leading to service disruptions and wasted resources.  - 18+ IoT Sensors (soil moisture, air quality, weather, etc.)

  - Road network with condition monitoring

---- **Citizen Reports** - Community-driven issue reporting system

- **Predictive Analytics** - AI-powered insights and forecasting

## 💡 Our Solution- **Admin Controls** - Manual sensor override and scenario simulation

- **Responsive Design** - Works on desktop, tablet, and mobile

### **A Single Platform for Total Transparency**

## 📋 Prerequisites

1. **🤖 AI-Powered Monitoring**

   - Real-time anomaly detection from satellite data, mobile uploads, and citizen reports- Node.js 18+ and npm

   - Predictive maintenance alerts before failures occur- Modern browser with WebGL support

   - Multi-source data fusion for comprehensive coverage- 4GB RAM minimum



2. **🔐 Blockchain-Backed Transparency**## 🚀 Quick Start

   - Performance-based budgeting with smart contracts

   - Immutable transaction logs (tamper-proof)### 1. Install Dependencies

   - Automated fund disbursement upon verified task completion

```bash

3. **👥 Connected Ecosystem**# Install frontend dependencies

   - Offline-first mobile apps for field workersnpm install

   - Voice-based citizen portals (no internet required)

   - Optimized task routing and geo-tagged reporting# Install backend dependencies

cd backend

---npm install

cd ..

## 🌟 Key Features```



### **Interactive 3D Digital Twin**### 2. Start the Backend Server

- Real-time village visualization with HUD-style interface

- Hover over infrastructure nodes to see live data```bash

- Blueprint-style grid with glowing road networkscd backend

- Color-coded asset status (operational, warning, critical)npm start

```

### **Live Data Dashboard**

- KPI cards: Infrastructure health, active sensors, alertsThe WebSocket server will start on `http://localhost:3001`

- Real-time charts: Water levels, power distribution, traffic

- Activity feed: Live updates from IoT sensors and citizen reports### 3. Start the Frontend



### **For Everyone**Open a new terminal:

- **Citizens**: Report issues via voice/web, track complaint status, view public funds

- **Field Workers**: Prioritized tasks, offline sync, geo-tagged photo uploads```bash

- **Administrators**: 3D visualization, predictive analytics, transparent budgetingnpm run dev

```

### **Interactive Landing Page**

- Live data ticker showing real-time system eventsThe application will open at `http://localhost:3000`

- Before/After slider demonstrating problem → solution transformation

- Persona switcher (click to see features for your role)## 📁 Project Structure

- Frosted glass nav bar with modern HUD design

```

---ruralens/

├── frontend/

## 🚀 Quick Start│   ├── src/

│   │   ├── components/

### **Prerequisites**│   │   │   ├── Map3D/          # 3D map with layers

- Node.js 18+ and npm│   │   │   ├── Dashboard/      # KPIs, charts, activity feed

- Modern browser with WebGL support│   │   │   ├── Sidebar/        # Navigation menu

│   │   │   ├── InfoPanel/      # Asset details panel

### **1. Install Dependencies**│   │   │   ├── ControlPanel/   # Admin controls

```bash│   │   │   └── Layout/         # TopNav, StatusBar

# Install frontend dependencies│   │   ├── hooks/

npm install│   │   │   └── useWebSocket.ts # WebSocket connection hook

│   │   ├── store/

# Install backend dependencies│   │   │   └── villageStore.ts # Zustand state management

cd backend│   │   ├── App.tsx

npm install│   │   └── main.tsx

cd ..│   ├── package.json

```│   └── vite.config.ts

├── backend/

### **2. Start Backend Server**│   ├── server.js               # Express + WebSocket server

```bash│   ├── utils/

cd backend│   │   └── dataGenerator.js    # Realistic data simulation

npm start│   └── package.json

```└── README.md

Backend runs on `http://localhost:3001` with WebSocket support.```



### **3. Start Frontend**## 🎮 Usage Guide

```bash

npm run dev### Navigation

```

Frontend opens at `http://localhost:5173`- **Left Sidebar**: Click icons to switch between views (Dashboard, Water, Power, Roads, etc.)

- **3D Map**: 

### **4. Login**  - Click and drag to pan

Use any of these demo credentials:  - Scroll to zoom

- **Admin**: `admin@village.gov` / `admin123`  - Click markers to view details

- **Field Worker**: `worker@village.gov` / `worker123`  - Right panel shows asset information

- **Citizen**: `citizen@village.gov` / `citizen123`

### Admin Control Panel

---

Click the gear icon (bottom-right) to access:

## 📁 Project Structure

1. **Manual Sensor Controls**: Adjust sensor values in real-time

```2. **Scenario Simulations**:

village-digital-twin/   - Water Crisis: Drops all tank levels

├── src/   - Power Outage: Shuts down transformers

│   ├── components/   - Heavy Rainfall: Increases tank levels

│   │   ├── Landing/           # Landing page with interactive features

│   │   ├── Auth/              # Login system### Dashboard View

│   │   ├── Map3D/             # 3D village visualization

│   │   ├── Dashboard/         # KPI cards, charts, activity feed- **KPI Cards**: Infrastructure health, active sensors, citizen reports

│   │   ├── Views/             # Water, Power, Roads, etc.- **Live Charts**: Water levels, power load distribution

│   │   ├── Sidebar/           # Navigation menu- **Activity Feed**: Real-time events and alerts

│   │   ├── InfoPanel/         # Asset details panel

│   │   ├── ControlPanel/      # Admin controls## 🔧 Configuration

│   │   └── Layout/            # TopNav, StatusBar

│   ├── hooks/### Backend Port

│   │   └── useWebSocket.ts    # Real-time WebSocket connection

│   ├── store/Edit `backend/server.js`:

│   │   └── villageStore.ts    # Zustand state management

│   └── utils/```javascript

│       └── helpers.ts         # Utility functionsconst PORT = 3001; // Change this

├── backend/```

│   ├── server.js              # Express + WebSocket server

│   ├── utils/### WebSocket URL

│   │   └── dataGenerator.js   # Realistic IoT data simulation

│   └── package.jsonEdit `src/hooks/useWebSocket.ts`:

├── index.html                 # Entry point with IBM Plex fonts

├── package.json```typescript

└── README.mdconst WS_URL = 'ws://localhost:3001'; // Update if backend port changes

``````



---### Map Center Coordinates



## 🎨 Design SystemEdit `src/components/Map3D/Map3D.tsx`:



### **Typography**```typescript

- **IBM Plex Mono**: All headings, buttons, technical text (command-line aesthetic)const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204]; // [longitude, latitude]

- **IBM Plex Sans**: Body text, descriptions (superior readability)```



### **Color Palette**## 📊 Data Simulation

- **Primary**: Teal (#14b8a6) - CTAs, highlights, active states

- **Secondary**: Slate/Gray - Professional dark themeThe backend generates realistic sensor data with:

- **Accent**: Color-coded by asset type (Blue: Water, Yellow: Power, Green: Roads)

- **Diurnal Cycles**: Temperature and power load follow time-of-day patterns

### **Interactive Components**- **Water Consumption**: Gradual decrease with random refill events

1. **Glossy Nav Bar**: Frosted glass effect with `backdrop-blur-xl`- **Traffic Patterns**: Peak hours (7-9 AM, 5-7 PM)

2. **Live Data Ticker**: Continuously scrolling real-time events- **Noise Levels**: Higher during daytime

3. **Digital Twin HUD**: Interactive blueprint with hover tooltips- **Air Quality**: Better at night

4. **Before/After Slider**: Drag to compare problem vs solution

5. **Persona Switcher**: Toggle between user roles to see tailored featuresAll updates broadcast via WebSocket every 5 seconds.



---## 🌐 Deployment



## 🔧 ConfigurationDeploy your RuralLens Digital Twin to Render (free tier available) in under 15 minutes!



### **Environment Variables**### Quick Deploy Guide



Create `.env.development` for local development:**📋 Step-by-Step Checklist**: See [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) for a quick checklist

```env

VITE_WS_URL=ws://localhost:3001**📖 Detailed Guide**: See [`RENDER_DEPLOYMENT.md`](RENDER_DEPLOYMENT.md) for complete instructions

```

### Quick Start (3 Steps)

Create `.env.production` for deployment:

```env1. **Deploy Backend** (Render Web Service)

VITE_WS_URL=wss://your-backend-url.onrender.com   - Connect GitHub repository

```   - Root directory: `backend`

   - Build: `npm install`

### **Backend Configuration**   - Start: `node server.js`

   - Get your backend URL: `https://ruralens-backend.onrender.com`

Edit `backend/server.js` to change port:

```javascript2. **Update Frontend Configuration**

const PORT = process.env.PORT || 3001;   - Create `.env.production` file

```   - Add: `VITE_WS_URL=wss://your-backend-url.onrender.com`



---3. **Deploy Frontend** (Render Static Site)

   - Connect same GitHub repository

## 🌐 Deployment (Render.com)   - Build: `npm install && npm run build`

   - Publish directory: `dist`

### **Backend Deployment**   - Done! Your app is live! 🎉

1. Create new **Web Service** on Render

2. Connect GitHub repository### Features

3. Settings:- ✅ Auto-deploy on git push

   - **Root Directory**: `backend`- ✅ Free HTTPS with SSL

   - **Build Command**: `npm install`- ✅ Auto-scaling

   - **Start Command**: `node server.js`- ✅ WebSocket support

4. Copy your backend URL: `https://village-digital-twin.onrender.com`- ✅ Free tier: 750 hours/month per service



### **Frontend Deployment****Your deployed app will be accessible at**: `https://your-app.onrender.com`

1. Update `.env.production` with backend URL (use `wss://` for WebSocket)

2. Create new **Static Site** on Render## 🛠️ Technology Stack

3. Settings:

   - **Build Command**: `npm install && npm run build`### Frontend

   - **Publish Directory**: `dist`- **React 18** - UI framework

4. Add environment variable: `VITE_WS_URL=wss://your-backend.onrender.com`- **TypeScript** - Type safety

- **Vite** - Build tool

**Done!** Your app will be live at `https://your-app.onrender.com`- **MapLibre GL JS** - 3D map rendering

- **Zustand** - State management

---- **Chart.js** - Data visualization

- **Tailwind CSS** - Styling

## 🛠️ Technology Stack- **Framer Motion** - Animations

- **Lucide React** - Icons

### **Frontend**- **date-fns** - Date formatting

- React 18 + TypeScript

- Vite (build tool)### Backend

- MapLibre GL JS (3D maps)- **Node.js** - Runtime

- Zustand (state management)- **Express** - HTTP server

- Chart.js (visualizations)- **ws** - WebSocket library

- Tailwind CSS (styling)

- Framer Motion (animations)## 📸 Screenshots

- IBM Plex Fonts (typography)

### Dashboard

### **Backend**![Dashboard](docs/dashboard.png)

- Node.js + Express

- WebSocket (ws library)*KPI cards, live charts, and activity feed*

- Real-time data simulation with diurnal cycles

### 3D Map View

---![3D Map](docs/3d-map.png)



## 📊 IoT Data Simulation*Interactive terrain with water tanks, buildings, and sensors*



The backend generates realistic sensor data with:### Asset Details

- **Diurnal Cycles**: Temperature, power load vary by time of day![Asset Panel](docs/asset-panel.png)

- **Water Consumption**: Gradual tank depletion with refill events

- **Traffic Patterns**: Peak hours (7-9 AM, 5-7 PM)*Detailed information panel for selected infrastructure*

- **Weather Simulation**: Temperature, humidity, air quality

- **Random Events**: Infrastructure failures, citizen reports### Admin Controls

![Admin Panel](docs/admin-controls.png)

All updates broadcast via WebSocket every 5 seconds.

*Manual sensor overrides and scenario simulations*

---

## 🧪 Testing Checklist

## 🎮 User Guide

- [ ] 3D map loads within 3 seconds

### **Landing Page**- [ ] 60fps rendering with all layers visible

- Scroll through to see problem statement, solution, and user personas- [ ] WebSocket connects and updates data

- Hover over glowing dots in the Digital Twin to see live data- [ ] Click any asset to view details panel

- Drag the Before/After slider to compare problem vs solution- [ ] Admin controls modify sensor values

- Click persona buttons (Administrators/Field Workers/Citizens) to see role-specific features- [ ] Scenario simulations trigger alerts

- [ ] Charts update smoothly

### **Dashboard**- [ ] Responsive on mobile/tablet

- View KPI cards for quick infrastructure health overview

- Monitor real-time charts (water levels, power distribution)## 🐛 Troubleshooting

- Check activity feed for latest events

### Map Not Loading

### **3D Map View**- Check browser console for errors

- Click/drag to pan, scroll to zoom- Ensure WebGL is enabled in browser settings

- Click colored markers to view asset details- Try clearing browser cache

- Right panel shows comprehensive information

### WebSocket Connection Failed

### **Admin Controls** (Admin only)- Verify backend server is running

- Manual sensor overrides for testing- Check `WS_URL` in `useWebSocket.ts`

- Scenario simulations:- Ensure port 3001 is not blocked by firewall

  - **Water Crisis**: Drops all tank levels

  - **Power Outage**: Shuts down transformers### Slow Performance

  - **Heavy Rainfall**: Increases tank levels- Reduce number of visible sensors in Map3D

- Lower map pitch (less 3D angle)

---- Check browser's hardware acceleration settings



## 🧪 Testing Checklist## 📝 License



- ✅ Landing page interactive elements (ticker, slider, persona switcher)MIT License - Free to use and modify

- ✅ WebSocket connection establishes within 2 seconds

- ✅ 3D map loads and renders at 60fps## 👥 Contributors

- ✅ Clicking assets opens info panel

- ✅ Admin controls modify sensor values in real-timeBuilt with ❤️ for smart village initiatives

- ✅ Charts update smoothly without lag

- ✅ Responsive design on mobile/tablet## 🔗 Links



---- [Live Demo](#) (Coming soon)

- [Documentation](#)

## 🐛 Troubleshooting- [Issue Tracker](#)



### **WebSocket Connection Failed**## 📧 Support

- Ensure backend server is running on correct port

- Check `VITE_WS_URL` in environment variablesFor questions or support, please open an issue on GitHub.

- Verify firewall isn't blocking WebSocket connections

---

### **Map Not Loading**

- Confirm WebGL is enabled in browser**RuraLens** - Smart Village Infrastructure Management  

- Check browser console for errorsBuilt with ❤️ for rural development initiatives

- Try clearing cache and hard refresh

### **Slow Performance**
- Reduce number of visible 3D map layers
- Lower map pitch (less 3D tilt)
- Enable hardware acceleration in browser settings

---

## 📝 License

MIT License - Free to use and modify for rural development initiatives

---

## 🤝 Contributing

We welcome contributions! This project is built to help rural communities and government initiatives improve infrastructure management.

---

## 📧 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact: [Your contact information]

---

**Built with ❤️ for smarter, more equitable rural India**

*RuraLens - From Infrastructure Blindness to Digital Foresight*
