import { useState, useEffect } from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  ArrowRight,
  Filter,
  Loader2
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

interface CitizenReport {
  id: string;
  category: string;
  title: string;
  description: string;
  coords: [number, number];
  location: string;
  priority: string;
  status: string;
  assignedTo?: string;
  photos: string[];
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FieldWorkerView() {
  const { username } = useVillageStore();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'pending'>('all');
  const [selectedTicket, setSelectedTicket] = useState<CitizenReport | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    assignedTo: '',
  });

  // Fetch reports from backend
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // Filter reports for field worker
  const myTickets = reports.filter(report => {
    if (filter === 'assigned') return report.assignedTo === username || report.assignedTo?.includes('Field Worker');
    if (filter === 'pending') return report.status === 'pending';
    return true;
  });

  const stats = {
    assigned: reports.filter(r => r.assignedTo === username || r.assignedTo?.includes('Field Worker')).length,
    inProgress: reports.filter(r => r.status === 'in_progress' && (r.assignedTo === username || r.assignedTo?.includes('Field Worker'))).length,
    completed: reports.filter(r => r.status === 'completed' && (r.assignedTo === username || r.assignedTo?.includes('Field Worker'))).length,
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:3001/api/reports/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateForm.status,
          assignedTo: updateForm.assignedTo || selectedTicket.assignedTo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Ticket updated successfully!');
        setSelectedTicket(null);
        setUpdateForm({ status: '', assignedTo: '' });
        // Refresh reports
        fetchReports();
      } else {
        alert('Failed to update ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket. Please check your connection.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Field Worker Dashboard</h1>
              <p className="text-slate-400">Welcome back, {username}!</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                <AlertCircle size={24} className="text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.assigned}</span>
            </div>
            <h3 className="text-slate-400">Assigned Tickets</h3>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/20">
                <Clock size={24} className="text-yellow-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.inProgress}</span>
            </div>
            <h3 className="text-slate-400">In Progress</h3>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.completed}</span>
            </div>
            <h3 className="text-slate-400">Completed Today</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-slate-400" />
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'assigned'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-800'
            }`}
          >
            My Assignments
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-800'
            }`}
          >
            All Tickets
          </button>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm hover:bg-slate-900/70 transition-all cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      ticket.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/20 uppercase">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{ticket.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{ticket.description}</p>
                </div>

                <div className={`p-3 rounded-lg ${
                  ticket.status === 'completed' ? 'bg-green-500/10' :
                  ticket.status === 'in_progress' ? 'bg-yellow-500/10' :
                  'bg-slate-500/10'
                }`}>
                  {ticket.status === 'completed' && <CheckCircle size={24} className="text-green-400" />}
                  {ticket.status === 'in_progress' && <Clock size={24} className="text-yellow-400" />}
                  {ticket.status === 'pending' && <AlertCircle size={24} className="text-slate-400" />}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={16} />
                  <span>{ticket.location || `${ticket.coords[1].toFixed(4)}, ${ticket.coords[0].toFixed(4)}`}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} />
                  <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {ticket.photoCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Camera size={16} />
                    <span>{ticket.photoCount} photo{ticket.photoCount > 1 ? 's' : ''} attached</span>
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              {ticket.photos && ticket.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {ticket.photos.slice(0, 3).map((photo, idx) => (
                    <img
                      key={idx}
                      src={`http://localhost:3001${photo}`}
                      alt={`Report photo ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`http://localhost:3001${photo}`, '_blank');
                      }}
                    />
                  ))}
                  {ticket.photoCount > 3 && (
                    <div className="w-full h-20 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-sm border border-white/10">
                      +{ticket.photoCount - 3} more
                    </div>
                  )}
                </div>
              )}

              {ticket.assignedTo && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-sm text-blue-400 border border-blue-500/20">
                  Assigned to: <strong>{ticket.assignedTo}</strong>
                </div>
              )}

              <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                Update Ticket
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {myTickets.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-12 text-center border border-white/10 shadow-sm">
            <Wrench size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tickets Found</h3>
            <p className="text-slate-400">
              {filter === 'assigned' 
                ? 'You have no assigned tickets at the moment'
                : 'No tickets match the current filter'}
            </p>
          </div>
        )}

        {/* Update Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Update Ticket</h2>
              
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-2">{selectedTicket.title}</h3>
                <p className="text-slate-400 mb-3">{selectedTicket.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {selectedTicket.coords.join(', ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {format(new Date(selectedTicket.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Update Status
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending (Need Support)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Assign To
                  </label>
                  <input
                    type="text"
                    value={updateForm.assignedTo}
                    onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                    placeholder={selectedTicket?.assignedTo || "Field worker name"}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave blank to keep current assignment
                  </p>
                </div>

                {/* Show attached photos */}
                {selectedTicket.photos && selectedTicket.photos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Attached Photos ({selectedTicket.photoCount})
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedTicket.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={`http://localhost:3001${photo}`}
                          alt={`Report photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/10"
                          onClick={() => window.open(`http://localhost:3001${photo}`, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Submit Update'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicket(null);
                      setUpdateForm({ status: '', assignedTo: '' });
                    }}
                    className="px-6 py-3 border border-white/10 text-slate-300 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
