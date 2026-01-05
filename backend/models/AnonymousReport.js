import mongoose from 'mongoose';

// Schema for escalation history tracking (blockchain-like immutable records)
const escalationSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true
  },
  authority: {
    type: String,
    required: true,
    enum: ['sarpanch', 'block_officer', 'district_magistrate', 'state_authority']
  },
  authorityName: {
    type: String,
    default: ''
  },
  escalatedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  // Blockchain-like hash for immutability verification
  previousHash: {
    type: String,
    default: null
  },
  currentHash: {
    type: String,
    required: true
  },
  // Digital signature placeholder for authenticity
  signature: {
    type: String,
    default: ''
  }
});

// Schema for status updates from admin/field workers
const statusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected']
  },
  updatedBy: {
    type: String,
    required: true
  },
  updatedByRole: {
    type: String,
    enum: ['admin', 'field_worker', 'sarpanch', 'system']
  },
  message: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Schema for citizen votes on report credibility
const voteSchema = new mongoose.Schema({
  voterId: {
    type: String, // Anonymous voter identifier (hashed)
    required: true
  },
  voteType: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Schema for citizen feedback on resolution
const resolutionFeedbackSchema = new mongoose.Schema({
  isResolved: {
    type: Boolean,
    required: true
  },
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Main Anonymous Report Schema
const anonymousReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Original report data (stored encrypted/hashed for privacy)
  originalReportHash: {
    type: String,
    required: true
  },
  
  // Anonymous identifier for the reporter (for tracking, not identification)
  reporterToken: {
    type: String,
    required: true
  },
  
  // AI-processed anonymized content
  anonymizedContent: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    extractedIntent: {
      type: String,
      required: true
    },
    problemCategory: {
      type: String,
      required: true,
      enum: ['road', 'water', 'power', 'waste', 'healthcare', 'education', 'corruption', 'safety', 'other']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    keywords: [{
      type: String
    }],
    affectedArea: {
      type: String,
      default: ''
    }
  },
  
  // Location (anonymized to area level, not exact)
  location: {
    area: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: ''
    },
    approximateCoords: {
      type: [Number], // [longitude, latitude] - generalized
      default: []
    }
  },
  
  // Current status
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  
  // Priority (can be adjusted by admin)
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Assignment
  assignedTo: {
    workerId: {
      type: String,
      default: null
    },
    workerName: {
      type: String,
      default: ''
    },
    assignedAt: {
      type: Date,
      default: null
    }
  },
  
  // Escalation tracking (blockchain-like)
  currentEscalationLevel: {
    type: Number,
    default: 0 // 0 = local, 1 = block, 2 = district, 3 = state
  },
  escalationHistory: [escalationSchema],
  
  // Auto-escalation settings
  escalationDeadline: {
    type: Date,
    default: null
  },
  autoEscalateEnabled: {
    type: Boolean,
    default: true
  },
  escalationTimeframeDays: {
    type: Number,
    default: 7 // Days before auto-escalation
  },
  
  // Status updates from admin/workers
  statusUpdates: [statusUpdateSchema],
  
  // Community voting for credibility
  votes: [voteSchema],
  upvoteCount: {
    type: Number,
    default: 0
  },
  downvoteCount: {
    type: Number,
    default: 0
  },
  credibilityScore: {
    type: Number,
    default: 50 // 0-100 scale
  },
  
  // Resolution feedback from reporter
  resolutionFeedback: resolutionFeedbackSchema,
  
  // Photos (anonymized - metadata stripped)
  photos: [{
    type: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  
  // AI Processing metadata
  aiProcessing: {
    model: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date,
      default: null
    },
    confidence: {
      type: Number,
      default: 0
    },
    piiRemoved: [{
      type: String
    }]
  }
});

// Pre-save middleware
anonymousReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate credibility score based on votes
  const totalVotes = this.upvoteCount + this.downvoteCount;
  if (totalVotes > 0) {
    this.credibilityScore = Math.round((this.upvoteCount / totalVotes) * 100);
  }
  
  // Set escalation deadline if not set
  if (!this.escalationDeadline && this.autoEscalateEnabled) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + this.escalationTimeframeDays);
    this.escalationDeadline = deadline;
  }
  
  next();
});

// Method to check if escalation is needed
anonymousReportSchema.methods.needsEscalation = function() {
  if (!this.autoEscalateEnabled) return false;
  if (this.status === 'resolved' || this.status === 'closed') return false;
  if (this.currentEscalationLevel >= 3) return false; // Max level reached
  
  return new Date() > this.escalationDeadline;
};

// Method to get authority name for escalation level
anonymousReportSchema.statics.getAuthorityForLevel = function(level) {
  const authorities = {
    0: 'sarpanch',
    1: 'block_officer',
    2: 'district_magistrate',
    3: 'state_authority'
  };
  return authorities[level] || 'sarpanch';
};

export default mongoose.model('AnonymousReport', anonymousReportSchema);
