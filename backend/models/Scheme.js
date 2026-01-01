import mongoose from 'mongoose';

// Define sub-schemas to avoid casting issues
const phaseSchema = new mongoose.Schema({
  id: Number,
  name: String,
  progress: Number,
  status: String,
  startDate: String,
  endDate: String,
  budget: Number,
  spent: Number,
  // Enhanced phase details from PDF
  milestones: [String],
  deliverables: [String],
  plannedWork: String,
  timeline: String
}, { _id: false });

const vendorReportSchema = new mongoose.Schema({
  id: String,
  vendorName: String,
  submittedDate: Date,
  phase: Number,
  workCompleted: String,
  expenseClaimed: Number,
  verificationStatus: String,
  documents: [String],
  // AI-generated compliance analysis
  complianceAnalysis: {
    overallCompliance: Number, // 0-100%
    matchingItems: [String],
    discrepancies: [{
      category: String, // 'budget', 'timeline', 'quality', 'scope'
      severity: String, // 'critical', 'high', 'medium', 'low'
      description: String,
      plannedValue: String,
      actualValue: String
    }],
    overdueWork: [{
      task: String,
      plannedDate: String,
      currentStatus: String,
      delayDays: Number
    }],
    budgetAnalysis: {
      plannedBudget: Number,
      claimedExpense: Number,
      variance: Number,
      variancePercentage: Number
    },
    aiSummary: String,
    aiProcessed: Boolean
  },
  pdfFileName: String
}, { _id: false });

const discrepancySchema = new mongoose.Schema({
  id: String,
  type: String,
  severity: String,
  description: String,
  reportedDate: String,
  date: String,
  reportedBy: String,
  categories: [String],
  concerns: [String],
  status: String
}, { _id: false });

const schemeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: String,
  village: String,
  district: String,
  totalBudget: Number,
  budgetUtilized: Number,
  startDate: String,
  endDate: String,
  overallProgress: Number,
  status: {
    type: String,
    enum: ['on-track', 'delayed', 'completed', 'discrepant']
  },
  description: String,
  phases: [phaseSchema],
  vendorReports: [vendorReportSchema],
  discrepancies: [discrepancySchema],
  citizenRating: {
    type: Number,
    default: 0
  },
  feedbackCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
schemeSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model('Scheme', schemeSchema);
