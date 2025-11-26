import { useState } from 'react';

interface RagQueryRequest {
  question: string;
  scheme_id?: string | null;
  bbox?: [number, number, number, number] | null;
  max_citations?: number;
}

interface Citation {
  doc_id: string;
  type: string;
  snippet: string;
  score: number;
  timestamp: string | null;
  geo: { lat: number; lon: number } | null;
}

interface RagQueryResponse {
  answer: string;
  citations: Citation[];
  trace_id: string;
  cached: boolean;
}

interface UseRagQueryResult {
  loading: boolean;
  error: string | null;
  data: RagQueryResponse | null;
  runQuery: (params: RagQueryRequest) => Promise<void>;
  reset: () => void;
}

/**
 * React hook for RAG queries
 * Handles loading, errors, and calling the backend API
 */
export default function useRagQuery(): UseRagQueryResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RagQueryResponse | null>(null);

  const runQuery = async (params: RagQueryRequest) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('http://192.168.29.179:3001/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify({
          question: params.question,
          scheme_id: params.scheme_id || null,
          bbox: params.bbox || null,
          max_citations: params.max_citations || 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 502) {
          throw new Error(errorData.message || 'RAG service temporarily unavailable. Please try again.');
        } else {
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }
      }

      const result: RagQueryResponse = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      console.error('RAG query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    loading,
    error,
    data,
    runQuery,
    reset
  };
}

export type { RagQueryRequest, RagQueryResponse, Citation };
