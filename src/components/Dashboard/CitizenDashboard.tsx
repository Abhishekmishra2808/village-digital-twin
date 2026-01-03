import { useState, useEffect } from 'react';
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
  Smartphone,
  Download,
  Loader,
  Cpu,
  Shield,
  Sparkles
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';
import { Capacitor } from '@capacitor/core';
import RagQueryModal from '../Rag/RagQueryModal';
import type { Citation } from '../../hooks/useRagQuery';

// Define LocalLLM plugin
const LocalLLM = Capacitor.isNativePlatform() ? {
  addListener: (eventName: string, callback: (data: any) => void) => {
    return (window as any).Capacitor?.Plugins?.LocalLLM?.addListener(eventName, callback);
  }
} : null;

export default function CitizenDashboard() {
  const schemes = useVillageStore((state) => state.schemes);
  const username = useVillageStore((state) => state.username);
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
  const [feedbackScheme, setFeedbackScheme] = useState<GovernmentScheme | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  
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

      // Submit feedback to backend (RunAnywhereAI will process it locally)
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
      setAiStatus({ status: 'error', message: 'Failed to submit feedback', progress: 0 });
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
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Government Schemes</h1>
          <p className="text-slate-400">Track development projects in your village and share your feedback</p>
        </div>
        <button
          onClick={() => setShowRagModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md flex items-center space-x-2"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>

      {/* Citizen KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">Active Schemes</div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalSchemes}</div>
          <div className="text-sm text-emerald-400 font-medium">
            {completedSchemes} completed
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">Community Rating</div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-yellow-400" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-3xl font-bold text-white">{avgRating}</div>
            <Star size={20} className="text-yellow-400 fill-yellow-400" />
          </div>
          <div className="text-sm text-slate-400">Average rating</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">Total Feedback</div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{totalFeedback}</div>
          <div className="text-sm text-blue-400 font-medium">
            Citizens participated
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-400">Your Voice Matters</div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="text-lg font-bold text-white mb-2">100% Anonymous</div>
          <div className="text-xs text-slate-400">Share honest feedback safely</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
          >
            {/* Scheme Preview */}
            <div
              onClick={() => toggleExpand(scheme.id)}
              className="p-5 cursor-pointer hover:bg-white/5 transition-colors"
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
                      <h3 className="text-lg font-bold text-white mb-2">{scheme.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
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
                        <span className="text-sm text-slate-400">{scheme.category}</span>
                      </div>

                      {/* Community Rating */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
                          <span className="text-sm text-slate-400">({scheme.feedbackCount} ratings)</span>
                        </div>
                        <button
                          onClick={(e) => openFeedbackModal(scheme, e)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center space-x-1"
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
                      <span className="text-slate-400">Progress</span>
                      <span className="font-bold text-white">{scheme.overallProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 transition-all ${getProgressColor(scheme.status)}`}
                        style={{ width: `${scheme.overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {expandedScheme === scheme.id ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedScheme === scheme.id && (
              <div className="border-t border-white/10 bg-slate-900/30 p-5 space-y-4">
                {/* Description */}
                <div>
                  <h4 className="font-bold text-white mb-2">About This Scheme</h4>
                  <p className="text-sm text-slate-300">{scheme.description}</p>
                </div>

                {/* Budget Info */}
                <div>
                  <h4 className="font-bold text-white mb-3">Budget Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-slate-400 mb-1">Total Budget</div>
                      <div className="text-lg font-bold text-white">₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-slate-400 mb-1">Utilized</div>
                      <div className="text-lg font-bold text-white">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
                      <div className="text-xs text-emerald-400">
                        {Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}% spent
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-bold text-white mb-3">Timeline</h4>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between text-sm">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Started</div>
                        <div className="font-medium text-white">{new Date(scheme.startDate).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp size={16} className="text-blue-400" />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Expected End</div>
                        <div className="font-medium text-white">{new Date(scheme.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phases Summary */}
                <div>
                  <h4 className="font-bold text-white mb-3">Project Phases</h4>
                  <div className="space-y-2">
                    {scheme.phases.map((phase, idx) => (
                      <div key={phase.id} className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm text-white">
                            Phase {idx + 1}: {phase.name}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            phase.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            phase.status === 'on-track' ? 'bg-blue-500/20 text-blue-400' :
                            phase.status === 'delayed' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {phase.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full">
                          <div
                            className={`h-1.5 rounded-full ${
                              phase.status === 'completed' ? 'bg-emerald-500' :
                              phase.status === 'on-track' ? 'bg-blue-500' :
                              phase.status === 'delayed' ? 'bg-yellow-500' :
                              'bg-slate-500'
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
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No schemes available at the moment.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackScheme && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {isProcessing ? (
              <div className="p-8">
                {/* AI Processing Status Display */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    {aiStatus.status === 'downloading' && (
                      <Download size={36} className="text-white animate-bounce" />
                    )}
                    {aiStatus.status === 'loading' && (
                      <Loader size={36} className="text-white animate-spin" />
                    )}
                    {aiStatus.status === 'processing' && (
                      <Cpu size={36} className="text-white animate-pulse" />
                    )}
                    {(aiStatus.status === 'checking' || aiStatus.status === 'starting') && (
                      <Smartphone size={36} className="text-white animate-pulse" />
                    )}
                    {(aiStatus.status === 'complete' || aiStatus.status === 'loaded') && (
                      <CheckCircle size={36} className="text-white" />
                    )}
                    {aiStatus.status === 'fallback' && (
                      <Shield size={36} className="text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {aiStatus.status === 'downloading' && 'Downloading AI Model'}
                    {aiStatus.status === 'loading' && 'Loading AI Model'}
                    {aiStatus.status === 'processing' && 'AI Processing'}
                    {aiStatus.status === 'checking' && 'Checking Model'}
                    {aiStatus.status === 'complete' && 'Complete!'}
                    {aiStatus.status === 'fallback' && 'Using Fallback'}
                    {aiStatus.status === 'starting' && 'Starting...'}
                  </h3>
                  
                  <p className="text-slate-400 mb-4">{aiStatus.message}</p>
                  
                  {/* Progress Bar (for downloading) */}
                  {aiStatus.status === 'downloading' && aiStatus.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Downloading SmolLM2 360M (119 MB)</span>
                        <span className="font-bold">{Math.round(aiStatus.progress * 100)}%</span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
                          style={{ width: `${aiStatus.progress * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">First-time only • Stored locally on your device</p>
                    </div>
                  )}
                  
                  {/* Status Indicators */}
                  <div className="space-y-2 mt-6">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      aiStatus.status === 'checking' || aiStatus.status === 'downloaded' || 
                      aiStatus.status === 'loading' || aiStatus.status === 'processing' || 
                      aiStatus.status === 'complete' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/50 border border-white/5'
                    }`}>
                      <span className="text-sm text-slate-300">Model Check</span>
                      {(aiStatus.status === 'checking' || aiStatus.status === 'downloaded' || 
                        aiStatus.status === 'loading' || aiStatus.status === 'processing' || 
                        aiStatus.status === 'complete') && (
                        <CheckCircle size={16} className="text-emerald-400" />
                      )}
                    </div>
                    
                    {aiStatus.status === 'downloading' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-sm text-slate-300">Downloading</span>
                        <Loader size={16} className="text-blue-400 animate-spin" />
                      </div>
                    )}
                    
                    {(aiStatus.status === 'downloaded' || aiStatus.status === 'loading' || 
                      aiStatus.status === 'processing' || aiStatus.status === 'complete') && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        aiStatus.status === 'loading' || aiStatus.status === 'processing' || 
                        aiStatus.status === 'complete' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/50 border border-white/5'
                      }`}>
                        <span className="text-sm text-slate-300">Model Loading</span>
                        {aiStatus.status === 'loading' && <Loader size={16} className="text-blue-400 animate-spin" />}
                        {(aiStatus.status === 'processing' || aiStatus.status === 'complete') && (
                          <CheckCircle size={16} className="text-emerald-400" />
                        )}
                      </div>
                    )}
                    
                    {(aiStatus.status === 'processing' || aiStatus.status === 'complete') && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        aiStatus.status === 'complete' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-blue-500/10 border border-blue-500/20'
                      }`}>
                        <span className="text-sm text-slate-300">AI Anonymization</span>
                        {aiStatus.status === 'processing' && <Loader size={16} className="text-blue-400 animate-spin" />}
                        {aiStatus.status === 'complete' && <CheckCircle size={16} className="text-emerald-400" />}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 text-sm text-emerald-400">
                      <Shield size={14} />
                      <span className="font-medium">100% On-Device • No Cloud • Private</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : submitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-slate-300 mb-2">Your anonymous feedback has been processed by LOCAL AI (RunanywhereAI) running ON YOUR DEVICE and recorded. Your data never left your phone\!.</p>
                <p className="text-sm text-slate-500">Admins will see a professional summary without your identity. All AI processing happened locally on your device\!.</p>
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
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 flex items-start space-x-2">
                    <Users size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      <div className="font-medium mb-1 text-blue-300">100% Anonymous</div>
                      <div className="text-xs text-blue-400/80">Your identity will never be revealed. Feel free to share honest feedback.</div>
                    </div>
                  </div>

                  {/* Local AI Badge */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6 flex items-start space-x-2">
                    <Smartphone size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-emerald-200">
                      <div className="font-medium mb-1 text-emerald-300">Local AI Processing (RunanywhereAI)</div>
                      <div className="text-xs text-emerald-400/80">AI runs 100% ON YOUR DEVICE. Your data never leaves your phone. No cloud, no tracking\!</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Rate this scheme</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Comments (Optional) - Write in any language
                    </label>
                    <div className="mb-2 flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                      <MessageSquare size={14} />
                      <span>Local AI (RunanywhereAI) will process your feedback ON YOUR DEVICE to protect your identity</span>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience in your own words, any language... Local AI (RunanywhereAI) running ON YOUR DEVICE will analyze and anonymize your feedback - 100% private, no cloud."
                      className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-slate-500"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="text-xs text-slate-500 mt-1">{comment.length}/500 characters</div>
                  </div>

                  {/* Urgent Issue */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUrgent}
                        onChange={(e) => setIsUrgent(e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 bg-slate-800 border-white/10"
                      />
                      <div className="flex items-center space-x-1">
                        <Flag size={16} className="text-red-400" />
                        <span className="text-sm text-slate-300">Mark as urgent/critical issue</span>
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

      {/* RAG Query Modal */}
      {showRagModal && (
        <RagQueryModal
          isOpen={showRagModal}
          onClose={() => setShowRagModal(false)}
          onHighlightCitation={(citation: Citation) => {
            console.log('📍 Citizen Dashboard - AI Citation:', citation);
            alert(`📍 AI Answer Citation:\n\nType: ${citation.type}\nSnippet: ${citation.snippet}\nRelevance: ${(citation.score * 100).toFixed(0)}%`);
          }}
        />
      )}
    </div>
  );
}
