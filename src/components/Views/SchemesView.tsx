import { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';
import { API_URL } from '../../config/api';
import RagQueryModal from '../Rag/RagQueryModal';
import type { Citation } from '../../hooks/useRagQuery';

export default function SchemesView() {
  // Get schemes from store instead of mock data
  const schemes = useVillageStore((state) => state.schemes);
  const fetchSchemes = useVillageStore((state) => state.fetchSchemes);
  const userRole = useVillageStore((state) => state.userRole);
  
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'phases' | 'reports'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRagModal, setShowRagModal] = useState(false);

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
      'on-track': 'bg-green-100 text-green-800 border-green-200',
      'delayed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'discrepant': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200'
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

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => {
                setSelectedScheme(scheme);
                setModalInitialTab('overview');
                setShowDetailsModal(true);
              }}
              className="bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 p-4 md:p-6 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 md:space-x-4 flex-1">
                    {/* Category Icon */}
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-2xl md:text-3xl border border-white/5">
                      {categoryIcons[scheme.category] || '📋'}
                    </div>
                    
                    {/* Title and Meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {scheme.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <StatusBadge status={scheme.status} />
                        <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-white/10">
                          {scheme.category}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} className="flex-shrink-0 text-slate-500" />
                          <span className="truncate">{scheme.village}, {scheme.district}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText size={14} className="flex-shrink-0 text-slate-500" />
                          <span className="font-mono">{scheme.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 md:w-20 md:h-20">
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
                        <span className="text-lg md:text-xl font-bold text-white">{scheme.overallProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 bg-slate-900/30">
                <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Budget</div>
                  <div className="text-sm md:text-base font-bold text-white">
                    ₹{(scheme.totalBudget / 100000).toFixed(1)}L
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}% used
                  </div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Utilized</div>
                  <div className="text-sm md:text-base font-bold text-emerald-400">
                    ₹{(scheme.budgetUtilized / 100000).toFixed(1)}L
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ₹{((scheme.totalBudget - scheme.budgetUtilized) / 100000).toFixed(1)}L left
                  </div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Rating</div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm md:text-base font-bold text-white">{scheme.citizenRating.toFixed(1)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {scheme.feedbackCount} reviews
                  </div>
                </div>
                
                <div className="text-center p-3 bg-slate-800/50 rounded-xl border border-white/5">
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
                <div className="px-4 md:px-6 pb-4 space-y-2">
                  {/* Vendor Report Issues */}
                  {scheme.vendorReports && scheme.vendorReports.length > 0 && (() => {
                    const latestReport = scheme.vendorReports[scheme.vendorReports.length - 1];
                    const discCount = latestReport.complianceAnalysis?.discrepancies?.length ?? 0;
                    const overdueCount = latestReport.complianceAnalysis?.overdueWork?.length ?? 0;
                    
                    return (discCount > 0 || overdueCount > 0) ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-red-200">
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
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center space-x-2">
                      <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-orange-200 flex-1">
                        {scheme.discrepancies.length} Issue{scheme.discrepancies.length > 1 ? 's' : ''} Detected
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Footer */}
              <div className="px-4 md:px-6 py-3 bg-slate-900/30 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] md:text-xs text-slate-500">
                  Updated {new Date(scheme.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  {userRole === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheme(scheme);
                        setModalInitialTab('reports');
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center space-x-1"
                    >
                      <Upload size={12} />
                      <span className="hidden sm:inline">Upload Report</span>
                      <span className="sm:hidden">Upload</span>
                    </button>
                  )}
                  <button
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition-colors flex items-center space-x-1 group-hover:bg-purple-600 group-hover:text-white"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} />
                  </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-6 text-white">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex-1 pr-2">
              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 line-clamp-2">{scheme.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm space-y-1 sm:space-y-0">
                <div className="flex items-center space-x-1">
                  <MapPin size={12} className="md:hidden" />
                  <MapPin size={14} className="hidden md:block" />
                  <span className="truncate">{scheme.village}, {scheme.district}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText size={12} className="md:hidden" />
                  <FileText size={14} className="hidden md:block" />
                  <span className="truncate">{scheme.id}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button 
                onClick={onClose}
                className="p-1.5 md:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={20} className="md:hidden" />
                <X size={24} className="hidden md:block" />
              </button>
              {userRole === 'admin' && (
                <button
                  className="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-semibold shadow transition disabled:opacity-60"
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
          <div className="bg-red-100 text-red-700 rounded px-3 py-2 mb-2 text-xs font-semibold text-center">
            {deleteError}
          </div>
        )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3">
              <div className="text-[10px] md:text-xs opacity-90">Progress</div>
              <div className="text-lg md:text-2xl font-bold">{scheme.overallProgress}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3">
              <div className="text-[10px] md:text-xs opacity-90">Budget</div>
              <div className="text-lg md:text-2xl font-bold">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
              <div className="text-[9px] md:text-xs opacity-75">of ₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3">
              <div className="text-[10px] md:text-xs opacity-90">Rating</div>
              <div className="flex items-center space-x-1">
                <Star size={14} className="md:hidden fill-yellow-300 text-yellow-300" />
                <Star size={16} className="hidden md:block fill-yellow-300 text-yellow-300" />
                <span className="text-lg md:text-2xl font-bold">{scheme.citizenRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-3 md:px-6 overflow-x-auto">
          <div className="flex space-x-4 md:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 md:py-4 border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('phases')}
              className={`py-3 md:py-4 border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${
                activeTab === 'phases'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Phases & Timeline
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vendor Reports
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Discrepancies */}
              {scheme.discrepancies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="text-red-600" size={20} />
                    <h3 className="font-bold text-red-900">Critical Discrepancies</h3>
                  </div>
                  <ul className="space-y-2">
                    {scheme.discrepancies.map((disc, idx) => (
                      <li key={idx} className="text-sm text-red-700 flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <div>
                                <div className="font-medium">{disc.type}</div>
                          <div className="text-xs">{disc.description}</div>
                          <div className="text-xs text-red-600">Reported: {new Date(disc.reportedDate || disc.date || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{scheme.description}</p>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Project Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600">Start Date</div>
                      <div className="font-bold text-gray-900">{new Date(scheme.startDate).toLocaleDateString()}</div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-purple-600 rounded-full"
                          style={{ width: `${scheme.overallProgress}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">End Date</div>
                      <div className="font-bold text-gray-900">{new Date(scheme.endDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Budget Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700 mb-1">Total Allocated</div>
                    <div className="text-2xl font-bold text-blue-900">₹{(scheme.totalBudget / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700 mb-1">Total Utilized</div>
                    <div className="text-2xl font-bold text-green-900">₹{(scheme.budgetUtilized / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-700 mb-1">Remaining</div>
                    <div className="text-2xl font-bold text-purple-900">₹{((scheme.totalBudget - scheme.budgetUtilized) / 100000).toFixed(2)}L</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm text-yellow-700 mb-1">Utilization Rate</div>
                    <div className="text-2xl font-bold text-yellow-900">{Math.round((scheme.budgetUtilized / scheme.totalBudget) * 100)}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-4">
              {scheme.phases.map((phase, idx) => (
                <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Phase {idx + 1}: {phase.name}</h4>
                      <div className="text-sm text-gray-600">
                        {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                      phase.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                      phase.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {phase.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{phase.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'on-track' ? 'bg-blue-500' :
                          phase.status === 'delayed' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-600">Budget</div>
                      <div className="font-bold text-gray-900">₹{(phase.budget / 100000).toFixed(1)}L</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-600">Spent</div>
                      <div className="font-bold text-gray-900">₹{(phase.spent / 100000).toFixed(1)}L</div>
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
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-dashed border-green-300 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText size={24} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Upload Vendor Progress Report</h3>
              <p className="text-xs text-gray-600">AI will analyze compliance against government plan</p>
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
            <div className="flex items-center justify-center space-x-2 bg-white border-2 border-green-400 hover:border-green-600 rounded-lg px-4 py-3 transition-colors">
              {isUploading ? (
                <>
                  <Loader size={18} className="animate-spin text-green-600" />
                  <span className="text-sm font-medium text-green-600">Analyzing report with AI...</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">Upload Vendor Report PDF</span>
                </>
              )}
            </div>
          </label>
          
          {uploadError && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              {uploadError}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            AI will compare vendor's report with government plan and identify discrepancies, overdue work, and budget variances
          </p>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {scheme.vendorReports && scheme.vendorReports.length > 0 ? (
          scheme.vendorReports.map((report: any) => (
            <div key={report.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Report Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{report.vendorName}</h4>
                    <div className="text-sm text-gray-600">Phase {report.phase} Report</div>
                    <div className="text-xs text-gray-500">
                      Submitted: {new Date(report.submittedDate).toLocaleDateString()}
                      {report.pdfFileName && ` • ${report.pdfFileName}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      report.verificationStatus === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                      report.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.verificationStatus?.toUpperCase() || 'PENDING'}
                    </span>
                    {report.complianceAnalysis && (
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Compliance Score</div>
                        <div className={`text-2xl font-bold ${
                          report.complianceAnalysis.overallCompliance >= 80 ? 'text-green-600' :
                          report.complianceAnalysis.overallCompliance >= 60 ? 'text-yellow-600' :
                          'text-red-600'
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText size={16} className="text-blue-600" />
                      <h5 className="font-semibold text-blue-900">AI Analysis Summary</h5>
                    </div>
                    <p className="text-sm text-blue-800">{report.complianceAnalysis.aiSummary}</p>
                  </div>

                  {/* Matching Items */}
                  {report.complianceAnalysis.matchingItems?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-green-700 mb-2 flex items-center space-x-2">
                        <CheckCircle size={16} />
                        <span>Work Completed as Planned ({report.complianceAnalysis.matchingItems.length})</span>
                      </h5>
                      <ul className="space-y-1">
                        {report.complianceAnalysis.matchingItems.map((item: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Discrepancies */}
                  {report.complianceAnalysis.discrepancies?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-red-700 mb-2 flex items-center space-x-2">
                        <AlertTriangle size={16} />
                        <span>Discrepancies Found ({report.complianceAnalysis.discrepancies.length})</span>
                      </h5>
                      <div className="space-y-3">
                        {report.complianceAnalysis.discrepancies.map((disc: any, idx: number) => (
                          <div key={idx} className={`border-l-4 pl-3 py-2 ${
                            disc.severity === 'critical' ? 'border-red-600 bg-red-50' :
                            disc.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                            disc.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                            'border-blue-500 bg-blue-50'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{disc.category?.toUpperCase()}</div>
                                <div className="text-sm text-gray-700 mt-1">{disc.description}</div>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                  <div>
                                    <span className="text-gray-600">Planned: </span>
                                    <span className="font-medium text-gray-900">{disc.plannedValue}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Actual: </span>
                                    <span className="font-medium text-gray-900">{disc.actualValue}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                disc.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                disc.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                disc.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-blue-200 text-blue-800'
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
                      <h5 className="font-semibold text-orange-700 mb-2 flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>Overdue Work ({report.complianceAnalysis.overdueWork.length})</span>
                      </h5>
                      <div className="space-y-2">
                        {report.complianceAnalysis.overdueWork.map((task: any, idx: number) => (
                          <div key={idx} className="bg-orange-50 border border-orange-200 rounded p-3">
                            <div className="font-medium text-sm text-gray-900">{task.task}</div>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-gray-600">Planned: </span>
                                <span className="font-medium">{new Date(task.plannedDate).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Status: </span>
                                <span className="font-medium">{task.currentStatus}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Delay: </span>
                                <span className="font-medium text-red-600">{task.delayDays} days</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Budget Analysis */}
                  {report.complianceAnalysis.budgetAnalysis && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <DollarSign size={16} />
                        <span>Budget Analysis</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-600">Planned Budget</div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{(report.complianceAnalysis.budgetAnalysis.plannedBudget / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Claimed Expense</div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{(report.complianceAnalysis.budgetAnalysis.claimedExpense / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Variance</div>
                          <div className={`text-lg font-bold ${
                            report.complianceAnalysis.budgetAnalysis.variance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {report.complianceAnalysis.budgetAnalysis.variance > 0 ? '+' : ''}
                            ₹{(report.complianceAnalysis.budgetAnalysis.variance / 100000).toFixed(2)}L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Variance %</div>
                          <div className={`text-lg font-bold ${
                            report.complianceAnalysis.budgetAnalysis.variancePercentage > 0 ? 'text-red-600' : 'text-green-600'
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
                    <div className="text-sm font-medium text-gray-700 mb-1">Work Completed:</div>
                    <div className="text-sm text-gray-600">{report.workCompleted}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Expense Claimed</div>
                      <div className="text-lg font-bold text-gray-900">₹{(report.expenseClaimed / 100000).toFixed(2)}L</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
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
    <div className="border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <FileText size={18} className="text-purple-600" />
          <span className="font-medium text-gray-900">1. Project Phases & Milestones</span>
          {phases.length > 0 && (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {phases.length} phases
            </span>
          )}
        </div>
        <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          {phases.map((phase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => {
                    const updated = [...phases];
                    updated[index].name = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-gray-900 bg-transparent border-none focus:outline-none"
                  placeholder="Phase name"
                />
                <button
                  type="button"
                  onClick={() => removePhase(index)}
                  className="text-red-600 hover:text-red-800"
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
                className="w-full text-sm text-gray-900 border border-gray-300 rounded px-2 py-1"
                rows={2}
                placeholder="Planned work for this phase..."
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addPhase}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
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
    <div className="border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Briefcase size={18} className="text-indigo-600" />
          <span className="font-medium text-gray-900">2. Assign Contractors & Vendors</span>
          {contractors.length > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
              {contractors.length} assigned
            </span>
          )}
        </div>
        <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          {contractors.map((contractor, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={contractor.name}
                  onChange={(e) => {
                    const updated = [...contractors];
                    updated[index].name = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 text-sm flex-1 mr-2"
                  placeholder="Contractor name"
                />
                <button
                  type="button"
                  onClick={() => removeContractor(index)}
                  className="text-red-600 hover:text-red-800"
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
                  className="text-sm border border-gray-300 rounded px-2 py-1"
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
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Contact"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addContractor}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
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
    <div className="border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Upload size={18} className="text-green-600" />
          <span className="font-medium text-gray-900">3. Supporting Documents</span>
          {documents.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              {documents.length} documents
            </span>
          )}
        </div>
        <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2">
              <span className="text-sm text-gray-700">{doc}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-600 hover:text-red-800"
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
              className="flex-1 text-sm border border-gray-300 rounded px-3 py-2"
              placeholder="Document name or URL..."
            />
            <button
              type="button"
              onClick={addDocument}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
    <div className="border border-gray-300 rounded-lg">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <CheckCircle size={18} className="text-orange-600" />
          <span className="font-medium text-gray-900">4. Monitoring Checkpoints</span>
          {checkpoints.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
              {checkpoints.length} checkpoints
            </span>
          )}
        </div>
        <span className="text-gray-500">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          {checkpoints.map((checkpoint, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={checkpoint.title}
                  onChange={(e) => {
                    const updated = [...checkpoints];
                    updated[index].title = e.target.value;
                    onChange(updated);
                  }}
                  className="font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 text-sm flex-1 mr-2"
                  placeholder="Checkpoint title"
                />
                <button
                  type="button"
                  onClick={() => removeCheckpoint(index)}
                  className="text-red-600 hover:text-red-800"
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
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                />
                <input
                  type="text"
                  value={checkpoint.responsible}
                  onChange={(e) => {
                    const updated = [...checkpoints];
                    updated[index].responsible = e.target.value;
                    onChange(updated);
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Responsible person"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCheckpoint}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Add New Government Scheme</h2>
              <p className="text-sm opacity-90">Register a new rural development project</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            {/* PDF Upload Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Scheme Document</h3>
                    <p className="text-xs text-gray-600">AI will extract and auto-fill all details from PDF</p>
                  </div>
                </div>
                {pdfFile && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
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
                <div className="flex items-center justify-center space-x-2 bg-white border-2 border-blue-400 hover:border-blue-600 rounded-lg px-4 py-3 transition-colors">
                  {isExtractingPDF ? (
                    <>
                      <Loader size={18} className="animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Extracting data from PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {pdfFile ? 'Upload Different PDF' : 'Upload Government Scheme PDF'}
                      </span>
                    </>
                  )}
                </div>
              </label>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                PDF will be analyzed using AI to extract scheme details, phases, budget, and timeline
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">Or fill manually:</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Swachh Bharat Mission - Phase 3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Village name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="District name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 5000000"
                />
                {formData.totalBudget && (
                  <div className="text-xs text-gray-500 mt-1">
                    = ₹{(parseInt(formData.totalBudget) / 100000).toFixed(2)} Lakh
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Brief description of the scheme objectives and scope..."
              />
            </div>

            {/* Additional Sections - Expandable */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-900">{error}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
