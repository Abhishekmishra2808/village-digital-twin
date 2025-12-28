import { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  MessageSquare,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

export default function FieldWorkerView() {
  const { citizenReports, username } = useVillageStore();
  const [filter, setFilter] = useState<'all' | 'assigned' | 'pending'>('assigned');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    estimatedCompletion: '',
  });

  // Filter reports for field worker
  const myTickets = citizenReports.filter(report => {
    if (filter === 'assigned') return report.assignedTo?.includes('Field Worker');
    if (filter === 'pending') return report.status === 'pending';
    return true;
  });

  const stats = {
    assigned: citizenReports.filter(r => r.assignedTo?.includes('Field Worker')).length,
    inProgress: citizenReports.filter(r => r.status === 'in_progress' && r.assignedTo?.includes('Field Worker')).length,
    completed: citizenReports.filter(r => r.status === 'completed' && r.assignedTo?.includes('Field Worker')).length,
  };

  const handleUpdateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send update to backend
    alert('Ticket updated successfully!');
    setSelectedTicket(null);
  };

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Field Worker Dashboard</h1>
              <p className="text-gray-400">Welcome back, {username}!</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-dark rounded-xl p-6 bg-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} className="text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.assigned}</span>
            </div>
            <h3 className="text-gray-400">Assigned Tickets</h3>
          </div>

          <div className="glass-dark rounded-xl p-6 bg-yellow-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.inProgress}</span>
            </div>
            <h3 className="text-gray-400">In Progress</h3>
          </div>

          <div className="glass-dark rounded-xl p-6 bg-green-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.completed}</span>
            </div>
            <h3 className="text-gray-400">Completed Today</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-gray-400" />
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'assigned'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            My Assignments
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
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
              className="glass-dark rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 uppercase">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{ticket.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{ticket.description}</p>
                </div>

                <div className={`p-3 rounded-lg ${
                  ticket.status === 'completed' ? 'bg-green-500/20' :
                  ticket.status === 'in_progress' ? 'bg-yellow-500/20' :
                  'bg-gray-500/20'
                }`}>
                  {ticket.status === 'completed' && <CheckCircle size={24} className="text-green-400" />}
                  {ticket.status === 'in_progress' && <Clock size={24} className="text-yellow-400" />}
                  {ticket.status === 'pending' && <AlertCircle size={24} className="text-gray-400" />}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{ticket.coords.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {ticket.photos > 0 && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Camera size={16} />
                    <span>{ticket.photos} photos attached</span>
                  </div>
                )}
              </div>

              {ticket.assignedTo && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-sm text-blue-300">
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
          <div className="glass-dark rounded-xl p-12 text-center">
            <Wrench size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tickets Found</h3>
            <p className="text-gray-400">
              {filter === 'assigned' 
                ? 'You have no assigned tickets at the moment'
                : 'No tickets match the current filter'}
            </p>
          </div>
        )}

        {/* Update Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="glass-dark rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Update Ticket</h2>
              
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-2">{selectedTicket.title}</h3>
                <p className="text-gray-400 mb-3">{selectedTicket.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Update Status
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending (Need Support)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work Notes
                  </label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    placeholder="Describe work done, materials used, etc."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Completion
                  </label>
                  <input
                    type="datetime-local"
                    value={updateForm.estimatedCompletion}
                    onChange={(e) => setUpdateForm({ ...updateForm, estimatedCompletion: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-600 text-white"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Camera size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-400 mb-2">Upload Completion Photos</p>
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
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Submit Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
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
