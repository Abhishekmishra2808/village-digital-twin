import express from 'express';
import crypto from 'crypto';
import Scheme from '../models/Scheme.js';
import Feedback from '../models/Feedback.js';
import { processFeedbackWithAI } from '../utils/geminiService.js';

const router = express.Router();

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

    console.log(`🤖 Processing feedback with Gemini AI for: ${scheme.name}`);

    // Process with AI
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

// Get feedback for a scheme (admin only - no raw comments)
router.get('/:id/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find({ schemeId: req.params.id })
      .select('-rawComment') // Never expose raw comments
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

export default router;
