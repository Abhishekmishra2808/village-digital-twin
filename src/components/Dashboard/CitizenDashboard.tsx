import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  Sparkles,
  Activity,
  Star,
  X,
  Send,
  Flag,
  Loader,
  Cpu
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';
import { Capacitor } from '@capacitor/core';

// Define LocalLLM plugin
const LocalLLM = Capacitor.isNativePlatform() ? {
  addListener: (eventName: string, callback: (data: any) => void) => {
    return (window as any).Capacitor?.Plugins?.LocalLLM?.addListener(eventName, callback);
  }
} : null;

export default function CitizenDashboard() {
  const schemes = useVillageStore((state) => state.schemes);
  const setActiveView = useVillageStore((state) => state.setActiveView);
  const username = useVillageStore((state) => state.username);

  const [feedbackScheme, setFeedbackScheme] = useState<GovernmentScheme | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // AI Processing Status
  const [aiStatus, setAiStatus] = useState<{
    status: string;
    message: string;
    progress: number;
  }>({
    status: 'idle',
    message: '',
    progress: 0
  });

  // Listen to AI processing status events
  useEffect(() => {
    if (!LocalLLM) return;

    const listener = LocalLLM.addListener('aiProcessingStatus', (data: any) => {
      console.log('AI Status Update:', data);
      setAiStatus({
        status: data.status,
        message: data.message,
        progress: data.progress || 0
      });
    });

    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  }, []);

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
    setAiStatus({ status: 'starting', message: 'Preparing to process feedback...', progress: 0 });

    try {
      // Generate a unique userId from username or create anonymous ID
      const userId = username || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const feedbackData = {
        rating,
        comment: comment.trim() || undefined,
        isUrgent,
        userId
      };

      // Submit feedback to backend
      const response = await fetch(`${API_URL}/api/schemes/${feedbackScheme.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
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
      setSubmitted(true);

      // Reset and close after 2 seconds
      setTimeout(() => {
        closeFeedbackModal();
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      setIsProcessing(false);
      setAiStatus({ status: 'error', message: 'Failed to submit feedback', progress: 0 });
      alert('Failed to submit feedback. Please try again.');
      setSubmitted(false);
    }
  };

  // Get active schemes (not completed)
  const activeSchemes = schemes.filter(s => s.status !== 'completed');
  
  // Get recent updates (simulated from scheme phases)
  const recentUpdates = schemes
    .flatMap(s => s.phases.map(p => ({
      schemeName: s.name,
      phaseName: p.name,
      status: p.status,
      date: p.endDate, // Using end date as a proxy for update time
      id: `${s.id}-${p.id}`
    })))
    .filter(u => u.status === 'completed' || u.status === 'on-track' || u.status === 'delayed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-24">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40 p-5 shadow-sm backdrop-blur-sm">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Welcome back, Citizen!</h1>
                <p className="mt-1 max-w-xl text-slate-400 text-sm">
                  Stay updated with the latest development projects in your village. 
                  Your feedback helps us build a better community together.
                </p>
                <button 
                  onClick={() => setActiveView('schemes')}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600/10 px-3 py-1.5 text-sm font-medium text-blue-400 hover:bg-blue-600/20 transition-colors"
                >
                  View All Schemes
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="hidden lg:block">
                <div className="rounded-lg bg-slate-900/50 p-2.5 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Community Impact</p>
                      <p className="font-bold text-sm text-emerald-400">High Engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Active Schemes</p>
              <p className="text-xl font-bold text-white">{activeSchemes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-xl font-bold text-white">
                {schemes.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">In Progress</p>
              <p className="text-xl font-bold text-white">
                {schemes.filter(s => s.status === 'on-track' || s.status === 'delayed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Your Feedback</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Schemes List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Ongoing Projects
            </h2>
            <button 
              onClick={() => setActiveView('schemes')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {activeSchemes.slice(0, 3).map((scheme) => (
              <div 
                key={scheme.id}
                className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-all hover:border-blue-500/30 hover:bg-slate-800/80"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      scheme.status === 'on-track' ? 'bg-emerald-500/20 text-emerald-400' :
                      scheme.status === 'delayed' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {scheme.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Due: {new Date(scheme.endDate).toLocaleDateString()}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          scheme.status === 'on-track' ? 'bg-emerald-500/10 text-emerald-400' :
                          scheme.status === 'delayed' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {scheme.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{scheme.overallProgress}%</span>
                      <span className="ml-1 text-xs text-slate-500">complete</span>
                    </div>
                    <div className="h-1.5 w-full min-w-[100px] overflow-hidden rounded-full bg-slate-700 sm:w-24">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          scheme.overallProgress >= 75 ? 'bg-emerald-500' :
                          scheme.overallProgress >= 40 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${scheme.overallProgress}%` }}
                      />
                    </div>
                    <button
                      onClick={(e) => openFeedbackModal(scheme, e)}
                      className="mt-2 flex items-center gap-1 rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 transition-colors"
                    >
                      <Star className="h-3 w-3" />
                      Rate Scheme
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Pulse / Recent Updates */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Community Pulse
          </h2>
          
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 backdrop-blur-sm">
            <div className="space-y-6">
              {recentUpdates.map((update) => (
                <div key={update.id} className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                  <div className="absolute left-[4px] top-4 h-full w-0.5 bg-slate-700 last:hidden"></div>
                  
                  <div>
                    <p className="text-sm font-medium text-white">{update.phaseName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {update.schemeName}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        update.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {update.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentUpdates.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p>No recent updates available</p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Satisfaction Rate</span>
                <div className="flex items-center gap-1 text-emerald-400">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-bold">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-slate-800 shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <button 
                onClick={closeFeedbackModal}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-1 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold text-white">Rate this Scheme</h3>
              <p className="text-blue-100 text-sm mt-1">{feedbackScheme.name}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              {!submitted ? (
                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-sm font-medium text-slate-300">How would you rate the progress?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`transition-all hover:scale-110 ${
                            rating >= star ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        >
                          <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 h-5">
                      {rating === 1 && "Very Dissatisfied"}
                      {rating === 2 && "Dissatisfied"}
                      {rating === 3 && "Neutral"}
                      {rating === 4 && "Satisfied"}
                      {rating === 5 && "Very Satisfied"}
                    </p>
                  </div>

                  {/* Comment Area */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Your Feedback (Optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts on the implementation..."
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/50 p-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  {/* Urgency Toggle */}
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/30 p-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                      <Flag className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Flag as Urgent Issue</p>
                      <p className="text-xs text-slate-400">Mark if this requires immediate attention</p>
                    </div>
                    <button
                      onClick={() => setIsUrgent(!isUrgent)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${isUrgent ? 'bg-red-500' : 'bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0 || isProcessing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Submit Feedback
                      </>
                    )}
                  </button>

                  {/* AI Processing Status Indicator */}
                  {isProcessing && (
                    <div className="mt-4 rounded-lg bg-slate-900/50 p-3 border border-blue-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="text-xs font-medium text-blue-300">AI Analysis in Progress</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${aiStatus.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center">{aiStatus.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Thank You!</h4>
                  <p className="mt-2 text-slate-400">
                    Your feedback has been recorded and will be analyzed by our AI system to improve the scheme implementation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
