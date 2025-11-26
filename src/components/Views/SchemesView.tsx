import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  FileText,
  Filter,
  Search,
  Calendar,
  MapPin,
  Star,
  X,
  Plus,
  Upload,
  Loader,
  ChevronRight,
  Sparkles,
  Send,
  Flag,
  Cpu
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';
import RagQueryModal from '../Rag/RagQueryModal';
import FeedbackView from './FeedbackView';
import type { Citation } from '../../hooks/useRagQuery';
import { Capacitor } from '@capacitor/core';

// Define LocalLLM plugin
const LocalLLM = Capacitor.isNativePlatform() ? {
  addListener: (eventName: string, callback: (data: any) => void) => {
    return (window as any).Capacitor?.Plugins?.LocalLLM?.addListener(eventName, callback);
  }
} : null;

export default function SchemesView() {
  // Get schemes from store instead of mock data
  const schemes = useVillageStore((state) => state.schemes);
  const fetchSchemes = useVillageStore((state) => state.fetchSchemes);
  const userRole = useVillageStore((state) => state.userRole);
  const username = useVillageStore((state) => state.username);
  
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'phases' | 'reports'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRagModal, setShowRagModal] = useState(false);

  // Feedback State
  const [feedbackScheme, setFeedbackScheme] = useState<GovernmentScheme | null>(null);
  const [viewFeedbackScheme, setViewFeedbackScheme] = useState<GovernmentScheme | null>(null);
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

  // Calculate summary statistics
  const totalSchemes = schemes.length;
  const onTrackSchemes = schemes.filter(s => s.status === 'on-track' || s.status === 'completed').length;
  const delayedSchemes = schemes.filter(s => s.status === 'delayed').length;
  const discrepantSchemes = schemes.filter(s => s.status === 'discrepant').length;
  const totalBudget = schemes.reduce((sum, s) => sum + s.totalBudget, 0);
  const budgetUtilized = schemes.reduce((sum, s) => sum + s.budgetUtilized, 0);
  const avgProgress = schemes.length > 0 ? Math.round(schemes.reduce((sum, s) => sum + s.overallProgress, 0) / schemes.length) : 0;
  const totalFeedback = schemes.reduce((sum, s) => sum + s.feedbackCount, 0);

  // Filter schemes
  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = filterCategory === 'all' || scheme.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || scheme.status === filterStatus;
    const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scheme.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Category mapping for icons
  const categoryIcons: Record<string, string> = {
    'Sanitation': '🧹',
    'Water Supply': '💧',
    'Housing': '🏠',
    'Employment': '👷',
    'Power': '⚡'
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      'on-track': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'delayed': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'discrepant': 'bg-red-500/10 text-red-400 border-red-500/20',
      'completed': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors]}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full overflow-auto bg-transparent">
      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase size={20} className="md:hidden text-white" />
                <Briefcase size={24} className="hidden md:block text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white">Government Schemes Dashboard</h1>
                <p className="text-sm md:text-base text-slate-400">Real-time monitoring of rural development projects</p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowRagModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <Sparkles size={20} />
                <span>Ask AI</span>
              </button>
              {/* Only show "Add New Scheme" button to admins */}
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowAddSchemeModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add New Scheme</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs md:text-sm font-medium text-slate-400">Total Schemes</div>
              <Briefcase size={16} className="md:hidden text-purple-400" />
              <Briefcase size={20} className="hidden md:block text-purple-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">{totalSchemes}</div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-1">Active projects</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs md:text-sm font-medium text-slate-400">On Track / Delayed</div>
              <TrendingUp size={16} className="md:hidden text-emerald-400" />
              <TrendingUp size={20} className="hidden md:block text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">{onTrackSchemes} / {delayedSchemes}</div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-1">{discrepantSchemes} with discrepancies</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs md:text-sm font-medium text-slate-400">Budget Utilization</div>
              <DollarSign size={16} className="md:hidden text-blue-400" />
              <DollarSign size={20} className="hidden md:block text-blue-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">{totalBudget > 0 ? Math.round((budgetUtilized / totalBudget) * 100) : 0}%</div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-1">₹{(budgetUtilized / 10000000).toFixed(1)}Cr of ₹{(totalBudget / 10000000).toFixed(1)}Cr</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs md:text-sm font-medium text-slate-400">Avg Progress</div>
              <CheckCircle size={16} className="md:hidden text-indigo-400" />
              <CheckCircle size={20} className="hidden md:block text-indigo-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">{avgProgress}%</div>
            <div className="text-[10px] md:text-xs text-slate-500 mt-1">{totalFeedback} citizen feedbacks</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-3 md:p-4 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm md:text-base text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-slate-500"
              />
            </div>

            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="sanitation">Sanitation</option>
                <option value="water supply">Water Supply</option>
                <option value="housing">Housing</option>
                <option value="employment">Employment</option>
                <option value="power">Power</option>
              </select>
            </div>

            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="on-track">On Track</option>
                <option value="delayed">Delayed</option>
                <option value="discrepant">Discrepant</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium text-slate-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Schemes Grid - Modular & Modern Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => {
                setSelectedScheme(scheme);
                setModalInitialTab('overview');
                setShowDetailsModal(true);
              }}
              className="group bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-5 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xl shadow-inner">
                    {categoryIcons[scheme.category] || '📋'}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{scheme.category}</span>
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {scheme.name}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={scheme.status} />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Location & ID */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-[100px]">{scheme.village}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <div className="font-mono opacity-70">{scheme.id}</div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-bold text-white">{scheme.overallProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        scheme.status === 'on-track' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        scheme.status === 'delayed' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                        scheme.status === 'discrepant' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                        'bg-gradient-to-r from-blue-500 to-blue-400'
                      }`}
                      style={{ width: `${scheme.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Budget Used</div>
                    <div className="text-sm font-bold text-white">
                      {Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}%
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Deadline</div>
                    <div className="text-sm font-bold text-white">
                      {new Date(scheme.endDate).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Alerts (Conditional) */}
                {(scheme.discrepancies.length > 0) && (
                  <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                    <AlertTriangle size={12} />
                    <span>{scheme.discrepancies.length} Issues Detected</span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center group-hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-slate-300">{scheme.citizenRating.toFixed(1)}</span>
                  <span className="opacity-50">({scheme.feedbackCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  {userRole === 'user' && (
                    <button
                      onClick={(e) => openFeedbackModal(scheme, e)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Star size={12} /> Rate
                    </button>
                  )}
                  {userRole === 'admin' && scheme.feedbackCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewFeedbackScheme(scheme);
                      }}
                      className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <FileText size={12} /> View Feedback
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs font-medium text-purple-400 group-hover:translate-x-1 transition-transform">
                    View Details <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-12 text-center">
            <div className="text-slate-600 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-slate-400">No schemes found matching your filters</p>
          </div>
        )}
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
                    <label className="text-sm font-medium text-slate-300">Your Feedback</label>
                    <div className="flex items-start gap-2 mb-2 text-xs text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5">
                      <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Write freely about the scheme - your identity is protected through anonymization by <span className="font-medium text-green-400">Runanywhere SDK</span></span>
                    </div>
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
                <FeedbackSuccessView />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheme Details Modal */}
      {showDetailsModal && selectedScheme && (
        <SchemeDetailsModal 
          scheme={selectedScheme}
          initialTab={modalInitialTab}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedScheme(null);
            setModalInitialTab('overview');
          }}
        />
      )}

      {/* Add Scheme Modal */}
      {showAddSchemeModal && (
        <AddSchemeModal 
          onClose={() => setShowAddSchemeModal(false)}
          onSubmit={async (newScheme) => {
            console.log('New scheme added:', newScheme);
            setShowAddSchemeModal(false);
            // Refresh schemes after adding
            await fetchSchemes();
          }}
        />
      )}

      {/* RAG Query Modal */}
      {showRagModal && (
        <RagQueryModal
          isOpen={showRagModal}
          onClose={() => setShowRagModal(false)}
          onHighlightCitation={(citation: Citation) => {
            console.log('📍 Highlight citation on map:', citation);
            // TODO: Implement map highlighting when map instance is available
            // For now, just show an alert
            alert(`📍 Citation Location:\n\nType: ${citation.type}\nSnippet: ${citation.snippet}\nCoordinates: ${citation.geo?.lat}, ${citation.geo?.lon}`);
          }}
        />
      )}

      {/* Feedback View Modal (Admin Only) */}
      {viewFeedbackScheme && (
        <FeedbackView
          scheme={viewFeedbackScheme}
          onClose={() => setViewFeedbackScheme(null)}
        />
      )}
    </div>
  );
}

// Feedback Success View with Checklist Animation
function FeedbackSuccessView() {
  const [steps, setSteps] = useState([
    { id: 1, label: 'Loading the model', status: 'pending' }, // pending, current, completed
    { id: 2, label: 'Model loaded', status: 'pending' },
    { id: 3, label: 'Anonymizing message', status: 'pending' },
    { id: 4, label: 'Anonymized', status: 'pending' }
  ]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Simulate the checklist progress
    const runAnimation = async () => {
      // Step 1: Loading the model (35 seconds)
      setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'current' } : s));
      await new Promise(r => setTimeout(r, 35000));
      setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'completed' } : s));

      // Step 2: Model loaded (10 seconds)
      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'current' } : s));
      await new Promise(r => setTimeout(r, 10000));
      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'completed' } : s));

      // Step 3: Anonymizing message
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'current' } : s));
      await new Promise(r => setTimeout(r, 1000));
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'completed' } : s));

      // Step 4: Anonymized
      setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: 'current' } : s));
      await new Promise(r => setTimeout(r, 500));
      setSteps(prev => prev.map(s => s.id === 4 ? { ...s, status: 'completed' } : s));

      setCompleted(true);
    };

    runAnimation();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center w-full">
      {!completed ? (
        <div className="w-full max-w-xs space-y-4">
          <h4 className="text-lg font-bold text-white mb-4">Processing Feedback...</h4>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step.status === 'completed' ? 'bg-green-500 border-green-500' :
                  step.status === 'current' ? 'border-blue-500 animate-pulse' :
                  'border-slate-600'
                }`}>
                  {step.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                  {step.status === 'current' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  step.status === 'completed' ? 'text-green-400' :
                  step.status === 'current' ? 'text-blue-400' :
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h4 className="text-xl font-bold text-white">Thank You!</h4>
          <p className="mt-2 text-slate-400">
            Your feedback has been securely anonymized and recorded.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-800/50 py-2 px-4 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Powered by RunAnywhere SDK</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Scheme Details Modal Component
function SchemeDetailsModal({ 
  scheme, 
  onClose, 
  initialTab = 'overview' 
}: { 
  scheme: GovernmentScheme; 
  onClose: () => void; 
  initialTab?: 'overview' | 'phases' | 'reports';
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'reports'>(initialTab);
  const userRole = useVillageStore((state) => state.userRole);
  const deleteScheme = useVillageStore((state) => state.deleteScheme);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-6 text-white">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex-1 pr-2">
              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">{scheme.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1 text-purple-100">
                  <MapPin size={12} className="md:hidden" />
                  <MapPin size={14} className="hidden md:block" />
                  <span className="truncate">{scheme.village}, {scheme.district}</span>
                </div>
                <div className="flex items-center space-x-1 text-purple-100">
                  <FileText size={12} className="md:hidden" />
                  <FileText size={14} className="hidden md:block" />
                  <span className="truncate">{scheme.id}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button 
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 text-white"
                aria-label="Close"
              >
                <X size={20} className="md:hidden" />
                <X size={24} className="hidden md:block" />
              </button>
              {userRole === 'admin' && (
                <button
                  className="mt-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs rounded-lg font-semibold shadow transition disabled:opacity-60"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this scheme? This action cannot be undone.')) return;
                    setIsDeleting(true);
                    setDeleteError('');
                    try {
                      await deleteScheme(scheme.id);
                      setIsDeleting(false);
                      onClose();
                    } catch (err: any) {
                      setDeleteError(err.message || 'Failed to delete scheme');
                      setIsDeleting(false);
                    }
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Scheme'}
                </button>
              )}
            </div>
          </div>
        {deleteError && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded px-3 py-2 mb-2 text-xs font-semibold text-center">
            {deleteError}
          </div>
        )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
              <div className="text-[10px] md:text-xs text-purple-100 opacity-90">Progress</div>
              <div className="text-lg md:text-2xl font-bold text-white">{scheme.overallProgress}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
              <div className="text-[10px] md:text-xs text-purple-100 opacity-90">Budget</div>
              <div className="text-lg md:text-2xl font-bold text-white">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
              <div className="text-[9px] md:text-xs text-purple-200 opacity-75">of ₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
              <div className="text-[10px] md:text-xs text-purple-100 opacity-90">Rating</div>
              <div className="flex items-center space-x-1">
                <Star size={14} className="md:hidden fill-yellow-400 text-yellow-400" />
                <Star size={16} className="hidden md:block fill-yellow-400 text-yellow-400" />
                <span className="text-lg md:text-2xl font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 px-3 md:px-6 overflow-x-auto bg-slate-900">
          <div className="flex space-x-4 md:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 md:py-4 border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-400 font-medium'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('phases')}
              className={`py-3 md:py-4 border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'phases'
                  ? 'border-purple-500 text-purple-400 font-medium'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Phases & Timeline
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-purple-500 text-purple-400 font-medium'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Vendor Reports
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)] bg-slate-900">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Discrepancies */}
              {scheme.discrepancies.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="text-red-400" size={20} />
                    <h3 className="font-bold text-red-200">Critical Discrepancies</h3>
                  </div>
                  <ul className="space-y-2">
                    {scheme.discrepancies.map((disc, idx) => (
                      <li key={idx} className="text-sm text-red-300 flex items-start space-x-2">
                        <span className="text-red-400 mt-1">•</span>
                        <div>
                                <div className="font-medium text-red-200">{disc.type}</div>
                          <div className="text-xs opacity-80">{disc.description}</div>
                          <div className="text-xs text-red-400 mt-0.5">Reported: {new Date(disc.reportedDate || disc.date || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-bold text-white mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{scheme.description}</p>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-white mb-3">Project Timeline</h3>
                <div className="bg-slate-800/50 border border-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400">Start Date</div>
                      <div className="font-bold text-white">{new Date(scheme.startDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                          style={{ width: `${scheme.overallProgress}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">End Date</div>
                      <div className="font-bold text-white">{new Date(scheme.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div>
                <h3 className="font-bold text-white mb-3">Budget Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-sm text-blue-300 mb-1">Total Allocated</div>
                    <div className="text-2xl font-bold text-blue-100">₹{(scheme.totalBudget / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="text-sm text-emerald-300 mb-1">Total Utilized</div>
                    <div className="text-2xl font-bold text-emerald-100">₹{(scheme.budgetUtilized / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-sm text-purple-300 mb-1">Remaining</div>
                    <div className="text-2xl font-bold text-purple-100">₹{((scheme.totalBudget - scheme.budgetUtilized) / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <div className="text-sm text-amber-300 mb-1">Utilization Rate</div>
                    <div className="text-2xl font-bold text-amber-100">{Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-4">
              {scheme.phases.map((phase, idx) => (
                <div key={phase.id} className="border border-white/10 bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white mb-1">Phase {idx + 1}: {phase.name}</h4>
                      <div className="text-sm text-slate-400">
                        {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      phase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      phase.status === 'on-track' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      phase.status === 'delayed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-700 text-slate-300 border-slate-600'
                    }`}>
                      {phase.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-medium text-white">{phase.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          phase.status === 'completed' ? 'bg-emerald-500' :
                          phase.status === 'on-track' ? 'bg-blue-500' :
                          phase.status === 'delayed' ? 'bg-amber-500' :
                          'bg-slate-500'
                        }`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-slate-800 rounded p-2 border border-white/5">
                      <div className="text-xs text-slate-500">Budget</div>
                      <div className="font-bold text-white">₹{(phase.budget / 100000).toFixed(1)}L</div>
                    </div>
                    <div className="bg-slate-800 rounded p-2 border border-white/5">
                      <div className="text-xs text-slate-500">Spent</div>
                      <div className="font-bold text-white">₹{(phase.spent / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <VendorReportsTab scheme={scheme} />
          )}
        </div>
      </div>
    </div>
  );
}

// Vendor Reports Tab Component
function VendorReportsTab({ scheme }: { scheme: GovernmentScheme }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const userRole = useVillageStore((state) => state.userRole);
  const fetchSchemes = useVillageStore((state) => state.fetchSchemes);

  const handleVendorReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      console.log('📄 Uploading vendor report for analysis:', file.name);
      
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_URL}/api/schemes/${scheme.id}/vendor-report`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Vendor report analyzed:', result.report);
        console.log('📊 Scheme metrics updated:', result.updatedScheme);
        
        // Show success message with updated metrics
        const updatedScheme = result.updatedScheme;
        alert(`✅ Vendor report uploaded and analyzed successfully!\n\n` +
              `Updated Metrics:\n` +
              `• Progress: ${updatedScheme.overallProgress}%\n` +
              `• Budget Utilized: ₹${(updatedScheme.budgetUtilized / 100000).toFixed(2)}L\n` +
              `• Status: ${updatedScheme.status.toUpperCase()}\n\n` +
              `Refreshing to show updates...`);
        
        // Refresh the schemes data
        await fetchSchemes();
        
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to analyze vendor report');
      }
    } catch (err: any) {
      console.error('❌ Vendor report upload error:', err);
      setUploadError(err.message || 'Failed to upload vendor report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section - Admin Only */}
      {userRole === 'admin' && (
        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border-2 border-dashed border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText size={24} className="text-emerald-400" />
            <div>
              <h3 className="font-semibold text-white">Upload Vendor Progress Report</h3>
              <p className="text-xs text-slate-400">AI will analyze compliance against government plan</p>
            </div>
          </div>
          
          <label className="cursor-pointer block">
            <input
              type="file"
              accept=".pdf"
              onChange={handleVendorReportUpload}
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex items-center justify-center space-x-2 bg-slate-800 border-2 border-emerald-500/50 hover:border-emerald-400 rounded-lg px-4 py-3 transition-colors">
              {isUploading ? (
                <>
                  <Loader size={18} className="animate-spin text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Analyzing report with AI...</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Upload Vendor Report PDF</span>
                </>
              )}
            </div>
          </label>
          
          {uploadError && (
            <div className="mt-3 text-sm text-red-400 bg-red-500/10 p-2 rounded">
              {uploadError}
            </div>
          )}
          
          <p className="text-xs text-slate-500 mt-3 text-center">
            AI will compare vendor's report with government plan and identify discrepancies, overdue work, and budget variances
          </p>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {scheme.vendorReports && scheme.vendorReports.length > 0 ? (
          scheme.vendorReports.map((report: any) => (
            <div key={report.id} className="border border-white/10 rounded-lg overflow-hidden bg-slate-800/30">
              {/* Report Header */}
              <div className="bg-slate-800/50 p-4 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white">{report.vendorName}</h4>
                    <div className="text-sm text-slate-400">Phase {report.phase} Report</div>
                    <div className="text-xs text-slate-500">
                      Submitted: {new Date(report.submittedDate).toLocaleDateString()}
                      {report.pdfFileName && ` • ${report.pdfFileName}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.verificationStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      report.verificationStatus === 'under-review' ? 'bg-amber-500/10 text-amber-400' :
                      report.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {report.verificationStatus?.toUpperCase() || 'PENDING'}
                    </span>
                    {report.complianceAnalysis && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Compliance Score</div>
                        <div className={`text-2xl font-bold ${
                          report.complianceAnalysis.overallCompliance >= 80 ? 'text-emerald-400' :
                          report.complianceAnalysis.overallCompliance >= 60 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {report.complianceAnalysis.overallCompliance}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis Results */}
              {report.complianceAnalysis && report.complianceAnalysis.aiProcessed && (
                <div className="p-4 space-y-4">
                  {/* AI Summary */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText size={16} className="text-blue-400" />
                      <h5 className="font-semibold text-blue-200">AI Analysis Summary</h5>
                    </div>
                    <p className="text-sm text-blue-300">{report.complianceAnalysis.aiSummary}</p>
                  </div>

                  {/* Matching Items */}
                  {report.complianceAnalysis.matchingItems?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-emerald-300 mb-2 flex items-center space-x-2">
                        <CheckCircle size={16} />
                        <span>Work Completed as Planned ({report.complianceAnalysis.matchingItems.length})</span>
                      </h5>
                      <ul className="space-y-1">
                        {report.complianceAnalysis.matchingItems.map((item: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start space-x-2">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Discrepancies */}
                  {report.complianceAnalysis.discrepancies?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-300 mb-2 flex items-center space-x-2">
                        <AlertTriangle size={16} />
                        <span>Discrepancies Found ({report.complianceAnalysis.discrepancies.length})</span>
                      </h5>
                      <div className="space-y-3">
                        {report.complianceAnalysis.discrepancies.map((disc: any, idx: number) => (
                          <div key={idx} className={`border-l-4 pl-3 py-2 ${
                            disc.severity === 'critical' ? 'border-red-500 bg-red-500/10' :
                            disc.severity === 'high' ? 'border-orange-500 bg-orange-500/10' :
                            disc.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                            'border-blue-500 bg-blue-500/10'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-white">{disc.category?.toUpperCase()}</div>
                                <div className="text-sm text-slate-300 mt-1">{disc.description}</div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                  <div>
                                    <span className="text-slate-400">Planned: </span>
                                    <span className="font-medium text-white">{disc.plannedValue}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Actual: </span>
                                    <span className="font-medium text-white">{disc.actualValue}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                disc.severity === 'critical' ? 'bg-red-500/20 text-red-200' :
                                disc.severity === 'high' ? 'bg-orange-500/20 text-orange-200' :
                                disc.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                                'bg-blue-500/20 text-blue-200'
                              }`}>
                                {disc.severity?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overdue Work */}
                  {report.complianceAnalysis.overdueWork?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-orange-300 mb-2 flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>Overdue Work ({report.complianceAnalysis.overdueWork.length})</span>
                      </h5>
                      <div className="space-y-2">
                        {report.complianceAnalysis.overdueWork.map((task: any, idx: number) => (
                          <div key={idx} className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
                            <div className="font-medium text-sm text-white">{task.task}</div>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-slate-400">Planned: </span>
                                <span className="font-medium text-white">{new Date(task.plannedDate).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Status: </span>
                                <span className="font-medium text-white">{task.currentStatus}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Delay: </span>
                                <span className="font-medium text-red-400">{task.delayDays} days</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Analysis */}
                  {report.complianceAnalysis.budgetAnalysis && (
                    <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-3 flex items-center space-x-2">
                        <DollarSign size={16} />
                        <span>Budget Analysis</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-400">Planned Budget</div>
                          <div className="text-lg font-bold text-white">
                            ₹{(report.complianceAnalysis.budgetAnalysis.plannedBudget / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Claimed Expense</div>
                          <div className="text-lg font-bold text-white">
                            ₹{(report.complianceAnalysis.budgetAnalysis.claimedExpense / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Variance</div>
                          <div className={`text-lg font-bold ${
                            report.complianceAnalysis.budgetAnalysis.variance > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {report.complianceAnalysis.budgetAnalysis.variance > 0 ? '+' : ''}
                            ₹{(report.complianceAnalysis.budgetAnalysis.variance / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Variance %</div>
                          <div className={`text-lg font-bold ${
                            report.complianceAnalysis.budgetAnalysis.variancePercentage > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {report.complianceAnalysis.budgetAnalysis.variancePercentage > 0 ? '+' : ''}
                            {report.complianceAnalysis.budgetAnalysis.variancePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Basic Report Info (if no AI analysis) */}
              {(!report.complianceAnalysis || !report.complianceAnalysis.aiProcessed) && (
                <div className="p-4">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-slate-300 mb-1">Work Completed:</div>
                    <div className="text-sm text-slate-400">{report.workCompleted}</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3 border border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-400">Expense Claimed</div>
                      <div className="text-lg font-bold text-white">₹{(report.expenseClaimed / 100000).toFixed(2)}L</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p>No vendor reports uploaded yet</p>
            {userRole === 'admin' && (
              <p className="text-sm mt-2">Upload a vendor report PDF to see AI-powered compliance analysis</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components for Scheme Creation

// 1. Phases & Milestones Section
function PhasesMilestonesSection({ phases, onChange }: { phases: any[]; onChange: (phases: any[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addPhase = () => {
    onChange([...phases, {
      id: phases.length + 1,
      name: `Phase ${phases.length + 1}`,
      milestones: [],
      deliverables: [],
      plannedWork: '',
      timeline: '',
      budget: 0,
      startDate: '',
      endDate: ''
    }]);
  };

  const removePhase = (index: number) => {
    onChange(phases.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-white/10 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <FileText size={18} className="text-purple-400" />
          <span className="font-medium text-white">1. Project Phases & Milestones</span>
          {phases.length > 0 && (
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
              {phases.length} phases
            </span>
          )}
        </div>
        <span className="text-slate-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-3">
          {phases.map((phase, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-3 bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => {
                    const updated = [...phases];
                    updated[index].name = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full mr-2"
                  placeholder="Phase name"
                />
                <button
                  type="button"
                  onClick={() => removePhase(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                value={phase.plannedWork}
                onChange={(e) => {
                  const updated = [...phases];
                  updated[index].plannedWork = e.target.value;
                  onChange(updated);
                }}
                className="w-full text-sm text-white bg-slate-800 border border-white/10 rounded px-2 py-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                rows={2}
                placeholder="Planned work for this phase..."
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addPhase}
            className="w-full border-2 border-dashed border-white/10 rounded-lg py-2 text-sm text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-colors"
          >
            + Add Phase
          </button>
        </div>
      )}
    </div>
  );
}

// 2. Contractors Section
function ContractorsSection({ contractors, onChange }: { contractors: any[]; onChange: (contractors: any[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addContractor = () => {
    onChange([...contractors, {
      name: '',
      company: '',
      contact: '',
      role: '',
      assignedPhase: ''
    }]);
  };

  const removeContractor = (index: number) => {
    onChange(contractors.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-white/10 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Briefcase size={18} className="text-indigo-400" />
          <span className="font-medium text-white">2. Assign Contractors & Vendors</span>
          {contractors.length > 0 && (
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">
              {contractors.length} assigned
            </span>
          )}
        </div>
        <span className="text-slate-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-3">
          {contractors.map((contractor, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-3 bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={contractor.name}
                  onChange={(e) => {
                    const updated = [...contractors];
                    updated[index].name = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-white bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm flex-1 mr-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Contractor name"
                />
                <button
                  type="button"
                  onClick={() => removeContractor(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contractor.company}
                  onChange={(e) => {
                    const updated = [...contractors];
                    updated[index].company = e.target.value;
                    onChange(updated);
                  }}
                  className="text-sm text-white bg-slate-800 border border-white/10 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Company"
                />
                <input
                  type="text"
                  value={contractor.contact}
                  onChange={(e) => {
                    const updated = [...contractors];
                    updated[index].contact = e.target.value;
                    onChange(updated);
                  }}
                  className="text-sm text-white bg-slate-800 border border-white/10 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Contact"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addContractor}
            className="w-full border-2 border-dashed border-white/10 rounded-lg py-2 text-sm text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors"
          >
            + Add Contractor
          </button>
        </div>
      )}
    </div>
  );
}

// 3. Documents Section
function DocumentsSection({ documents, onChange }: { documents: string[]; onChange: (documents: string[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newDoc, setNewDoc] = useState('');

  const addDocument = () => {
    if (newDoc.trim()) {
      onChange([...documents, newDoc.trim()]);
      setNewDoc('');
    }
  };

  const removeDocument = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-white/10 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Upload size={18} className="text-emerald-400" />
          <span className="font-medium text-white">3. Supporting Documents</span>
          {documents.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
              {documents.length} documents
            </span>
          )}
        </div>
        <span className="text-slate-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-800/50 border border-white/10 rounded px-3 py-2">
              <span className="text-sm text-slate-300">{doc}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newDoc}
              onChange={(e) => setNewDoc(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
              className="flex-1 text-sm text-white bg-slate-800 border border-white/10 rounded px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="Document name or URL..."
            />
            <button
              type="button"
              onClick={addDocument}
              className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. Monitoring Checkpoints Section
function MonitoringSection({ checkpoints, onChange }: { checkpoints: any[]; onChange: (checkpoints: any[]) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addCheckpoint = () => {
    onChange([...checkpoints, {
      title: '',
      date: '',
      description: '',
      responsible: ''
    }]);
  };

  const removeCheckpoint = (index: number) => {
    onChange(checkpoints.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-white/10 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <CheckCircle size={18} className="text-orange-400" />
          <span className="font-medium text-white">4. Monitoring Checkpoints</span>
          {checkpoints.length > 0 && (
            <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full">
              {checkpoints.length} checkpoints
            </span>
          )}
        </div>
        <span className="text-slate-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-3">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-3 bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={checkpoint.title}
                  onChange={(e) => {
                    const updated = [...checkpoints];
                    updated[index].title = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-white bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm flex-1 mr-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder="Checkpoint title"
                />
                <button
                  type="button"
                  onClick={() => removeCheckpoint(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={checkpoint.date}
                  onChange={(e) => {
                    const updated = [...checkpoints];
                    updated[index].date = e.target.value;
                    onChange(updated);
                  }}
                  className="text-sm text-white bg-slate-800 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                />
                <input
                  type="text"
                  value={checkpoint.responsible}
                  onChange={(e) => {
                    const updated = [...checkpoints];
                    updated[index].responsible = e.target.value;
                    onChange(updated);
                  }}
                  className="text-sm text-white bg-slate-800 border border-white/10 rounded px-2 py-1 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder="Responsible person"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCheckpoint}
            className="w-full border-2 border-dashed border-white/10 rounded-lg py-2 text-sm text-slate-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors"
          >
            + Add Checkpoint
          </button>
        </div>
      )}
    </div>
  );
}

// Add Scheme Modal Component
function AddSchemeModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (scheme: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    village: '',
    district: '',
    totalBudget: '',
    startDate: '',
    endDate: '',
    description: '',
    phases: [] as any[],
    contractors: [] as any[],
    documents: [] as string[],
    monitoringCheckpoints: [] as any[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isExtractingPDF, setIsExtractingPDF] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setPdfFile(file);
    setIsExtractingPDF(true);
    setError('');

    try {
      console.log('📄 Uploading PDF for extraction:', file.name);
      
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_URL}/api/schemes/extract-from-pdf`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ PDF data extracted:', result.data);
        
        // Auto-fill form with extracted data
        setFormData({
          name: result.data.name || '',
          category: result.data.category || '',
          village: result.data.village || '',
          district: result.data.district || '',
          totalBudget: result.data.totalBudget?.toString() || '',
          startDate: result.data.startDate || '',
          endDate: result.data.endDate || '',
          description: result.data.description || '',
          phases: result.data.phases || [],
          contractors: [],
          documents: [],
          monitoringCheckpoints: []
        });

        alert('✅ PDF data extracted successfully! Please review and edit if needed.');
      } else {
        throw new Error(result.error || 'Failed to extract data from PDF');
      }
    } catch (err: any) {
      console.error('❌ PDF extraction error:', err);
      setError(err.message || 'Failed to extract data from PDF. Please fill manually.');
    } finally {
      setIsExtractingPDF(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('📤 Submitting new scheme:', formData);
      
      const response = await fetch(`${API_URL}/api/schemes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create scheme');
      }

      const result = await response.json();
      console.log('✅ Scheme created:', result);
      
      onSubmit(formData);
    } catch (err: any) {
      console.error('❌ Error creating scheme:', err);
      setError(err.message || 'Failed to create scheme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Add New Government Scheme</h2>
              <p className="text-sm opacity-90">Register a new rural development project</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-slate-900">
          <div className="space-y-4">
            {/* PDF Upload Section */}
            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-2 border-dashed border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText size={24} className="text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">Upload Scheme Document</h3>
                    <p className="text-xs text-slate-400">AI will extract and auto-fill all details from PDF</p>
                  </div>
                </div>
                {pdfFile && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                    ✓ {pdfFile.name}
                  </span>
                )}
              </div>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                  disabled={isExtractingPDF}
                />
                <div className="flex items-center justify-center space-x-2 bg-slate-800 border-2 border-blue-500/50 hover:border-blue-400 rounded-lg px-4 py-3 transition-colors">
                  {isExtractingPDF ? (
                    <>
                      <Loader size={18} className="animate-spin text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Extracting data from PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">
                        {pdfFile ? 'Upload Different PDF' : 'Upload Government Scheme PDF'}
                      </span>
                    </>
                  )}
                </div>
              </label>
              
              <p className="text-xs text-slate-500 mt-2 text-center">
                PDF will be analyzed using AI to extract scheme details, phases, budget, and timeline.
                <br/>
                <span className="text-purple-400 font-medium">Powered by RunAnywhere SDK</span>
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-slate-400 mb-3">Or fill manually:</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Scheme Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="e.g., Swachh Bharat Mission - Phase 3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Housing">Housing</option>
                  <option value="Employment">Employment</option>
                  <option value="Power">Power</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Village *</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Village name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="District name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Total Budget (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="e.g., 5000000"
                />
                {formData.totalBudget && (
                  <div className="text-xs text-slate-500 mt-1">
                    = ₹{(parseInt(formData.totalBudget) / 100000).toFixed(2)} Lakh
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none outline-none"
                rows={4}
                placeholder="Brief description of the scheme objectives and scope..."
              />
            </div>

            {/* Additional Sections - Expandable */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              {/* 1. Add Project Phases */}
              <PhasesMilestonesSection
                phases={formData.phases}
                onChange={(phases) => setFormData({ ...formData, phases })}
              />

              {/* 2. Assign Contractors */}
              <ContractorsSection
                contractors={formData.contractors}
                onChange={(contractors) => setFormData({ ...formData, contractors })}
              />

              {/* 3. Upload Documents */}
              <DocumentsSection
                documents={formData.documents}
                onChange={(documents) => setFormData({ ...formData, documents })}
              />

              {/* 4. Monitoring Checkpoints */}
              <MonitoringSection
                checkpoints={formData.monitoringCheckpoints}
                onChange={(checkpoints) => setFormData({ ...formData, monitoringCheckpoints: checkpoints })}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-200">{error}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-white/10 rounded-lg font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add Scheme</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Render Feedback View Modal at the end of the main return statement
// Add before the closing </> tag:
// {viewFeedbackScheme && (
//   <FeedbackView
//     scheme={viewFeedbackScheme}
//     onClose={() => setViewFeedbackScheme(null)}
//   />
// )}
