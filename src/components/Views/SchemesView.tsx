import { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Users,
  FileText,
  Filter,
  Search,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  X,
  Plus,
  Send,
  Flag
} from 'lucide-react';
import { useVillageStore, type GovernmentScheme } from '../../store/villageStore';

export default function SchemesView() {
  // Get schemes from store instead of mock data
  const schemes = useVillageStore((state) => state.schemes);
  const userRole = useVillageStore((state) => state.userRole);
  
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Government Schemes Dashboard</h1>
                <p className="text-gray-600">Real-time monitoring of rural development projects</p>
              </div>
            </div>
            {/* Only show "Add New Scheme" button to admins */}
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddSchemeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add New Scheme</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Total Schemes</div>
              <Briefcase size={20} className="text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalSchemes}</div>
            <div className="text-xs text-gray-500 mt-1">Active projects</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">On Track / Delayed</div>
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{onTrackSchemes} / {delayedSchemes}</div>
            <div className="text-xs text-gray-500 mt-1">{discrepantSchemes} with discrepancies</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Budget Utilization</div>
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalBudget > 0 ? Math.round((budgetUtilized / totalBudget) * 100) : 0}%</div>
            <div className="text-xs text-gray-500 mt-1">₹{(budgetUtilized / 10000000).toFixed(1)}Cr of ₹{(totalBudget / 10000000).toFixed(1)}Cr</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Avg Progress</div>
              <CheckCircle size={20} className="text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{avgProgress}%</div>
            <div className="text-xs text-gray-500 mt-1">{totalFeedback} citizen feedbacks</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
              <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedScheme(scheme);
                setShowDetailsModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-4xl">{categoryIcons[scheme.category] || '📋'}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{scheme.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{scheme.village}, {scheme.district}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{new Date(scheme.startDate).toLocaleDateString()} - {new Date(scheme.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText size={14} />
                        <span>{scheme.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={scheme.status} />
                      <span className="text-sm text-gray-600">{scheme.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{scheme.overallProgress}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-2 transition-all ${
                      scheme.status === 'on-track' ? 'bg-green-500' :
                      scheme.status === 'delayed' ? 'bg-yellow-500' :
                      scheme.status === 'discrepant' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${scheme.overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Budget Allocated</div>
                  <div className="text-sm font-bold text-gray-900">₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Budget Utilized</div>
                  <div className="text-sm font-bold text-gray-900">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Citizen Rating</div>
                  <div className="flex items-center space-x-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">{scheme.citizenRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({scheme.feedbackCount})</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Last Updated</div>
                  <div className="text-sm font-bold text-gray-900">{new Date(scheme.lastUpdated).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Discrepancies Alert */}
              {scheme.discrepancies.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-red-900 mb-1">Discrepancies Detected</div>
                      <ul className="text-xs text-red-700 space-y-1">
                        {scheme.discrepancies.map((disc, idx) => (
                          <li key={idx}>• {disc.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScheme(scheme);
                    setShowDetailsModal(true);
                  }}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScheme(scheme);
                    setShowDetailsModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  Vendor Reports
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScheme(scheme);
                    setShowFeedbackModal(true);
                  }}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center space-x-1"
                >
                  <MessageSquare size={12} />
                  <span>Citizen Feedback</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Search size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600">No schemes found matching your filters</p>
          </div>
        )}
      </div>

      {/* Scheme Details Modal */}
      {showDetailsModal && selectedScheme && (
        <SchemeDetailsModal 
          scheme={selectedScheme} 
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedScheme(null);
          }}
        />
      )}

      {/* Citizen Feedback Modal */}
      {showFeedbackModal && selectedScheme && (
        <CitizenFeedbackModal 
          scheme={selectedScheme} 
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedScheme(null);
          }}
        />
      )}

      {/* Add Scheme Modal */}
      {showAddSchemeModal && (
        <AddSchemeModal 
          onClose={() => setShowAddSchemeModal(false)}
          onSubmit={(newScheme) => {
            console.log('New scheme added:', newScheme);
            setShowAddSchemeModal(false);
            // In real app, this would send to backend
          }}
        />
      )}
    </div>
  );
}

// Scheme Details Modal Component
function SchemeDetailsModal({ scheme, onClose }: { scheme: GovernmentScheme; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'reports'>('overview');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{scheme.name}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>{scheme.village}, {scheme.district}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText size={14} />
                  <span>{scheme.id}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90">Progress</div>
              <div className="text-2xl font-bold">{scheme.overallProgress}%</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90">Budget</div>
              <div className="text-2xl font-bold">₹{(scheme.budgetUtilized / 100000).toFixed(1)}L</div>
              <div className="text-xs opacity-75">of ₹{(scheme.totalBudget / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-xs opacity-90">Rating</div>
              <div className="flex items-center space-x-1">
                <Star size={16} className="fill-yellow-300 text-yellow-300" />
                <span className="text-2xl font-bold">{scheme.citizenRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('phases')}
              className={`py-4 border-b-2 transition-colors ${
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
            <div className="space-y-4">
              {scheme.vendorReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{report.vendorName}</h4>
                      <div className="text-sm text-gray-600">Phase {report.phase} Report</div>
                      <div className="text-xs text-gray-500">Submitted: {new Date(report.submittedDate).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                      report.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.verificationStatus.toUpperCase()}
                    </span>
                  </div>

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

                  {report.documents.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-2">Documents:</div>
                      <div className="flex flex-wrap gap-2">
                        {report.documents.map((doc, idx) => (
                          <span key={idx} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            <FileText size={12} />
                            <span>{doc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Citizen Feedback Modal Component
function CitizenFeedbackModal({ scheme, onClose }: { scheme: GovernmentScheme; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log('Feedback submitted:', { schemeId: scheme.id, rating, comment, isUrgent });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your anonymous feedback has been recorded and will help improve this project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Citizen Feedback</h2>
              <p className="text-sm opacity-90">{scheme.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
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
              Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience, suggestions, or concerns..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>Submit Feedback</span>
          </button>
        </div>
      </div>
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
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Brief description of the scheme objectives and scope..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <FileText size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <div className="font-medium mb-1">Next Steps</div>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Add project phases and milestones</li>
                    <li>Upload supporting documents</li>
                    <li>Assign contractors and vendors</li>
                    <li>Set up monitoring checkpoints</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Scheme</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
