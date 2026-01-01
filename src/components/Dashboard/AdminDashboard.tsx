import { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Users,
  Star,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';

export default function AdminDashboard() {
  const schemes = useVillageStore((state) => state.schemes);
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  // Calculate KPIs
  const totalSchemes = schemes.length;
  const onTrackSchemes = schemes.filter(s => s.status === 'on-track' || s.status === 'completed').length;
  const delayedSchemes = schemes.filter(s => s.status === 'delayed').length;
  const discrepantSchemes = schemes.filter(s => s.status === 'discrepant').length;
  const totalBudget = schemes.reduce((sum, s) => sum + s.totalBudget, 0);
  const budgetUtilized = schemes.reduce((sum, s) => sum + s.budgetUtilized, 0);
  const avgProgress = schemes.length > 0 ? Math.round(schemes.reduce((sum, s) => sum + s.overallProgress, 0) / schemes.length) : 0;
  const totalFeedback = schemes.reduce((sum, s) => sum + s.feedbackCount, 0);
  const avgRating = schemes.length > 0 ? (schemes.reduce((sum, s) => sum + s.citizenRating, 0) / schemes.length).toFixed(1) : '0.0';

  const toggleExpand = (schemeId: string) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId);
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

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage government schemes in real-time</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Total Schemes</div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalSchemes}</div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-600 font-medium">{onTrackSchemes} on track</span>
            <span className="text-gray-400">•</span>
            <span className="text-yellow-600 font-medium">{delayedSchemes} delayed</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Avg Progress</div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{avgProgress}%</div>
          <div className="text-sm text-gray-600">
            {discrepantSchemes > 0 && <span className="text-red-600 font-medium">⚠ {discrepantSchemes} with issues</span>}
            {discrepantSchemes === 0 && <span className="text-green-600 font-medium">✓ All clear</span>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Budget Status</div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {totalBudget > 0 ? Math.round((budgetUtilized / totalBudget) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">
            ₹{(budgetUtilized / 10000000).toFixed(1)}Cr of ₹{(totalBudget / 10000000).toFixed(1)}Cr
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-600">Citizen Feedback</div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalFeedback}</div>
          <div className="flex items-center space-x-1 text-sm">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-gray-600 font-medium">{avgRating} avg rating</span>
          </div>
        </div>
      </div>

      {/* Schemes Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Government Schemes</h2>
          <div className="text-sm text-gray-500">Live updates • Last refresh: {new Date().toLocaleTimeString()}</div>
        </div>

        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
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
                            <span>{new Date(scheme.startDate).toLocaleDateString()} - {new Date(scheme.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                            {scheme.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">{scheme.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Overall Progress</span>
                        <span className="font-bold text-gray-900">{scheme.overallProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 transition-all ${getProgressColor(scheme.status)}`}
                          style={{ width: `${scheme.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs text-blue-700 mb-1">Budget</div>
                        <div className="text-sm font-bold text-blue-900">₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-xs text-green-700 mb-1">Utilized</div>
                        <div className="text-sm font-bold text-green-900">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2">
                        <div className="text-xs text-yellow-700 mb-1">Feedback</div>
                        <div className="text-sm font-bold text-yellow-900">{scheme.feedbackCount}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="text-xs text-purple-700 mb-1">Rating</div>
                        <div className="flex items-center space-x-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-purple-900">{scheme.citizenRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Discrepancies Alert */}
                    {scheme.discrepancies.length > 0 && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                          <div className="text-sm font-bold text-red-900">
                            {scheme.discrepancies.length} Critical Issue{scheme.discrepancies.length > 1 ? 's' : ''} Detected
                          </div>
                        </div>
                      </div>
                    )}
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
                    <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700">{scheme.description}</p>
                  </div>

                  {/* Phases */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Project Phases</h4>
                    <div className="space-y-2">
                      {scheme.phases.map((phase, idx) => (
                        <div key={phase.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Phase {idx + 1}: {phase.name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                              phase.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                              phase.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {phase.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
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
                            <span className="text-xs font-medium text-gray-900 w-12 text-right">{phase.progress}%</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="text-xs text-gray-600">
                              Budget: ₹{(phase.budget / 100000).toFixed(1)}L
                            </div>
                            <div className="text-xs text-gray-600">
                              Spent: ₹{(phase.spent / 100000).toFixed(1)}L
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI-Processed Citizen Feedback */}
                  {scheme.feedbackCount > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
                        <MessageSquare size={16} className="text-blue-600" />
                        <span>AI-Processed Citizen Feedback</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Anonymous</span>
                      </h4>
                      
                      {/* Overall Rating Summary */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-2xl font-bold text-gray-900">{scheme.citizenRating.toFixed(1)}</span>
                            <span className="text-sm text-gray-600">/ 5.0</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Total Responses</div>
                            <div className="text-lg font-bold text-gray-900">{scheme.feedbackCount}</div>
                          </div>
                        </div>
                        
                        {/* Overall Sentiment Distribution */}
                        {scheme.feedbackHistory && scheme.feedbackHistory.length > 0 && (() => {
                          const sentimentCounts: Record<string, number> = scheme.feedbackHistory.reduce((acc: Record<string, number>, fb: any) => {
                            acc[fb.sentiment] = (acc[fb.sentiment] || 0) + 1;
                            return acc;
                          }, {});
                          const total = scheme.feedbackHistory.length;
                          
                          // Calculate overall sentiment
                          const getOverallSentiment = () => {
                            const positive = sentimentCounts['Positive'] || 0;
                            const negative = sentimentCounts['Negative'] || 0;
                            const critical = sentimentCounts['Critical'] || 0;
                            
                            if (critical > total * 0.3) return { label: 'Critical', emoji: '🔴', color: 'text-red-600', bg: 'bg-red-100' };
                            if (negative > total * 0.4) return { label: 'Mostly Negative', emoji: '😟', color: 'text-orange-600', bg: 'bg-orange-100' };
                            if (positive > total * 0.6) return { label: 'Mostly Positive', emoji: '😊', color: 'text-green-600', bg: 'bg-green-100' };
                            if (positive > negative + critical) return { label: 'Positive', emoji: '🙂', color: 'text-green-600', bg: 'bg-green-100' };
                            return { label: 'Mixed/Neutral', emoji: '😐', color: 'text-gray-600', bg: 'bg-gray-100' };
                          };
                          
                          const overallSentiment = getOverallSentiment();
                          
                          return (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              {/* Overall Combined Sentiment */}
                              <div className={`${overallSentiment.bg} rounded-lg p-3 mb-3 border-2 border-current ${overallSentiment.color}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-4xl">{overallSentiment.emoji}</span>
                                    <div>
                                      <div className="text-xs font-medium opacity-75">Overall Sentiment</div>
                                      <div className="text-lg font-bold">{overallSentiment.label}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs opacity-75">Based on</div>
                                    <div className="text-2xl font-bold">{total}</div>
                                    <div className="text-xs opacity-75">responses</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Sentiment Breakdown */}
                              <div className="text-xs font-medium text-gray-700 mb-2">Sentiment Breakdown:</div>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { name: 'Positive', emoji: '😊', color: 'bg-green-500' },
                                  { name: 'Neutral', emoji: '😐', color: 'bg-gray-400' },
                                  { name: 'Negative', emoji: '😟', color: 'bg-yellow-500' },
                                  { name: 'Critical', emoji: '🔴', color: 'bg-red-500' }
                                ].map(({ name, emoji, color }) => {
                                  const count = sentimentCounts[name] || 0;
                                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                                  
                                  return (
                                    <div key={name} className="text-center">
                                      <div className="text-xl mb-1">{emoji}</div>
                                      <div className="text-xs text-gray-600 mb-1">{name}</div>
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${color} transition-all`}
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <div className="text-xs font-bold text-gray-800 mt-1">
                                        {count} ({percentage}%)
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(scheme.lastUpdated).toLocaleString()}
                        </div>
                      </div>

                      {/* Individual Anonymized Feedback Messages */}
                      {scheme.feedbackHistory && scheme.feedbackHistory.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-gray-900 flex items-center space-x-2">
                              <span>💬</span>
                              <span>Citizen Feedback (Anonymized)</span>
                            </h5>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              Latest {Math.min(10, scheme.feedbackHistory.length)} messages
                            </span>
                          </div>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {scheme.feedbackHistory.slice(-10).reverse().map((feedback: any, index: number) => {
                              // Get sentiment emoji
                              const sentimentEmoji = 
                                feedback.sentiment === 'Positive' ? '😊' :
                                feedback.sentiment === 'Neutral' ? '😐' :
                                feedback.sentiment === 'Negative' ? '😟' :
                                '🔴';
                              
                              const sentimentColor = 
                                feedback.sentiment === 'Positive' ? 'border-green-300 bg-green-50' :
                                feedback.sentiment === 'Neutral' ? 'border-gray-300 bg-gray-50' :
                                feedback.sentiment === 'Negative' ? 'border-yellow-300 bg-yellow-50' :
                                'border-red-300 bg-red-50';
                              
                              return (
                                <div key={feedback._id || index} className={`border-l-4 ${sentimentColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
                                  {/* Anonymous User Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        👤
                                      </div>
                                      <div>
                                        <div className="text-sm font-bold text-gray-900">Anonymous Citizen #{(scheme.feedbackHistory?.length || 0) - index}</div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(feedback.createdAt || feedback.timestamp).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-2xl">{sentimentEmoji}</span>
                                      <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            size={12}
                                            className={star <= feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* AI-Processed Message */}
                                  <div className="bg-white rounded-lg p-3 mb-2 border border-gray-200">
                                    <div className="flex items-start space-x-2 mb-2">
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                        🤖 AI-Processed
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        feedback.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                        feedback.sentiment === 'Negative' ? 'bg-yellow-100 text-yellow-700' :
                                        feedback.sentiment === 'Critical' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {feedback.sentiment}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                      "{feedback.aiSummary}"
                                    </p>
                                  </div>

                                  {/* What Citizen Wants */}
                                  {feedback.concerns && feedback.concerns.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-xs font-bold text-gray-700 mb-2 flex items-center space-x-1">
                                        <span>💡</span>
                                        <span>What citizen wants addressed:</span>
                                      </div>
                                      <ul className="space-y-1 bg-white rounded-lg p-2 border border-gray-200">
                                        {feedback.concerns.map((concern: string, idx: number) => (
                                          <li key={idx} className="text-xs text-gray-800 flex items-start space-x-2">
                                            <span className="text-blue-600 font-bold mt-0.5">→</span>
                                            <span className="flex-1">{concern}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Categories and Urgency Footer */}
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <div className="flex items-center space-x-1 flex-wrap gap-1">
                                      {feedback.categories && feedback.categories.map((cat: string, idx: number) => (
                                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                          {cat}
                                        </span>
                                      ))}
                                    </div>
                                    {feedback.isUrgent && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center space-x-1 font-bold">
                                        <AlertTriangle size={12} />
                                        <span>URGENT</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <div className="flex items-start space-x-2">
                              <span className="text-lg">🔒</span>
                              <div className="text-xs text-blue-900">
                                <div className="font-bold mb-1">100% Anonymous & AI-Processed</div>
                                <div>All personal information has been removed by Gemini AI. Original messages are encrypted and never displayed.</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Common Themes Across All Feedback */}
                      {scheme.feedbackHistory && scheme.feedbackHistory.length > 0 && (() => {
                        // Aggregate all concerns
                        const allConcerns = scheme.feedbackHistory.flatMap((fb: any) => fb.concerns || []);
                        const allCategories = scheme.feedbackHistory.flatMap((fb: any) => fb.categories || []);
                        
                        // Count occurrences
                        const concernCounts: Record<string, number> = allConcerns.reduce((acc: Record<string, number>, concern: string) => {
                          acc[concern] = (acc[concern] || 0) + 1;
                          return acc;
                        }, {});
                        
                        const categoryCounts: Record<string, number> = allCategories.reduce((acc: Record<string, number>, cat: string) => {
                          acc[cat] = (acc[cat] || 0) + 1;
                          return acc;
                        }, {});
                        
                        // Get top 5 concerns
                        const topConcerns = Object.entries(concernCounts)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .slice(0, 5);
                        
                        // Get top categories
                        const topCategories = Object.entries(categoryCounts)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .slice(0, 5);
                        
                        if (topConcerns.length === 0) return null;
                        
                        return (
                          <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <h5 className="font-bold text-purple-900 mb-3 flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              <span>Common Themes (AI Analysis)</span>
                            </h5>
                            
                            {/* Top Categories */}
                            <div className="mb-3">
                              <div className="text-xs font-medium text-purple-700 mb-2">Most Frequent Issue Types:</div>
                              <div className="flex flex-wrap gap-2">
                                {topCategories.map(([category, count]) => (
                                  <div key={category} className="bg-white border border-purple-200 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">{category}</span>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Top Concerns */}
                            <div>
                              <div className="text-xs font-medium text-purple-700 mb-2">Most Mentioned Concerns:</div>
                              <div className="space-y-2">
                                {topConcerns.map(([concern, count], idx) => (
                                  <div key={idx} className="bg-white border border-purple-200 rounded-lg p-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-2 flex-1">
                                        <span className="text-purple-600 font-bold text-sm mt-0.5">{idx + 1}.</span>
                                        <span className="text-sm text-gray-800">{concern}</span>
                                      </div>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold ml-2">
                                        {count} times
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-purple-200 text-xs text-purple-700">
                              💡 All feedback is AI-processed to remove personal information and identify common patterns
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Discrepancies Details */}
                  {scheme.discrepancies.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-900 mb-2 flex items-center space-x-2">
                        <AlertTriangle size={16} />
                        <span>Critical Issues</span>
                      </h4>
                      <div className="space-y-2">
                        {scheme.discrepancies.map((disc, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <div className={`mt-1 w-2 h-2 rounded-full ${
                                disc.severity === 'high' ? 'bg-red-600' :
                                disc.severity === 'medium' ? 'bg-orange-500' :
                                'bg-yellow-500'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-red-900 text-sm mb-1">{disc.type}</div>
                                <div className="text-xs text-red-700">{disc.description}</div>
                                <div className="text-xs text-red-600 mt-1">
                                  Reported: {new Date(disc.reportedDate || disc.date || Date.now()).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {schemes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No schemes available. Start monitoring government projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
