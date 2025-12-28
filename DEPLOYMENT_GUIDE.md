# 🚀 Deploy Sundarpur Digital Twin to Render

## Complete Deployment Guide

This guide will help you deploy both the backend (WebSocket server) and frontend (React app) to Render.com for FREE!

---

## 📋 Prerequisites

1. **GitHub Account** - Create one at https://github.com
2. **Render Account** - Sign up at https://render.com (use GitHub to sign in)
3. **Git Installed** - Download from https://git-scm.com

---

## 🔧 STEP 1: Prepare Your Code

### 1.1 Initialize Git Repository

Open terminal in your project folder:

```bash
cd "c:\Users\abhis\Desktop\vilage twin"
git init
git add .
git commit -m "Initial commit - Sundarpur Digital Twin"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `sundarpur-digital-twin`
3. Description: `Digital Twin of Sundarpur Village with real-time IoT monitoring`
4. Public or Private: **Public** (recommended for free hosting)
5. Click **Create repository**

### 1.3 Push Code to GitHub

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/sundarpur-digital-twin.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🖥️ STEP 2: Deploy Backend (WebSocket Server)

### 2.1 Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select `sundarpur-digital-twin` repository

### 2.2 Configure Backend Service

**Basic Settings:**
- **Name**: `sundarpur-backend`
- **Region**: Singapore (or closest to you)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables:**
Click **Advanced** → **Add Environment Variable**

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

**Instance Type:**
- Select **Free** (0 cost!)

### 2.3 Deploy Backend

1. Click **Create Web Service**
2. Wait 3-5 minutes for deployment
3. Once deployed, note your backend URL:
   ```
   https://sundarpur-backend.onrender.com
   ```

### 2.4 Get WebSocket URL

Your WebSocket URL will be:
```
wss://sundarpur-backend.onrender.com
```

**Important**: Note this URL - you'll need it for frontend!

---

## 🎨 STEP 3: Deploy Frontend (React App)

### 3.1 Update Environment Variables

Before deploying frontend, update `.env.production`:

```bash
VITE_WS_URL=wss://sundarpur-backend.onrender.com
VITE_API_URL=https://sundarpur-backend.onrender.com
```

**Commit and push changes:**

```bash
git add .
git commit -m "Update production WebSocket URL"
git push
```

### 3.2 Create Frontend Service on Render

1. Click **New +** → **Static Site**
2. Connect same GitHub repository
3. Select `sundarpur-digital-twin`

### 3.3 Configure Frontend Service

**Basic Settings:**
- **Name**: `sundarpur-frontend`
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
Click **Advanced** → **Add Environment Variable**

| Key | Value |
|-----|-------|
| `VITE_WS_URL` | `wss://sundarpur-backend.onrender.com` |
| `VITE_API_URL` | `https://sundarpur-backend.onrender.com` |

### 3.4 Deploy Frontend

1. Click **Create Static Site**
2. Wait 5-7 minutes for deployment
3. Your app will be live at:
   ```
   https://sundarpur-frontend.onrender.com
   ```

---

## 🔄 STEP 4: Update Sensor Simulator

The sensor simulator (`sensor-simulator.html`) needs to connect to your deployed backend.

### 4.1 Update WebSocket URL in Simulator

Open `sensor-simulator.html` and find this line (around line 340):

```javascript
ws = new WebSocket('ws://localhost:3001');
```

**Replace with:**

```javascript
ws = new WebSocket('wss://sundarpur-backend.onrender.com');
```

### 4.2 Host Sensor Simulator

**Option 1: Deploy as separate static site on Render**
1. Create new folder: `sensor-control`
2. Move `sensor-simulator.html` there and rename to `index.html`
3. Deploy as Static Site on Render

**Option 2: Use GitHub Pages**
1. Create `gh-pages` branch
2. Push `sensor-simulator.html` (renamed to `index.html`)
3. Enable GitHub Pages in repository settings

**Option 3: Keep it local**
- Just open the updated `sensor-simulator.html` file in browser
- It will connect to your deployed backend

---

## ✅ STEP 5: Verify Deployment

### 5.1 Test Backend

Open browser and go to:
```
https://sundarpur-backend.onrender.com
```

You should see: "Sundarpur Digital Twin Server"

### 5.2 Test Frontend

1. Go to: `https://sundarpur-frontend.onrender.com`
2. You should see the login page
3. Login with: `demo` / `demo123`
4. Check WebSocket status in top-right (should show "Connected")

### 5.3 Test Full Functionality

1. Click on map markers - should work perfectly
2. Navigate to different views
3. Check real-time updates
4. Open sensor simulator and control sensors
5. Verify main dashboard updates in real-time

---

## 🔧 Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → sundarpur-backend → Logs
- Verify `package.json` has correct dependencies
- Check `NODE_ENV` is set to `production`

### Frontend can't connect to WebSocket
- Verify `VITE_WS_URL` environment variable is correct
- Check it's `wss://` (not `ws://`) for production
- Verify backend is running and accessible

### Build fails
- Check build logs for errors
- Verify all dependencies are in `package.json`
- Make sure `vite.config.ts` is correct

### Slow performance
- Free tier on Render spins down after 15 minutes of inactivity
- First load after inactivity will be slow (30-60 seconds)
- Consider upgrading to paid tier for always-on service

---

## 💰 Cost Breakdown

### Render Free Tier
- **Backend**: FREE (750 hours/month)
- **Frontend**: FREE (100 GB bandwidth/month)
- **Total**: $0/month! 🎉

### Limitations
- Backend spins down after 15 min inactivity
- 750 hours/month backend runtime
- 100 GB/month bandwidth for frontend

### Upgrade Options (Optional)
If you need 24/7 uptime:
- **Starter Plan**: $7/month per service
- **Always on** - no spin down
- Better performance

---

## 🎯 Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Buy domain from Namecheap, GoDaddy, etc.
2. In Render Dashboard:
   - Go to your frontend service
   - Click **Settings**
   - Scroll to **Custom Domains**
   - Click **Add Custom Domain**
   - Enter your domain (e.g., `sundarpur.yourdomain.com`)
3. Add DNS records as instructed by Render
4. Wait for SSL certificate (automatic, free)

---

## 📱 Share Your Project

Once deployed, you can share these URLs:

- **Main App**: `https://sundarpur-frontend.onrender.com`
- **Backend API**: `https://sundarpur-backend.onrender.com`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/sundarpur-digital-twin`

Perfect for:
- Hackathon judges
- Portfolio
- Job applications
- Sharing with friends

---

## 🔄 Update Your Deployed App

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Render will **automatically redeploy** both services! 🚀

---

## 🎉 You're Live!

Your Sundarpur Digital Twin is now:
- ✅ Hosted online 24/7
- ✅ Accessible from anywhere
- ✅ Real-time WebSocket working
- ✅ FREE to run
- ✅ Auto-deploys on push

**Congratulations!** 🎊

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Support**: https://render.com/support
- **Community**: https://community.render.com

---

## 🔗 Quick Links After Deployment

Save these for easy access:

- **Live App**: https://sundarpur-frontend.onrender.com
- **Backend**: https://sundarpur-backend.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repo**: https://github.com/YOUR_USERNAME/sundarpur-digital-twin

---

**Happy Deploying!** 🚀
