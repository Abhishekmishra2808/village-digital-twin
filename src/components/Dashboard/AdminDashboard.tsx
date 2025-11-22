import { 
  Briefcase, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useVillageStore } from '../../store/villageStore';
import RagQueryModal from '../Rag/RagQueryModal';
import type { Citation } from '../../hooks/useRagQuery';

export default function AdminDashboard() {
  const schemes = useVillageStore((state) => state.schemes);
  const setActiveView = useVillageStore((state) => state.setActiveView);
  const [showRagModal, setShowRagModal] = useState(false);

  // Calculate KPIs
  const totalSchemes = schemes.length;
  const onTrackSchemes = schemes.filter(s => s.status === 'on-track' || s.status === 'completed').length;
  const delayedSchemes = schemes.filter(s => s.status === 'delayed').length;
  const discrepantSchemes = schemes.filter(s => s.status === 'discrepant').length;
  const completedSchemes = schemes.filter(s => s.status === 'completed').length;
  const totalBudget = schemes.reduce((sum, s) => sum + s.totalBudget, 0);
  const budgetUtilized = schemes.reduce((sum, s) => sum + s.budgetUtilized, 0);
  const avgProgress = schemes.length > 0 ? Math.round(schemes.reduce((sum, s) => sum + s.overallProgress, 0) / schemes.length) : 0;
  const totalFeedback = schemes.reduce((sum, s) => sum + s.feedbackCount, 0);
  const avgRating = schemes.length > 0 ? (schemes.reduce((sum, s) => sum + s.citizenRating, 0) / schemes.length).toFixed(1) : '0.0';

  // Category breakdown
  const categoryBreakdown = schemes.reduce((acc: Record<string, number>, scheme) => {
    acc[scheme.category] = (acc[scheme.category] || 0) + 1;
    return acc;
  }, {});

  // Budget by category
  const budgetByCategory = schemes.reduce((acc: Record<string, { allocated: number; used: number }>, scheme) => {
    if (!acc[scheme.category]) {
      acc[scheme.category] = { allocated: 0, used: 0 };
    }
    acc[scheme.category].allocated += scheme.totalBudget;
    acc[scheme.category].used += scheme.budgetUtilized;
    return acc;
  }, {});

  // High performing schemes
  const topPerformers = schemes
    .filter(s => s.overallProgress >= 75 && s.citizenRating >= 4.0)
    .slice(0, 3);

  // Schemes needing attention
  const needsAttention = schemes
    .filter(s => s.status === 'delayed' || s.status === 'discrepant')
    .slice(0, 3);

  // Only show first 2 schemes in dashboard for preview
  const displayedSchemes = schemes.slice(0, 2);
  const hasMoreSchemes = schemes.length > 2;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'discrepant': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Category mapping for icons
  const categoryIcons: Record<string, string> = {
    'Sanitation': '🧹',
    'Water Supply': '💧',
    'Housing': '🏠',
    'Employment': '👷',
    'Power': '⚡'
  };

  const categoryColors: Record<string, string> = {
    'Sanitation': 'bg-blue-500',
    'Water Supply': 'bg-cyan-500',
    'Housing': 'bg-orange-500',
    'Employment': 'bg-purple-500',
    'Power': 'bg-yellow-500'
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 bg-transparent">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-slate-400">Real-time overview • Updated just now</p>
        </div>
        <button
          onClick={() => setShowRagModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
        >
          <Sparkles size={18} />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>

      {/* Top KPI Cards - 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5 text-white hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Briefcase size={20} className="text-purple-400" />
            <div className="text-xs md:text-sm text-slate-400">Total Projects</div>
          </div>
          <div className="text-3xl md:text-4xl font-bold mb-1">{totalSchemes}</div>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>{completedSchemes} completed</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5 text-white hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Target size={20} className="text-emerald-400" />
            <div className="text-xs md:text-sm text-slate-400">On Track</div>
          </div>
          <div className="text-3xl md:text-4xl font-bold mb-1">{onTrackSchemes}</div>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>{Math.round((onTrackSchemes / totalSchemes) * 100)}% success rate</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5 text-white hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle size={20} className="text-rose-400" />
            <div className="text-xs md:text-sm text-slate-400">Issues</div>
          </div>
          <div className="text-3xl md:text-4xl font-bold mb-1">{discrepantSchemes}</div>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
            <Clock size={14} className="text-amber-400" />
            <span>{delayedSchemes} delayed</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5 text-white hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-blue-400" />
            <div className="text-xs md:text-sm text-slate-400">Avg Progress</div>
          </div>
          <div className="text-3xl md:text-4xl font-bold mb-1">{avgProgress}%</div>
          <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
            <TrendingUp size={14} className="text-blue-400" />
            <span>+5% from last month</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Budget Overview */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm md:text-base">Budget Overview</h3>
            <DollarSign size={20} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs md:text-sm text-slate-400 mb-1">
                <span>Allocated</span>
                <span className="font-bold text-white">₹{(totalBudget / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm text-slate-400 mb-1">
                <span>Utilized</span>
                <span className="font-bold text-emerald-400">₹{(budgetUtilized / 10000000).toFixed(1)}Cr</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                  style={{ width: `${Math.round((budgetUtilized / totalBudget) * 100)}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-slate-400">Remaining</span>
                <span className="text-sm md:text-base font-bold text-white">₹{((totalBudget - budgetUtilized) / 10000000).toFixed(1)}Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Citizen Feedback */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm md:text-base">Citizen Feedback</h3>
            <Users size={20} className="text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">{totalFeedback}</div>
                <div className="text-xs md:text-sm text-slate-400">Total Reviews</div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl md:text-3xl font-bold text-white">{avgRating}</span>
                </div>
                <div className="text-xs md:text-sm text-slate-400 ml-1">Avg Rating</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5">
              <div className="text-xs md:text-sm text-slate-400">
                <span className="text-emerald-400 font-semibold">{Math.round((schemes.filter(s => s.citizenRating >= 4).length / schemes.length) * 100)}%</span> schemes rated 4+ stars
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm md:text-base">Quick Actions</h3>
            <Zap size={20} className="text-orange-400" />
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveView('schemes')}
              className="w-full text-left px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors text-xs md:text-sm text-purple-300 font-medium border border-purple-500/20"
            >
              📊 View All Schemes
            </button>
            <button 
              onClick={() => setActiveView('analytics')}
              className="w-full text-left px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-xs md:text-sm text-blue-300 font-medium border border-blue-500/20"
            >
              📈 Analytics Dashboard
            </button>
            <button 
              onClick={() => setActiveView('reports')}
              className="w-full text-left px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors text-xs md:text-sm text-emerald-300 font-medium border border-emerald-500/20"
            >
              💬 Citizen Reports
            </button>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Category Distribution */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5">
          <h3 className="font-semibold text-white mb-3 text-sm md:text-base">Schemes by Category</h3>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = Math.round((count / totalSchemes) * 100);
              const budget = budgetByCategory[category];
              // Removed the unused budgetUsed variable calculation
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg md:text-xl">{categoryIcons[category] || '📋'}</span>
                      <span className="text-xs md:text-sm font-medium text-slate-300">{category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs md:text-sm font-bold text-white">{count}</span>
                      <span className="text-xs text-slate-500 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${categoryColors[category] || 'bg-slate-500'} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right">₹{budget ? (budget.used / 100000).toFixed(0) : 0}L</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm md:text-base">⚠️ Priority Alerts</h3>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/20">
              {needsAttention.length}
            </span>
          </div>
          <div className="space-y-2">
            {needsAttention.length > 0 ? (
              needsAttention.map((scheme) => (
                <div 
                  key={scheme.id}
                  onClick={() => setActiveView('schemes')}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-base md:text-lg">{categoryIcons[scheme.category]}</span>
                      <span className="text-xs md:text-sm font-medium text-white line-clamp-1">{scheme.name}</span>
                    </div>
                    <StatusBadge status={scheme.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 ml-6">
                    <span>{scheme.village}</span>
                    <span className="text-red-400 font-medium">{scheme.discrepancies.length} issues</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-xs md:text-sm">No critical issues! 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 rounded-xl shadow-sm border border-emerald-500/20 p-4 md:p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm md:text-base">🏆 Top Performing Schemes</h3>
            <span className="text-xs md:text-sm text-emerald-400 font-medium">Progress ≥75% • Rating ≥4.0</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPerformers.map((scheme) => (
              <div 
                key={scheme.id}
                onClick={() => setActiveView('schemes')}
                className="bg-slate-900/60 rounded-lg p-3 border border-emerald-500/20 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl md:text-2xl">{categoryIcons[scheme.category]}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-white line-clamp-1">{scheme.name}</h4>
                    <p className="text-xs text-slate-400">{scheme.village}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="text-lg md:text-xl font-bold text-emerald-400">{scheme.overallProgress}%</div>
                    <TrendingUp size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs md:text-sm font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Schemes Preview */}
      <div className="bg-slate-900/50 border border-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Recent Schemes</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Showing {displayedSchemes.length} of {schemes.length} schemes
            </p>
          </div>
          {hasMoreSchemes && (
            <button
              onClick={() => setActiveView('schemes')}
              className="px-3 md:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20 text-xs md:text-sm"
            >
              <span>View All {schemes.length}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {displayedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => setActiveView('schemes')}
              className="bg-slate-800/40 rounded-xl md:rounded-2xl border border-white/5 hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-3 md:p-6 border-b border-white/5">
                <div className="flex items-start justify-between gap-3 md:gap-4">
                  <div className="flex items-start space-x-2 md:space-x-4 flex-1">
                    {/* Category Icon */}
                    <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 bg-slate-800 rounded-lg md:rounded-xl shadow-sm flex items-center justify-center text-xl md:text-3xl border border-white/5">
                      {categoryIcons[scheme.category] || '📋'}
                    </div>
                    
                    {/* Title and Meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold text-white mb-1 md:mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {scheme.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-2 md:mb-3">
                        <StatusBadge status={scheme.status} />
                        <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-slate-700/50 rounded-full text-xs font-medium text-slate-300 border border-white/10">
                          {scheme.category}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} className="md:hidden flex-shrink-0 text-slate-500" />
                          <MapPin size={14} className="hidden md:block flex-shrink-0 text-slate-500" />
                          <span className="truncate">{scheme.village}, {scheme.district}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className="md:hidden flex-shrink-0 text-slate-500" />
                          <Calendar size={14} className="hidden md:block flex-shrink-0 text-slate-500" />
                          <span className="font-mono">{scheme.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="flex-shrink-0">
                    <div className="relative w-14 h-14 md:w-20 md:h-20">
                      <svg className="transform -rotate-90 w-full h-full">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="30%"
                          stroke="#334155"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="30%"
                          stroke={
                            scheme.status === 'on-track' ? '#10b981' :
                            scheme.status === 'delayed' ? '#f59e0b' :
                            scheme.status === 'discrepant' ? '#ef4444' :
                            '#3b82f6'
                          }
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${scheme.overallProgress * 1.88} 188`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base md:text-xl font-bold text-white">{scheme.overallProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-3 md:p-6 bg-slate-900/30">
                <div className="text-center p-2 md:p-3 bg-slate-800/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Budget</div>
                  <div className="text-sm md:text-base font-bold text-white">
                    ₹{(scheme.totalBudget / 100000).toFixed(1)}L
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}% used
                  </div>
                </div>
                
                <div className="text-center p-2 md:p-3 bg-slate-800/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Utilized</div>
                  <div className="text-sm md:text-base font-bold text-emerald-400">
                    ₹{(scheme.budgetUtilized / 100000).toFixed(1)}L
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ₹{((scheme.totalBudget - scheme.budgetUtilized) / 100000).toFixed(1)}L left
                  </div>
                </div>
                
                <div className="text-center p-2 md:p-3 bg-slate-800/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Rating</div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm md:text-base font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {scheme.feedbackCount} reviews
                  </div>
                </div>
                
                <div className="text-center p-2 md:p-3 bg-slate-800/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Timeline</div>
                  <div className="text-sm md:text-base font-bold text-white">
                    {(() => {
                      const end = new Date(scheme.endDate);
                      const now = new Date();
                      const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      return daysLeft > 0 ? `${daysLeft}d` : 'Complete';
                    })()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(scheme.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Alerts Section - Only show if there are issues */}
              {(scheme.discrepancies.length > 0 || 
                (scheme.vendorReports && scheme.vendorReports.length > 0 && 
                 (() => {
                   const latestReport = scheme.vendorReports[scheme.vendorReports.length - 1];
                   return (latestReport.complianceAnalysis?.discrepancies?.length ?? 0) > 0 ||
                          (latestReport.complianceAnalysis?.overdueWork?.length ?? 0) > 0;
                 })())) && (
                <div className="px-3 md:px-6 pb-3 md:pb-4 space-y-2 bg-slate-900/30">
                  {/* Vendor Report Issues */}
                  {scheme.vendorReports && scheme.vendorReports.length > 0 && (() => {
                    const latestReport = scheme.vendorReports[scheme.vendorReports.length - 1];
                    const discCount = latestReport.complianceAnalysis?.discrepancies?.length ?? 0;
                    const overdueCount = latestReport.complianceAnalysis?.overdueWork?.length ?? 0;
                    
                    return (discCount > 0 || overdueCount > 0) ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 md:p-3 flex items-center space-x-2">
                        <AlertTriangle size={14} className="md:hidden text-red-400 flex-shrink-0" />
                        <AlertTriangle size={16} className="hidden md:block text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-red-300">
                            {discCount > 0 && `${discCount} Discrepancies`}
                            {discCount > 0 && overdueCount > 0 && ' • '}
                            {overdueCount > 0 && `${overdueCount} Overdue Tasks`}
                          </div>
                        </div>
                        <span className="text-[10px] text-red-200 px-2 py-1 bg-red-500/20 rounded-full font-medium">
                          Action Needed
                        </span>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Legacy Discrepancies */}
                  {scheme.discrepancies.length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 md:p-3 flex items-center space-x-2">
                      <AlertTriangle size={14} className="md:hidden text-orange-400 flex-shrink-0" />
                      <AlertTriangle size={16} className="hidden md:block text-orange-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-orange-300 flex-1">
                        {scheme.discrepancies.length} Issue{scheme.discrepancies.length > 1 ? 's' : ''} Detected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {schemes.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-700" />
            <p>No schemes available. Start monitoring government projects.</p>
          </div>
        )}
      </div>

      {/* RAG Query Modal */}
      {showRagModal && (
        <RagQueryModal
          isOpen={showRagModal}
          onClose={() => setShowRagModal(false)}
          onHighlightCitation={(citation: Citation) => {
            console.log('📍 Admin Dashboard - Highlight citation:', citation);
            alert(`📍 Citation from AI:\n\nType: ${citation.type}\nSnippet: ${citation.snippet}\nScore: ${citation.score}`);
          }}
        />
      )}
    </div>
  );
}
