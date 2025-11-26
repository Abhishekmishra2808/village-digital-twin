import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import Scheme from '../models/Scheme.js';
import Feedback from '../models/Feedback.js';
// Switched from Gemini to Hugging Face Llama 3.1-8B-Instruct
import { processFeedbackWithAI } from '../utils/huggingfaceService.js';
import { extractSchemeFromPDF, analyzeVendorReport } from '../utils/pdfService.js';

const router = express.Router();

// Configure multer for PDF uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ lastUpdated: -1 });
    res.json({ schemes });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch schemes' });
  }
});

// Create new scheme (admin only)
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new scheme:', req.body);

    const {
      name,
      description,
      category,
      village,
      district,
      totalBudget,
      startDate,
      endDate,
    } = req.body;

    // Validate required fields
    if (!name || !description || !totalBudget) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, and totalBudget are required' 
      });
    }

    // Generate unique ID
    const schemeId = `SCHEME-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create new scheme
    const newScheme = new Scheme({
      id: schemeId,
      name,
      description,
      category: category || 'General',
      village: village || 'Delhi Village',
      district: district || 'New Delhi',
      totalBudget: parseFloat(totalBudget) || 0,
      budgetUtilized: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      overallProgress: 0,
      status: 'on-track',
      phases: [
        {
          id: 1,
          name: 'Planning',
          progress: 0,
          status: 'not-started',
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          budget: parseFloat(totalBudget) || 0,
          spent: 0
        }
      ],
      vendorReports: [],
      discrepancies: [],
      citizenRating: 0,
      feedbackCount: 0,
      lastUpdated: new Date().toISOString()
    });

    const savedScheme = await newScheme.save();
    console.log('✅ Scheme created successfully:', savedScheme.id);

    // Broadcast to all connected clients
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allSchemes = await Scheme.find().sort({ lastUpdated: -1 });
      broadcast({
        type: 'scheme_added',
        scheme: savedScheme,
        allSchemes: allSchemes,
        timestamp: new Date().toISOString()
      });
      console.log('📡 Broadcasted new scheme to all clients');
    }

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme: savedScheme
    });
  } catch (error) {
    console.error('❌ Error creating scheme:', error);
    res.status(500).json({ 
      error: 'Failed to create scheme', 
      details: error.message 
    });
  }
});

// Get single scheme
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ id: req.params.id });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Get feedback for this scheme
    const feedback = await Feedback.find({ schemeId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ scheme, feedback });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({ error: 'Failed to fetch scheme' });
  }
});

// Submit feedback (AI processed)
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, comment, isUrgent, userId } = req.body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) required' });
    }

    // Create anonymous user hash (use userId or IP address)
    const userIdentifier = userId || req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const userHash = crypto.createHash('sha256').update(userIdentifier).digest('hex');

    // Find scheme
    const scheme = await Scheme.findOne({ id: req.params.id });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Check if user already submitted feedback in the last 3 weeks (21 days)
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    const recentFeedback = await Feedback.findOne({
      schemeId: req.params.id,
      userHash: userHash,
      createdAt: { $gte: threeWeeksAgo }
    }).select('+userHash');

    if (recentFeedback) {
      const daysSinceLastFeedback = Math.ceil((Date.now() - recentFeedback.createdAt) / (1000 * 60 * 60 * 24));
      const daysRemaining = 21 - daysSinceLastFeedback;
      
      return res.status(429).json({ 
        error: 'You have already submitted feedback for this scheme recently',
        message: `Please wait ${daysRemaining} more day(s) before submitting feedback again`,
        nextAllowedDate: new Date(recentFeedback.createdAt.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    console.log(`🤖 Processing feedback with Hugging Face Llama 3.1-8B for: ${scheme.name}`);

    // Process with Hugging Face Llama 3.1-8B
    const aiResult = await processFeedbackWithAI(
      comment || 'No comment provided',
      rating,
      scheme.name
    );

    const aiAnalysis = aiResult.analysis;

    // Save feedback to database
    const feedback = await Feedback.create({
      schemeId: req.params.id,
      userHash: userHash,
      rating,
      rawComment: comment, // Stored but never exposed
      aiSummary: aiAnalysis.summary,
      concerns: aiAnalysis.concerns,
      sentiment: aiAnalysis.sentiment,
      categories: aiAnalysis.categories,
      urgency: aiAnalysis.urgency,
      isUrgent: isUrgent || (aiAnalysis.urgency === 'Critical' || aiAnalysis.urgency === 'High'),
      aiProcessed: aiResult.success
    });

    // Update scheme statistics - FIX: Properly calculate average rating
    const previousCount = scheme.feedbackCount || 0;
    const previousRating = scheme.citizenRating || 0;
    
    // New count
    scheme.feedbackCount = previousCount + 1;
    
    // Calculate new average: ((old_avg * old_count) + new_rating) / new_count
    const totalRating = (previousRating * previousCount) + rating;
    scheme.citizenRating = totalRating / scheme.feedbackCount;
    scheme.citizenRating = Math.round(scheme.citizenRating * 10) / 10; // Round to 1 decimal

    // Add discrepancy if urgent
    if (feedback.isUrgent) {
      scheme.discrepancies.push({
        id: `disc-${Date.now()}`,
        type: 'citizen_reported',
        description: `${aiAnalysis.urgency} Issue: ${aiAnalysis.summary}`,
        severity: aiAnalysis.urgency === 'Critical' ? 'critical' : 'high',
        reportedBy: 'Citizen (Anonymous)',
        categories: aiAnalysis.categories,
        concerns: aiAnalysis.concerns,
        date: new Date().toISOString(),
        status: 'pending'
      });
    }

    await scheme.save();

    console.log(`✅ Feedback saved: ${scheme.name} - Rating: ${rating}/5 - New Avg: ${scheme.citizenRating} - Total: ${scheme.feedbackCount} - Sentiment: ${aiAnalysis.sentiment}`);

    // Broadcast updated scheme to all clients
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allSchemes = await Scheme.find().sort({ lastUpdated: -1 });
      broadcast({
        type: 'scheme_updated',
        schemeId: scheme.id,
        allSchemes: allSchemes,
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        aiSummary: feedback.aiSummary,
        sentiment: feedback.sentiment,
        urgency: feedback.urgency
      },
      scheme: {
        id: scheme.id,
        citizenRating: scheme.citizenRating,
        feedbackCount: scheme.feedbackCount
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get feedback for a scheme (admin only - anonymized with rating visible)
router.get('/:id/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find({ schemeId: req.params.id })
      .select('-rawComment -userHash') // Never expose raw comments or user identity
      .sort({ createdAt: -1 })
      .limit(50);

    // Return anonymized feedback with rating visible
    const anonymizedFeedback = feedback.map(f => ({
      id: f._id,
      schemeId: f.schemeId,
      rating: f.rating, // Rating is visible to admin
      aiSummary: f.aiSummary,
      concerns: f.concerns,
      sentiment: f.sentiment,
      categories: f.categories,
      urgency: f.urgency,
      isUrgent: f.isUrgent,
      aiProcessed: f.aiProcessed,
      createdAt: f.createdAt,
      // userHash is never exposed - anonymity preserved
    }));

    res.json({ feedback: anonymizedFeedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Extract scheme details from PDF using AI
router.post('/extract-from-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('📄 Processing scheme PDF:', req.file.originalname, 'Size:', req.file.size);

    // Extract scheme data using Gemini AI
    const result = await extractSchemeFromPDF(req.file.buffer);

    if (result.success) {
      console.log('✅ Successfully extracted scheme data from PDF');
      res.json({
        success: true,
        data: result.data,
        message: 'Scheme data extracted successfully. Please review and submit.'
      });
    } else {
      console.error('❌ Failed to extract scheme data:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to extract data from PDF. Please fill manually.'
      });
    }
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    res.status(500).json({ error: 'Failed to process PDF file' });
  }
});

// Upload and analyze vendor report against government plan
router.post('/:id/vendor-report', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const schemeId = req.params.id;
    
    // Get the government scheme plan
    const scheme = await Scheme.findOne({ id: schemeId });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    console.log('📊 Analyzing vendor report for scheme:', scheme.name);
    console.log('📄 Vendor PDF:', req.file.originalname, 'Size:', req.file.size);

    // Analyze vendor report using Gemini AI
    const result = await analyzeVendorReport(req.file.buffer, scheme);

    if (result.success) {
      // Create vendor report entry
      const vendorReport = {
        id: `VR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        vendorName: result.analysis.vendorName || 'Unknown Vendor',
        submittedDate: result.analysis.reportDate ? new Date(result.analysis.reportDate) : new Date(),
        phase: result.analysis.phase || 1,
        workCompleted: result.analysis.workCompleted || 'Not specified',
        expenseClaimed: result.analysis.expenseClaimed || 0,
        verificationStatus: result.analysis.overallCompliance >= 80 ? 'approved' : 
                           result.analysis.overallCompliance >= 60 ? 'under-review' : 'rejected',
        pdfFileName: req.file.originalname,
        complianceAnalysis: {
          overallCompliance: result.analysis.overallCompliance,
          matchingItems: result.analysis.matchingItems || [],
          discrepancies: result.analysis.discrepancies || [],
          overdueWork: result.analysis.overdueWork || [],
          budgetAnalysis: result.analysis.budgetAnalysis || {},
          aiSummary: result.analysis.aiSummary,
          aiProcessed: result.aiProcessed
        }
      };

      // Add to scheme's vendor reports
      if (!scheme.vendorReports) {
        scheme.vendorReports = [];
      }
      scheme.vendorReports.push(vendorReport);

      // ===== UPDATE SCHEME METRICS BASED ON VENDOR REPORT =====
      
      // 1. UPDATE BUDGET UTILIZED
      const claimedExpense = result.analysis.expenseClaimed || 0;
      if (claimedExpense > 0) {
        // Add the claimed expense to budget utilized
        scheme.budgetUtilized = (scheme.budgetUtilized || 0) + claimedExpense;
        console.log(`💰 Budget Updated: +₹${claimedExpense} → Total: ₹${scheme.budgetUtilized}`);
      }

      // 2. UPDATE OVERALL PROGRESS
      // Calculate progress based on phases and vendor reports
      const totalPhases = scheme.phases.length || 4;
      const reportedPhase = result.analysis.phase || 1;
      
      // Update the specific phase progress if provided in analysis
      if (scheme.phases && scheme.phases.length > 0) {
        const phaseIndex = scheme.phases.findIndex(p => p.id === reportedPhase);
        if (phaseIndex !== -1) {
          // Estimate phase progress from compliance score
          const phaseProgress = Math.min(100, Math.round(result.analysis.overallCompliance));
          scheme.phases[phaseIndex].progress = phaseProgress;
          
          // Update phase status
          if (phaseProgress >= 100) {
            scheme.phases[phaseIndex].status = 'completed';
          } else if (phaseProgress > 0) {
            scheme.phases[phaseIndex].status = result.analysis.overallCompliance >= 70 ? 'on-track' : 'delayed';
          }
          
          // Update phase budget spent
          if (claimedExpense > 0) {
            scheme.phases[phaseIndex].spent = (scheme.phases[phaseIndex].spent || 0) + claimedExpense;
          }
        }
      }
      
      // Calculate overall progress as average of all phases
      let totalProgress = 0;
      if (scheme.phases && scheme.phases.length > 0) {
        totalProgress = scheme.phases.reduce((sum, phase) => sum + (phase.progress || 0), 0) / scheme.phases.length;
      } else {
        // Fallback: estimate from reported phase and compliance
        totalProgress = ((reportedPhase - 1) / totalPhases) * 100 + (result.analysis.overallCompliance / totalPhases);
      }
      
      scheme.overallProgress = Math.min(100, Math.round(totalProgress));
      console.log(`📊 Progress Updated: ${scheme.overallProgress}%`);

      // 3. UPDATE SCHEME STATUS
      if (result.analysis.discrepancies && result.analysis.discrepancies.length > 0) {
        const hasCritical = result.analysis.discrepancies.some(d => d.severity === 'critical');
        if (hasCritical) {
          scheme.status = 'discrepant';
        } else if (result.analysis.overallCompliance < 70) {
          scheme.status = 'delayed';
        }
      } else if (scheme.overallProgress >= 100) {
        scheme.status = 'completed';
      } else if (result.analysis.overallCompliance >= 70) {
        scheme.status = 'on-track';
      }

      await scheme.save();

      // Broadcast update via WebSocket
      const broadcast = req.app.get('broadcast');
      if (broadcast) {
        // Fetch updated scheme list to reflect changes
        const allSchemes = await Scheme.find().sort({ lastUpdated: -1 });
        broadcast({
          type: 'vendor_report_added',
          schemeId: scheme.id,
          report: vendorReport,
          allSchemes: allSchemes, // Send updated schemes list
          timestamp: new Date().toISOString()
        });
      }

      console.log('✅ Vendor report analyzed and saved');
      console.log(`📈 Scheme Updated - Progress: ${scheme.overallProgress}%, Budget: ₹${scheme.budgetUtilized}, Status: ${scheme.status}`);
      
      res.json({
        success: true,
        report: vendorReport,
        message: 'Vendor report analyzed successfully',
        updatedScheme: {
          id: scheme.id,
          overallProgress: scheme.overallProgress,
          budgetUtilized: scheme.budgetUtilized,
          status: scheme.status,
          phases: scheme.phases
        }
      });
    } else {
      console.error('❌ Failed to analyze vendor report:', result.error);
      res.status(500).json({
        success: false,
        error: result.error,
        message: 'Failed to analyze vendor report. Please review manually.'
      });
    }
  } catch (error) {
    console.error('❌ Vendor report processing error:', error);
    res.status(500).json({ error: 'Failed to process vendor report' });
  }
});
// Delete a scheme (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findOneAndDelete({ id: req.params.id });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Optionally, delete related feedback
    await Feedback.deleteMany({ schemeId: req.params.id });

    // Broadcast to all connected clients
    const broadcast = req.app.get('broadcast');
    if (broadcast) {
      const allSchemes = await Scheme.find().sort({ lastUpdated: -1 });
      broadcast({
        type: 'scheme_deleted',
        schemeId: req.params.id,
        allSchemes: allSchemes,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, message: 'Scheme deleted successfully', schemeId: req.params.id });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    res.status(500).json({ error: 'Failed to delete scheme' });
  }
});

export default router;

