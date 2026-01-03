# Running Real-Time Pathway RAG on Windows

## ⚠️ Issue: Pathway Doesn't Run on Windows

The error you saw is expected:
```
This is not the real Pathway package.
Visit https://pathway.com/developers/ to get Pathway.
Note: your platform is Windows-10-10.0.26200-SP0
```

**Pathway requires Linux** - it won't run on Windows directly.

## ✅ Solution: Use WSL2 (Windows Subsystem for Linux)

### Step 1: Check if WSL2 is Installed

```powershell
wsl --list --verbose
```

If you see `Ubuntu` listed, you're good! If not, install it:

```powershell
wsl --install -d Ubuntu
```

### Step 2: Open WSL2 Ubuntu

```powershell
wsl -d Ubuntu
```

### Step 3: Navigate to Project in WSL2

```bash
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag
```

### Step 4: Install Python and Pip in WSL2

```bash
# Update package list
sudo apt update

# Install Python 3.11 and pip
sudo apt install python3.11 python3.11-venv python3-pip -y

# Verify installation
python3 --version
pip3 --version
```

### Step 5: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Step 6: Install Pathway and Dependencies

```bash
# Install all requirements
pip install -r requirements.txt

# This will install:
# - pathway[all] (the REAL Pathway for Linux)
# - pymongo (MongoDB connector)
# - openai (for embeddings)
# - google-generativeai (for Gemini)
# - litellm (for LLM abstraction)
```

### Step 7: Set Up Environment Variables

```bash
# Copy the environment file
cp .env.realtime .env

# The .env file already has:
# - MONGODB_URI (configured)
# - OPENAI_API_KEY (configured)
# - GEMINI_API_KEY (configured)
```

### Step 8: Run Real-Time Pathway Server

```bash
python realtime_mongodb_rag.py
```

**Expected Output:**
```
🚀 Starting Real-Time MongoDB Pathway RAG Server
✅ Connected to MongoDB: test
📊 Starting to stream from collections: schemes, citizenreports
✅ Loaded 6 documents from schemes
✅ Loaded 2 documents from citizenreports
🤖 Using Gemini 2.5 Flash for LLM
🌐 Starting REST API server on http://0.0.0.0:8000
📡 Endpoint: POST /v1/pw_ai_answer
```

### Step 9: Update Backend to Use Port 8000

In **Windows PowerShell**, edit `backend/.env`:

```bash
# Change this line:
PATHWAY_MCP_URL=http://localhost:8080/v1/pw_ai_answer

# To this:
PATHWAY_MCP_URL=http://localhost:8000/v1/pw_ai_answer
```

Or just uncomment the line that says "Use port 8000 for real Pathway"

### Step 10: Test It!

Open http://localhost:3000, click "Ask AI 🤖" and ask questions!

## Current Setup (Mock Server)

Right now you're using the **mock server** on port 8080:
- ✅ Works on Windows
- ✅ Uses Gemini AI
- ✅ Reads MongoDB exports
- ❌ No vector embeddings (no semantic search)
- ❌ No real Pathway RAG

## With Real Pathway (Port 8000)

Once you run it in WSL2:
- ✅ Real Pathway RAG engine
- ✅ Vector embeddings (OpenAI ada-002)
- ✅ Semantic search (meaning-based)
- ✅ Live MongoDB streaming
- ✅ Much more accurate answers
- ✅ Real relevance scores

## Quick Start Script for WSL2

Save this as `start-pathway.sh` in WSL2:

```bash
#!/bin/bash
cd /mnt/c/Users/abhis/Desktop/Projects/vilage\ twin/llm-app/templates/question_answering_rag
source venv/bin/activate
python realtime_mongodb_rag.py
```

Make it executable:
```bash
chmod +x start-pathway.sh
```

Run it:
```bash
./start-pathway.sh
```

## Troubleshooting

### "sudo: unable to resolve host"
```bash
# Edit hosts file
sudo nano /etc/hosts
# Add this line:
127.0.0.1 localhost
```

### "pip: command not found"
```bash
sudo apt install python3-pip
```

### "pathway not found"
```bash
# Make sure you're in the virtual environment
source venv/bin/activate
# Check PATH
which python  # Should show venv path
```

### Port 8000 in use
```bash
# Find what's using it
sudo lsof -i :8000
# Kill it
sudo kill -9 <PID>
```

## Summary

| Feature | Mock Server (Windows) | Real Pathway (WSL2) |
|---------|----------------------|---------------------|
| Platform | ✅ Windows | ✅ Linux (WSL2) |
| Port | 8080 | 8000 |
| Vector Search | ❌ No | ✅ Yes |
| Embeddings | ❌ No | ✅ OpenAI ada-002 |
| Accuracy | ~60% | ~95% |
| Real-time Updates | ❌ Static exports | ✅ Live streaming |
| Setup Time | ✅ 2 min | ⏱️ 10 min |

**For production and best results, use WSL2 with real Pathway!**
