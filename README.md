# 🌾 RuraLens - Digital Twin for Rural India# 🌾 RuraLens - Digital Twin for Rural India# RuraLens - Smart Village Infrastructure Management System



> **Transforming rural infrastructure management through real-time monitoring, AI-powered analytics, and blockchain-backed transparency.**



A comprehensive digital twin platform designed for India's 600,000+ villages, managing ₹2.4 lakh crore in infrastructure budgets. RuraLens combines IoT sensors, satellite data, and citizen reports to provide predictive maintenance, transparent fund allocation, and real-time monitoring.> **Transforming rural infrastructure management through real-time monitoring, AI-powered analytics, and blockchain-backed transparency.**A comprehensive 3D digital replica featuring real-time monitoring, predictive analytics, and interactive visualization for village infrastructure management.



---



## 🎯 The Problem We SolveA comprehensive digital twin platform designed for India's 600,000+ villages, managing ₹2.4 lakh crore in infrastructure budgets. RuraLens combines IoT sensors, satellite data, and citizen reports to provide predictive maintenance, transparent fund allocation, and real-time monitoring.![Dashboard Preview](docs/dashboard-preview.png)



India's rural infrastructure faces **"infrastructure blindness"**:![3D Map Preview](docs/map-preview.png)



- **Delayed Repairs**: Critical failures go unnoticed until too late---

- **Inefficient Funding**: Reactive maintenance instead of proactive planning  

- **Inequitable Allocation**: Political connections over performance metrics## 🌟 Features



**Impact**: ₹2.4 lakh crore managed with limited visibility, leading to service disruptions and wasted resources.## 🎯 The Problem We Solve



---- **Interactive 3D Map** - WebGL-based terrain rendering with MapLibre GL JS



## 💡 Our SolutionIndia's rural infrastructure faces **"infrastructure blindness"**:- **Real-time Data** - WebSocket connection for live sensor updates



### A Single Platform for Total Transparency- **Delayed Repairs**: Critical failures go unnoticed until too late- **Infrastructure Monitoring**



#### 🤖 AI-Powered Monitoring- **Inefficient Funding**: Reactive maintenance instead of proactive planning  - 5 Water Tanks with level monitoring

- Real-time anomaly detection from satellite data and citizen reports

- Predictive maintenance alerts before failures occur- **Inequitable Allocation**: Political connections over performance metrics  - 12 Power Transformers with load tracking

- Multi-source data fusion for comprehensive coverage

  - 8 Key Buildings with occupancy data

#### 🔐 Blockchain-Backed Transparency

- Performance-based budgeting with smart contracts**Impact**: ₹2.4 lakh crore managed with limited visibility, leading to service disruptions and wasted resources.  - 18+ IoT Sensors (soil moisture, air quality, weather, etc.)

- Immutable transaction logs (tamper-proof)

- Automated fund disbursement upon verified task completion  - Road network with condition monitoring



#### 👥 Connected Ecosystem---- **Citizen Reports** - Community-driven issue reporting system

- Web-based dashboards for administrators and field workers

- Voice-based citizen portals (no internet required)- **Predictive Analytics** - AI-powered insights and forecasting

- Geo-tagged reporting and task management

## 💡 Our Solution- **Admin Controls** - Manual sensor override and scenario simulation

---

- **Responsive Design** - Works on desktop, tablet, and mobile

## 🌟 Key Features

### **A Single Platform for Total Transparency**

### Interactive 3D Digital Twin

- Real-time village visualization with HUD-style interface## 📋 Prerequisites

- Hover over infrastructure nodes to see live data

- Blueprint-style grid with glowing road networks1. **🤖 AI-Powered Monitoring**

- Color-coded asset status (operational, warning, critical)

   - Real-time anomaly detection from satellite data, mobile uploads, and citizen reports- Node.js 18+ and npm

### Live Data Dashboard

- **KPI Cards**: Infrastructure health, active sensors, alerts   - Predictive maintenance alerts before failures occur- Modern browser with WebGL support

- **Real-time Charts**: Water levels, power distribution, traffic

- **Activity Feed**: Live updates from IoT sensors and citizen reports   - Multi-source data fusion for comprehensive coverage- 4GB RAM minimum



### For Everyone

- **Citizens**: Report issues via voice/web, track complaint status, view public funds

- **Field Workers**: Prioritized tasks via web dashboard, geo-tagged photo uploads2. **🔐 Blockchain-Backed Transparency**## 🚀 Quick Start

- **Administrators**: 3D visualization, predictive analytics, transparent budgeting

   - Performance-based budgeting with smart contracts

### Interactive Landing Page

- Live data ticker showing real-time system events   - Immutable transaction logs (tamper-proof)### 1. Install Dependencies

- Before/After slider demonstrating problem → solution transformation

- Persona switcher (click to see features for your role)   - Automated fund disbursement upon verified task completion

- Frosted glass nav bar with modern HUD design

```bash

---

3. **👥 Connected Ecosystem**# Install frontend dependencies

## 🚀 Quick Start

   - Offline-first mobile apps for field workersnpm install

### Prerequisites

- Node.js 18+ and npm   - Voice-based citizen portals (no internet required)

- Modern browser with WebGL support

   - Optimized task routing and geo-tagged reporting# Install backend dependencies

### 1. Install Dependencies

cd backend

```bash

# Install frontend dependencies---npm install

npm install

cd ..

# Install backend dependencies

cd backend## 🌟 Key Features```

npm install

cd ..

```

### **Interactive 3D Digital Twin**### 2. Start the Backend Server

### 2. Start Backend Server

- Real-time village visualization with HUD-style interface

```bash

cd backend- Hover over infrastructure nodes to see live data```bash

npm start

```- Blueprint-style grid with glowing road networkscd backend



Backend runs on `http://localhost:3001` with WebSocket support.- Color-coded asset status (operational, warning, critical)npm start



### 3. Start Frontend```



```bash### **Live Data Dashboard**

npm run dev

```- KPI cards: Infrastructure health, active sensors, alertsThe WebSocket server will start on `http://localhost:3001`



Frontend opens at `http://localhost:5173`- Real-time charts: Water levels, power distribution, traffic



### 4. Login- Activity feed: Live updates from IoT sensors and citizen reports### 3. Start the Frontend



Use any of these demo credentials:

- **Admin**: `admin@village.gov` / `admin123`

- **Field Worker**: `worker@village.gov` / `worker123`### **For Everyone**Open a new terminal:

- **Citizen**: `citizen@village.gov` / `citizen123`

- **Citizens**: Report issues via voice/web, track complaint status, view public funds

---

- **Field Workers**: Prioritized tasks, offline sync, geo-tagged photo uploads```bash

## 📁 Project Structure

- **Administrators**: 3D visualization, predictive analytics, transparent budgetingnpm run dev

```

village-digital-twin/```

├── public/                    # Static assets

│   ├── favicon.jpg### **Interactive Landing Page**

│   └── sensor-simulator.html

├── src/- Live data ticker showing real-time system eventsThe application will open at `http://localhost:3000`

│   ├── components/

│   │   ├── Landing/           # Landing page with interactive features- Before/After slider demonstrating problem → solution transformation

│   │   ├── Auth/              # Login system

│   │   ├── Map3D/             # 3D village visualization- Persona switcher (click to see features for your role)## 📁 Project Structure

│   │   ├── Dashboard/         # KPI cards, charts, activity feed

│   │   ├── Views/             # Water, Power, Roads, etc.- Frosted glass nav bar with modern HUD design

│   │   ├── Sidebar/           # Navigation menu

│   │   ├── InfoPanel/         # Asset details panel```

│   │   ├── ControlPanel/      # Admin controls

│   │   └── Layout/            # TopNav, StatusBar---ruralens/

│   ├── hooks/

│   │   └── useWebSocket.ts    # Real-time WebSocket connection├── frontend/

│   ├── store/

│   │   └── villageStore.ts    # Zustand state management## 🚀 Quick Start│   ├── src/

│   └── utils/

│       └── helpers.ts         # Utility functions│   │   ├── components/

├── backend/

│   ├── server.js              # Express + WebSocket server### **Prerequisites**│   │   │   ├── Map3D/          # 3D map with layers

│   ├── utils/

│   │   └── dataGenerator.js   # Realistic IoT data simulation- Node.js 18+ and npm│   │   │   ├── Dashboard/      # KPIs, charts, activity feed

│   └── package.json

├── index.html                 # Entry point- Modern browser with WebGL support│   │   │   ├── Sidebar/        # Navigation menu

├── package.json               # Dependencies

├── vite.config.ts             # Vite configuration│   │   │   ├── InfoPanel/      # Asset details panel

└── README.md                  # This file

```### **1. Install Dependencies**│   │   │   ├── ControlPanel/   # Admin controls



---```bash│   │   │   └── Layout/         # TopNav, StatusBar



## 🎨 Design System# Install frontend dependencies│   │   ├── hooks/



### Typographynpm install│   │   │   └── useWebSocket.ts # WebSocket connection hook

- **IBM Plex Mono**: All headings, buttons, technical text (command-line aesthetic)

- **IBM Plex Sans**: Body text, descriptions (superior readability)│   │   ├── store/



### Color Palette# Install backend dependencies│   │   │   └── villageStore.ts # Zustand state management

- **Primary**: Teal (#14b8a6) - CTAs, highlights, active states

- **Secondary**: Slate/Gray - Professional dark themecd backend│   │   ├── App.tsx

- **Accent**: Color-coded by asset type (Blue: Water, Yellow: Power, Green: Roads)

npm install│   │   └── main.tsx

### Interactive Components

1. **Glossy Nav Bar** - Frosted glass effect with `backdrop-blur-xl`cd ..│   ├── package.json

2. **Live Data Ticker** - Continuously scrolling real-time events

3. **Digital Twin HUD** - Interactive blueprint with hover tooltips```│   └── vite.config.ts

4. **Before/After Slider** - Drag to compare problem vs solution

5. **Persona Switcher** - Toggle between user roles to see tailored features├── backend/



---### **2. Start Backend Server**│   ├── server.js               # Express + WebSocket server



## 🔧 Configuration```bash│   ├── utils/



### Environment Variablescd backend│   │   └── dataGenerator.js    # Realistic data simulation



Create `.env.development` for local development:npm start│   └── package.json



```env```└── README.md

VITE_WS_URL=ws://localhost:3001

```Backend runs on `http://localhost:3001` with WebSocket support.```



Create `.env.production` for deployment:



```env### **3. Start Frontend**## 🎮 Usage Guide

VITE_WS_URL=wss://your-backend-url.onrender.com

``````bash



### Backend Configurationnpm run dev### Navigation



Edit `backend/server.js` to change port:```



```javascriptFrontend opens at `http://localhost:5173`- **Left Sidebar**: Click icons to switch between views (Dashboard, Water, Power, Roads, etc.)

const PORT = process.env.PORT || 3001;

```- **3D Map**: 



---### **4. Login**  - Click and drag to pan



## 🌐 Deployment (Render.com)Use any of these demo credentials:  - Scroll to zoom



### Backend Deployment- **Admin**: `admin@village.gov` / `admin123`  - Click markers to view details



1. Create new **Web Service** on Render- **Field Worker**: `worker@village.gov` / `worker123`  - Right panel shows asset information

2. Connect GitHub repository

3. Configure settings:- **Citizen**: `citizen@village.gov` / `citizen123`

   - **Root Directory**: `backend`

   - **Build Command**: `npm install`### Admin Control Panel

   - **Start Command**: `node server.js`

4. Copy your backend URL: `https://village-digital-twin.onrender.com`---



### Frontend DeploymentClick the gear icon (bottom-right) to access:



1. Update `.env.production` with backend URL (use `wss://` for WebSocket)## 📁 Project Structure

2. Create new **Static Site** on Render

3. Configure settings:1. **Manual Sensor Controls**: Adjust sensor values in real-time

   - **Build Command**: `npm install && npm run build`

   - **Publish Directory**: `dist````2. **Scenario Simulations**:

4. Add environment variable: `VITE_WS_URL=wss://your-backend.onrender.com`

village-digital-twin/   - Water Crisis: Drops all tank levels

**Done!** Your app will be live at `https://your-app.onrender.com`

├── src/   - Power Outage: Shuts down transformers

---

│   ├── components/   - Heavy Rainfall: Increases tank levels

## 🛠️ Technology Stack

│   │   ├── Landing/           # Landing page with interactive features

### Frontend

- **React 18** - UI framework│   │   ├── Auth/              # Login system### Dashboard View

- **TypeScript** - Type safety

- **Vite** - Build tool and dev server│   │   ├── Map3D/             # 3D village visualization

- **MapLibre GL JS** - 3D map rendering

- **Zustand** - State management│   │   ├── Dashboard/         # KPI cards, charts, activity feed- **KPI Cards**: Infrastructure health, active sensors, citizen reports

- **Chart.js** - Data visualizations

- **Tailwind CSS** - Utility-first styling│   │   ├── Views/             # Water, Power, Roads, etc.- **Live Charts**: Water levels, power load distribution

- **Framer Motion** - Smooth animations

- **IBM Plex Fonts** - Typography system│   │   ├── Sidebar/           # Navigation menu- **Activity Feed**: Real-time events and alerts



### Backend│   │   ├── InfoPanel/         # Asset details panel

- **Node.js** - Runtime environment

- **Express** - HTTP server│   │   ├── ControlPanel/      # Admin controls## 🔧 Configuration

- **WebSocket (ws)** - Real-time communication

- **CORS** - Cross-origin resource sharing│   │   └── Layout/            # TopNav, StatusBar



---│   ├── hooks/### Backend Port



## 📊 IoT Data Simulation│   │   └── useWebSocket.ts    # Real-time WebSocket connection



The backend generates realistic sensor data with:│   ├── store/Edit `backend/server.js`:



- **Diurnal Cycles**: Temperature, power load vary by time of day│   │   └── villageStore.ts    # Zustand state management

- **Water Consumption**: Gradual tank depletion with refill events

- **Traffic Patterns**: Peak hours (7-9 AM, 5-7 PM)│   └── utils/```javascript

- **Weather Simulation**: Temperature, humidity, air quality

- **Random Events**: Infrastructure failures, citizen reports│       └── helpers.ts         # Utility functionsconst PORT = 3001; // Change this



All updates broadcast via WebSocket every 5 seconds.├── backend/```



---│   ├── server.js              # Express + WebSocket server



## 🎮 User Guide│   ├── utils/### WebSocket URL



### Landing Page│   │   └── dataGenerator.js   # Realistic IoT data simulation

1. Scroll through to see problem statement, solution, and user personas

2. Hover over glowing dots in the Digital Twin to see live data│   └── package.jsonEdit `src/hooks/useWebSocket.ts`:

3. Drag the Before/After slider to compare problem vs solution

4. Click persona buttons to see role-specific features├── index.html                 # Entry point with IBM Plex fonts



### Dashboard├── package.json```typescript

1. View KPI cards for quick infrastructure health overview

2. Monitor real-time charts (water levels, power distribution)└── README.mdconst WS_URL = 'ws://localhost:3001'; // Update if backend port changes

3. Check activity feed for latest events

``````

### 3D Map View

1. Click and drag to pan, scroll to zoom

2. Click colored markers to view asset details

3. Right panel shows comprehensive information---### Map Center Coordinates



### Admin Controls (Admin only)

1. Access via gear icon (bottom-right)

2. Manual sensor overrides for testing## 🎨 Design SystemEdit `src/components/Map3D/Map3D.tsx`:

3. Scenario simulations:

   - **Water Crisis**: Drops all tank levels

   - **Power Outage**: Shuts down transformers

   - **Heavy Rainfall**: Increases tank levels### **Typography**```typescript



---- **IBM Plex Mono**: All headings, buttons, technical text (command-line aesthetic)const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204]; // [longitude, latitude]



## 🧪 Testing Checklist- **IBM Plex Sans**: Body text, descriptions (superior readability)```



- ✅ Landing page interactive elements (ticker, slider, persona switcher)

- ✅ WebSocket connection establishes within 2 seconds

- ✅ 3D map loads and renders at 60fps### **Color Palette**## 📊 Data Simulation

- ✅ Clicking assets opens info panel

- ✅ Admin controls modify sensor values in real-time- **Primary**: Teal (#14b8a6) - CTAs, highlights, active states

- ✅ Charts update smoothly without lag

- ✅ Responsive design on mobile/tablet- **Secondary**: Slate/Gray - Professional dark themeThe backend generates realistic sensor data with:



---- **Accent**: Color-coded by asset type (Blue: Water, Yellow: Power, Green: Roads)



## 🐛 Troubleshooting- **Diurnal Cycles**: Temperature and power load follow time-of-day patterns



### WebSocket Connection Failed### **Interactive Components**- **Water Consumption**: Gradual decrease with random refill events

- Ensure backend server is running on correct port

- Check `VITE_WS_URL` in environment variables1. **Glossy Nav Bar**: Frosted glass effect with `backdrop-blur-xl`- **Traffic Patterns**: Peak hours (7-9 AM, 5-7 PM)

- Verify firewall isn't blocking WebSocket connections

2. **Live Data Ticker**: Continuously scrolling real-time events- **Noise Levels**: Higher during daytime

### Map Not Loading

- Confirm WebGL is enabled in browser3. **Digital Twin HUD**: Interactive blueprint with hover tooltips- **Air Quality**: Better at night

- Check browser console for errors

- Try clearing cache and hard refresh4. **Before/After Slider**: Drag to compare problem vs solution



### Slow Performance5. **Persona Switcher**: Toggle between user roles to see tailored featuresAll updates broadcast via WebSocket every 5 seconds.

- Reduce number of visible 3D map layers

- Lower map pitch (less 3D tilt)

- Enable hardware acceleration in browser settings

---## 🌐 Deployment

---



## 📝 License

## 🔧 ConfigurationDeploy your RuralLens Digital Twin to Render (free tier available) in under 15 minutes!

MIT License - Free to use and modify for rural development initiatives



---

### **Environment Variables**### Quick Deploy Guide

## 🤝 Contributing



We welcome contributions! This project is built to help rural communities and government initiatives improve infrastructure management.

Create `.env.development` for local development:**📋 Step-by-Step Checklist**: See [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) for a quick checklist

### How to Contribute

1. Fork the repository```env

2. Create a feature branch (`git checkout -b feature/amazing-feature`)

3. Commit your changes (`git commit -m 'Add amazing feature'`)VITE_WS_URL=ws://localhost:3001**📖 Detailed Guide**: See [`RENDER_DEPLOYMENT.md`](RENDER_DEPLOYMENT.md) for complete instructions

4. Push to the branch (`git push origin feature/amazing-feature`)

5. Open a Pull Request```



---### Quick Start (3 Steps)



## 📧 SupportCreate `.env.production` for deployment:



For questions, issues, or feature requests:```env1. **Deploy Backend** (Render Web Service)

- **Issues**: [GitHub Issues](https://github.com/Abhishekmishra2808/village-digital-twin/issues)

- **Discussions**: [GitHub Discussions](https://github.com/Abhishekmishra2808/village-digital-twin/discussions)VITE_WS_URL=wss://your-backend-url.onrender.com   - Connect GitHub repository



---```   - Root directory: `backend`



<div align="center">   - Build: `npm install`



**Built with ❤️ for smarter, more equitable rural India**### **Backend Configuration**   - Start: `node server.js`



*RuraLens - From Infrastructure Blindness to Digital Foresight*   - Get your backend URL: `https://ruralens-backend.onrender.com`



[Live Demo](https://village-digital-twin.onrender.com) • [Documentation](https://github.com/Abhishekmishra2808/village-digital-twin) • [Report Bug](https://github.com/Abhishekmishra2808/village-digital-twin/issues)Edit `backend/server.js` to change port:



</div>```javascript2. **Update Frontend Configuration**


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
