import { useState } from 'react';
import { X, Send, Loader2, MapPin, ExternalLink, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import useRagQuery, { Citation } from '../../hooks/useRagQuery';
import { format } from 'date-fns';

interface RagQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeId?: string | null;
  onHighlightCitation?: (citation: Citation) => void;
}

export default function RagQueryModal({ 
  isOpen, 
  onClose, 
  schemeId = null,
  onHighlightCitation
}: RagQueryModalProps) {
  const [question, setQuestion] = useState('');
  const [limitToScheme, setLimitToScheme] = useState(!!schemeId);
  const { loading, error, data, runQuery, reset } = useRagQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    await runQuery({
      question: question.trim(),
      scheme_id: limitToScheme && schemeId ? schemeId : null,
      bbox: null, // Could be added later for map-based queries
      max_citations: 5
    });
  };

  const handleClose = () => {
    reset();
    setQuestion('');
    onClose();
  };

  const getCitationIcon = (type: string) => {
    switch (type) {
      case 'vendor-report':
        return <FileText size={16} className="text-blue-600" />;
      case 'government-scheme':
        return <FileText size={16} className="text-purple-600" />;
      case 'citizen-report':
        return <AlertCircle size={16} className="text-orange-600" />;
      case 'sensor-event':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getCitationTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Send size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ask a Question</h2>
              <p className="text-white/80 text-sm">Get AI-powered insights from schemes, reports & sensors</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Question Input Form */}
          {!data && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Why is Scheme S-123 delayed? What are the main issues with water supply?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={500}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {question.length}/500 characters
                </p>
              </div>

              {schemeId && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="limitToScheme"
                    checked={limitToScheme}
                    onChange={(e) => setLimitToScheme(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    disabled={loading}
                  />
                  <label htmlFor="limitToScheme" className="text-sm text-gray-700">
                    Limit search to current scheme only
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Ask Question
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={reset}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Answer Display */}
          {data && (
            <div className="space-y-6">
              {/* Question Asked */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Question:</p>
                <p className="text-gray-900 font-medium">{question}</p>
                {data.cached && (
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Cached result
                  </span>
                )}
              </div>

              {/* Answer */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Answer
                </h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{data.answer}</p>
              </div>

              {/* Citations */}
              {data.citations && data.citations.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">
                    Sources ({data.citations.length})
                  </h3>
                  <div className="space-y-3">
                    {data.citations.map((citation, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCitationIcon(citation.type)}
                            <span className="text-sm font-semibold text-gray-900">
                              {getCitationTypeLabel(citation.type)}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              Score: {(citation.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3 italic">
                          "{citation.snippet}"
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {citation.doc_id}
                          </span>
                          {citation.timestamp && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {format(new Date(citation.timestamp), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          {citation.geo && onHighlightCitation && (
                            <button
                              onClick={() => onHighlightCitation(citation)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <MapPin size={14} />
                              Show on Map
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/api/docs/${citation.doc_id}`, '_blank')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Open Document
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trace ID (for debugging) */}
              <div className="text-xs text-gray-400 text-center">
                Trace ID: {data.trace_id}
              </div>

              {/* Ask Another Question */}
              <button
                onClick={reset}
                className="w-full py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                Ask Another Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
