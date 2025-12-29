# 🚀 Render Deployment - Quick Reference Card

## 📍 URLs & Access

### Render Dashboard
🔗 https://dashboard.render.com

### Your Repository
🔗 https://github.com/Abhishekmishra2808/village-digital-twin

---

## ⚙️ Backend Configuration

```yaml
Service Type:      Web Service
Name:              ruralens-backend
Region:            Singapore (or nearest)
Branch:            main
Root Directory:    backend
Runtime:           Node
Build Command:     npm install
Start Command:     node server.js
Instance Type:     Free

Environment Variables:
  NODE_ENV = production
  PORT = 10000
```

**Expected URL**: `https://ruralens-backend.onrender.com`

---

## 🌐 Frontend Configuration

```yaml
Service Type:      Static Site
Name:              ruralens-frontend
Branch:            main
Root Directory:    (empty - root of repo)
Build Command:     npm install && npm run build
Publish Directory: dist

Environment Variables:
  VITE_WS_URL = wss://ruralens-backend.onrender.com
```

**Expected URL**: `https://ruralens-frontend.onrender.com`

---

## 📝 Deployment Order

1. ✅ Deploy **Backend** first (get the URL)
2. ✅ Update **Frontend** config with backend URL
3. ✅ Deploy **Frontend**
4. ✅ Test everything

---

## 🔧 Common Commands

### Local Development
```bash
# Start backend
cd backend
npm start

# Start frontend (new terminal)
npm run dev

# Open sensor simulator
# Open sensor-simulator.html in browser
```

### Production Build Test
```bash
# Test production build locally
npm run build
npm run preview
```

### Git Deploy
```bash
# Push changes to trigger auto-deploy
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys! ✨
```

---

## 🐛 Troubleshooting Quick Fixes

### WebSocket Not Connecting
```bash
# Check these:
1. Backend URL starts with wss:// (not ws://)
2. Backend service is running (green status in Render)
3. VITE_WS_URL environment variable is set
4. Browser console for specific errors
```

### Build Failed
```bash
# Try locally first:
npm run build

# Check:
1. All dependencies in package.json
2. Node version matches (18+)
3. Build logs in Render for errors
```

### Blank Page After Deploy
```bash
# Check:
1. Browser console for errors
2. Publish directory is "dist"
3. Environment variables set correctly
4. Assets loaded (Network tab)
```

### Backend Slow/Timeout
```
This is NORMAL on free tier!
- Backend sleeps after 15 min inactivity
- First request: 30-60 sec cold start
- Solution: Upgrade to paid tier OR
  Use UptimeRobot to ping every 14 min
```

---

## 📊 Free Tier Limits

| Resource | Limit |
|----------|-------|
| Build Minutes | 500/month |
| Bandwidth | 100GB/month |
| Services | Unlimited |
| Sleep After | 15 min inactivity |
| Cold Start | 30-60 seconds |

**Upgrade**: $7/month for 24/7 uptime

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed & running
- [ ] Backend URL copied
- [ ] `.env.production` created with backend URL
- [ ] Frontend deployed
- [ ] Frontend URL accessible
- [ ] WebSocket shows "Connected"
- [ ] Real-time data updating
- [ ] All views working (Dashboard, Map, Water, Power, etc.)
- [ ] Sensor simulator updated with production URL
- [ ] URLs saved & shared

---

## 📞 Help & Resources

| Resource | Link |
|----------|------|
| Full Guide | `RENDER_DEPLOYMENT.md` |
| Checklist | `DEPLOYMENT_CHECKLIST.md` |
| Render Docs | https://render.com/docs |
| Render Community | https://community.render.com |

---

## 🎯 One-Liner Deploy

"Deploy backend → Copy URL → Update frontend config → Deploy frontend → Done!"

---

**Last Updated**: November 1, 2025
**Version**: 1.0.0
**Status**: Ready for Production 🚀
