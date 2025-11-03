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
                        <div className="text-xs text-gray-500">
                          Last updated: {new Date(scheme.lastUpdated).toLocaleString()}
                        </div>
                      </div>

                      {/* Recent Feedback Items */}
                      {scheme.feedbackHistory && scheme.feedbackHistory.length > 0 && (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {scheme.feedbackHistory.slice(-5).reverse().map((feedback) => (
                            <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              {/* Header with rating and sentiment */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      className={star <= feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  feedback.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                                  feedback.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                                  feedback.sentiment === 'Critical' ? 'bg-red-200 text-red-900' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {feedback.sentiment}
                                </span>
                              </div>

                              {/* AI Summary */}
                              <p className="text-sm text-gray-800 mb-2 leading-relaxed">{feedback.aiSummary}</p>

                              {/* Key Concerns */}
                              {feedback.concerns && feedback.concerns.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Key Concerns:</div>
                                  <ul className="space-y-1">
                                    {feedback.concerns.map((concern, idx) => (
                                      <li key={idx} className="text-xs text-gray-700 flex items-start space-x-1">
                                        <span className="text-blue-600 mt-0.5">•</span>
                                        <span>{concern}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Categories and Urgency */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center space-x-1 flex-wrap">
                                  {feedback.categories.map((cat, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {feedback.isUrgent && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                      <AlertTriangle size={10} />
                                      <span>Urgent</span>
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {new Date(feedback.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
