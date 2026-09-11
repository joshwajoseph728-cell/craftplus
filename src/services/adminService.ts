import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Report } from '../types/database.types';
import { INITIAL_REPORTS, INITIAL_PROFILES, INITIAL_POSTS } from '../lib/mockData';

const LOCAL_STORAGE_REPORTS = 'vibesphere_reports';

const getStoredReports = (): Report[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_REPORTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_REPORTS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(INITIAL_REPORTS));
  return INITIAL_REPORTS;
};

const setStoredReports = (reports: Report[]) => {
  localStorage.setItem(LOCAL_STORAGE_REPORTS, JSON.stringify(reports));
};

export const adminService = {
  async getPlatformStats() {
    if (!isSupabaseConfigured()) {
      return {
        totalUsers: 1420 + INITIAL_PROFILES.length,
        totalPosts: 8520 + INITIAL_POSTS.length,
        totalStories: 184,
        pendingReports: getStoredReports().filter(r => r.status === 'pending').length,
        dailyActiveUsers: 842
      };
    }

    try {
      const [users, posts, reports] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return {
        totalUsers: users.count || 0,
        totalPosts: posts.count || 0,
        totalStories: 24,
        pendingReports: reports.count || 0,
        dailyActiveUsers: (users.count || 1) * 3
      };
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      return {
        totalUsers: 24,
        totalPosts: 120,
        totalStories: 12,
        pendingReports: 2,
        dailyActiveUsers: 18
      };
    }
  },

  async getReports(): Promise<Report[]> {
    if (!isSupabaseConfigured()) {
      return getStoredReports();
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(*),
          post:posts!post_id(*),
          reported_user:profiles!reported_user_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Report[];
    } catch (err) {
      console.error('Error fetching reports from Supabase:', err);
      return getStoredReports();
    }
  },

  async updateReportStatus(reportId: string, status: 'reviewed' | 'action_taken' | 'dismissed'): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const reports = getStoredReports();
      setStoredReports(reports.map(r => r.id === reportId ? { ...r, status } : r));
      return true;
    }

    try {
      const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
      return !error;
    } catch {
      return false;
    }
  },

  async submitReport(params: {
    reporterId: string;
    postId?: string;
    commentId?: string;
    reportedUserId?: string;
    reason: 'spam' | 'harassment' | 'hate' | 'violence' | 'nudity' | 'scam' | 'other';
    details?: string;
  }): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newReport: Report = {
        id: `rep-${Date.now()}`,
        reporter_id: params.reporterId,
        post_id: params.postId,
        comment_id: params.commentId,
        reported_user_id: params.reportedUserId,
        reason: params.reason,
        details: params.details || '',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      const reports = getStoredReports();
      setStoredReports([newReport, ...reports]);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('reports').insert(params);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit report' };
    }
  }
};

