import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AnonymousReport from '../models/AnonymousReport.js';
import { anonymizeAndExtractIntent, analyzeReportLegitimacy } from '../utils/huggingfaceService.js';
import {
  createEscalationRecord,
  verifyEscalationChain,
  getNextEscalationLevel,
  generateReporterToken,
  hashOriginalReport,
  generateVoterId,
  calculateEscalationDeadline,
  getAuthorityDetails
} from '../utils/blockchainService.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads/anonymous-reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads (with metadata stripping)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use random name to prevent any identifying info from filename
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    cb(null, 'anon-' + uniqueSuffix + '.jpg'); // Always save as jpg
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// ============ PUBLIC ROUTES (for citizens) ============

/**
 * POST /api/anonymous-reports
 * Submit a new anonymous report
 */
router.post('/', upload.array('photos', 3), async (req, res) => {
  try {
    console.log('📝 Creating new anonymous report');
    
    const {
      title,
      description,
      category,
      location,
      district,
      coords,
      sessionId // Used to generate anonymous token
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, and category are required'
      });
    }

    // Generate reporter token (for tracking, not identification)
    const reporterToken = generateReporterToken(sessionId || req.ip || Date.now().toString());
    
    // Hash original content for privacy
    const originalReportHash = hashOriginalReport({ title, description, timestamp: Date.now() });

    // AI: Anonymize report and extract intent
    let anonymizedData;
    try {
      anonymizedData = await anonymizeAndExtractIntent(title, description, category, location || '');
      console.log('✅ Report anonymized successfully');
    } catch (aiError) {
      console.warn('⚠️ AI anonymization failed, using basic anonymization');
      anonymizedData = {
        anonymizedTitle: title.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CITIZEN]'),
        anonymizedDescription: description.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[CITIZEN]'),
        extractedIntent: `Issue reported regarding ${category}`,
        problemCategory: category,
        severity: 'medium',
        affectedArea: location || 'Unknown',
        keywords: [category],
        piiRemoved: [],
        confidence: 0.5
      };
    }

    // AI: Check report legitimacy
    let legitimacyCheck;
    try {
      legitimacyCheck = await analyzeReportLegitimacy(description);
    } catch (error) {
      legitimacyCheck = { isLegitimate: true, legitimacyScore: 70 };
    }

    // Generate unique ID
    const reportId = `ANON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Parse coordinates if provided
    let approximateCoords = [];
    if (coords) {
      try {
        const parsedCoords = JSON.parse(coords);
        // Generalize coordinates (reduce precision for privacy)
        approximateCoords = [
          Math.round(parsedCoords[0] * 100) / 100,
          Math.round(parsedCoords[1] * 100) / 100
        ];
      } catch (e) {
        console.warn('Failed to parse coordinates');
      }
    }

    // Get uploaded photo paths
    const photoPaths = req.files ? req.files.map(file => `/uploads/anonymous-reports/${file.filename}`) : [];

    // Calculate initial escalation deadline
    const escalationDeadline = calculateEscalationDeadline(0);

    // Create the report
    const newReport = new AnonymousReport({
      id: reportId,
      originalReportHash,
      reporterToken,
      anonymizedContent: {
        title: anonymizedData.anonymizedTitle,
        description: anonymizedData.anonymizedDescription,
        extractedIntent: anonymizedData.extractedIntent,
        problemCategory: anonymizedData.problemCategory || category,
        severity: anonymizedData.severity || 'medium',
        keywords: anonymizedData.keywords || [],
        affectedArea: anonymizedData.affectedArea || location || ''
      },
      location: {
        area: location || '',
        district: district || '',
        approximateCoords
      },
      status: legitimacyCheck.legitimacyScore < 40 ? 'pending' : 'pending',
      priority: anonymizedData.severity || 'medium',
      escalationDeadline,
      photos: photoPaths,
      aiProcessing: {
        model: anonymizedData.model || 'basic',
        processedAt: new Date(),
        confidence: anonymizedData.confidence || 0.5,
        piiRemoved: anonymizedData.piiRemoved || []
      }
    });

    // Add initial status update
    newReport.statusUpdates.push({
      status: 'pending',
      updatedBy: 'system',
      updatedByRole: 'system',
      message: 'Report submitted and anonymized successfully',
      timestamp: new Date()
    });

    const savedReport = await newReport.save();
    console.log('✅ Anonymous report created:', savedReport.id);

    // Broadcast to admin clients
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast({
        type: 'anonymous_report_added',
        report: {
          id: savedReport.id,
          title: savedReport.anonymizedContent.title,
          category: savedReport.anonymizedContent.problemCategory,
          status: savedReport.status,
          priority: savedReport.priority,
          createdAt: savedReport.createdAt
        },
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      reportId: savedReport.id,
      reporterToken, // Return token so citizen can track their report
      message: 'Report submitted anonymously. Save your reporter token to track status.',
      escalationDeadline: savedReport.escalationDeadline
    });

  } catch (error) {
    console.error('Error creating anonymous report:', error);
    res.status(500).json({ error: 'Failed to submit report', details: error.message });
  }
});

/**
 * GET /api/anonymous-reports/track/:token
 * Track report status using reporter token
 */
router.get('/track/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const report = await AnonymousReport.findOne({ reporterToken: token });
    if (!report) {
      return res.status(404).json({ error: 'Report not found. Please check your tracking token.' });
    }

    res.json({
      success: true,
      report: {
        id: report.id,
        title: report.anonymizedContent.title,
        category: report.anonymizedContent.problemCategory,
        status: report.status,
        priority: report.priority,
        createdAt: report.createdAt,
        currentEscalationLevel: report.currentEscalationLevel,
        escalationDeadline: report.escalationDeadline,
        statusUpdates: report.statusUpdates.map(u => ({
          status: u.status,
          message: u.message,
          timestamp: u.timestamp
        })),
        assignedTo: report.assignedTo.workerName || null,
        upvoteCount: report.upvoteCount,
        downvoteCount: report.downvoteCount,
        credibilityScore: report.credibilityScore,
        resolutionFeedback: report.resolutionFeedback
      }
    });
  } catch (error) {
    console.error('Error tracking report:', error);
    res.status(500).json({ error: 'Failed to track report' });
  }
});

/**
 * POST /api/anonymous-reports/:id/escalate
 * Citizen escalates their report to higher authority
 */
router.post('/:id/escalate', async (req, res) => {
  try {
    const { id } = req.params;
    const { reporterToken, reason } = req.body;

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify reporter token
    if (report.reporterToken !== reporterToken) {
      return res.status(403).json({ error: 'Unauthorized. Invalid reporter token.' });
    }

    // Check if escalation is allowed
    const nextLevel = getNextEscalationLevel(report.currentEscalationLevel);
    if (!nextLevel) {
      return res.status(400).json({ error: 'Report is already at maximum escalation level' });
    }

    // Check if deadline has passed (required for escalation)
    const now = new Date();
    if (now < report.escalationDeadline) {
      const daysRemaining = Math.ceil((report.escalationDeadline - now) / (1000 * 60 * 60 * 24));
      return res.status(400).json({ 
        error: `Cannot escalate yet. ${daysRemaining} days remaining before escalation is allowed.`,
        escalationDeadline: report.escalationDeadline
      });
    }

    // Get previous hash
    const previousHash = report.escalationHistory.length > 0
      ? report.escalationHistory[report.escalationHistory.length - 1].currentHash
      : null;

    // Create escalation record
    const escalationRecord = createEscalationRecord(
      report.id,
      nextLevel.level,
      reason || 'Issue not resolved within timeframe',
      previousHash
    );

    // Update report
    report.escalationHistory.push(escalationRecord);
    report.currentEscalationLevel = nextLevel.level;
    report.escalationDeadline = calculateEscalationDeadline(nextLevel.level);
    
    report.statusUpdates.push({
      status: report.status,
      updatedBy: 'citizen',
      updatedByRole: 'system',
      message: `Escalated to ${nextLevel.title}. Reason: ${reason || 'Issue not resolved'}`,
      timestamp: new Date()
    });

    await report.save();

    // Broadcast escalation
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast({
        type: 'report_escalated',
        reportId: report.id,
        newLevel: nextLevel.level,
        authority: nextLevel.title,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Report escalated to ${nextLevel.title}`,
      newLevel: nextLevel.level,
      authority: nextLevel.title,
      newDeadline: report.escalationDeadline,
      escalationHash: escalationRecord.currentHash
    });

  } catch (error) {
    console.error('Error escalating report:', error);
    res.status(500).json({ error: 'Failed to escalate report' });
  }
});

/**
 * POST /api/anonymous-reports/:id/feedback
 * Citizen provides feedback on resolution
 */
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { reporterToken, isResolved, satisfactionRating, feedback } = req.body;

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify reporter token
    if (report.reporterToken !== reporterToken) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update resolution feedback
    report.resolutionFeedback = {
      isResolved,
      satisfactionRating,
      feedback: feedback || '',
      submittedAt: new Date()
    };

    // If citizen confirms resolved, update status
    if (isResolved && report.status !== 'closed') {
      report.status = 'closed';
      report.resolvedAt = new Date();
      
      report.statusUpdates.push({
        status: 'closed',
        updatedBy: 'citizen',
        updatedByRole: 'system',
        message: `Citizen confirmed issue resolved. Rating: ${satisfactionRating}/5`,
        timestamp: new Date()
      });
    }

    await report.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * POST /api/anonymous-reports/:id/vote
 * Community voting on report credibility
 */
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, voterIdentifier } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Generate anonymous voter ID
    const voterId = generateVoterId(id, voterIdentifier || req.ip);

    // Check if already voted
    const existingVote = report.votes.find(v => v.voterId === voterId);
    if (existingVote) {
      // Allow changing vote
      if (existingVote.voteType === voteType) {
        return res.status(400).json({ error: 'You have already cast this vote' });
      }
      
      // Update vote counts
      if (existingVote.voteType === 'upvote') {
        report.upvoteCount = Math.max(0, report.upvoteCount - 1);
      } else {
        report.downvoteCount = Math.max(0, report.downvoteCount - 1);
      }
      
      existingVote.voteType = voteType;
      existingVote.timestamp = new Date();
    } else {
      // Add new vote
      report.votes.push({
        voterId,
        voteType,
        timestamp: new Date()
      });
    }

    // Update vote counts
    if (voteType === 'upvote') {
      report.upvoteCount++;
    } else {
      report.downvoteCount++;
    }

    await report.save();

    res.json({
      success: true,
      upvoteCount: report.upvoteCount,
      downvoteCount: report.downvoteCount,
      credibilityScore: report.credibilityScore
    });

  } catch (error) {
    console.error('Error voting on report:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// ============ ADMIN ROUTES ============

/**
 * GET /api/anonymous-reports
 * Admin: Get all anonymous reports
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, escalationLevel, sortBy } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (escalationLevel) query.currentEscalationLevel = parseInt(escalationLevel);

    let sortOption = { createdAt: -1 };
    if (sortBy === 'priority') sortOption = { priority: -1, createdAt: -1 };
    if (sortBy === 'escalation') sortOption = { currentEscalationLevel: -1, createdAt: -1 };
    if (sortBy === 'credibility') sortOption = { credibilityScore: -1, createdAt: -1 };

    const reports = await AnonymousReport.find(query).sort(sortOption);
    
    res.json({
      success: true,
      count: reports.length,
      reports: reports.map(r => ({
        id: r.id,
        title: r.anonymizedContent.title,
        description: r.anonymizedContent.description,
        intent: r.anonymizedContent.extractedIntent,
        category: r.anonymizedContent.problemCategory,
        severity: r.anonymizedContent.severity,
        keywords: r.anonymizedContent.keywords,
        location: r.location,
        status: r.status,
        priority: r.priority,
        assignedTo: r.assignedTo,
        currentEscalationLevel: r.currentEscalationLevel,
        escalationDeadline: r.escalationDeadline,
        escalationHistory: r.escalationHistory,
        upvoteCount: r.upvoteCount,
        downvoteCount: r.downvoteCount,
        credibilityScore: r.credibilityScore,
        photos: r.photos,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        statusUpdates: r.statusUpdates,
        resolutionFeedback: r.resolutionFeedback
      }))
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/anonymous-reports/:id
 * Admin: Get single report details
 */
router.get('/:id', async (req, res) => {
  try {
    const report = await AnonymousReport.findOne({ id: req.params.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify escalation chain integrity
    const chainVerification = verifyEscalationChain(report.escalationHistory);

    res.json({
      success: true,
      report: {
        id: report.id,
        anonymizedContent: report.anonymizedContent,
        location: report.location,
        status: report.status,
        priority: report.priority,
        assignedTo: report.assignedTo,
        currentEscalationLevel: report.currentEscalationLevel,
        currentAuthority: getAuthorityDetails(report.currentEscalationLevel),
        escalationDeadline: report.escalationDeadline,
        escalationHistory: report.escalationHistory,
        chainIntegrity: chainVerification,
        statusUpdates: report.statusUpdates,
        votes: {
          upvotes: report.upvoteCount,
          downvotes: report.downvoteCount,
          credibilityScore: report.credibilityScore,
          totalVotes: report.votes.length
        },
        photos: report.photos,
        aiProcessing: report.aiProcessing,
        resolutionFeedback: report.resolutionFeedback,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        acknowledgedAt: report.acknowledgedAt,
        resolvedAt: report.resolvedAt
      }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * PUT /api/anonymous-reports/:id/status
 * Admin: Update report status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, updatedBy, updatedByRole } = req.body;

    const validStatuses = ['pending', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    
    // Set acknowledged timestamp
    if (status === 'acknowledged' && !report.acknowledgedAt) {
      report.acknowledgedAt = new Date();
    }
    
    // Set resolved timestamp
    if ((status === 'resolved' || status === 'closed') && !report.resolvedAt) {
      report.resolvedAt = new Date();
    }

    report.statusUpdates.push({
      status,
      updatedBy: updatedBy || 'admin',
      updatedByRole: updatedByRole || 'admin',
      message: message || `Status updated to ${status}`,
      timestamp: new Date()
    });

    await report.save();

    // Broadcast update
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast({
        type: 'report_status_updated',
        reportId: report.id,
        status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      report: {
        id: report.id,
        status: report.status,
        statusUpdates: report.statusUpdates
      }
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * PUT /api/anonymous-reports/:id/assign
 * Admin: Assign field worker to report
 */
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName, assignedBy } = req.body;

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.assignedTo = {
      workerId,
      workerName,
      assignedAt: new Date()
    };

    report.status = 'assigned';

    report.statusUpdates.push({
      status: 'assigned',
      updatedBy: assignedBy || 'admin',
      updatedByRole: 'admin',
      message: `Assigned to field worker: ${workerName}`,
      timestamp: new Date()
    });

    await report.save();

    // Broadcast assignment
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      broadcast({
        type: 'report_assigned',
        reportId: report.id,
        workerId,
        workerName,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: `Report assigned to ${workerName}`,
      report: {
        id: report.id,
        status: report.status,
        assignedTo: report.assignedTo
      }
    });

  } catch (error) {
    console.error('Error assigning report:', error);
    res.status(500).json({ error: 'Failed to assign report' });
  }
});

/**
 * PUT /api/anonymous-reports/:id/priority
 * Admin: Update report priority
 */
router.put('/:id/priority', async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, updatedBy } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    const report = await AnonymousReport.findOne({ id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const oldPriority = report.priority;
    report.priority = priority;

    report.statusUpdates.push({
      status: report.status,
      updatedBy: updatedBy || 'admin',
      updatedByRole: 'admin',
      message: `Priority changed from ${oldPriority} to ${priority}`,
      timestamp: new Date()
    });

    await report.save();

    res.json({
      success: true,
      message: 'Priority updated successfully',
      report: {
        id: report.id,
        priority: report.priority
      }
    });

  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

/**
 * GET /api/anonymous-reports/stats/overview
 * Admin: Get reports statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await AnonymousReport.countDocuments();
    const pending = await AnonymousReport.countDocuments({ status: 'pending' });
    const inProgress = await AnonymousReport.countDocuments({ status: { $in: ['acknowledged', 'assigned', 'in_progress'] } });
    const resolved = await AnonymousReport.countDocuments({ status: { $in: ['resolved', 'closed'] } });
    const escalated = await AnonymousReport.countDocuments({ currentEscalationLevel: { $gt: 0 } });
    const critical = await AnonymousReport.countDocuments({ priority: 'critical' });

    // Category breakdown
    const categoryStats = await AnonymousReport.aggregate([
      { $group: { _id: '$anonymizedContent.problemCategory', count: { $sum: 1 } } }
    ]);

    // Average resolution time (for resolved reports)
    const resolvedReports = await AnonymousReport.find({ resolvedAt: { $ne: null } });
    let avgResolutionTime = 0;
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((sum, r) => {
        return sum + (r.resolvedAt - r.createdAt);
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedReports.length / (1000 * 60 * 60 * 24)); // Days
    }

    res.json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        escalated,
        critical,
        avgResolutionTimeDays: avgResolutionTime,
        byCategory: categoryStats.reduce((acc, c) => {
          acc[c._id] = c.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
