import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PATHWAY_MCP_URL = process.env.PATHWAY_MCP_URL || 'http://localhost:8080/rag';
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
   * @param {Object} payload - Request payload
   * @param {string} payload.question - User question
   * @param {Object} payload.filters - Optional filters (scheme_id, bbox)
   * @param {number} payload.max_citations - Max citations to return
   * @param {boolean} payload.return_snippets - Return snippets with citations
   * @returns {Promise<Object>} - Pathway response with answer and citations
   */
  async callRag(payload) {
    let lastError;
    
    // Transform backend payload to Pathway's expected format
    // Pathway QARestServer expects: {"prompt": "question text"}
    const pathwayPayload = {
      prompt: payload.question || payload.prompt
    };
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.post(this.baseURL, pathwayPayload, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          timeout: PATHWAY_TIMEOUT
        });

        // Success - return parsed response
        return this._normalizeResponse(response.data);
      } catch (error) {
        lastError = error;

        // 4xx errors - don't retry
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw new PathwayClientError(
            `Pathway client error: ${error.response.status}`,
            error.response.status,
            error.response.data
          );
        }

        // 5xx errors or timeouts - retry with exponential backoff
        if (attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, 4s max
          console.log(`⚠️  Pathway request failed (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
          await this._sleep(delay);
          continue;
        }
      }
    }

    // All retries exhausted
    throw new PathwayClientError(
      'Pathway service unavailable after retries',
      502,
      { original_error: lastError.message }
    );
  }

  /**
   * Normalize Pathway response to expected format
   * Pathway returns {response: string}, we map it to {answer: string}
   */
  _normalizeResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new PathwayClientError('Malformed Pathway response', 502, data);
    }

    return {
      answer: data.answer || data.response || 'No answer provided',
      citations: Array.isArray(data.citations) ? data.citations : [],
      trace_id: data.trace_id || data.traceId || `trace_${Date.now()}`,
      cached: data.cached || false
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
