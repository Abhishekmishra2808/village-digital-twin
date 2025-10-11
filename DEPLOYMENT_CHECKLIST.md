# ⚡ Quick Deployment Checklist

## Before You Start
- [ ] GitHub account created
- [ ] Render account created (sign in with GitHub)
- [ ] Git installed on computer

---

## Backend Deployment

### Step 1: GitHub
- [ ] `git init` in project folder
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`
- [ ] Create repo on GitHub: `sundarpur-digital-twin`
- [ ] `git remote add origin <your-repo-url>`
- [ ] `git push -u origin main`

### Step 2: Render Backend
- [ ] Go to https://dashboard.render.com
- [ ] Click **New +** → **Web Service**
- [ ] Connect GitHub repo
- [ ] Configure:
  - Name: `sundarpur-backend`
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `node server.js`
  - Environment: `NODE_ENV=production`
- [ ] Click **Create Web Service**
- [ ] Wait for deployment (3-5 min)
- [ ] Copy backend URL: `https://sundarpur-backend.onrender.com`

---

## Frontend Deployment

### Step 3: Update Production Config
- [ ] Edit `.env.production`:
  ```
  VITE_WS_URL=wss://sundarpur-backend.onrender.com
  VITE_API_URL=https://sundarpur-backend.onrender.com
  ```
- [ ] `git add .`
- [ ] `git commit -m "Update production URLs"`
- [ ] `git push`

### Step 4: Render Frontend
- [ ] Click **New +** → **Static Site**
- [ ] Connect same GitHub repo
- [ ] Configure:
  - Name: `sundarpur-frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Environment Variables:
    - `VITE_WS_URL=wss://sundarpur-backend.onrender.com`
    - `VITE_API_URL=https://sundarpur-backend.onrender.com`
- [ ] Click **Create Static Site**
- [ ] Wait for deployment (5-7 min)
- [ ] Copy frontend URL: `https://sundarpur-frontend.onrender.com`

---

## Testing

### Step 5: Verify Everything Works
- [ ] Open frontend URL in browser
- [ ] Login with `demo` / `demo123`
- [ ] Check "Connected" status in top-right
- [ ] Click map markers (should work!)
- [ ] Navigate between views
- [ ] Open sensor simulator (update WebSocket URL first)
- [ ] Test real-time sync

---

## Sensor Simulator (Optional)

### Step 6: Update Simulator
- [ ] Open `sensor-simulator.html`
- [ ] Find: `ws = new WebSocket('ws://localhost:3001')`
- [ ] Replace with: `ws = new WebSocket('wss://sundarpur-backend.onrender.com')`
- [ ] Save and open in browser
- [ ] Verify connection to deployed backend

---

## 🎉 Done!

Your app is now live at:
- **Frontend**: https://sundarpur-frontend.onrender.com
- **Backend**: https://sundarpur-backend.onrender.com

---

## Quick Commands Reference

```bash
# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/sundarpur-digital-twin.git
git push -u origin main

# Update after changes
git add .
git commit -m "Your change description"
git push
```

---

## Important URLs

- **Render Dashboard**: https://dashboard.render.com
- **GitHub**: https://github.com
- **Your Repo**: https://github.com/YOUR_USERNAME/sundarpur-digital-twin

---

**Total Time**: 15-20 minutes
**Cost**: FREE! 🎉
