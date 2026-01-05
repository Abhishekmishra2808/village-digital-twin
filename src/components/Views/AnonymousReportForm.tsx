import { useState } from 'react';
import {
  Shield,
  Send,
  MapPin,
  Camera,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Info
} from 'lucide-react';
import { useAnonymousReports } from '../../hooks/useAnonymousReports';

const CATEGORIES = [
  { id: 'road', label: 'Road & Infrastructure', emoji: '🛣️', description: 'Potholes, broken roads, bridges, drainage' },
  { id: 'water', label: 'Water Supply', emoji: '💧', description: 'Water shortage, contamination, pipeline issues' },
  { id: 'power', label: 'Electricity', emoji: '⚡', description: 'Power cuts, voltage issues, streetlights' },
  { id: 'waste', label: 'Waste Management', emoji: '🗑️', description: 'Garbage collection, dumping, sanitation' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥', description: 'Medical facilities, ambulance, health camps' },
  { id: 'education', label: 'Education', emoji: '📚', description: 'Schools, teachers, mid-day meals' },
  { id: 'corruption', label: 'Corruption', emoji: '⚖️', description: 'Bribery, misuse of funds, irregularities' },
  { id: 'safety', label: 'Safety', emoji: '🛡️', description: 'Crime, harassment, security concerns' },
  { id: 'other', label: 'Other', emoji: '📝', description: 'Any other village-related issues' }
];

export default function AnonymousReportForm() {
  const { submitReport } = useAnonymousReports();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    district: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    reportId?: string;
    reporterToken?: string;
    error?: string;
  } | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const detectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([longitude, latitude]);
        setDetecting(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Could not detect location');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 3) {
      alert('Maximum 3 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setPhotos(prev => [...prev, ...validFiles]);
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    setResult(null);

    const response = await submitReport({
      ...formData,
      coords: coords || undefined,
      photos
    });

    setSubmitting(false);
    setResult(response);

    if (response.success) {
      // Reset form
      setFormData({ title: '', description: '', category: '', location: '', district: '' });
      setPhotos([]);
      setPreviewUrls([]);
      setCoords(null);
    }
  };

  const copyToken = () => {
    if (result?.reporterToken) {
      navigator.clipboard.writeText(result.reporterToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  if (result?.success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted Successfully!</h2>
          <p className="text-slate-400 mb-6">
            Your report has been anonymized and submitted. Save your tracking token to check the status.
          </p>
          
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <div className="text-sm text-slate-400 mb-2">Report ID</div>
            <div className="text-lg font-mono text-cyan-400">{result.reportId}</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <div className="text-sm text-slate-400 mb-2">Your Tracking Token (Save this!)</div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-mono text-yellow-400 break-all">{result.reporterToken}</div>
              <button
                onClick={copyToken}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                {tokenCopied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-yellow-400 font-medium mb-1">Important!</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Save your tracking token - you'll need it to check status</li>
                  <li>• You can escalate the report if not resolved in 7 days</li>
                  <li>• Other citizens can vote on your report for credibility</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="mt-6 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit Anonymous Report</h2>
            <p className="text-slate-400 text-sm">Your identity will be protected through AI anonymization</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <span className="text-blue-400 font-medium">Privacy Protected: </span>
              Your report will be processed by AI to remove all personal information (names, phone numbers, addresses, etc.) 
              while preserving the essential details of your complaint.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Issue Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.category === cat.id
                      ? 'border-cyan-500 bg-cyan-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  <div className="text-sm font-medium text-white">{cat.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Issue Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief title describing the issue"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Detailed Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail. Include all relevant information - AI will remove any personal details automatically."
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Feel free to include names, dates, and specific details - they will be anonymized automatically.
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Area/Village
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Market Area"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="e.g., Pune"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GPS Location (Optional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={detectLocation}
                disabled={detecting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {detecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {detecting ? 'Detecting...' : 'Detect Location'}
              </button>
              {coords && (
                <span className="text-sm text-green-400">
                  ✓ Location detected (will be generalized for privacy)
                </span>
              )}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Photos (Optional, max 3)
            </label>
            <div className="flex flex-wrap gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-cyan-500 transition-colors">
                  <Camera className="w-6 h-6 text-slate-500" />
                  <span className="text-xs text-slate-500 mt-1">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Photo metadata will be stripped for privacy
            </p>
          </div>

          {/* Error */}
          {result?.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
              {result.error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !formData.title || !formData.description || !formData.category}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing & Anonymizing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Anonymous Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
