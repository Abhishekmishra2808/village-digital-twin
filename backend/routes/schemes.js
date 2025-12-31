import express from 'express';
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
    const { rating, comment, isUrgent } = req.body;

    // Validate
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) required' });
    }

    // Find scheme
    const scheme = await Scheme.findOne({ id: req.params.id });
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
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

    // Update scheme statistics
    scheme.feedbackCount += 1;
    const currentRating = scheme.citizenRating || 0;
    const currentCount = scheme.feedbackCount - 1;
    scheme.citizenRating = currentCount > 0
      ? ((currentRating * currentCount) + rating) / scheme.feedbackCount
      : rating;
    scheme.citizenRating = Math.round(scheme.citizenRating * 10) / 10;

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

    console.log(`✅ Feedback saved: ${scheme.name} - Rating: ${rating}/5 - Sentiment: ${aiAnalysis.sentiment}`);

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
