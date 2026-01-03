# RAG Feature Integration with Pathway

## Overview

This implementation integrates Pathway's LLM xpack RAG capabilities with the Rural Digital Twin platform. The system allows users to ask natural language questions about schemes, vendor reports, sensor data, and citizen reports, receiving AI-generated answers with citations that can be visualized on the map.

## Architecture

```
Frontend (React) → Backend (Node.js/Express) → Pathway MCP Server → LLM (OpenAI/Gemini)
                                              ↓
                                         MongoDB (citations enrichment)
```

## Pathway Integration

### What is Pathway?

Pathway is a Python data processing framework for real-time RAG pipelines. It provides:
- **DocumentStore**: Automatically indexes documents and updates on new data
- **BaseRAGQuestionAnswerer**: Standard RAG with vector store retrieval
- **AdaptiveRAGQuestionAnswerer**: Token-optimized RAG
- **REST API Server**: `DocumentStoreServer` handles API calls

### Expected Pathway Setup

Your Pathway server should expose a REST endpoint (typically `/v1/retrieve` or `/v1/pw_ai_answer`) that accepts:

**Request:**
```json
{
  "query": "Why is Scheme S-123 delayed?",
  "filters": {
    "scheme_id": "S-123",
    "bbox": [minLon, minLat, maxLon, maxLat]
  },
  "k": 5
}
```

**Response:**
```json
{
  "answer": "Scheme S-123 is delayed due to...",
  "citations": [
    {
      "doc_id": "vendor-report-2025-11-10",
      "snippet": "Milestone 2 completed 14 days late",
      "score": 0.92
    }
  ],
  "trace_id": "trace_abc123"
}
```

## Implementation Details

### Backend Components

1. **`backend/utils/pathwayClient.js`**
   - Wrapper for calling Pathway MCP REST endpoint
   - Exponential retry logic (3 attempts)
   - 20s timeout with proper error handling
   - Service-to-service auth via `PATHWAY_MCP_TOKEN`

2. **`backend/utils/piiSanitizer.js`**
   - Redacts PII (emails, phones, Aadhaar, PAN) before sending to Pathway
   - Normalizes cache keys for consistency
   - PII detection for logging decisions

3. **`backend/utils/ragCache.js`**
   - In-memory LRU cache with 120s TTL
   - Reduces Pathway/LLM API calls
   - Configurable via `RAG_CACHE_TTL_SECONDS`

4. **`backend/routes/rag.js`**
   - Main RAG endpoint: `POST /api/rag-query`
   - JWT authentication required
   - Rate limiting: 10 queries/min per user
   - Citation enrichment from MongoDB

### Frontend Components

5. **`src/hooks/useRagQuery.ts`**
   - React hook for RAG queries
   - Handles loading, errors, retry logic

6. **`src/components/Rag/RagQueryModal.tsx`**
   - Modal UI for questions and answers
   - Citation display with "Show on Map" buttons
   - Trace ID for debugging

7. **`src/utils/mapHighlighter.ts`**
   - Pan/zoom/flash markers by doc_id
   - 3-second pulse animation

## Environment Variables

### Backend (`.env`)

```bash
# Pathway MCP Configuration
PATHWAY_MCP_URL=http://localhost:8080/v1/pw_ai_answer
PATHWAY_MCP_TOKEN=your_pathway_service_token_here

# RAG Settings
RAG_CACHE_TTL_SECONDS=120
RAG_MAX_CITATIONS=5
PATHWAY_TIMEOUT_MS=20000

# Existing variables
MONGODB_URI=mongodb://localhost:27017/ruralens
JWT_SECRET=your_jwt_secret
```

## Setting Up Pathway Server

### Option 1: Using Pathway Templates (Recommended)

```bash
# Clone the llm-app repository
git clone https://github.com/pathwaycom/llm-app.git
cd llm-app/templates/question_answering_rag

# Install dependencies
pip install -r requirements.txt

# Configure your data sources in app.py
# Point to your MongoDB collections or file storage

# Run the server
python app.py
```

### Option 2: Custom Pathway Pipeline

```python
import pathway as pw
from pathway.xpacks.llm import DocumentStore, BaseRAGQuestionAnswerer
from pathway.xpacks.llm.servers import DocumentStoreServer

# Create document store
doc_store = DocumentStore(
    docs=pw.io.mongodb.read(...),  # Your MongoDB collections
    embedder=pw.xpacks.llm.embedders.OpenAIEmbedder()
)

# Create RAG answerer
rag = BaseRAGQuestionAnswerer(
    llm=pw.xpacks.llm.llms.OpenAIChat(model="gpt-4"),
    indexer=doc_store,
    search_topk=5
)

# Serve REST API
server = DocumentStoreServer(
    host="0.0.0.0",
    port=8080,
    rag=rag
)

pw.run()
```

## Document ID Mapping

To ensure Pathway citations match your MongoDB documents, use consistent doc_id patterns:

| MongoDB Collection | Doc ID Pattern | Example |
|-------------------|----------------|---------|
| schemes | `scheme-{id}` | `scheme-S-123` |
| schemes.vendorReports | `vendor-report-{id}` | `vendor-report-2025-11-10` |
| citizenReports | `citizen-report-{id}` | `citizen-report-REPORT-123` |
| sensor events | `sensor-{id}` | `sensor-zoneB-2025-11-12` |

## Citation Enrichment

The backend enriches Pathway citations with metadata from MongoDB:

**Geo Fallback Order:**
1. Direct doc coordinates (citizen reports, schemes)
2. Doc metadata (vendor reports → scheme location)
3. Nearest sensor with same scheme_id
4. Scheme centroid

## Security Features

✅ **Service auth** - PATHWAY_MCP_TOKEN never exposed to frontend  
✅ **PII sanitization** - Emails/phones redacted before Pathway  
✅ **Rate limiting** - 10 queries/min per user  
✅ **JWT auth** - All requests require valid token  
✅ **Audit logging** - trace_id, user_id, latency (no PII logged)  

## API Endpoints

### POST `/api/rag-query`

**Request:**
```json
{
  "question": "Why is Scheme S-123 delayed?",
  "scheme_id": "S-123",
  "bbox": null,
  "max_citations": 5
}
```

**Response:**
```json
{
  "answer": "Scheme S-123 is delayed due to...",
  "citations": [
    {
      "doc_id": "vendor-report-2025-11-10",
      "type": "vendor-report",
      "snippet": "Milestone 2 completed 14 days late",
      "score": 0.92,
      "timestamp": "2025-11-10T00:00:00Z",
      "geo": { "lat": 18.5204, "lon": 73.8567 }
    }
  ],
  "trace_id": "trace_abc123",
  "cached": false
}
```

**Error Responses:**
- `400` - Invalid request (missing question, invalid bbox)
- `429` - Rate limit exceeded
- `502` - Pathway service unavailable

## Usage Examples

### Adding RAG Button to SchemesView

```tsx
import { useState } from 'react';
import RagQueryModal from '../components/Rag/RagQueryModal';
import { highlightCitationOnMap } from '../utils/mapHighlighter';

function SchemesView() {
  const [showRagModal, setShowRagModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  return (
    <>
      <button 
        onClick={() => setShowRagModal(true)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
      >
        🤖 Ask AI
      </button>
      
      <RagQueryModal
        isOpen={showRagModal}
        onClose={() => setShowRagModal(false)}
        schemeId={selectedScheme?.id}
        onHighlightCitation={(citation) => {
          // Highlight on map
          highlightCitationOnMap(citation, mapInstance);
        }}
      />
    </>
  );
}
```

## Testing

### Manual Testing

1. Start backend: `cd backend && npm start`
2. Start Pathway server (see setup above)
3. Open frontend and click "Ask AI"
4. Try questions like:
   - "Why is Scheme S-123 delayed?"
   - "What are the main water supply issues?"
   - "Show me recent sensor alerts"

### Example Test Query

```bash
curl -X POST http://localhost:3001/api/rag-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "What is the status of road construction schemes?",
    "scheme_id": null,
    "bbox": null,
    "max_citations": 5
  }'
```

## Troubleshooting

### "Pathway service unavailable"
- Check `PATHWAY_MCP_URL` is correct
- Verify Pathway server is running: `curl http://localhost:8080/health`
- Check `PATHWAY_MCP_TOKEN` is set correctly

### "Rate limit exceeded"
- Wait 1 minute before retrying
- Increase rate limit in `backend/routes/rag.js` if needed

### Citations missing geo coordinates
- Verify MongoDB documents have location fields
- Check geo fallback logic in `enrichCitations()`
- Ensure scheme coordinates are populated

### Hallucinated answers
- Review system prompt in `backend/routes/rag.js`
- Increase `max_citations` for more context
- Use Pathway's AdaptiveRAG for better accuracy

## Performance Optimization

1. **Caching**: 120s TTL reduces redundant LLM calls
2. **Rate limiting**: Prevents cost spikes
3. **Citation enrichment**: Single DB query per citation
4. **Timeout**: 20s prevents hanging requests

## Future Enhancements

- [ ] Worker queue for high-volume queries
- [ ] Redis cache for multi-server deployments
- [ ] A/B testing different prompts
- [ ] Feedback loop (thumbs up/down on answers)
- [ ] Query history and analytics
- [ ] Multi-language support
- [ ] Voice input/output

## References

- [Pathway Documentation](https://pathway.com/developers/user-guide/introduction/welcome)
- [LLM xpack Overview](https://pathway.com/developers/user-guide/llm-xpack/overview)
- [Pathway GitHub](https://github.com/pathwaycom/pathway)
- [LLM App Templates](https://github.com/pathwaycom/llm-app)

## License

Same as parent project.
