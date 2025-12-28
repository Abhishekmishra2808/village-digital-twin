import { useState } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Calendar,
  Image as ImageIcon,
  Send,
  CheckCircle,
  Clock,
  User,
  Camera
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

export default function CitizenReportsView() {
  const { citizenReports, userRole, username } = useVillageStore();
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({
    category: 'road',
    title: '',
    description: '',
    location: '',
    priority: 'medium',
  });

  const categories = [
    { id: 'road', label: 'Road & Infrastructure', icon: '🛣️' },
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'power', label: 'Electricity', icon: '⚡' },
    { id: 'waste', label: 'Waste Management', icon: '🗑️' },
    { id: 'other', label: 'Other', icon: '📝' },
  ];

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would send to backend
    alert('Report submitted successfully! Thank you for helping improve Sundarpur.');
    setShowReportForm(false);
    setNewReport({
      category: 'road',
      title: '',
      description: '',
      location: '',
      priority: 'medium',
    });
  };

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {userRole === 'user' ? 'Report a Problem' : 'Citizen Reports'}
            </h1>
            <p className="text-gray-400">
              {userRole === 'user' 
                ? 'Help improve village infrastructure by reporting issues'
                : 'View and manage citizen-submitted infrastructure issues'}
            </p>
          </div>
          
          {userRole === 'user' && (
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              <Send size={20} />
              New Report
            </button>
          )}
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="glass-dark rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Submit New Report</h2>
              
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewReport({ ...newReport, category: cat.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          newReport.category === cat.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{cat.icon}</span>
                        <span className="text-white text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Provide detailed information about the problem"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    placeholder="Exact location or landmark"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({ ...newReport, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Camera size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-400 mb-2">Upload Photos (Optional)</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Choose Files
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="space-y-4">
          {citizenReports.map((report) => {
            const categoryData = categories.find(c => c.id === report.category);
            
            return (
              <div key={report.id} className="glass-dark rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
                      {categoryData?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{report.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {report.coords.join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                        </span>
                        {report.photos > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon size={14} />
                            {report.photos} photos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      report.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {report.priority}
                    </span>

                    <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                      report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {report.status === 'completed' && <CheckCircle size={16} />}
                      {report.status === 'in_progress' && <Clock size={16} />}
                      {report.status === 'pending' && <AlertCircle size={16} />}
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {report.assignedTo && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 rounded-lg p-3">
                    <User size={16} />
                    <span>Assigned to: <strong className="text-white">{report.assignedTo}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {citizenReports.length === 0 && (
          <div className="glass-dark rounded-xl p-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to report an infrastructure issue</p>
            {userRole === 'user' && (
              <button
                onClick={() => setShowReportForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Submit First Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
