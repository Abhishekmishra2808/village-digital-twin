# 🚀 Quick Render Deployment Checklist

## Before You Start
- [ ] Code pushed to GitHub
- [ ] Render account created (free at render.com)
- [ ] GitHub account connected to Render

---

## Step 1: Deploy Backend (5 minutes)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Connect your repository**: `Abhishekmishra2808/village-digital-twin`
4. **Configure**:
   ```
   Name:              ruralens-backend
   Region:            Singapore (or closest to you)
   Branch:            main
   Root Directory:    backend
   Runtime:           Node
   Build Command:     npm install
   Start Command:     node server.js
   Instance Type:     Free
   ```
5. **Add Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
6. **Click "Create Web Service"**
7. **Wait for deployment** (2-5 minutes)
8. **Copy your backend URL**: e.g., `https://ruralens-backend.onrender.com`

✅ Backend Status: [ ] Deployed

---

## Step 2: Update Frontend Configuration

### Option A: Create .env.production file

1. **Create file**: `.env.production`
2. **Add your backend URL**:
   ```env
   VITE_WS_URL=wss://YOUR-BACKEND-URL.onrender.com
   ```
   Example: `VITE_WS_URL=wss://ruralens-backend.onrender.com`

3. **Commit and push**:
   ```bash
   git add .env.production
   git commit -m "Add production WebSocket URL"
   git push origin main
   ```

✅ Configuration Updated: [ ] Yes

---

## Step 3: Deploy Frontend (7 minutes)

1. **In Render Dashboard, click "New +" → "Static Site"**
2. **Connect same repository**: `Abhishekmishra2808/village-digital-twin`
3. **Configure**:
   ```
   Name:              ruralens-frontend
   Branch:            main
   Root Directory:    (leave empty)
   Build Command:     npm install && npm run build
   Publish Directory: dist
   ```
4. **Add Environment Variable**:
   - `VITE_WS_URL` = `wss://YOUR-BACKEND-URL.onrender.com`
   
5. **Click "Create Static Site"**
6. **Wait for deployment** (3-7 minutes)
7. **Get your frontend URL**: e.g., `https://ruralens-frontend.onrender.com`

✅ Frontend Status: [ ] Deployed

---

## Step 4: Update Sensor Simulator (IMPORTANT!)

The sensor-simulator.html is already configured to auto-detect the environment, but you need to update the production URL:

1. **Edit `sensor-simulator.html`**
2. **Find line ~664** (in `connectWebSocket()` function)
3. **Replace this line**:
   ```javascript
   : 'wss://ruralens-backend.onrender.com';  // Replace with your Render backend URL
   ```
   With your actual backend URL from Step 1

4. **Commit and push**:
   ```bash
   git add sensor-simulator.html
   git commit -m "Update sensor simulator production URL"
   git push origin main
   ```

✅ Simulator Updated: [ ] Yes

---

## Step 5: Test Everything

### Test Backend:
- [ ] Visit backend URL in browser (should see "RuralLens Backend")
- [ ] Status should be "Live"
- [ ] No errors in Render logs

### Test Frontend:
- [ ] Open frontend URL: `https://your-frontend.onrender.com`
- [ ] Dashboard loads correctly
- [ ] 3D map renders
- [ ] Status bar shows "Connected"
- [ ] Real-time data updates visible
- [ ] Try switching views (Water, Power, Traffic, etc.)
- [ ] Check browser console for errors

### Test Sensor Simulator:
- [ ] Open `sensor-simulator.html` (can deploy to same static site or separately)
- [ ] Status shows "Connected to Production Server"
- [ ] All tabs load (Overview, Water, Power, Sensors, Traffic, Environment, Flood)
- [ ] Sliders adjust values
- [ ] Scenario buttons work
- [ ] Changes reflect in main app

---

## Common Issues & Quick Fixes

### ❌ "WebSocket connection failed"
**Fix**: 
- Check backend URL starts with `wss://` (not `ws://`)
- Verify backend is deployed and running
- Check environment variable `VITE_WS_URL` is set correctly

### ❌ "Build failed"
**Fix**:
- Check Render build logs for specific error
- Ensure all dependencies in `package.json`
- Try building locally: `npm run build`

### ❌ "Blank page after deployment"
**Fix**:
- Check browser console for errors
- Verify `dist` is the publish directory
- Check environment variables are set

### ⚠️ "Backend takes long to respond"
**Info**: Free tier sleeps after 15 min inactivity
- First request takes 30-60 seconds (cold start)
- This is normal for free tier
- Consider upgrading to paid tier for 24/7 uptime

---

## Your Deployed URLs

After successful deployment, save these URLs:

1. **Backend (API/WebSocket)**:
   - URL: `https://_____________________________.onrender.com`
   - WebSocket: `wss://_____________________________.onrender.com`

2. **Frontend (Main App)**:
   - URL: `https://_____________________________.onrender.com`

3. **Sensor Simulator**:
   - URL: `https://_____________________________.onrender.com/sensor-simulator.html`
   - (or separate deployment)

---

## 🎉 Deployment Complete!

Your RuralLens Digital Twin is now live and accessible from anywhere!

### Next Steps:
- [ ] Share the frontend URL with your team/users
- [ ] Monitor Render dashboard for errors
- [ ] Set up custom domain (optional)
- [ ] Consider setting up UptimeRobot to keep backend awake (optional)

### Auto-Deploy is Enabled!
Every time you push to GitHub `main` branch, Render will automatically rebuild and redeploy. No manual steps needed! 🚀

---

## Need Help?

📚 **Full Guide**: See `RENDER_DEPLOYMENT.md` for detailed instructions

🐛 **Troubleshooting**: Check Render logs in dashboard

💬 **Render Docs**: https://render.com/docs

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Status**: [ ] Backend Live  [ ] Frontend Live  [ ] All Tests Passed ✅
