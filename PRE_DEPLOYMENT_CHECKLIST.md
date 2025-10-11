# 🎯 Pre-Deployment Checklist

Run through this checklist BEFORE deploying to catch any issues:

## ✅ Code Preparation

### Backend
- [x] `PORT` uses `process.env.PORT || 3001`
- [x] CORS enabled for all origins
- [x] `package.json` has all dependencies
- [x] `package.json` has `"engines": {"node": ">=18.0.0"}`
- [x] `"type": "module"` in package.json
- [x] No hardcoded localhost URLs

### Frontend  
- [x] WebSocket URL uses environment variable
- [x] `vite-env.d.ts` created for TypeScript
- [x] `.env.production` file created
- [x] Build command: `npm install && npm run build`
- [x] Output directory: `dist`

## ✅ Files Created/Updated

- [x] `backend/package.json` - Added engines field
- [x] `backend/server.js` - Uses PORT env variable
- [x] `backend/README.md` - Created
- [x] `.env.production` - Created with production URLs
- [x] `src/hooks/useWebSocket.ts` - Uses env variable
- [x] `src/vite-env.d.ts` - TypeScript definitions
- [x] `.gitignore` - Created
- [x] `DEPLOYMENT_GUIDE.md` - Complete guide
- [x] `DEPLOYMENT_CHECKLIST.md` - Quick checklist

## ✅ What to Do Now

### 1. Test Locally First
```bash
# Test that env variable works
cd backend
PORT=4000 node server.js
# Should start on port 4000

# Test frontend build
cd ..
npm run build
# Should create dist/ folder
```

### 2. Initialize Git
```bash
git init
git add .
git commit -m "Ready for deployment"
```

### 3. Create GitHub Repo
- Go to https://github.com/new
- Name: `sundarpur-digital-twin`
- Public repository
- Don't initialize with README (you already have one)

### 4. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/sundarpur-digital-twin.git
git branch -M main
git push -u origin main
```

### 5. Deploy Backend on Render
- New Web Service
- Connect GitHub repo
- Root directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Add env: `NODE_ENV=production`

### 6. Deploy Frontend on Render
- New Static Site
- Build: `npm install && npm run build`
- Publish: `dist`
- Add env variables:
  - `VITE_WS_URL=wss://YOUR-BACKEND.onrender.com`
  - `VITE_API_URL=https://YOUR-BACKEND.onrender.com`

## ⚠️ Important Notes

### Backend URL Format
- ✅ Correct: `wss://sundarpur-backend.onrender.com` (WebSocket)
- ❌ Wrong: `ws://sundarpur-backend.onrender.com`
- ✅ Correct: `https://sundarpur-backend.onrender.com` (HTTP)
- ❌ Wrong: `http://sundarpur-backend.onrender.com`

### Free Tier Limitations
- Backend spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month limit on backend
- This is NORMAL for free tier!

### After Deployment
- First load will be slow (backend spinning up)
- Subsequent loads will be fast
- WebSocket will auto-reconnect if disconnected

## 🐛 Common Issues

### Build Fails
**Problem**: `npm run build` fails
**Solution**: 
- Check `package.json` has all dependencies
- Run `npm install` locally first
- Check for TypeScript errors

### WebSocket Won't Connect
**Problem**: "Disconnected" status
**Solution**:
- Verify backend is deployed and running
- Check `VITE_WS_URL` uses `wss://` not `ws://`
- Check backend URL is correct in environment variables

### Map Doesn't Load
**Problem**: Map tiles don't show
**Solution**:
- This is usually fine - OpenStreetMap may be slow
- Markers should still work
- Try refreshing the page

### Sensor Simulator Can't Connect
**Problem**: Simulator shows "Disconnected"
**Solution**:
- Update WebSocket URL in `sensor-simulator.html`
- Use `wss://` for production
- Make sure backend is running

## 📝 Environment Variables Summary

### Backend (.env or Render dashboard)
```
NODE_ENV=production
PORT=10000  (Render sets this automatically)
```

### Frontend (.env.production + Render dashboard)
```
VITE_WS_URL=wss://sundarpur-backend.onrender.com
VITE_API_URL=https://sundarpur-backend.onrender.com
```

## ✅ Final Verification

Before marking as complete:

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Can access frontend URL
- [ ] Can login successfully
- [ ] WebSocket shows "Connected"
- [ ] Map markers are clickable
- [ ] Sensor simulator connects (if deployed)
- [ ] All views work correctly

## 🎉 Success!

Once all checkboxes are ✅, your app is live and accessible from anywhere in the world!

**Share your URLs:**
- Frontend: `https://your-app.onrender.com`
- Backend: `https://your-backend.onrender.com`

---

**Estimated Time**: 15-20 minutes
**Cost**: $0 (FREE tier)
**Difficulty**: Easy (just follow the steps)
