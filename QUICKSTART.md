# Quick Start Guide

## 🚀 Running the Application

### Option 1: Using Batch Files (Windows)

**Step 1:** Double-click `start-backend.bat`
- This starts the WebSocket server
- You should see: "WebSocket server ready at ws://localhost:3001"

**Step 2:** Double-click `start-frontend.bat`
- This starts the React development server
- Browser will auto-open at http://localhost:3000

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✅ Verification

You should see:
- ✅ Backend: "WebSocket server ready at ws://localhost:3001"
- ✅ Frontend: "Local: http://localhost:3000/"
- ✅ Browser: Dashboard with KPI cards and live data
- ✅ Status Bar: "WebSocket Connected" (green dot)

## 🎯 First Actions

1. **Check Connection**: Look for green dot in top-right (WebSocket Connected)
2. **View Dashboard**: See KPI cards updating
3. **Click Menu Items**: Try "Water Infrastructure" or "Power Grid"
4. **Click a Marker**: On the 3D map to see asset details
5. **Open Admin Panel**: Click gear icon (bottom-right)

## 🐛 Troubleshooting

**Port Already in Use:**
- Kill process on port 3001 or 3000
- Or change port in `backend/server.js` and `vite.config.ts`

**WebSocket Not Connecting:**
- Make sure backend started successfully
- Check browser console for errors
- Verify `ws://localhost:3001` is accessible

**Map Not Loading:**
- Wait 5-10 seconds for tiles to load
- Check internet connection (needs OpenStreetMap)
- Try refreshing the page

## 📊 Test Features

- ✅ Watch Activity Feed update every 5 seconds
- ✅ Click water tank markers (💧) to view details
- ✅ Click power nodes (◆) to view transformer info
- ✅ Click sensors (●) to view readings
- ✅ Use admin controls to adjust values
- ✅ Try scenario simulations (Water Crisis, Power Outage, etc.)

---

**Ready!** Your Sundarpur Digital Twin is now running! 🎉
