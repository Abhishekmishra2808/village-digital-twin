import { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
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
    <div className="h-full w-full overflow-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-sm">
              <Wrench size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Field Worker Dashboard</h1>
              <p className="text-gray-600">Welcome back, {username}!</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <AlertCircle size={24} className="text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.assigned}</span>
            </div>
            <h3 className="text-gray-600">Assigned Tickets</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <h3 className="text-gray-600">In Progress</h3>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <h3 className="text-gray-600">Completed Today</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Filter size={20} className="text-gray-600" />
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'assigned'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Assignments
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      ticket.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
                      ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                </div>

                <div className={`p-3 rounded-lg ${
                  ticket.status === 'completed' ? 'bg-green-50' :
                  ticket.status === 'in_progress' ? 'bg-yellow-50' :
                  'bg-gray-100'
                }`}>
                  {ticket.status === 'completed' && <CheckCircle size={24} className="text-green-600" />}
                  {ticket.status === 'in_progress' && <Clock size={24} className="text-yellow-600" />}
                  {ticket.status === 'pending' && <AlertCircle size={24} className="text-gray-600" />}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{ticket.coords.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                {ticket.photos > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Camera size={16} />
                    <span>{ticket.photos} photos attached</span>
                  </div>
                )}
              </div>

              {ticket.assignedTo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200">
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
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600">
              {filter === 'assigned' 
                ? 'You have no assigned tickets at the moment'
                : 'No tickets match the current filter'}
            </p>
          </div>
        )}

        {/* Update Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto border border-gray-200 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Ticket</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTicket.title}</h3>
                <p className="text-gray-600 mb-3">{selectedTicket.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending (Need Support)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Notes
                  </label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                    placeholder="Describe work done, materials used, etc."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Completion
                  </label>
                  <input
                    type="datetime-local"
                    value={updateForm.estimatedCompletion}
                    onChange={(e) => setUpdateForm({ ...updateForm, estimatedCompletion: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <Camera size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">Upload Completion Photos</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
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
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
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
