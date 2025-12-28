# Sundarpur Digital Twin - Project Setup Complete! 🎉

## ✅ Installation Complete

All files have been created. Now follow these steps to run the application:

### Step 1: Install Frontend Dependencies

Open a terminal and run:

```bash
npm install
```

This will install all required packages:
- React, TypeScript, Vite
- MapLibre GL JS (for 3D maps)
- Zustand (state management)
- Chart.js (data visualization)
- Tailwind CSS (styling)
- And more...

### Step 2: Install Backend Dependencies

Open a new terminal, navigate to the backend folder, and run:

```bash
cd backend
npm install
```

This installs:
- Express (HTTP server)
- ws (WebSocket library)
- cors (cross-origin support)

### Step 3: Start the Backend Server

In the backend terminal, run:

```bash
npm start
```

You should see:
```
🚀 Sundarpur Digital Twin Server running on port 3001
📡 WebSocket server ready at ws://localhost:3001
```

### Step 4: Start the Frontend

In the first terminal (root directory), run:

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 5: Open Your Browser

Navigate to: **http://localhost:3000**

## 🎯 What You'll See

### 1. Dashboard (Default View)
- 4 KPI cards showing infrastructure health
- Live charts for water and power infrastructure
- Activity feed with real-time events

### 2. 3D Map View
- Click "Water Infrastructure" or other menu items
- Interactive 3D terrain map
- Click markers to see asset details
- Blue water droplets = water tanks
- Diamond shapes = power transformers
- Small circles = IoT sensors

### 3. Admin Controls
- Click the gear icon (bottom-right)
- Adjust sensor values with sliders
- Simulate scenarios:
  - Water Crisis
  - Power Outage
  - Heavy Rainfall

## 🎮 Demo Instructions

### Test Real-Time Updates

1. Watch the Activity Feed - new events appear every 5 seconds
2. Check KPI cards - numbers update automatically
3. Charts animate smoothly with new data

### Test Asset Interaction

1. Click any water tank marker (💧)
2. Right panel opens with details
3. See live water level gauge
4. View capacity, flow rate, maintenance info

### Test Admin Controls

1. Click gear icon (bottom-right)
2. Move "Central Tank Level" slider
3. Watch the corresponding marker change color
4. Check Activity Feed for update event

### Test Scenario Simulations

1. Open Admin Controls
2. Click "Simulate Water Crisis"
3. Watch all tank levels drop
4. Alert appears in Activity Feed
5. KPI cards update to show critical status

## 📊 Understanding the Data

### Water Tanks (5 total)
- **Green** = Good (>50% full)
- **Yellow** = Warning (30-50% full)
- **Red** = Critical (<30% full)

### Power Nodes (12 total)
- **Green** = Good (<80% load)
- **Yellow** = Warning (80-95% load)
- **Red** = Critical (>95% load)

### Sensors (18 total)
- Soil Moisture
- Air Quality (AQI)
- Weather Station
- Water Quality
- Traffic Counters
- Noise Monitors
- And more...

## 🔍 Key Features to Explore

### Navigation
- ✅ Left sidebar - switch between views
- ✅ Map controls - zoom, pan, rotate
- ✅ Click markers - view details
- ✅ Collapsible sidebar (arrow button)

### Data Visualization
- ✅ Live updating charts
- ✅ Color-coded status indicators
- ✅ Animated progress bars
- ✅ Real-time activity feed

### Interactive Elements
- ✅ Hover over markers for tooltips
- ✅ Click buildings for details
- ✅ Adjust admin controls
- ✅ Trigger scenario simulations

## 🐛 Troubleshooting

### "Cannot find module" errors
- Run `npm install` in root directory
- Run `npm install` in backend directory

### WebSocket connection failed
- Make sure backend server is running (Step 3)
- Check that port 3001 is not in use
- Look for "✅ WebSocket connected" in browser console

### Map not loading
- Wait a few seconds for tiles to download
- Check internet connection (needs OpenStreetMap tiles)
- Look for errors in browser console (F12)

### Slow performance
- Close other browser tabs
- Use Chrome or Edge (better WebGL support)
- Reduce number of open applications

## 📱 Browser Compatibility

**Recommended Browsers:**
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

**Required Features:**
- WebGL 2.0
- WebSocket support
- ES2020+ JavaScript

## 🎨 Customization Tips

### Change Village Coordinates

Edit `src/components/Map3D/Map3D.tsx`:
```typescript
const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204];
```

### Add More Sensors

Edit `backend/utils/dataGenerator.js` and add to `sensors` array.

### Change Update Frequency

Edit `backend/server.js`:
```javascript
setInterval(() => {
  // ... update code
}, 5000); // Change 5000 (5 seconds) to your preferred interval
```

### Modify Color Scheme

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#1e3a8a',  // Change these
  secondary: '#0d9488',
  // ... etc
}
```

## 📚 Next Steps

1. ✅ Explore all menu items (Water, Power, Roads, etc.)
2. ✅ Click different markers on the map
3. ✅ Test admin controls and scenarios
4. ✅ Watch Activity Feed for live updates
5. ✅ Check charts for data trends

## 🚀 Ready for Deployment?

See the "Deployment" section in `README.md` for instructions on deploying to:
- Vercel (Frontend)
- Render.com (Backend)

## 💡 Pro Tips

- **Performance**: Close admin panel when not needed
- **Demo Mode**: Use scenario simulations for presentations
- **Data Export**: Open browser console and type `localStorage` to see cached data
- **Mobile View**: Resize browser window to see responsive design

## 🎉 Enjoy Your Digital Twin!

You now have a fully functional village infrastructure management system with:
- Real-time 3D visualization
- Live sensor monitoring
- Interactive dashboards
- Admin controls
- Scenario simulations

Perfect for:
- Smart city demonstrations
- Infrastructure planning
- Community engagement
- Educational purposes
- IoT project showcases

---

**Need Help?**
- Check browser console (F12) for errors
- Review `README.md` for detailed docs
- Ensure both frontend and backend are running

**Happy Monitoring! 🏘️📊🗺️**
