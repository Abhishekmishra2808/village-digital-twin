import { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
  Shield,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { useAnonymousReports } from '../../hooks/useAnonymousReports';

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  acknowledged: { label: 'Acknowledged', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  assigned: { label: 'Worker Assigned', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  in_progress: { label: 'Work In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  resolved: { label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/20' },
  closed: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/20' }
};

const AUTHORITY_LEVELS = {
  0: { name: 'Village Sarpanch', color: 'text-green-400' },
  1: { name: 'Block Officer', color: 'text-blue-400' },
  2: { name: 'District Magistrate', color: 'text-yellow-400' },
  3: { name: 'State Authority', color: 'text-red-400' }
};

export default function AnonymousReportTracker() {
  const { trackReport, escalateReport, submitFeedback, loading } = useAnonymousReports();
  const [token, setToken] = useState('');
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalate, setShowEscalate] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    isResolved: true,
    rating: 5,
    feedback: ''
  });

  const handleTrack = async () => {
    if (!token.trim()) {
      setError('Please enter your tracking token');
      return;
    }

    setError(null);
    const result = await trackReport(token.trim());
    
    if (result.success) {
      setReport(result.report);
    } else {
      setError(result.error || 'Report not found');
      setReport(null);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      alert('Please provide a reason for escalation');
      return;
    }

    const result = await escalateReport(report.id, token, escalateReason);
    
    if (result.success) {
      alert(`Report escalated to ${result.authority}`);
      setShowEscalate(false);
      setEscalateReason('');
      // Refresh report
      handleTrack();
    } else {
      alert(result.error || 'Failed to escalate');
    }
  };

  const handleFeedbackSubmit = async () => {
    const result = await submitFeedback(
      report.id,
      token,
      feedbackData.isResolved,
      feedbackData.rating,
      feedbackData.feedback
    );

    if (result.success) {
      alert('Thank you for your feedback!');
      setShowFeedback(false);
      handleTrack();
    } else {
      alert(result.error || 'Failed to submit feedback');
    }
  };

  const canEscalate = report && 
    report.status !== 'resolved' && 
    report.status !== 'closed' && 
    report.currentEscalationLevel < 3 &&
    new Date() > new Date(report.escalationDeadline);

  const daysUntilEscalation = report?.escalationDeadline 
    ? Math.ceil((new Date(report.escalationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Box */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 rounded-xl">
            <Search className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Track Your Report</h2>
            <p className="text-slate-400 text-sm">Enter your tracking token to check status</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your tracking token"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Track
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Report Details */}
      {report && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          {/* Status Banner */}
          <div className={`p-4 ${STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.bg || 'bg-slate-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-6 h-6 ${STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.color}`} />
                <div>
                  <div className={`font-medium ${STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.color}`}>
                    {STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]?.label}
                  </div>
                  <div className="text-sm text-slate-400">Report ID: {report.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Current Authority</div>
                <div className={AUTHORITY_LEVELS[report.currentEscalationLevel as keyof typeof AUTHORITY_LEVELS]?.color}>
                  {AUTHORITY_LEVELS[report.currentEscalationLevel as keyof typeof AUTHORITY_LEVELS]?.name}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Report Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
              <p className="text-slate-400">{report.category}</p>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Status Timeline
              </h4>
              <div className="space-y-3">
                {report.statusUpdates?.map((update: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{update.message}</div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(update.timestamp), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalation Info */}
            {report.currentEscalationLevel > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">Escalation History</span>
                </div>
                {report.escalationHistory?.map((esc: any, index: number) => (
                  <div key={index} className="text-sm text-slate-300 mb-1">
                    Level {esc.level}: {esc.authorityName} - {esc.reason}
                    <div className="text-xs text-slate-500">
                      {format(new Date(esc.escalatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Credibility */}
            <div className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  <span className="text-white">{report.upvoteCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                  <span className="text-white">{report.downvoteCount}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Credibility Score</div>
                <div className={`text-lg font-bold ${
                  report.credibilityScore >= 70 ? 'text-green-400' :
                  report.credibilityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {report.credibilityScore}%
                </div>
              </div>
            </div>

            {/* Assigned Worker */}
            {report.assignedTo && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Assigned To</div>
                <div className="text-purple-400 font-medium">{report.assignedTo}</div>
              </div>
            )}

            {/* Escalation Deadline */}
            {report.status !== 'resolved' && report.status !== 'closed' && (
              <div className={`rounded-xl p-4 ${canEscalate ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-700/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Escalation Deadline</div>
                    <div className={canEscalate ? 'text-red-400' : 'text-white'}>
                      {format(new Date(report.escalationDeadline), 'MMM d, yyyy')}
                      {canEscalate ? ' (Passed)' : ` (${daysUntilEscalation} days remaining)`}
                    </div>
                  </div>
                  {canEscalate && (
                    <button
                      onClick={() => setShowEscalate(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Escalate Modal */}
            {showEscalate && (
              <div className="bg-slate-700/50 rounded-xl p-4 border border-red-500/30">
                <h4 className="text-white font-medium mb-3">Escalate to Higher Authority</h4>
                <p className="text-sm text-slate-400 mb-3">
                  This will escalate your report to {AUTHORITY_LEVELS[(report.currentEscalationLevel + 1) as keyof typeof AUTHORITY_LEVELS]?.name}.
                  This action is recorded on blockchain and cannot be reversed.
                </p>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Reason for escalation..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none mb-3"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleEscalate}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Confirm Escalation
                  </button>
                  <button
                    onClick={() => setShowEscalate(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Resolution Feedback */}
            {(report.status === 'resolved' || report.status === 'closed') && !report.resolutionFeedback && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-green-400 font-medium mb-2">Was your issue resolved?</h4>
                <p className="text-sm text-slate-400 mb-3">
                  Please provide feedback to help improve our services
                </p>
                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    Provide Feedback
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setFeedbackData(prev => ({ ...prev, isResolved: true }))}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          feedbackData.isResolved 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        Yes, Resolved
                      </button>
                      <button
                        onClick={() => setFeedbackData(prev => ({ ...prev, isResolved: false }))}
                        className={`px-4 py-2 rounded-xl transition-colors ${
                          !feedbackData.isResolved 
                            ? 'bg-red-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        No, Not Resolved
                      </button>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-2">Satisfaction Rating</div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            onClick={() => setFeedbackData(prev => ({ ...prev, rating }))}
                            className={`p-2 rounded-lg transition-colors ${
                              feedbackData.rating >= rating
                                ? 'text-yellow-400'
                                : 'text-slate-600'
                            }`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={feedbackData.feedback}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Additional comments (optional)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleFeedbackSubmit}
                      className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Already Submitted Feedback */}
            {report.resolutionFeedback && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-2">Your Feedback</div>
                <div className="flex items-center gap-4">
                  <span className={report.resolutionFeedback.isResolved ? 'text-green-400' : 'text-red-400'}>
                    {report.resolutionFeedback.isResolved ? '✓ Confirmed Resolved' : '✗ Not Resolved'}
                  </span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(r => (
                      <Star 
                        key={r} 
                        className={`w-4 h-4 ${r <= report.resolutionFeedback.satisfactionRating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                      />
                    ))}
                  </div>
                </div>
                {report.resolutionFeedback.feedback && (
                  <div className="text-sm text-slate-300 mt-2">"{report.resolutionFeedback.feedback}"</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions when no report */}
      {!report && !error && (
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8 text-center">
          <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">Track Your Anonymous Report</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Enter the tracking token you received when submitting your report to see its current status, 
            escalate if needed, or provide feedback on resolution.
          </p>
        </div>
      )}
    </div>
  );
}
