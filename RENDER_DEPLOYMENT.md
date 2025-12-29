# 🚀 Deploy RuralLens to Render

## Complete Step-by-Step Deployment Guide

### Prerequisites
- ✅ GitHub account
- ✅ Render account (free at [render.com](https://render.com))
- ✅ Your code pushed to GitHub repository

---

## Part 1: Deploy Backend (WebSocket Server) 🔌

### Step 1: Prepare Backend for Deployment

1. **Update `backend/render.yaml`** (already configured):
   - Service name: `sundarpur-backend`
   - Type: Web Service
   - Runtime: Node.js
   - Port: 10000

### Step 2: Deploy Backend on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click **"New +"** button → Select **"Web Service"**
   - Connect your GitHub repository: `Abhishekmishra2808/village-digital-twin`
   - Click **"Connect"**

3. **Configure Backend Service**
   ```
   Name:              ruralens-backend
   Region:            Singapore (or nearest to you)
   Branch:            main
   Root Directory:    backend
   Runtime:           Node
   Build Command:     npm install
   Start Command:     node server.js
   Instance Type:     Free
   ```

4. **Add Environment Variables**
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add:
     ```
     NODE_ENV = production
     PORT = 10000
     ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 2-5 minutes for deployment
   - **Copy your backend URL**: e.g., `https://ruralens-backend.onrender.com`

---

## Part 2: Deploy Frontend (React App) 🌐

### Step 1: Update Frontend Configuration

1. **Update WebSocket URL in Frontend Code**
   
   You need to update the WebSocket connection to use your deployed backend URL.

   **Option A: Using Environment Variables (Recommended)**
   
   Create `c:\Users\abhis\Desktop\Projects\vilage twin\.env.production`:
   ```env
   VITE_WS_URL=wss://ruralens-backend.onrender.com
   ```

   **Option B: Direct Update**
   
   Update `src/hooks/useWebSocket.ts`:
   ```typescript
   const WS_URL = import.meta.env.VITE_WS_URL || 'wss://ruralens-backend.onrender.com';
   ```

2. **Add Build Script** (already in package.json ✅)
   ```json
   "build": "tsc && vite build"
   ```

### Step 2: Deploy Frontend on Render

1. **Create New Static Site**
   - In Render Dashboard, click **"New +"** → **"Static Site"**
   - Connect same repository: `Abhishekmishra2808/village-digital-twin`

2. **Configure Frontend Service**
   ```
   Name:              ruralens-frontend
   Branch:            main
   Root Directory:    (leave empty - root of repo)
   Build Command:     npm install && npm run build
   Publish Directory: dist
   ```

3. **Add Environment Variables** (if using .env.production)
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add:
     ```
     VITE_WS_URL = wss://ruralens-backend.onrender.com
     ```
     (Replace with your actual backend URL from Part 1)

4. **Deploy**
   - Click **"Create Static Site"**
   - Wait 3-7 minutes for deployment
   - **Your frontend URL**: e.g., `https://ruralens-frontend.onrender.com`

---

## Part 3: Configure WebSocket Connection 🔗

### Update Frontend to Use Production WebSocket

1. **Edit `src/hooks/useWebSocket.ts`**:
   ```typescript
   const WS_URL = import.meta.env.PROD 
     ? 'wss://ruralens-backend.onrender.com'  // Production
     : 'ws://localhost:3001';                  // Local development
   ```

2. **Commit and push changes**:
   ```bash
   git add .
   git commit -m "Configure production WebSocket URL"
   git push origin main
   ```

3. **Render will auto-redeploy** (if auto-deploy is enabled)

---

## Part 4: Update Sensor Simulator 🎛️

1. **Edit `sensor-simulator.html`**:
   
   Find the WebSocket connection line and update it:
   ```javascript
   // Change this:
   ws = new WebSocket('ws://localhost:3001');
   
   // To this (with your backend URL):
   const WS_URL = window.location.hostname === 'localhost'
     ? 'ws://localhost:3001'
     : 'wss://ruralens-backend.onrender.com';
   
   ws = new WebSocket(WS_URL);
   ```

2. **Deploy sensor-simulator.html**:
   - You can host it on the same static site
   - Or use a separate static hosting (Netlify, Vercel, GitHub Pages)

---

## 🎯 Quick Deploy Commands

### Initial Setup
```bash
# 1. Make sure all changes are committed
git status
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. Your code is now on GitHub and ready for Render!
```

### After Each Update
```bash
git add .
git commit -m "Update: describe your changes"
git push origin main
# Render auto-deploys! 🚀
```

---

## 📋 Deployment Checklist

### Backend Deployment ✓
- [ ] Backend deployed on Render
- [ ] WebSocket server running on port 10000
- [ ] Environment variables set (NODE_ENV, PORT)
- [ ] Backend URL copied (e.g., `https://ruralens-backend.onrender.com`)
- [ ] Test WebSocket: Visit backend URL in browser (should see "RuralLens Backend")

### Frontend Deployment ✓
- [ ] Frontend deployed as Static Site
- [ ] Build command: `npm install && npm run build`
- [ ] Publish directory: `dist`
- [ ] WebSocket URL updated to production backend
- [ ] Environment variables configured
- [ ] Frontend accessible in browser

### Testing ✓
- [ ] Open frontend URL in browser
- [ ] Dashboard loads correctly
- [ ] 3D map renders
- [ ] WebSocket status shows "Connected"
- [ ] Real-time data updates working
- [ ] Sensor simulator connects successfully

---

## 🔧 Common Issues & Solutions

### Issue 1: WebSocket Connection Failed
**Problem**: Frontend shows "Disconnected"

**Solution**:
- Check backend URL is correct (starts with `wss://` not `ws://`)
- Ensure backend is deployed and running
- Check browser console for errors
- Verify CORS is enabled on backend

### Issue 2: Build Failed on Render
**Problem**: "Build failed" error

**Solution**:
- Check Node version in `package.json` engines
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors
- Try building locally: `npm run build`

### Issue 3: Blank Page After Deployment
**Problem**: Frontend loads but shows blank page

**Solution**:
- Check browser console for errors
- Verify `dist` folder is published directory
- Check all assets loaded (Network tab)
- Ensure environment variables are set

### Issue 4: Free Tier Limitations
**Problem**: Backend sleeps after 15 minutes of inactivity

**Solution**:
- Use a service like UptimeRobot to ping your backend every 14 minutes
- Or upgrade to paid tier ($7/month for 24/7 uptime)
- Accept 30-60 second cold start on first request

---

## 🌐 Your Live URLs

After deployment, you'll have:

1. **Backend (WebSocket Server)**
   - URL: `https://ruralens-backend.onrender.com`
   - WebSocket: `wss://ruralens-backend.onrender.com`

2. **Frontend (React App)**
   - URL: `https://ruralens-frontend.onrender.com`
   - Main dashboard and all views

3. **Sensor Simulator**
   - Can be hosted on same static site
   - Or deploy separately

---

## 🎨 Custom Domain (Optional)

To use your own domain (e.g., `ruralens.com`):

1. **In Render Dashboard**:
   - Go to your Static Site settings
   - Click **"Custom Domain"**
   - Add your domain

2. **In Your Domain Registrar**:
   - Add CNAME record pointing to Render's URL
   - Wait for DNS propagation (can take 24-48 hours)

---

## 📊 Monitoring & Logs

### View Logs:
1. Go to Render Dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time logs and errors

### Monitor Performance:
- Render provides basic metrics (free tier)
- See request count, response times
- Monitor for crashes/errors

---

## 💡 Pro Tips

1. **Enable Auto-Deploy**:
   - Render auto-deploys when you push to GitHub
   - No manual intervention needed

2. **Use Environment Variables**:
   - Never hardcode URLs or secrets
   - Use `.env.production` for production config

3. **Test Locally First**:
   ```bash
   npm run build
   npm run preview  # Test production build locally
   ```

4. **Keep Free Tier Active**:
   - Free tier services sleep after 15 min inactivity
   - First request takes 30-60 seconds to wake up
   - Use UptimeRobot to keep it awake (optional)

5. **Monitor Build Times**:
   - Frontend: 3-7 minutes
   - Backend: 2-5 minutes
   - Both have 500 build minutes/month on free tier

---

## 🚀 Ready to Deploy?

### Quick Start (5 Minutes):

1. **Deploy Backend**:
   - New Web Service → Connect GitHub → Configure → Deploy
   - Copy backend URL

2. **Update Frontend**:
   - Edit WebSocket URL with backend URL
   - Commit and push

3. **Deploy Frontend**:
   - New Static Site → Connect GitHub → Configure → Deploy
   - Done! ✅

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: Create issue in your repository

---

## ✅ Post-Deployment

After successful deployment:

1. **Share your links**:
   - Frontend: Your main application URL
   - Backend: WebSocket server URL

2. **Test all features**:
   - Dashboard, 3D Map, Analytics
   - Water, Power, Traffic views
   - Real-time updates
   - Sensor simulator

3. **Monitor performance**:
   - Check logs regularly
   - Monitor for errors
   - Track response times

**Congratulations! Your RuralLens application is now live! 🎉**
