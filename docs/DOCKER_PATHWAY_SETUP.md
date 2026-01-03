# Running Pathway RAG with Docker

## 🐳 Why Docker?

Docker provides the **easiest way** to run Pathway on Windows:

✅ **No WSL2 needed** - Runs directly on Windows
✅ **No Python environment issues** - Everything is containerized
✅ **One command setup** - Just run a script
✅ **Consistent environment** - Works the same everywhere
✅ **Easy updates** - Just pull the latest image

---

## 📋 Prerequisites

### 1. Install Docker Desktop

Download and install from: https://www.docker.com/products/docker-desktop/

**After installation:**
- Open Docker Desktop
- Wait for it to start (whale icon in system tray)
- Keep it running in the background

### 2. Get OpenAI API Key

**Required for vector embeddings:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

---

## 🚀 Quick Start

### Step 1: Navigate to Project

```powershell
cd "C:\Users\abhis\Desktop\Projects\vilage twin\llm-app\templates\question_answering_rag"
```

### Step 2: Configure OpenAI Key

Edit `.env.docker` file:

```bash
# Replace with your actual key
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### Step 3: Start Pathway Server

```powershell
.\start-docker.ps1
```

**Expected output:**
```
🐳 Starting Pathway RAG Server with Docker
✅ Docker is running
🚀 Building and starting container...
✅ Pathway RAG Server started successfully!

📡 Server running at: http://localhost:8000
📡 API Endpoint: http://localhost:8000/v1/pw_ai_answer
```

### Step 4: Update Backend Configuration

Edit `backend\.env`:

```bash
# Change from mock server (port 8080) to Docker Pathway (port 8000)
PATHWAY_MCP_URL=http://localhost:8000/v1/pw_ai_answer
```

### Step 5: Start Your Application

```powershell
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd ..
npm run dev
```

### Step 6: Test It!

1. Open http://localhost:5173
2. Login (admin@village.com / admin123)
3. Click **"Ask AI 🤖"**
4. Ask: "Which schemes are delayed?"

---

## 📊 Managing the Docker Container

### View Logs (Real-time)

```powershell
docker logs -f pathway-rag-server
```

Expected logs:
```
🚀 Starting Real-Time MongoDB Pathway RAG Server
✅ Connected to MongoDB: test
📊 Loaded 6 documents from schemes
🤖 Using Gemini 2.5 Flash for LLM
🌐 Starting REST API server on http://0.0.0.0:8000
```

### Stop the Server

```powershell
.\stop-docker.ps1
```

Or manually:
```powershell
docker-compose -f docker-compose-mongodb.yml down
```

### Restart the Server

```powershell
# Stop and start
.\stop-docker.ps1
.\start-docker.ps1
```

### Check Container Status

```powershell
docker ps
```

You should see:
```
CONTAINER ID   IMAGE                        STATUS         PORTS                    NAMES
abc123...      pathwaycom/pathway:latest    Up 2 minutes   0.0.0.0:8000->8000/tcp   pathway-rag-server
```

---

## 🔧 Troubleshooting

### Issue 1: "Docker is not running"

**Solution:**
1. Open Docker Desktop
2. Wait for it to start (green whale icon in system tray)
3. Run the script again

### Issue 2: "Port 8000 already in use"

**Solution:**
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change the port in docker-compose-mongodb.yml
# Change "8000:8000" to "8001:8000"
```

### Issue 3: "OpenAI API Key not configured"

**Solution:**
1. Edit `.env.docker`
2. Add your OpenAI key: `OPENAI_API_KEY=sk-...`
3. Restart: `.\start-docker.ps1`

### Issue 4: Container keeps restarting

**Check logs:**
```powershell
docker logs pathway-rag-server
```

Common causes:
- Invalid OpenAI API key
- MongoDB connection failed
- Python dependency issue

### Issue 5: "Cannot connect to MongoDB"

The MongoDB URI is already configured in `docker-compose-mongodb.yml`. If it fails:
- Check internet connection
- Verify MongoDB Atlas is accessible
- Check firewall settings

---

## 🔄 Updating Pathway

To get the latest Pathway version:

```powershell
# Pull latest image
docker pull pathwaycom/pathway:latest

# Restart with new image
.\stop-docker.ps1
.\start-docker.ps1
```

---

## 📁 Docker Files Overview

```
question_answering_rag/
├── docker-compose-mongodb.yml   # Docker configuration
├── .env.docker                  # Environment variables
├── start-docker.ps1             # Start script
├── stop-docker.ps1              # Stop script
├── realtime_mongodb_rag.py      # Main RAG application
└── requirements.txt             # Python dependencies
```

---

## 🆚 Docker vs WSL2 Comparison

| Feature | Docker | WSL2 |
|---------|--------|------|
| **Setup Time** | ⚡ 5 minutes | ⏱️ 20 minutes |
| **Complexity** | ✅ Simple | ⚠️ Complex |
| **Windows Support** | ✅ Native | ⚠️ Requires WSL2 |
| **Updates** | ✅ One command | ⚠️ Manual |
| **Isolation** | ✅ Full | ⚠️ Shared env |
| **Performance** | ✅ Good | ✅ Good |
| **Recommended** | ✅ **YES** | ⚠️ For Linux users |

---

## 🎯 Complete Workflow

### Full Application Startup

**Terminal 1 - Pathway (Docker):**
```powershell
cd "C:\Users\abhis\Desktop\Projects\vilage twin\llm-app\templates\question_answering_rag"
.\start-docker.ps1
```

**Terminal 2 - Backend:**
```powershell
cd "C:\Users\abhis\Desktop\Projects\vilage twin\backend"
npm start
```

**Terminal 3 - Frontend:**
```powershell
cd "C:\Users\abhis\Desktop\Projects\vilage twin"
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Pathway: http://localhost:8000

---

## 💰 Cost Estimate

**OpenAI Embeddings (text-embedding-ada-002):**
- $0.0001 per 1K tokens
- Initial indexing (~10 documents): **$0.002** (less than 1 cent)
- Per query: **$0.00001** (negligible)

**Gemini (for answers):**
- Free tier: 15 requests/minute
- Paid tier: ~$0.0005 per query

**Total cost per day (100 queries):** **< $0.10** 🎉

---

## 📚 Additional Resources

- **Pathway Docker Hub:** https://hub.docker.com/r/pathwaycom/pathway
- **Pathway Documentation:** https://pathway.com/developers
- **Docker Documentation:** https://docs.docker.com

---

## 🎉 Benefits of This Setup

✅ **Production-ready** - Used by Pathway in production
✅ **Auto-restart** - Container restarts if it crashes
✅ **Persistent cache** - Data survives container restarts
✅ **Easy debugging** - Clear logs with `docker logs`
✅ **Portable** - Works on any machine with Docker

---

## 🚀 You're All Set!

Now you have a **professional, production-ready** Pathway RAG setup running in Docker! 

**Next steps:**
1. Start the Docker container: `.\start-docker.ps1`
2. Start your backend and frontend
3. Ask questions with the AI feature
4. Monitor logs: `docker logs -f pathway-rag-server`

**Need help?** Check the logs or stop/restart the container.
