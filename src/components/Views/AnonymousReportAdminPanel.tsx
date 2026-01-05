import { useState, useEffect } from 'react';
import {
  Clock,
  ArrowUpRight,
  User,
  Eye,
  Edit,
  ThumbsUp,
  ThumbsDown,
  Shield,
  MapPin,
  Filter,
  X,
  Loader2,
  Link2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAnonymousReports } from '../../hooks/useAnonymousReports';
import { API_URL } from '../../config/api';

interface Props {
  selectedReportId: string | null;
  onClose?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'acknowledged', label: 'Acknowledged', color: 'bg-blue-500' },
  { value: 'assigned', label: 'Assigned', color: 'bg-purple-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-cyan-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

const FIELD_WORKERS = [
  { id: 'fw-001', name: 'Ramesh Kumar', area: 'North Zone' },
  { id: 'fw-002', name: 'Suresh Patil', area: 'South Zone' },
  { id: 'fw-003', name: 'Anil Singh', area: 'East Zone' },
  { id: 'fw-004', name: 'Vijay Sharma', area: 'West Zone' }
];

export default function AnonymousReportAdminPanel({ selectedReportId }: Props) {
  const { reports, stats, fetchReports, updateStatus, assignWorker } = useAnonymousReports();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  useEffect(() => {
    if (selectedReportId) {
      fetchReportDetails(selectedReportId);
    }
  }, [selectedReportId]);

  const fetchReportDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedReport(data.report);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedReport || !selectedStatus) return;

    const result = await updateStatus(
      selectedReport.id,
      selectedStatus,
      statusMessage || `Status updated to ${selectedStatus}`,
      'Admin'
    );

    if (result.success) {
      setShowStatusUpdate(false);
      setStatusMessage('');
      setSelectedStatus('');
      fetchReportDetails(selectedReport.id);
      fetchReports();
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedReport || !selectedWorker) return;

    const worker = FIELD_WORKERS.find(w => w.id === selectedWorker);
    if (!worker) return;

    const result = await assignWorker(
      selectedReport.id,
      worker.id,
      worker.name,
      'Admin'
    );

    if (result.success) {
      setShowAssign(false);
      setSelectedWorker('');
      fetchReportDetails(selectedReport.id);
      fetchReports();
    }
  };

  const filteredReports = reports.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterPriority && r.priority !== filterPriority) return false;
    return true;
  });

  const renderReportsList = () => (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-700 border-none rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-slate-700 border-none rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Priority</option>
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Title</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Category</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Priority</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Escalation</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Credibility</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr 
                key={report.id} 
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                  {report.id.substring(0, 12)}...
                </td>
                <td className="px-4 py-3 text-sm text-white max-w-xs truncate">
                  {report.title}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 capitalize">
                  {report.category}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    STATUS_OPTIONS.find(s => s.value === report.status)?.color
                  } bg-opacity-20 text-white`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    PRIORITY_OPTIONS.find(p => p.value === report.priority)?.color
                  } bg-opacity-20 text-white`}>
                    {report.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  Level {report.currentEscalationLevel}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${
                    report.credibilityScore >= 70 ? 'text-green-400' :
                    report.credibilityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {report.credibilityScore}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => fetchReportDetails(report.id)}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportDetail = () => {
    if (!selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Report Details</h2>
                <p className="text-sm text-slate-400 font-mono">{selectedReport.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Status & Priority */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Status</div>
                    <div className="text-white capitalize">{selectedReport.status}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Priority</div>
                    <div className="text-white capitalize">{selectedReport.priority}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Escalation Level</div>
                    <div className="text-white">Level {selectedReport.currentEscalationLevel}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Credibility</div>
                    <div className={`${
                      selectedReport.votes?.credibilityScore >= 70 ? 'text-green-400' :
                      selectedReport.votes?.credibilityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedReport.votes?.credibilityScore || 50}%
                    </div>
                  </div>
                </div>

                {/* Anonymized Content */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Anonymized Report</h3>
                  <h4 className="text-lg font-bold text-white mb-2">{selectedReport.anonymizedContent?.title}</h4>
                  <p className="text-slate-300 mb-4">{selectedReport.anonymizedContent?.description}</p>
                  
                  <div className="bg-cyan-500/10 rounded-lg p-3 mb-4">
                    <div className="text-xs text-slate-400 mb-1">AI Extracted Intent</div>
                    <div className="text-cyan-400">{selectedReport.anonymizedContent?.extractedIntent}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedReport.anonymizedContent?.keywords?.map((keyword: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Processing Info */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-purple-400 mb-2">AI Processing</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Model: </span>
                      <span className="text-white">{selectedReport.aiProcessing?.model || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Confidence: </span>
                      <span className="text-white">{((selectedReport.aiProcessing?.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">PII Removed: </span>
                      <span className="text-white">{selectedReport.aiProcessing?.piiRemoved?.join(', ') || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {selectedReport.location && (
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </h3>
                    <div className="text-white">
                      {selectedReport.location.area && <span>{selectedReport.location.area}, </span>}
                      {selectedReport.location.district}
                    </div>
                  </div>
                )}

                {/* Assignment */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Assignment
                  </h3>
                  {selectedReport.assignedTo?.workerName ? (
                    <div className="text-white">
                      Assigned to: {selectedReport.assignedTo.workerName}
                      <div className="text-sm text-slate-400">
                        Since {format(new Date(selectedReport.assignedTo.assignedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">Not assigned</div>
                  )}
                </div>

                {/* Escalation History */}
                {selectedReport.escalationHistory?.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4" /> Escalation History
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.escalationHistory.map((esc: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-white">{esc.authorityName}</span>
                          <span className="text-slate-400">{esc.reason}</span>
                          <span className="text-slate-500 font-mono text-xs">
                            Hash: {esc.currentHash?.substring(0, 12)}...
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedReport.chainIntegrity && (
                      <div className={`mt-3 text-sm ${selectedReport.chainIntegrity.valid ? 'text-green-400' : 'text-red-400'}`}>
                        <Link2 className="w-4 h-4 inline mr-1" />
                        {selectedReport.chainIntegrity.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Updates */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Status Timeline
                  </h3>
                  <div className="space-y-3">
                    {selectedReport.statusUpdates?.map((update: any, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                        <div className="flex-1">
                          <div className="text-sm text-white">{update.message}</div>
                          <div className="text-xs text-slate-500">
                            {format(new Date(update.timestamp), 'MMM d, yyyy h:mm a')} by {update.updatedBy}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Votes */}
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Community Votes</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-400" />
                      <span className="text-white">{selectedReport.votes?.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5 text-red-400" />
                      <span className="text-white">{selectedReport.votes?.downvotes || 0}</span>
                    </div>
                    <div className="text-slate-400">
                      Total: {selectedReport.votes?.totalVotes || 0} votes
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {selectedReport.photos?.length > 0 && (
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Photos</h3>
                    <div className="flex gap-3">
                      {selectedReport.photos.map((photo: string, i: number) => (
                        <img
                          key={i}
                          src={`${API_URL}${photo}`}
                          alt={`Report photo ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-600"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution Feedback */}
                {selectedReport.resolutionFeedback && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-green-400 mb-2">Citizen Feedback</h3>
                    <div className="text-white">
                      {selectedReport.resolutionFeedback.isResolved ? '✓ Confirmed Resolved' : '✗ Not Resolved'}
                      <span className="ml-3">Rating: {selectedReport.resolutionFeedback.satisfactionRating}/5</span>
                    </div>
                    {selectedReport.resolutionFeedback.feedback && (
                      <div className="text-sm text-slate-300 mt-2">
                        "{selectedReport.resolutionFeedback.feedback}"
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-700 flex gap-3">
            <button
              onClick={() => setShowStatusUpdate(true)}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Update Status
            </button>
            <button
              onClick={() => setShowAssign(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Assign Worker
            </button>
          </div>

          {/* Status Update Modal */}
          {showStatusUpdate && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-4">Update Status</h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white mb-4"
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white resize-none mb-4"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Worker Modal */}
          {showAssign && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-white mb-4">Assign Field Worker</h3>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white mb-4"
                >
                  <option value="">Select Worker</option>
                  {FIELD_WORKERS.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name} - {worker.area}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={handleAssignWorker}
                    disabled={!selectedWorker}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => setShowAssign(false)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
          <div className="text-sm text-slate-400">Total Reports</div>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400">{stats?.pending || 0}</div>
          <div className="text-sm text-slate-400">Pending Review</div>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
          <div className="text-3xl font-bold text-red-400">{stats?.escalated || 0}</div>
          <div className="text-sm text-slate-400">Escalated</div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
          <div className="text-3xl font-bold text-green-400">{stats?.resolved || 0}</div>
          <div className="text-sm text-slate-400">Resolved</div>
        </div>
      </div>

      {/* Reports List */}
      {renderReportsList()}

      {/* Report Detail Modal */}
      {selectedReport && renderReportDetail()}
    </div>
  );
}
