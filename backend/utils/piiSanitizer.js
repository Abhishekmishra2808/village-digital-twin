/**
 * Sanitize user input to remove PII before sending to external services
 */

// Patterns for common PII
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const AADHAAR_PATTERN = /\b\d{4}\s?\d{4}\s?\d{4}\b/g; // Indian Aadhaar format
const PAN_PATTERN = /\b[A-Z]{5}\d{4}[A-Z]\b/g; // Indian PAN format

/**
 * Sanitize text by redacting PII patterns
 * @param {string} text - Input text
 * @returns {string} - Sanitized text with PII redacted
 */
export function sanitizePII(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let sanitized = text;

  // Redact emails
  sanitized = sanitized.replace(EMAIL_PATTERN, '[EMAIL_REDACTED]');

  // Redact phone numbers
  sanitized = sanitized.replace(PHONE_PATTERN, '[PHONE_REDACTED]');

  // Redact Aadhaar numbers
  sanitized = sanitized.replace(AADHAAR_PATTERN, '[AADHAAR_REDACTED]');

  // Redact PAN numbers
  sanitized = sanitized.replace(PAN_PATTERN, '[PAN_REDACTED]');

  return sanitized;
}

/**
 * Normalize cache key for consistent caching
 * @param {string} question - User question
 * @param {string|null} schemeId - Optional scheme ID
 * @param {Array|null} bbox - Optional bounding box
 * @returns {string} - Normalized cache key
 */
export function normalizeCacheKey(question, schemeId = null, bbox = null) {
  // Lowercase and trim whitespace
  const normalizedQ = question.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Normalize scheme_id
  const normalizedScheme = schemeId ? schemeId.trim() : 'null';
  
  // Normalize bbox (round to 4 decimals for geo consistency)
  let normalizedBbox = 'null';
  if (bbox && Array.isArray(bbox) && bbox.length === 4) {
    normalizedBbox = bbox.map(coord => 
      typeof coord === 'number' ? coord.toFixed(4) : '0.0000'
    ).join(',');
  }

  return `${normalizedQ}|${normalizedScheme}|${normalizedBbox}`;
}

/**
 * Check if text contains potential PII (for logging decisions)
 * @param {string} text - Input text
 * @returns {boolean} - True if PII detected
 */
export function containsPII(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return EMAIL_PATTERN.test(text) || 
         PHONE_PATTERN.test(text) || 
         AADHAAR_PATTERN.test(text) ||
         PAN_PATTERN.test(text);
}
