import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Calendar,
  Image as ImageIcon,
  Send,
  CheckCircle,
  Clock,
  User,
  Camera,
  Loader2,
  Navigation,
  X
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

export default function CitizenReportsView() {
  const { userRole } = useVillageStore();
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [newReport, setNewReport] = useState({
    category: 'road',
    title: '',
    description: '',
    location: '',
    coords: [73.8567, 18.5204] as [number, number], // Default coords
    priority: 'medium',
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

  // Detect user's location
  const detectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNewReport({
          ...newReport,
          coords: [longitude, latitude],
        });
        setDetecting(false);
        alert(`Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        console.error('Error detecting location:', error);
        alert('Failed to detect location. Please ensure location permissions are granted.');
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles([...selectedFiles, ...validFiles]);

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...urls]);
  };

  // Remove selected file
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    URL.revokeObjectURL(newUrls[index]);
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const categories = [
    { id: 'road', label: 'Road & Infrastructure', icon: '🛣️' },
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'power', label: 'Electricity', icon: '⚡' },
    { id: 'waste', label: 'Waste Management', icon: '🗑️' },
    { id: 'other', label: 'Other', icon: '📝' },
  ];

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('category', newReport.category);
      formData.append('title', newReport.title);
      formData.append('description', newReport.description);
      formData.append('location', newReport.location);
      formData.append('coords', JSON.stringify(newReport.coords));
      formData.append('priority', newReport.priority);
      formData.append('createdBy', 'Citizen'); // Could use actual user name

      // Append images
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Report submitted successfully! Thank you for your contribution.');
        
        // Reset form
        setShowReportForm(false);
        setNewReport({
          category: 'road',
          title: '',
          description: '',
          location: '',
          coords: [73.8567, 18.5204],
          priority: 'medium',
        });
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);

        // Refresh reports list
        fetchReports();
      } else {
        alert('Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-transparent p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {userRole === 'user' ? 'Report a Problem' : 'Citizen Reports'}
            </h1>
            <p className="text-slate-400">
              {userRole === 'user' 
                ? 'Help improve village infrastructure by reporting issues'
                : 'View and manage citizen-submitted infrastructure issues'}
            </p>
          </div>
          
          {userRole === 'user' && (
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all"
            >
              <Send size={20} />
              New Report
            </button>
          )}
        </div>

        {/* Report Form Modal */}
        {showReportForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Submit New Report</h2>
              
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewReport({ ...newReport, category: cat.id })}
                        className={`p-4 rounded-lg border transition-all ${
                          newReport.category === cat.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-white/10 bg-slate-800/50 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{cat.icon}</span>
                        <span className="text-slate-200 text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    placeholder="Provide detailed information about the problem"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReport.location}
                      onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                      placeholder="Exact location or landmark"
                      className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detecting}
                      className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all"
                    >
                      {detecting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation size={18} />
                          Auto-Detect
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Current coordinates: {newReport.coords[0].toFixed(4)}, {newReport.coords[1].toFixed(4)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={newReport.priority}
                    onChange={(e) => setNewReport({ ...newReport, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Upload Photos (Optional, max 5)
                  </label>
                  
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center bg-slate-800/50">
                    <Camera size={40} className="mx-auto text-slate-500 mb-2" />
                    <p className="text-slate-400 mb-2">
                      {selectedFiles.length > 0 
                        ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected`
                        : 'Add photos to help describe the issue'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-block px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
                    >
                      Choose Files
                    </label>
                  </div>

                  {/* Photo Previews */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportForm(false);
                      previewUrls.forEach(url => URL.revokeObjectURL(url));
                      setPreviewUrls([]);
                      setSelectedFiles([]);
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

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => {
            const categoryData = categories.find(c => c.id === report.category);
            
            return (
              <div key={report.id} className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 hover:bg-slate-900/70 transition-all border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-2xl border border-blue-500/20">
                      {categoryData?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{report.title}</h3>
                      <p className="text-slate-400 text-sm mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {report.location || `${report.coords[1].toFixed(4)}, ${report.coords[0].toFixed(4)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                        </span>
                        {report.photoCount > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon size={14} />
                            {report.photoCount} photo{report.photoCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      report.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                      report.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                    }`}>
                      {report.priority}
                    </span>

                    <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${
                      report.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      report.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {report.status === 'completed' && <CheckCircle size={16} />}
                      {report.status === 'in_progress' && <Clock size={16} />}
                      {report.status === 'pending' && <AlertCircle size={16} />}
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Photo Gallery */}
                {report.photos && report.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {report.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:3001${photo}`}
                        alt={`Report photo ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/10"
                        onClick={() => window.open(`http://localhost:3001${photo}`, '_blank')}
                      />
                    ))}
                  </div>
                )}

                {report.assignedTo && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-white/5">
                    <User size={16} />
                    <span>Assigned to: <strong className="text-white">{report.assignedTo}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-12 text-center border border-white/10">
            <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
            <p className="text-slate-400 mb-6">Be the first to report an infrastructure issue</p>
            {userRole === 'user' && (
              <button
                onClick={() => setShowReportForm(true)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all"
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
