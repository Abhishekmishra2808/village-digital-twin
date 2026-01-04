import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  schemeId: {
    type: String,
    required: true,
    index: true
  },
  // Anonymous user identifier (hashed IP or session ID)
  userHash: {
    type: String,
    required: true,
    select: false // Never expose to admin
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
    // Rating is visible to admin (anonymized)
  },
  rawComment: {
    type: String,
    // Stored but never exposed to admin
    select: false
  },
  aiSummary: {
    type: String,
    required: true
  },
  concerns: [{
    type: String
  }],
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', 'Critical']
  },
  categories: [{
    type: String
  }],
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
feedbackSchema.index({ schemeId: 1, createdAt: -1 });
// Index to check if user already submitted feedback recently
feedbackSchema.index({ schemeId: 1, userHash: 1, createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
