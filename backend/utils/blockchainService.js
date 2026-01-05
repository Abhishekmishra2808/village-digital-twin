import crypto from 'crypto';

/**
 * Blockchain-like service for immutable escalation tracking
 * Uses cryptographic hashing to ensure escalation records cannot be tampered with
 */

// Authority levels and their details
const AUTHORITY_LEVELS = {
  0: { name: 'sarpanch', title: 'Village Sarpanch', timeframeDays: 7 },
  1: { name: 'block_officer', title: 'Block Development Officer', timeframeDays: 10 },
  2: { name: 'district_magistrate', title: 'District Magistrate', timeframeDays: 14 },
  3: { name: 'state_authority', title: 'State Level Authority', timeframeDays: 21 }
};

/**
 * Generate a hash for the escalation record
 * @param {Object} data - Escalation data
 * @param {string} previousHash - Hash of previous escalation
 * @returns {string} SHA-256 hash
 */
export function generateEscalationHash(data, previousHash = null) {
  const content = JSON.stringify({
    reportId: data.reportId,
    level: data.level,
    authority: data.authority,
    escalatedAt: data.escalatedAt,
    reason: data.reason,
    previousHash: previousHash
  });
  
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Verify the integrity of an escalation chain
 * @param {Array} escalationHistory - Array of escalation records
 * @returns {Object} Verification result
 */
export function verifyEscalationChain(escalationHistory) {
  if (!escalationHistory || escalationHistory.length === 0) {
    return { valid: true, message: 'No escalations to verify' };
  }
  
  for (let i = 0; i < escalationHistory.length; i++) {
    const record = escalationHistory[i];
    
    // First record should have null previousHash
    if (i === 0 && record.previousHash !== null) {
      return { 
        valid: false, 
        message: 'First escalation record has invalid previous hash',
        failedAt: i 
      };
    }
    
    // Verify chain linkage for subsequent records
    if (i > 0) {
      const expectedPrevHash = escalationHistory[i - 1].currentHash;
      if (record.previousHash !== expectedPrevHash) {
        return { 
          valid: false, 
          message: `Chain broken at record ${i}: previous hash mismatch`,
          failedAt: i 
        };
      }
    }
    
    // Verify current hash
    const computedHash = generateEscalationHash({
      reportId: record.reportId,
      level: record.level,
      authority: record.authority,
      escalatedAt: record.escalatedAt,
      reason: record.reason
    }, record.previousHash);
    
    if (record.currentHash !== computedHash) {
      return { 
        valid: false, 
        message: `Hash mismatch at record ${i}: data may have been tampered`,
        failedAt: i 
      };
    }
  }
  
  return { valid: true, message: 'Escalation chain verified successfully' };
}

/**
 * Create a new escalation record
 * @param {string} reportId - Report ID
 * @param {number} level - New escalation level
 * @param {string} reason - Reason for escalation
 * @param {string} previousHash - Hash of previous escalation (null for first)
 * @returns {Object} New escalation record
 */
export function createEscalationRecord(reportId, level, reason, previousHash = null) {
  const authority = AUTHORITY_LEVELS[level];
  if (!authority) {
    throw new Error(`Invalid escalation level: ${level}`);
  }
  
  const escalatedAt = new Date().toISOString();
  
  const record = {
    reportId,
    level,
    authority: authority.name,
    authorityName: authority.title,
    escalatedAt,
    reason,
    previousHash,
    currentHash: '' // Will be set below
  };
  
  record.currentHash = generateEscalationHash(record, previousHash);
  
  // Generate a simple signature (in production, use proper digital signatures)
  record.signature = crypto
    .createHmac('sha256', process.env.ESCALATION_SECRET || 'village-twin-secret')
    .update(record.currentHash)
    .digest('hex')
    .substring(0, 16);
  
  return record;
}

/**
 * Get the next escalation level details
 * @param {number} currentLevel - Current escalation level
 * @returns {Object|null} Next level details or null if max level reached
 */
export function getNextEscalationLevel(currentLevel) {
  const nextLevel = currentLevel + 1;
  if (nextLevel > 3) {
    return null; // Max level reached
  }
  return {
    level: nextLevel,
    ...AUTHORITY_LEVELS[nextLevel]
  };
}

/**
 * Get authority details for a level
 * @param {number} level - Escalation level
 * @returns {Object} Authority details
 */
export function getAuthorityDetails(level) {
  return AUTHORITY_LEVELS[level] || AUTHORITY_LEVELS[0];
}

/**
 * Calculate deadline for next escalation
 * @param {number} currentLevel - Current escalation level
 * @param {Date} fromDate - Date to calculate from
 * @returns {Date} Deadline date
 */
export function calculateEscalationDeadline(currentLevel, fromDate = new Date()) {
  const authority = AUTHORITY_LEVELS[currentLevel];
  const deadline = new Date(fromDate);
  deadline.setDate(deadline.getDate() + (authority?.timeframeDays || 7));
  return deadline;
}

/**
 * Generate a unique anonymous reporter token
 * @param {string} identifier - Some identifier (can be session ID, IP hash, etc.)
 * @returns {string} Anonymous token
 */
export function generateReporterToken(identifier) {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString('hex');
  const combined = `${identifier}-${timestamp}-${random}`;
  
  return crypto
    .createHash('sha256')
    .update(combined)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Hash the original report content for privacy
 * @param {Object} reportData - Original report data
 * @returns {string} Hash of original content
 */
export function hashOriginalReport(reportData) {
  const content = JSON.stringify({
    title: reportData.title,
    description: reportData.description,
    timestamp: reportData.timestamp || Date.now()
  });
  
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate a unique voter ID (for preventing duplicate votes)
 * @param {string} reportId - Report ID
 * @param {string} voterIdentifier - Some voter identifier (session, etc.)
 * @returns {string} Hashed voter ID
 */
export function generateVoterId(reportId, voterIdentifier) {
  const combined = `${reportId}-${voterIdentifier}`;
  return crypto
    .createHash('sha256')
    .update(combined)
    .digest('hex')
    .substring(0, 24);
}

export default {
  generateEscalationHash,
  verifyEscalationChain,
  createEscalationRecord,
  getNextEscalationLevel,
  getAuthorityDetails,
  calculateEscalationDeadline,
  generateReporterToken,
  hashOriginalReport,
  generateVoterId,
  AUTHORITY_LEVELS
};
