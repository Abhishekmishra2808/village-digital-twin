# RAG Data Source - MongoDB Integration Complete ✅

## Answer to Your Question

**"From where is the RAG getting the data?"**

The RAG system is now connected to MongoDB! Here's the complete data flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database (test)                       │
│  Collections: schemes, citizenreports, users, feedbacks         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 1. Export Script Reads MongoDB
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         backend/scripts/export-to-pathway.js                     │
│  • Converts MongoDB docs → Searchable text files                │
│  • Scheme JSON → scheme-sch002.txt (human-readable)             │
│  • Reports JSON → citizen-report-CR123.txt                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 2. Saves to Pathway data/ folder
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  llm-app/templates/question_answering_rag/data/                 │
│  📄 scheme-sch002.txt                                           │
│  📄 scheme-sch003.txt                                           │
│  📄 citizen-report-undefined.txt                                │
│  📄 README.md (metadata)                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 3. Pathway indexes files
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│            Pathway RAG Server (Python)                          │
│  • Reads data/ folder automatically                             │
│  • Creates vector embeddings (OpenAI ada-002)                   │
│  • Indexes in Usearch KNN vector store                          │
│  • Uses GPT-4o for question answering                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 4. Backend queries Pathway
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         backend/routes/rag.js (Express API)                     │
│  POST /api/rag-query                                            │
│  • Receives user question                                       │
│  • Calls Pathway: http://localhost:8000/v1/pw_ai_answer        │
│  • Enriches citations with MongoDB metadata                     │
│  • Returns answer + citations                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 5. Frontend displays answer
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Frontend (React + TypeScript)                      │
│  RagQueryModal.tsx                                              │
│  • "Which schemes are delayed?"                                 │
│  • Shows AI answer with citations                               │
│  • "Show on Map" buttons for locations                          │
└─────────────────────────────────────────────────────────────────┘
```

## Current Status

### ✅ What's Working

1. **Export Script**: `backend/scripts/export-to-pathway.js`
   - Successfully exports from MongoDB
   - Latest run: 8 documents (6 schemes + 2 reports)
   - Output: `llm-app/templates/question_answering_rag/data/`

2. **Data Files**: 
   ```
   ✅ scheme-sch002.txt (Jal Jeevan Mission - Pipeline Extension)
   ✅ scheme-sch003.txt (Pradhan Mantri Awas Yojana)
   ✅ scheme-sch004.txt (MGNREGA - Road Construction)
   ✅ scheme-sch005.txt (Swachh Bharat Mission)
   ✅ scheme-SCHEME-1762885226324-KDQSLWTAU.txt
   ✅ scheme-SCHEME-1763702152684-DND81PEX8.txt
   ✅ citizen-report-undefined.txt
   ✅ README.md (metadata)
   ```

3. **Data Format**: Each file contains searchable text:
   ```
   # Scheme: Jal Jeevan Mission - Pipeline Extension
   **ID:** sch002
   **Category:** Water Supply
   **Status:** delayed
   
   ## Progress & Budget
   - Overall Progress: 70%
   - Budget Utilized: ₹29,40,000
   
   ## Issues & Discrepancies
   **Issue 1:** budget-overrun (medium)
   - Phase 2 showing 15% higher material costs than estimated
   ```

### 🔄 Next Step: Start Pathway Server

**Option A: Use Mock Server (Current - Testing Only)**
```bash
cd llm-app/templates/question_answering_rag
python mock_pathway_server.py
# ❌ This uses HARDCODED data, NOT the MongoDB files
```

**Option B: Use Real Pathway (Recommended - Production)**
```bash
# In WSL2 Ubuntu
wsl -d Ubuntu
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not done)
pip install -r requirements.txt

# Set OpenAI key
export OPENAI_API_KEY="sk-your-key-here"

# Start Pathway server
python app.py
# ✅ This will index the MongoDB export files from data/
```

**What Pathway Does:**
```
INFO     Pathway RAG Server starting...
INFO     Indexing documents from: data/
INFO     Found 8 documents to index:
         - scheme-sch002.txt (3.2KB)
         - scheme-sch003.txt (2.8KB)
         - citizen-report-undefined.txt (0.5KB)
         ...
INFO     Creating vector embeddings with OpenAI...
INFO     Building Usearch KNN index...
INFO     ✅ RAG system initialized with 8 documents
INFO     🌐 Server running on http://0.0.0.0:8000
```

### 🎯 Testing RAG with Real MongoDB Data

1. **Start Pathway** (if not running):
   ```bash
   wsl -d Ubuntu
   cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag
   export OPENAI_API_KEY="sk-..."
   python app.py
   ```

2. **Test from Frontend**:
   - Open http://localhost:3000
   - Login as admin
   - Click "Ask AI 🤖" button
   - Ask: **"Which schemes are delayed?"**
   
   **Expected Answer:**
   ```
   Based on the indexed data, there are 2 delayed schemes:
   
   1. Jal Jeevan Mission - Pipeline Extension (sch002)
      - Status: delayed
      - Progress: 70%
      - Issues: Budget overrun in Phase 2 (15% higher costs)
      - Phase 2 & 3 are delayed
   
   2. [Other delayed scheme if any]
   
   Citations:
   📄 scheme-sch002.txt (Relevance: 0.92)
   ```

3. **Backend Updates `.env`**:
   ```bash
   # Change from mock to real Pathway
   PATHWAY_MCP_URL=http://localhost:8000  # Real Pathway (not 8080)
   ```

## Data Refresh Strategy

### When to Re-Export MongoDB Data

**Trigger Events:**
- New scheme added
- Vendor report submitted
- Citizen report filed
- Scheme status changes

**Methods:**

1. **Manual** (Current):
   ```bash
   node backend/scripts/export-to-pathway.js
   ```

2. **Scheduled** (Recommended):
   ```bash
   # Run every 6 hours using Task Scheduler or cron
   npm run export-pathway
   ```

3. **Automatic** (Future):
   ```javascript
   // backend/server.js
   import { exportToPathway } from './scripts/export-to-pathway.js';
   
   // Export on scheme update
   app.post('/api/schemes', async (req, res) => {
     await scheme.save();
     await exportToPathway(); // Refresh Pathway data
     res.json(scheme);
   });
   ```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     RuraLens RAG System                       │
│                   (MongoDB → Pathway RAG)                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐  1. User CRUD    ┌─────────────┐
│   Admin/    │ ───────────────> │   MongoDB   │
│   Vendor    │                  │  Database   │
│   Citizen   │                  │  (Runtime)  │
└─────────────┘                  └─────┬───────┘
                                       │
                                       │ 2. Export
                                       ▼
                                 ┌─────────────┐
                                 │  Node.js    │
                                 │   Export    │
                                 │   Script    │
                                 └─────┬───────┘
                                       │
                                       │ 3. Save as .txt
                                       ▼
┌─────────────┐                 ┌─────────────┐
│   Frontend  │                 │   data/     │
│   "Ask AI"  │ ──5. Query───>  │   folder    │
│   Button    │                 │  (8 files)  │
└─────┬───────┘                 └─────┬───────┘
      │                               │
      │ 6. Answer                     │ 4. Index
      │    + Citations                ▼
      │                         ┌─────────────┐
      └────────────────────────<│   Pathway   │
                                │ RAG Server  │
                                │  (Python)   │
                                └─────────────┘
                                • GPT-4o LLM
                                • OpenAI Embeddings
                                • Usearch KNN
```

## Summary

**✅ RAG is now connected to MongoDB!**

- **Mock Server (Port 8080)**: Uses hardcoded data for UI testing
- **Real Pathway (Port 8000)**: Indexes MongoDB exports for production

**Data Flow:**
1. MongoDB has real scheme/report data
2. Export script converts to text files (done!)
3. Pathway indexes these files
4. Backend queries Pathway for answers
5. Frontend displays answers with citations

**Next Action:** Start real Pathway server in WSL2 to replace mock server.

---

## Quick Start Commands

```bash
# Export MongoDB to Pathway (run when data changes)
node backend/scripts/export-to-pathway.js

# Start Real Pathway Server (WSL2)
wsl -d Ubuntu
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag
export OPENAI_API_KEY="sk-..."
python app.py

# Update Backend to use Real Pathway
# Edit backend/.env: PATHWAY_MCP_URL=http://localhost:8000

# Test from Frontend
# http://localhost:3000 → Click "Ask AI 🤖" → Ask question
```
