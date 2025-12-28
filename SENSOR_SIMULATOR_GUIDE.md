# 📡 Sensor Simulator - Updated & Beautiful!

## ✅ What's New

### 🎨 Modern Dark Theme
- Matches the main dashboard design perfectly
- Beautiful gradient background (#0f172a → #1e293b → #334155)
- Glass morphism effects throughout
- Smooth animations and hover effects

### 🔗 WebSocket Integration
- **Already Connected** to your backend server (ws://localhost:3001)
- Real-time synchronization with the main dashboard
- Auto-reconnect if connection lost
- Live status indicator

---

## 🚀 How to Use

### 1. **Open Sensor Simulator**
```
File: sensor-simulator.html
Location: c:\Users\abhis\Desktop\vilage twin\sensor-simulator.html
```

**Open it in browser:**
- Right-click the file
- Open with Chrome/Edge/Firefox

### 2. **Start Backend Server** (if not running)
```bash
cd backend
node server.js
```

### 3. **Open Main Dashboard**
```
http://localhost:3000
```

---

## 🎮 Control Features

### Quick Scenarios (One-Click Demo)
1. **💧 Water Crisis** - Drops all tank levels to critical
2. **⚡ Power Outage** - Simulates overload on transformers
3. **🌧️ Heavy Rainfall** - Increases rain sensors and water levels
4. **🔄 Reset to Normal** - Returns everything to safe levels

### Manual Controls

#### Water Tanks (5 shown)
- Real-time level adjustment (0-100%)
- Color-coded status:
  - Green (>50%): Good
  - Orange (30-50%): Warning
  - Red (<30%): Critical
- Instantly updates main dashboard

#### Power Transformers (8 shown)
- Adjust load (0-capacity kW)
- Real-time temperature display
- Load percentage calculation
- Status indicators

#### IoT Sensors (15 diverse types)
- Soil moisture 🌱
- Air quality 💨
- Weather 🌡️
- Water quality 💧
- Traffic 🚗
- Noise 🔊
- Energy ☀️
- Waste 🗑️
- And more...

---

## 🔄 Real-Time Sync

### How It Works

1. **Simulator → Backend**
   ```javascript
   ws.send({
     type: 'manual_update',
     payload: { category, id, field, value }
   });
   ```

2. **Backend → All Clients**
   - Updates main dashboard instantly
   - Reflects in all connected browsers
   - Shows on map markers
   - Updates KPI cards

3. **Dashboard → Simulator**
   - Automatic data sync
   - Shows current system state
   - Updates every second

---

## 🎯 Demo Workflow

### For Hackathon Presentation

1. **Open Both Windows Side-by-Side**
   - Left: Main dashboard (localhost:3000)
   - Right: Sensor simulator

2. **Show Normal Operation**
   - Point out green status indicators
   - Show real-time sensor updates
   - Demonstrate map navigation

3. **Simulate Water Crisis**
   - Click "💧 Water Crisis" button
   - Watch main dashboard alerts appear
   - Show critical status on map
   - Explain crisis detection

4. **Simulate Power Outage**
   - Click "⚡ Power Outage" button
   - Show transformer overload
   - Demonstrate alert notifications
   - Explain predictive analytics

5. **Manual Adjustments**
   - Drag sliders to adjust values
   - Show instant dashboard updates
   - Demonstrate real-time sync
   - Explain IoT integration

6. **Reset to Normal**
   - Click "🔄 Reset to Normal"
   - Show system recovery
   - Back to green status

---

## 📊 Statistics Panel

Shows live metrics:
- **Total Water Tanks**: 5
- **Power Transformers**: 12 (8 shown on map)
- **Active Sensors**: 45 (15 shown on map)
- **Avg Water Level**: Real-time calculation

---

## 🎨 Visual Design

### Color Coding

**Status Indicators:**
- 🟢 Green: Good/Normal operation
- 🟡 Orange: Warning/Attention needed
- 🔴 Red: Critical/Immediate action

**Sliders:**
- Blue gradient thumbs
- Smooth hover animations
- Glowing effects

**Cards:**
- Glass morphism background
- Subtle borders
- Smooth hover lift
- Modern shadows

---

## 🔧 Technical Details

### WebSocket Connection
```javascript
ws://localhost:3001
```

### Message Types

**Send to Server:**
```javascript
{
  type: 'manual_update',
  payload: { 
    category: 'waterTanks',
    id: 'tank-1',
    field: 'currentLevel',
    value: 45.5
  }
}
```

```javascript
{
  type: 'simulate_scenario',
  scenario: 'water_crisis'
}
```

**Receive from Server:**
```javascript
{
  data: {
    waterTanks: [...],
    powerNodes: [...],
    sensors: [...]
  }
}
```

### Auto-Reconnect
- Checks connection every 5 seconds
- Shows "Disconnected - Reconnecting..." if lost
- Automatic reconnection when server available

---

## 💡 Pro Tips

### For Best Demo Experience

1. **Test Before Demo**
   - Open both windows
   - Test all scenario buttons
   - Try manual adjustments
   - Verify sync works

2. **Positioning**
   - Simulator on secondary monitor
   - Main dashboard on primary screen
   - Or side-by-side windows

3. **Talking Points**
   - "Real-time IoT sensor network"
   - "WebSocket bi-directional communication"
   - "Crisis simulation for disaster management"
   - "Instant alerts and notifications"
   - "Predictive analytics for prevention"

4. **Interactive Demo**
   - Let judges adjust sliders
   - Show immediate updates
   - Demonstrate crisis scenarios
   - Reset to normal at end

---

## 🎉 Features Highlights

✅ **Modern UI** - Matches main dashboard perfectly
✅ **Real-Time Sync** - WebSocket integration
✅ **Quick Scenarios** - One-click crisis simulation
✅ **Manual Control** - Granular sensor adjustments
✅ **Auto-Reconnect** - Resilient connection
✅ **Visual Feedback** - Color-coded status
✅ **Statistics** - Live system metrics
✅ **Professional Design** - Glass morphism effects

---

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd backend
node server.js

# Terminal 2: Start Frontend
npm run dev

# Browser 1: Open Main Dashboard
http://localhost:3000

# Browser 2: Open Sensor Simulator
Open: sensor-simulator.html
```

---

## 🎯 Ready to Demo!

Your sensor simulator now:
- ✅ Looks beautiful with modern dark theme
- ✅ Perfectly synced with main dashboard
- ✅ Easy to use with scenario buttons
- ✅ Professional and impressive
- ✅ Perfect for hackathon demo

**Open sensor-simulator.html in your browser and control your village!** 🎮
