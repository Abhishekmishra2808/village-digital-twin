# 🏘️ RuraLens - AI-Powered Village Digital Twin

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-v18+-green.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Real-time monitoring and AI-powered insights for rural development projects**

[Features](#-key-features) • [Installation](#-quick-start) • [AI RAG System](#-ai-rag-system) • [Architecture](#-architecture) • [Demo](#-demo)

</div>

---

## 📋 Overview

RuraLens is a cutting-edge village digital twin platform that combines real-time IoT monitoring, 3D visualization, and **AI-powered Retrieval-Augmented Generation (RAG)** to provide intelligent insights for rural development schemes. The platform enables administrators, field workers, and citizens to ask natural language questions and receive accurate, citation-backed answers from government documents and live data.

### 🎯 Problem Solved

Rural development projects often suffer from:
- ❌ Information scattered across multiple documents
- ❌ Lack of real-time visibility into scheme progress
- ❌ Difficulty identifying discrepancies and delays
- ❌ Limited citizen engagement and feedback

### ✨ RuraLens Solution

- ✅ **AI-Powered Q&A**: Ask questions in plain language, get instant answers
- ✅ **Smart Citations**: Every answer backed by verifiable document sources
- ✅ **Real-Time Monitoring**: Live IoT sensor data and scheme tracking
- ✅ **Automated Compliance**: AI analyzes vendor reports vs government plans
- ✅ **Interactive 3D Maps**: Visualize projects and sensor locations

---

## 🚀 Key Features

### 🤖 AI RAG System (Retrieval-Augmented Generation)

The crown jewel of RuraLens - an intelligent question-answering system that understands context and provides accurate, sourced answers.

#### **How It Works:**

```
User Question → RAG Backend → Pathway MCP → Document Store
                    ↓              ↓              ↓
            PII Filter      Vector Search    Embeddings
                    ↓              ↓              ↓
            Rate Limit       LLM Processing  Knowledge Base
                    ↓              ↓              ↓
            Cache Check   ← Answer Generated ← Top Results
                    ↓
        Citation Enrichment (Geo + Metadata)
                    ↓
        Frontend Display with Map Integration
```

#### **RAG Features:**

| Feature | Description |
|---------|-------------|
| 🔍 **Natural Language Queries** | Ask questions like "Why is Swachh Bharat delayed?" |
| 📚 **Multi-Source Knowledge** | Searches schemes, reports, sensor data, citizen feedback |
| 🎯 **Smart Citations** | Every answer includes source documents with relevance scores |
| 🗺️ **Map Integration** | Click citations to view locations on 3D map |
| ⚡ **Lightning Fast** | 120-second cache, sub-second responses |
| 🔒 **PII Protection** | Auto-redacts sensitive information (Aadhaar, PAN, emails) |
| 📊 **Geo-Aware** | Citations include precise coordinates with 4-level fallback |

#### **Example Queries:**

```
Q: "What water problems are reported in Zone B?"
A: Citizens report water pressure issues in Zone B, particularly during peak hours 
   (7-9 AM) affecting approximately 45 households. Sensor data confirms 30% pressure 
   drop during these times.
   📍 Citations: [Sensor-042 (89% match), Citizen Report #127 (75% match)]

Q: "Why is MGNREGA road scheme delayed?"
A: The MGNREGA Rural Road Development is delayed by 14 days due to monsoon weather 
   impact and labor shortage. Vendor reported 40% workforce availability in October.
   📍 Citations: [Vendor Report Phase-2 (92% match), Weather Log (78% match)]

Q: "Show me all schemes with budget overruns"
A: 2 schemes show budget variance: S-123 (+12% due to material cost increase), 
   S-456 (+8% from scope expansion approved in review).
   📍 Citations: [Financial Report Q3 (94% match), Budget Analysis (81% match)]
```

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Dashboard   │  │  RAG Modal   │  │  3D Map Viewer     │   │
│  │  Components  │  │  with        │  │  (MapLibre GL)     │   │
│  │              │  │  Citations   │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  RAG Router  │  │  PII Filter  │  │  Cache Manager     │   │
│  │  + Auth      │  │  Sanitizer   │  │  (120s TTL)        │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Citation    │  │  Geo Fallback│  │  Audit Logger      │   │
│  │  Enrichment  │  │  4-Level     │  │  + Trace IDs       │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Pathway MCP Server (Python/Rust)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DocumentStore: Schemes, Reports, Sensors, Feedback      │  │
│  │  VectorSearch: Embedding-based semantic search            │  │
│  │  LLM: OpenAI/Gemini for answer generation                │  │
│  │  REST API: /v1/pw_ai_answer endpoint                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                              │
│  Collections: schemes, users, vendorReports, citizenReports,    │
│               sensors, feedback                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🗺️ MapLibre GL for 3D maps
- 🔌 WebSocket for real-time updates
- 📱 Capacitor for mobile apps

**Backend:**
- 🟢 Node.js with Express
- 🔐 JWT authentication
- 💾 MongoDB with Mongoose
- 🤖 Gemini AI for document analysis
- 📊 WebSocket server for live data

**AI/RAG Layer:**
- 🐍 Python Pathway framework
- 🦀 Rust-powered vector search
- 🧠 OpenAI GPT-4 / Google Gemini
- 📚 Document embeddings & semantic search

---

## ⚡ Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.x
Python >= 3.11
MongoDB >= 6.0
Git

# Optional (for production RAG)
WSL2 (Windows) or Linux
Docker (for containerized deployment)
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Abhishekmishra2808/village-digital-twin.git
cd village-digital-twin

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, API keys, etc.

# 5. Start development servers
npm run dev        # Frontend (Port 3000)
npm start          # Backend (Port 3001, from backend folder)
```

### Quick RAG Setup (Mock Mode)

For immediate testing without full Pathway setup:

```bash
# 1. Install Flask
pip install flask

# 2. Start mock Pathway server
cd llm-app/templates/question_answering_rag
python mock_pathway_server.py
# Server runs on http://localhost:8080

# 3. Backend .env should have:
PATHWAY_MCP_URL=http://localhost:8080/v1/pw_ai_answer
PATHWAY_MCP_TOKEN=mock_token_for_development
```

### Production RAG Setup

For production with real Pathway server:

```bash
# On Linux/WSL2:
cd llm-app/templates/question_answering_rag
bash setup-wsl.sh

# Configure with your LLM API key
export OPENAI_API_KEY=your_key_here
# or
export GEMINI_API_KEY=your_key_here

# Run Pathway server
source pathway-env/bin/activate
python app.py
```

---

## 🎨 Using the RAG Feature

### 1. Access Points

The **"Ask AI"** button appears in:
- 📊 **Admin Dashboard** - Top right corner
- 👥 **Citizen Dashboard** - Top right corner  
- 📋 **Schemes View** - Header toolbar

### 2. Ask Questions

Click "Ask AI" button → Modal opens:

```
┌────────────────────────────────────────────────────┐
│  🤖 Ask AI about Schemes                       ✕   │
├────────────────────────────────────────────────────┤
│                                                     │
│  What water problems are reported in Zone B?       │
│  ┌────────────────────────────────────────────┐   │
│  │                                             │   │
│  └────────────────────────────────────────────┘   │
│                                          [Ask AI]  │
│                                                     │
│  💡 Example questions:                             │
│     • Why is Swachh Bharat scheme delayed?         │
│     • Show budget status of MGNREGA project        │
│     • What are citizen complaints in Zone A?       │
└────────────────────────────────────────────────────┘
```

### 3. View Results

```
┌────────────────────────────────────────────────────┐
│  Answer:                                            │
│  ───────────────────────────────────────────────   │
│  Citizens report low water pressure in Zone B,     │
│  particularly during morning hours (7-9 AM).        │
│  Sensor data confirms 30% pressure drop.            │
│                                                     │
│  📚 Citations (2):                                  │
│  ┌────────────────────────────────────────────┐   │
│  │ 📄 Sensor Report                      89%  │   │
│  │ "Sensor-042 recorded pressure drops..."    │   │
│  │ [Show on Map] [View Document]              │   │
│  └────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────┐   │
│  │ 💬 Citizen Report                     75%  │   │
│  │ "Multiple complaints from Zone B..."       │   │
│  │ [Show on Map] [View Document]              │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  🔍 Trace ID: trace_1763664692_2300 • Cached ✓    │
└────────────────────────────────────────────────────┘
```

### 4. Explore Citations

- **Show on Map**: Pans to citation location with highlight
- **View Document**: Opens full source document
- **Relevance Score**: Shows AI confidence (0-100%)

---

## 🔐 Security Features

### RAG-Specific Security

| Feature | Implementation |
|---------|---------------|
| 🔒 **PII Sanitization** | Auto-redacts Aadhaar, PAN, emails, phones before LLM |
| 🎫 **JWT Authentication** | All RAG queries require valid user token |
| ⏱️ **Rate Limiting** | 10 queries/minute per user to prevent abuse |
| 🔑 **Service-to-Service Auth** | Backend ↔ Pathway uses PATHWAY_MCP_TOKEN |
| 📊 **Audit Logging** | Every query logged with trace_id, user, latency |
| 🚫 **Fail-Open Policy** | Returns graceful errors if Pathway unavailable |

### Privacy Protection

```javascript
// Example: PII auto-redacted before sending to LLM
Input:  "Contact John at john@example.com, Aadhaar: 1234-5678-9012"
Output: "Contact John at [EMAIL_REDACTED], Aadhaar: [AADHAAR_REDACTED]"
```

---

## 📊 RAG API Reference

### Endpoint

```http
POST /api/rag-query
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Request Body

```json
{
  "question": "Why is Swachh Bharat scheme delayed?",
  "scheme_id": "S-123",           // Optional: filter by scheme
  "bbox": [77.5, 28.4, 77.6, 28.5], // Optional: geographic filter
  "max_citations": 5              // Optional: limit citations (default 5)
}
```

### Response

```json
{
  "answer": "The Swachh Bharat Mission is delayed by 14 days due to monsoon weather...",
  "citations": [
    {
      "doc_id": "vendor-report-VR-2024-001",
      "type": "vendor_report",
      "snippet": "Weather delays in October pushed timeline by 3 weeks...",
      "score": 0.92,
      "timestamp": "2024-10-15T10:30:00Z",
      "geo": {
        "lat": 28.4595,
        "lon": 77.0266
      }
    },
    {
      "doc_id": "scheme-S-123",
      "type": "scheme",
      "snippet": "Phase 2 originally scheduled for October completion...",
      "score": 0.87,
      "timestamp": "2024-09-01T00:00:00Z",
      "geo": {
        "lat": 28.4612,
        "lon": 77.0312
      }
    }
  ],
  "trace_id": "trace_1763664729_8574",
  "cached": false,
  "processing_time_ms": 612
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Invalid request (missing question, malformed bbox) |
| `401` | Unauthorized (invalid/missing JWT token) |
| `429` | Rate limit exceeded (>10 queries/min) |
| `502` | RAG service temporarily unavailable |
| `500` | Internal server error |

---

## 🧪 Testing the RAG Feature

### Backend Test

```bash
cd backend
powershell -File test-rag.ps1
```

Expected output:
```
=== Testing RAG Feature ===
1. Logging in...
✅ Login successful!

2. Sending RAG query...
✅ RAG query successful!

Answer: Multiple schemes are experiencing delays...
Citations: 2 (scores: 0.9, 0.82)
Cached: False
```

### Frontend Test

1. Open http://localhost:3000
2. Login with: `admin@village.com` / `admin123`
3. Click **"Ask AI"** button (blue gradient)
4. Type: `"Why is MGNREGA delayed?"`
5. Verify:
   - ✅ Answer appears within 1 second
   - ✅ Citations show with scores
   - ✅ "Show on Map" buttons work
   - ✅ Cached indicator on repeat query

---

## 📚 Documentation

### Key Files

```
📁 Project Root
├── 📄 README.md (this file)
├── 📁 docs/
│   └── 📄 README_RAG.md (detailed RAG setup)
├── 📁 backend/
│   ├── 📁 routes/
│   │   └── 🔧 rag.js (RAG endpoint)
│   ├── 📁 utils/
│   │   ├── 🔧 pathwayClient.js (MCP client)
│   │   ├── 🔧 piiSanitizer.js (privacy filter)
│   │   └── 🔧 ragCache.js (response cache)
│   └── 📄 test-rag.ps1 (test script)
├── 📁 src/
│   ├── 📁 components/
│   │   └── 📁 Rag/
│   │       └── 🎨 RagQueryModal.tsx (UI component)
│   ├── 📁 hooks/
│   │   └── 🔧 useRagQuery.ts (React hook)
│   └── 📁 utils/
│       └── 🔧 mapHighlighter.ts (map integration)
└── 📁 llm-app/
    └── 📁 templates/question_answering_rag/
        ├── 🐍 app.py (Pathway server)
        ├── 🐍 mock_pathway_server.py (dev mock)
        └── 📜 setup-wsl.sh (Linux setup)
```

### Further Reading

- 📖 [Pathway Documentation](https://pathway.com/developers)
- 📖 [RAG Setup Guide](./docs/README_RAG.md)
- 📖 [API Reference](./docs/README_RAG.md#api-endpoints)

---

## 🌟 Demo

### Screenshots

The RAG feature is integrated across the platform:

**1. Admin Dashboard**
- Click "Ask AI" in top-right corner
- Query about scheme status, delays, budget
- View citations with geo-coordinates

**2. Schemes View**
- "Ask AI" button in toolbar
- Ask about specific schemes
- Citations link to scheme details

**3. Citizen Dashboard**
- Public-facing AI assistant
- Simplified query interface
- Helps citizens track projects

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution

- 🧠 **AI/ML**: Improve RAG accuracy, add new LLM providers
- 🎨 **UI/UX**: Enhance modal design, add voice input
- 📊 **Analytics**: Query insights, popular questions dashboard
- 🌐 **i18n**: Multi-language support for queries
- 📱 **Mobile**: Optimize RAG UI for mobile devices

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Team

**Developed by**: Village Digital Twin Team  
**Contact**: abhishekmishra8770@gmail.com  
**GitHub**: [@Abhishekmishra2808](https://github.com/Abhishekmishra2808)

---

## 🙏 Acknowledgments

- **Pathway** - For the amazing RAG framework
- **OpenAI/Google** - For LLM APIs
- **MongoDB** - For flexible document storage
- **React Community** - For excellent UI libraries

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ for rural development

[Report Bug](https://github.com/Abhishekmishra2808/village-digital-twin/issues) • [Request Feature](https://github.com/Abhishekmishra2808/village-digital-twin/issues)

</div>
