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
  X
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';

export default function CitizenDashboard() {
  const schemes = useVillageStore((state) => state.schemes);
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [feedbackScheme, setFeedbackScheme] = useState<GovernmentScheme | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleExpand = (schemeId: string) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId);
  };

  const openFeedbackModal = (scheme: GovernmentScheme, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedbackScheme(scheme);
    setRating(0);
    setComment('');
    setIsUrgent(false);
    setSubmitted(false);
  };

  const closeFeedbackModal = () => {
    setFeedbackScheme(null);
    setRating(0);
    setComment('');
    setIsUrgent(false);
    setSubmitted(false);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackScheme || !rating) return;

    setIsProcessing(true);

    try {
      const feedbackData = {
        schemeId: feedbackScheme.id,
        rating,
        comment: comment.trim() || undefined,
        isUrgent,
        timestamp: new Date().toISOString()
      };

      // Submit feedback to backend (Gemini AI will process it)
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discrepant': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'delayed': return 'bg-yellow-500';
      case 'discrepant': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate stats for citizen view
  const totalSchemes = schemes.length;
  const completedSchemes = schemes.filter(s => s.status === 'completed').length;
  const avgRating = schemes.length > 0 ? (schemes.reduce((sum, s) => sum + s.citizenRating, 0) / schemes.length).toFixed(1) : '0.0';
  const totalFeedback = schemes.reduce((sum, s) => sum + s.feedbackCount, 0);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Schemes</h1>
        <p className="text-gray-600">Track development projects in your village and share your feedback</p>
      </div>

      {/* Citizen KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Active Schemes</div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalSchemes}</div>
          <div className="text-sm text-green-600 font-medium">
            {completedSchemes} completed
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Community Rating</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          </div>
          <div className="text-sm text-gray-600">Average rating</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Total Feedback</div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalFeedback}</div>
          <div className="text-sm text-blue-600 font-medium">
            Citizens participated
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Your Voice Matters</div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-2">100% Anonymous</div>
          <div className="text-xs text-gray-600">Share honest feedback safely</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Your Feedback Helps Improve Projects</h3>
            <p className="text-sm text-blue-100 mb-3">
              Rate schemes, report issues, and help ensure government projects serve your community better. 
              All feedback is completely anonymous.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle size={16} />
              <span>Anonymous</span>
              <span>•</span>
              <CheckCircle size={16} />
              <span>Direct to authorities</span>
              <span>•</span>
              <CheckCircle size={16} />
              <span>Real impact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Scheme Preview */}
            <div
              onClick={() => toggleExpand(scheme.id)}
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="text-3xl">
                      {scheme.category === 'Sanitation' && '🧹'}
                      {scheme.category === 'Water Supply' && '💧'}
                      {scheme.category === 'Housing' && '🏠'}
                      {scheme.category === 'Employment' && '👷'}
                      {scheme.category === 'Power' && '⚡'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{scheme.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{scheme.village}, {scheme.district}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>Ends: {new Date(scheme.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                          {scheme.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{scheme.category}</span>
                      </div>

                      {/* Community Rating */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-bold text-gray-900">{scheme.citizenRating.toFixed(1)}</span>
                          <span className="text-sm text-gray-600">({scheme.feedbackCount} ratings)</span>
                        </div>
                        <button
                          onClick={(e) => openFeedbackModal(scheme, e)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare size={12} />
                          <span>Rate This Scheme</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-gray-900">{scheme.overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 transition-all ${getProgressColor(scheme.status)}`}
                        style={{ width: `${scheme.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  {expandedScheme === scheme.id ? (
                    <ChevronUp size={20} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedScheme === scheme.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
                {/* Description */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">About This Scheme</h4>
                  <p className="text-sm text-gray-700">{scheme.description}</p>
                </div>

                {/* Budget Info */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Budget Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Total Budget</div>
                      <div className="text-lg font-bold text-gray-900">₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Utilized</div>
                      <div className="text-lg font-bold text-gray-900">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
                      <div className="text-xs text-green-600">
                        {Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}% spent
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Timeline</h4>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Started</div>
                        <div className="font-medium text-gray-900">{new Date(scheme.startDate).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp size={16} className="text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Expected End</div>
                        <div className="font-medium text-gray-900">{new Date(scheme.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phases Summary */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Project Phases</h4>
                  <div className="space-y-2">
                    {scheme.phases.map((phase, idx) => (
                      <div key={phase.id} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm text-gray-900">
                            Phase {idx + 1}: {phase.name}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                            phase.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                            phase.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {phase.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${
                              phase.status === 'completed' ? 'bg-green-500' :
                              phase.status === 'on-track' ? 'bg-blue-500' :
                              phase.status === 'delayed' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {schemes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No schemes available at the moment.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackScheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {isProcessing ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MessageSquare size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing with AI...</h3>
                <p className="text-gray-600">Gemini is analyzing your feedback to ensure anonymity and extract key concerns.</p>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-2">Your anonymous feedback has been processed by AI and recorded.</p>
                <p className="text-sm text-gray-500">Admins will see a professional summary without your identity.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Share Your Feedback</h2>
                      <p className="text-sm opacity-90">{feedbackScheme.name}</p>
                    </div>
                    <button 
                      onClick={closeFeedbackModal}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Anonymous Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
                    <Users size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <div className="font-medium mb-1">100% Anonymous</div>
                      <div className="text-xs text-blue-700">Your identity will never be revealed. Feel free to share honest feedback.</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate this scheme</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional) - Write in any language
                    </label>
                    <div className="mb-2 flex items-center space-x-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <MessageSquare size={14} />
                      <span>AI will process your feedback to protect your identity</span>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience in your own words, any language... AI will analyze and anonymize your feedback."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</div>
                  </div>

                  {/* Urgent Issue */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex items-center space-x-1">
                        <Flag size={16} className="text-red-600" />
                        <span className="text-sm text-gray-700">Mark as urgent/critical issue</span>
                      </div>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Send size={18} />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
