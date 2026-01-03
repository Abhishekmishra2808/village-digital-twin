import { useState } from 'react';
import { 
  Briefcase, 
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  TrendingUp,
  Send,
  Flag,
  Users,
  CheckCircle,
  X,
  Smartphone
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';

  const handleSubmitFeedback = async () => {
    if (!feedbackScheme || !rating) return;

    setIsProcessing(true);

    try {
      // Generate a unique userId from username or create anonymous ID
      const userId = username || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const feedbackData = {
        rating,
        comment: comment.trim() || undefined,
        isUrgent,
        userId
      };

      // Submit feedback to backend (RunanywhereAI will process it locally on your device)
      const response = await fetch(`${API_URL}/api/schemes/${feedbackScheme.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle rate limiting error (429)
        if (response.status === 429) {
          alert(error.message || 'You have already submitted feedback recently. Please try again later.');
          setIsProcessing(false);
          closeFeedbackModal();
          return;
        }
        
        throw new Error(error.error || 'Failed to submit feedback');
      }

      const result = await response.json();
      console.log('✅ Feedback submitted successfully:', result);

      setIsProcessing(false);
      // Show success state
      setSubmitted(true);

      // Reset and close after 2 seconds
      setTimeout(() => {
        closeFeedbackModal();
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      setIsProcessing(false);
      alert('Failed to submit feedback. Please try again.');
      setSubmitted(false);
    }
  };

// ... existing code ...
