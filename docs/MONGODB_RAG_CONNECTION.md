# Connecting RAG to MongoDB

## Current Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   MongoDB   │ ───> │ Export Script│ ───> │  Data Files │
│  (Runtime)  │      │   (Node.js)  │      │  (.txt files)│
└─────────────┘      └──────────────┘      └─────────────┘
                                                    │
                                                    ▼
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Backend   │ ───> │   Pathway    │ <─── │  Document   │
│   (RAG API) │      │  RAG Server  │      │   Indexing  │
└─────────────┘      └──────────────┘      └─────────────┘
```

## How It Works

### 1. **Data Export** (Node.js Script)
**File:** `backend/scripts/export-to-pathway.js`

- Reads from MongoDB collections:
  - `schemes` → Individual scheme files
  - `citizenreports` → Citizen feedback files  
  - `sensors` → Sensor data files
  
- Converts to searchable text format:
  ```
  scheme-S-123.txt
  citizen-report-CR-456.txt
  sensor-TEMP-001-1234567890.txt
  ```

- Saves to: `llm-app/templates/question_answering_rag/data/`

### 2. **Pathway Indexing** (Python)
**File:** `llm-app/templates/question_answering_rag/app.py`

- Watches `data/` folder for changes
- Automatically indexes new/updated files
- Creates vector embeddings using OpenAI
- Stores in Usearch KNN vector database

### 3. **RAG Query Flow**
**File:** `backend/routes/rag.js`

1. User asks: "Which schemes are delayed?"
2. Backend calls Pathway: `POST http://localhost:8000/v1/pw_ai_answer`
3. Pathway searches indexed documents
4. GPT-4 generates answer with citations
5. Backend enriches citations with MongoDB metadata
6. Frontend displays answer with map markers

## Setup Instructions

### Step 1: Export MongoDB Data

```bash
# Make sure MongoDB is running and has data
node backend/scripts/export-to-pathway.js
```

**Output:**
```
🚀 Starting MongoDB to Pathway export...
✅ Connected to MongoDB
📊 Exporting schemes...
   Found 15 schemes
   ✅ Exported 15 schemes
📝 Exporting citizen reports...
   Found 8 reports
   ✅ Exported 8 reports
📡 Exporting sensor data...
   Found 42 sensor readings
   ✅ Exported 42 sensor readings
🎉 Export completed successfully!
📚 Total documents: 65
```

### Step 2: Start Pathway Server (WSL2)

```bash
# Open WSL2 Ubuntu
wsl -d Ubuntu

# Navigate to Pathway directory
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag

# Activate virtual environment
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export GEMINI_API_KEY="your-gemini-key"  # Optional

# Start Pathway server
python app.py
```

**Expected Output:**
```
INFO     Pathway RAG Server starting...
INFO     Indexing documents from: data/
INFO     Found 65 documents to index
INFO     Creating vector embeddings...
INFO     ✅ RAG system initialized
INFO     🌐 Server running on http://0.0.0.0:8000
```

### Step 3: Test RAG Connection

```bash
# In Windows PowerShell
cd backend
node test-rag.ps1
```

**Or manually:**
```bash
curl -X POST http://localhost:8000/v1/pw_ai_answer ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Which schemes are experiencing delays?\"}"
```

### Step 4: Use Frontend

1. Open RuraLens: http://localhost:3000
2. Login as admin/citizen
3. Click **"Ask AI 🤖"** button
4. Ask questions:
   - "What is the status of water schemes?"
   - "Show me all delayed projects"
   - "Which vendor reports have compliance issues?"
   - "Are there any sensor alerts?"

## Data Refresh Strategy

### Option A: Manual Export (Current)
```bash
# Run whenever MongoDB data changes
node backend/scripts/export-to-pathway.js
```

### Option B: Scheduled Export (Recommended)

**Windows Task Scheduler:**
```xml
<!-- Run every 6 hours -->
<Task>
  <Exec>
    <Command>node</Command>
    <Arguments>C:\Users\abhis\Desktop\Projects\vilage twin\backend\scripts\export-to-pathway.js</Arguments>
  </Exec>
</Task>
```

**Or using Node.js cron:**
```javascript
// backend/server.js
const cron = require('node-cron');
const { exportToPathway } = require('./scripts/export-to-pathway');

// Export every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('🔄 Running scheduled Pathway data export...');
  await exportToPathway();
});
```

### Option C: Real-Time Export (Advanced)

Use MongoDB Change Streams to export on every update:

```javascript
// backend/scripts/watch-and-export.js
const { exportToPathway } = require('./export-to-pathway');

// Watch for changes
mongoose.connection.collection('schemes').watch().on('change', async (change) => {
  console.log('📝 Scheme changed, re-exporting...');
  await exportToPathway();
});
```

## Mock Server vs Real Pathway

| Feature | Mock Server | Real Pathway |
|---------|-------------|--------------|
| **Port** | 8080 | 8000 |
| **Data Source** | Hardcoded dictionary | MongoDB export files |
| **LLM** | Fake responses | OpenAI GPT-4 / Gemini |
| **Use Case** | Frontend testing | Production queries |
| **Accuracy** | Low (fake data) | High (real data) |
| **Setup** | `python mock_pathway_server.py` | `python app.py` |

## Environment Variables

```bash
# Backend (.env)
PATHWAY_MCP_URL=http://localhost:8000  # Real Pathway server
# PATHWAY_MCP_URL=http://localhost:8080  # Mock server for testing

# Pathway (WSL2)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...  # Optional, fallback
```

## Troubleshooting

### "No documents indexed"
```bash
# Check if export created files
ls llm-app/templates/question_answering_rag/data/
# Should see: scheme-*.txt, citizen-report-*.txt, sensor-*.txt

# If empty, run export again
node backend/scripts/export-to-pathway.js
```

### "Connection refused to Pathway"
```bash
# Check if Pathway is running
curl http://localhost:8000/health

# If not, start Pathway in WSL2
wsl -d Ubuntu
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag
python app.py
```

### "OpenAI API key invalid"
```bash
# Set key in WSL2
export OPENAI_API_KEY="sk-your-key-here"

# Or add to ~/.bashrc
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.bashrc
```

## Next Steps

1. ✅ Export MongoDB data
2. ✅ Start Pathway server
3. ✅ Test RAG queries
4. 🔄 Set up scheduled exports (every 6 hours)
5. 🚀 Deploy to production with real OpenAI key
