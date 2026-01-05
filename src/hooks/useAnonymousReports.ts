import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';

interface AnonymousReport {
  id: string;
  title: string;
  description: string;
  intent: string;
  category: string;
  severity: string;
  keywords: string[];
  location: {
    area: string;
    district: string;
  };
  status: string;
  priority: string;
  assignedTo: {
    workerId: string | null;
    workerName: string;
    assignedAt: string | null;
  };
  currentEscalationLevel: number;
  escalationDeadline: string;
  escalationHistory: Array<{
    level: number;
    authority: string;
    authorityName: string;
    escalatedAt: string;
    reason: string;
    currentHash: string;
  }>;
  upvoteCount: number;
  downvoteCount: number;
  credibilityScore: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
  statusUpdates: Array<{
    status: string;
    message: string;
    timestamp: string;
  }>;
  resolutionFeedback?: {
    isResolved: boolean;
    satisfactionRating: number;
    feedback: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  critical: number;
  avgResolutionTimeDays: number;
  byCategory: Record<string, number>;
}

export function useAnonymousReports() {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (filters?: {
    status?: string;
    priority?: string;
    escalationLevel?: number;
    sortBy?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.escalationLevel !== undefined) params.append('escalationLevel', filters.escalationLevel.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`${API_URL}/api/anonymous-reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/stats/overview`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const submitReport = useCallback(async (reportData: {
    title: string;
    description: string;
    category: string;
    location?: string;
    district?: string;
    coords?: [number, number];
    photos?: File[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('category', reportData.category);
      if (reportData.location) formData.append('location', reportData.location);
      if (reportData.district) formData.append('district', reportData.district);
      if (reportData.coords) formData.append('coords', JSON.stringify(reportData.coords));
      formData.append('sessionId', Date.now().toString());
      
      if (reportData.photos) {
        reportData.photos.forEach(photo => {
          formData.append('photos', photo);
        });
      }

      const response = await fetch(`${API_URL}/api/anonymous-reports`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          reportId: data.reportId,
          reporterToken: data.reporterToken,
          message: data.message
        };
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
      return { success: false, error: err instanceof Error ? err.message : 'Failed to submit report' };
    } finally {
      setLoading(false);
    }
  }, []);

  const trackReport = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/track/${token}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, report: data.report };
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track report');
      return { success: false, error: err instanceof Error ? err.message : 'Report not found' };
    } finally {
      setLoading(false);
    }
  }, []);

  const escalateReport = useCallback(async (reportId: string, reporterToken: string, reason: string) => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${reportId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterToken, reason })
      });

      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: 'Failed to escalate report' };
    }
  }, []);

  const voteOnReport = useCallback(async (reportId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voteType, 
          voterIdentifier: localStorage.getItem('voterId') || Date.now().toString() 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, upvoteCount: data.upvoteCount, downvoteCount: data.downvoteCount, credibilityScore: data.credibilityScore }
            : r
        ));
      }
      
      return data;
    } catch (err) {
      return { success: false, error: 'Failed to vote' };
    }
  }, []);

  const updateStatus = useCallback(async (reportId: string, status: string, message: string, updatedBy: string) => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message, updatedBy, updatedByRole: 'admin' })
      });

      const data = await response.json();
      
      if (data.success) {
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, status } : r
        ));
      }
      
      return data;
    } catch (err) {
      return { success: false, error: 'Failed to update status' };
    }
  }, []);

  const assignWorker = useCallback(async (reportId: string, workerId: string, workerName: string, assignedBy: string) => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${reportId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, workerName, assignedBy })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchReports();
      }
      
      return data;
    } catch (err) {
      return { success: false, error: 'Failed to assign worker' };
    }
  }, [fetchReports]);

  const submitFeedback = useCallback(async (
    reportId: string, 
    reporterToken: string, 
    isResolved: boolean, 
    satisfactionRating: number, 
    feedback: string
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/anonymous-reports/${reportId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterToken, isResolved, satisfactionRating, feedback })
      });

      return await response.json();
    } catch (err) {
      return { success: false, error: 'Failed to submit feedback' };
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  return {
    reports,
    stats,
    loading,
    error,
    fetchReports,
    fetchStats,
    submitReport,
    trackReport,
    escalateReport,
    voteOnReport,
    updateStatus,
    assignWorker,
    submitFeedback
  };
}
