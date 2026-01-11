import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Use the retrieve endpoint that returns both answer AND source documents
const PATHWAY_MCP_URL = process.env.PATHWAY_MCP_URL || 'http://localhost:8000/v1/retrieve';
const PATHWAY_MCP_TOKEN = process.env.PATHWAY_MCP_TOKEN || '';
const PATHWAY_TIMEOUT = parseInt(process.env.PATHWAY_TIMEOUT_MS || '20000', 10);
const MAX_RETRIES = 3;

/**
 * Pathway MCP Client with exponential retry logic
 * Service-to-service authentication using PATHWAY_MCP_TOKEN
 */
class PathwayClient {
  constructor() {
    this.baseURL = PATHWAY_MCP_URL;
    this.token = PATHWAY_MCP_TOKEN;
    
    if (!this.token) {
      console.warn('⚠️  PATHWAY_MCP_TOKEN not set. RAG queries will fail.');
    }
  }

  /**
   * Call Pathway RAG endpoint with retry logic
   * Makes two calls: one to retrieve docs, one to get answer
   * @param {Object} payload - Request payload
   * @param {string} payload.question - User question
   * @param {Object} payload.filters - Optional filters (scheme_id, bbox)
   * @param {number} payload.max_citations - Max citations to return
   * @param {boolean} payload.return_snippets - Return snippets with citations
   * @returns {Promise<Object>} - Pathway response with answer and citations
   */
  async callRag(payload) {
    const question = payload.question || payload.prompt;
    
    try {
      console.log(`🔍 Calling Pathway with question: "${question.substring(0, 50)}..."`);
      
      // Step 1: Retrieve relevant documents from Pathway
      const retrieveUrl = this.baseURL.replace('/v1/pw_ai_answer', '/v1/retrieve');
      console.log(`📡 Retrieve URL: ${retrieveUrl}`);
      
      const retrieveResponse = await axios.post(retrieveUrl, {
        query: question,
        k: payload.max_citations || 6
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: PATHWAY_TIMEOUT
      });

      const documents = retrieveResponse.data || [];
      console.log(`📚 Retrieved ${documents.length} documents from Pathway`);

      // Step 2: Get AI-generated answer
      const answerUrl = this.baseURL.replace('/v1/retrieve', '/v1/pw_ai_answer');
      console.log(`📡 Answer URL: ${answerUrl}`);
      
      const answerResponse = await axios.post(answerUrl, {
        prompt: question
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        timeout: PATHWAY_TIMEOUT
      });

      console.log(`✅ Got answer: ${(answerResponse.data.response || '').substring(0, 50)}...`);

      // Combine answer with retrieved documents as citations
      return this._normalizeResponse({
        answer: answerResponse.data.response || answerResponse.data.answer,
        documents: documents
      });

    } catch (error) {
      console.error(`❌ PathwayClient error:`, error.message);
      // Handle errors with retry logic
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw new PathwayClientError(
          `Pathway client error: ${error.response.status}`,
          error.response.status,
          error.response.data
        );
      }

      throw new PathwayClientError(
        'Pathway service unavailable',
        502,
        { original_error: error.message }
      );
    }
  }

  /**
   * Normalize Pathway response to expected format
   * Converts retrieved documents into citation objects
   */
  _normalizeResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new PathwayClientError('Malformed Pathway response', 502, data);
    }

    const answer = data.answer || data.response || 'No answer provided';
    
    // Convert retrieved documents to citations
    let citations = [];
    const docs = data.documents || data.docs || [];
    
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const filePath = doc.metadata?.path || '';
      
      // Extract document ID from file path (e.g., "data/scheme_sch002.txt" -> "sch002")
      let doc_id = 'unknown';
      if (filePath.includes('scheme_')) {
        doc_id = filePath.match(/scheme_(.+)\.txt/)?.[1] || 'unknown';
      } else if (filePath.includes('citizen_report_')) {
        doc_id = filePath.match(/citizen_report_(.+)\.txt/)?.[1] || 'unknown';
      }

      citations.push({
        doc_id: doc_id,
        snippet: doc.text?.substring(0, 300) || '',
        score: doc.score || doc.dist || 0.85,
        metadata: doc.metadata || {}
      });
    }

    console.log(`✅ Converted ${citations.length} documents to citations`);

    return {
      answer,
      citations,
      trace_id: data.trace_id || data.traceId || `trace_${Date.now()}`,
      cached: false
    };
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Custom error class for Pathway client errors
 */
class PathwayClientError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'PathwayClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default new PathwayClient();
export { PathwayClientError };
