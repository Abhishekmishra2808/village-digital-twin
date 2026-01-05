import React, { useEffect, useState } from 'react';
import { GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';

interface Feedback {
  id: string;
  schemeId: string;
  rating: number;
  aiSummary: string;
  concerns: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Critical';
  categories: string[];
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  isUrgent: boolean;
  aiProcessed: boolean;
  createdAt: string;
}

interface FeedbackViewProps {
  scheme: GovernmentScheme;
  onClose: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ scheme, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [scheme.id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schemes/${scheme.id}/feedback`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setFeedbacks(data.feedback);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-400';
      case 'Neutral': return 'text-blue-400';
      case 'Negative': return 'text-orange-400';
      case 'Critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Low': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-blue-500/20 text-blue-400';
      case 'High': return 'bg-orange-500/20 text-orange-400';
      case 'Critical': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Quality': 'bg-purple-500/20 text-purple-400',
      'Delay': 'bg-orange-500/20 text-orange-400',
      'Budget': 'bg-yellow-500/20 text-yellow-400',
      'Vendor': 'bg-pink-500/20 text-pink-400',
      'Communication': 'bg-blue-500/20 text-blue-400',
      'Accessibility': 'bg-green-500/20 text-green-400',
      'Other': 'bg-gray-500/20 text-gray-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Citizen Feedback</h2>
              <p className="text-slate-400">{scheme.name}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
                  <div className="flex">
                    {renderStars(Math.round(scheme.citizenRating))}
                  </div>
                </div>
                <div className="text-slate-400">
                  {scheme.feedbackCount} {scheme.feedbackCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2 text-sm">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-blue-300 font-medium mb-1">Privacy Protected Feedback</p>
                <p className="text-blue-200/80 text-xs leading-relaxed">
                  All feedback shown here has been processed by AI to remove personal information including names, phone numbers, addresses, emails, and any identifying details. Only anonymized summaries, sentiment analysis, and concerns are displayed to protect citizen privacy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">⚠️ {error}</div>
              <button
                onClick={fetchFeedback}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Try Again
              </button>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p>No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderStars(feedback.rating)}
                      <span className={`text-sm font-medium ${getSentimentColor(feedback.sentiment)}`}>
                        {feedback.sentiment}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(feedback.createdAt)}
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="mb-3">
                    <p className="text-slate-300 leading-relaxed">{feedback.aiSummary}</p>
                  </div>

                  {/* Concerns */}
                  {feedback.concerns && feedback.concerns.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-slate-500 mb-2">Key Concerns:</div>
                      <ul className="space-y-1">
                        {feedback.concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-orange-400 mt-1">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Urgency Badge */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(feedback.urgency)}`}>
                      {feedback.urgency} Priority
                    </span>

                    {/* Category Badges */}
                    {feedback.categories && feedback.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(category)}`}
                      >
                        {category}
                      </span>
                    ))}

                    {/* AI Processed Badge */}
                    {feedback.aiProcessed && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 7H7v6h6V7z" />
                          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                        </svg>
                        AI Processed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;
