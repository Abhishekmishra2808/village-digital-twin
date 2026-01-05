import express from 'express';
import rateLimit from 'express-rate-limit';
import pathwayClient, { PathwayClientError } from '../utils/pathwayClient.js';
import { sanitizePII, normalizeCacheKey, containsPII } from '../utils/piiSanitizer.js';
import ragCache from '../utils/ragCache.js';
import Scheme from '../models/Scheme.js';
import AnonymousReport from '../models/AnonymousReport.js';

const router = express.Router();

// Rate limiter: 10 queries per minute per user
const ragRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many RAG queries. Please try again in a minute.' },
  keyGenerator: (req) => {
    // Use userId if authenticated, otherwise just use user ID fallback
    // Don't use IP to avoid IPv6 issues
    return req.user?.userId || 'anonymous';
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user?.userId // Skip rate limiting for non-authenticated requests
});

/**
 * POST /api/rag-query
 * RAG query endpoint with auth, caching, rate limiting, and citation enrichment
 */
router.post('/', ragRateLimiter, async (req, res) => {
  const startTime = Date.now();
  let trace_id = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate request body
    const { question, scheme_id, bbox, max_citations } = req.body;
    const user_id = req.user?.userId || 'anonymous';

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request: question is required and must be a non-empty string' 
      });
    }

    if (question.length > 500) {
      return res.status(400).json({ 
        error: 'Question too long. Maximum 500 characters allowed.' 
      });
    }

    // Validate bbox if provided
    if (bbox && (!Array.isArray(bbox) || bbox.length !== 4)) {
      return res.status(400).json({ 
        error: 'Invalid bbox format. Expected [minLon, minLat, maxLon, maxLat]' 
      });
    }

    const maxCitations = Math.min(max_citations || 5, 10); // Cap at 10

    // Check cache first (normalized key)
    const cacheKey = normalizeCacheKey(question, scheme_id, bbox);
    const cachedResponse = ragCache.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Sanitize PII from question before sending to Pathway
    const sanitizedQuestion = sanitizePII(question);
    const hasPII = containsPII(question);

    // Log request (avoid logging full question if contains PII)
    console.log(`🔍 RAG Query from ${user_id}: ${hasPII ? '[QUESTION_CONTAINS_PII]' : sanitizedQuestion.substring(0, 100)}`);
    console.log(`   Filters: scheme_id=${scheme_id || 'null'}, bbox=${bbox ? 'yes' : 'no'}`);

    // Build Pathway request
    const pathwayPayload = {
      question: sanitizedQuestion,
      filters: {
        scheme_id: scheme_id || null,
        bbox: bbox || null
      },
      max_citations: maxCitations,
      return_snippets: true,
      system_prompt: `Answer the user question in ≤250 words using ONLY the retrieved context. 
Provide a concise answer followed by numbered citations in format: [N:doc_id] snippet. 
Do NOT invent facts. If uncertain or context insufficient, respond "Insufficient data to answer this question."
Be specific and cite sources.`
    };

    // Call Pathway MCP
    let pathwayResponse;
    try {
      pathwayResponse = await pathwayClient.callRag(pathwayPayload);
      trace_id = pathwayResponse.trace_id || trace_id;
    } catch (error) {
      if (error instanceof PathwayClientError) {
        console.error(`❌ Pathway error [${trace_id}]:`, error.message);
        return res.status(502).json({
          error: 'RAG service temporarily unavailable',
          message: 'Unable to process query. Please try again in a moment.',
          trace_id
        });
      }
      throw error;
    }

    // Enrich citations with metadata and geo coordinates
    const enrichedCitations = await enrichCitations(
      pathwayResponse.citations,
      scheme_id,
      bbox
    );

    // Build response
    const response = {
      answer: pathwayResponse.answer,
      citations: enrichedCitations,
      trace_id,
      cached: false
    };

    // Cache the response
    ragCache.set(cacheKey, response);

    // Log completion
    const latency = Date.now() - startTime;
    console.log(`✅ RAG Query completed [${trace_id}] in ${latency}ms, ${enrichedCitations.length} citations`);

    // Audit log (without PII)
    logAudit({
      trace_id,
      user_id,
      has_pii: hasPII,
      scheme_id,
      citations_count: enrichedCitations.length,
      latency_ms: latency
    });

    res.json(response);

  } catch (error) {
    console.error(`❌ RAG query error [${trace_id}]:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process RAG query',
      trace_id
    });
  }
});

/**
 * Enrich citations with metadata and geo coordinates from MongoDB
 * Geo fallback order: direct doc → doc metadata → nearest sensor (same scheme) → scheme centroid
 */
async function enrichCitations(citations, scheme_id, bbox) {
  if (!citations || citations.length === 0) {
    return [];
  }

  const enriched = [];

  for (const citation of citations) {
    try {
      const enrichedCitation = {
        doc_id: citation.doc_id,
        snippet: citation.snippet || '',
        score: citation.score || 0,
        type: 'unknown',
        timestamp: null,
        geo: null
      };

      // Determine doc type and fetch metadata based on doc_id pattern
      if (citation.doc_id.startsWith('vendor-report-')) {
        await enrichVendorReport(enrichedCitation, scheme_id);
      } else if (citation.doc_id.startsWith('scheme-')) {
        await enrichScheme(enrichedCitation);
      } else if (citation.doc_id.startsWith('citizen-report-')) {
        await enrichCitizenReport(enrichedCitation);
      } else if (citation.doc_id.startsWith('sensor-')) {
        enrichedCitation.type = 'sensor-event';
        // Sensor data is in-memory, fallback to scheme geo
        if (scheme_id) {
          await fallbackToSchemeGeo(enrichedCitation, scheme_id);
        }
      }

      // If still no geo and bbox provided, try to find nearby items
      if (!enrichedCitation.geo && bbox) {
        await fallbackToBboxGeo(enrichedCitation, bbox);
      }

      enriched.push(enrichedCitation);
    } catch (error) {
      console.error(`⚠️  Failed to enrich citation ${citation.doc_id}:`, error.message);
      // Still include citation with available data
      enriched.push({
        doc_id: citation.doc_id,
        snippet: citation.snippet || '',
        score: citation.score || 0,
        type: 'unknown',
        timestamp: null,
        geo: null
      });
    }
  }

  return enriched;
}

/**
 * Enrich vendor report citation
 */
async function enrichVendorReport(citation, scheme_id) {
  // Vendor reports are embedded in schemes
  const schemes = await Scheme.find({
    'vendorReports.id': citation.doc_id
  }).limit(1);

  if (schemes.length > 0) {
    const scheme = schemes[0];
    const report = scheme.vendorReports.find(r => r.id === citation.doc_id);
    
    citation.type = 'vendor-report';
    citation.timestamp = report?.uploadedAt || scheme.startDate;
    
    // Use scheme location as geo
    if (scheme.location) {
      citation.geo = {
        lat: scheme.location.lat || null,
        lon: scheme.location.lng || null
      };
    }
  }
}

/**
 * Enrich scheme citation
 */
async function enrichScheme(citation) {
  const schemeId = citation.doc_id.replace('scheme-', '');
  const scheme = await Scheme.findOne({ id: schemeId });

  if (scheme) {
    citation.type = 'government-scheme';
    citation.timestamp = scheme.startDate;
    
    if (scheme.location) {
      citation.geo = {
        lat: scheme.location.lat || null,
        lon: scheme.location.lng || null
      };
    }
  }
}

/**
 * Enrich citizen report citation (now uses AnonymousReport)
 */
async function enrichCitizenReport(citation) {
  const report = await AnonymousReport.findOne({ id: citation.doc_id });

  if (report) {
    citation.type = 'citizen-report';
    citation.timestamp = report.createdAt;
    
    if (report.location?.approximateCoords && report.location.approximateCoords.length === 2) {
      citation.geo = {
        lat: report.location.approximateCoords[1], // [lon, lat] -> lat
        lon: report.location.approximateCoords[0]
      };
    }
  }
}

/**
 * Fallback to scheme centroid geo
 */
async function fallbackToSchemeGeo(citation, scheme_id) {
  const scheme = await Scheme.findOne({ id: scheme_id });
  if (scheme && scheme.location) {
    citation.geo = {
      lat: scheme.location.lat || null,
      lon: scheme.location.lng || null
    };
  }
}

/**
 * Fallback to nearest item in bbox
 */
async function fallbackToBboxGeo(citation, bbox) {
  // Try to find any geo-tagged item in bbox (anonymous reports)
  const [minLon, minLat, maxLon, maxLat] = bbox;
  
  const report = await AnonymousReport.findOne({
    'location.approximateCoords': {
      $geoWithin: {
        $box: [[minLon, minLat], [maxLon, maxLat]]
      }
    }
  }).limit(1);

  if (report && report.location?.approximateCoords && report.location.approximateCoords.length === 2) {
    citation.geo = {
      lat: report.location.approximateCoords[1],
      lon: report.location.approximateCoords[0]
    };
  }
}

/**
 * Audit logging (without PII)
 */
function logAudit(data) {
  // In production, send to logging service (e.g., CloudWatch, Datadog)
  console.log('📊 AUDIT:', JSON.stringify(data));
}

export default router;
