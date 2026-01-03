import NodeCache from 'node-cache';

const DEFAULT_TTL = parseInt(process.env.RAG_CACHE_TTL_SECONDS || '120', 10);

/**
 * Simple in-memory cache for RAG queries
 * TTL-based with LRU eviction
 */
class RagCache {
  constructor(ttl = DEFAULT_TTL) {
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: ttl * 0.2, // Check for expired keys every 20% of TTL
      useClones: false,
      deleteOnExpire: true
    });

    console.log(`✅ RAG cache initialized with TTL=${ttl}s`);
  }

  /**
   * Get cached response
   * @param {string} key - Cache key
   * @returns {Object|null} - Cached response or null
   */
  get(key) {
    const value = this.cache.get(key);
    if (value) {
      console.log(`💾 Cache HIT: ${key.substring(0, 50)}...`);
      return { ...value, cached: true };
    }
    console.log(`❌ Cache MISS: ${key.substring(0, 50)}...`);
    return null;
  }

  /**
   * Set cached response
   * @param {string} key - Cache key
   * @param {Object} value - Response to cache
   * @param {number} ttl - Optional custom TTL
   */
  set(key, value, ttl) {
    this.cache.set(key, value, ttl);
    console.log(`💾 Cache SET: ${key.substring(0, 50)}...`);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.flushAll();
    console.log(`🗑️  Cache cleared`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

export default new RagCache();
