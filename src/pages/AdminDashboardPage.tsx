import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { adminService } from '../services/adminService';
import { postService } from '../services/postService';
import { Report } from '../types/database.types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { formatRelativeTime } from '../lib/utils';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Image,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalPosts: 0,
    totalStories: 0,
    pendingReports: 0,
    dailyActiveUsers: 0
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getReports()
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateReport = async (reportId: string, status: 'reviewed' | 'action_taken' | 'dismissed') => {
    const ok = await adminService.updateReportStatus(reportId, status);
    if (ok) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      showToast('Report Updated', `Status marked as ${status}`, 'success');
      loadAdminData();
    }
  };

  const handleDeleteReportedPost = async (report: Report) => {
    if (!report.post_id) return;
    if (confirm('Delete this violating post permanently?')) {
      const ok = await postService.deletePost(report.post_id);
      if (ok) {
        await handleUpdateReport(report.id, 'action_taken');
        showToast('Post Removed', 'Violating post deleted by administrator', 'info');
      }
    }
  };

  // Check authorization
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Admin Authorization Required</h2>
        <p className="text-xs text-slate-400">
          You need an administrator role to access platform moderation controls.
        </p>
        <Link to="/feed">
          <Button variant="gradient" size="sm">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-500" />
            <span>Trust & Safety Moderation Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Platform telemetry, reported content, and security oversight</p>
        </div>

        <Button size="sm" variant="secondary" onClick={loadAdminData}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">+12% this week</span>
        </div>

        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Published Posts</span>
            <Image className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalPosts.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-500 font-semibold">Realtime feed sync</span>
        </div>

        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Stories</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalStories}</p>
          <span className="text-[10px] text-slate-400 font-semibold">24h auto-expiry</span>
        </div>

        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reports</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500">{stats.pendingReports}</p>
          <span className="text-[10px] text-rose-400 font-semibold">Requires moderation</span>
        </div>
      </div>

      {/* Moderation Reports Queue */}
      <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Reports Management Queue</span>
        </h3>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No reports in queue. Everything is clear!</p>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === 'pending' ? 'warning' : report.status === 'action_taken' ? 'slate' : 'brand'}>
                      {report.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Reason: {report.reason}</span>
                    <span className="text-[11px] text-slate-400">â€¢ {formatRelativeTime(report.created_at)}</span>
                  </div>

                  {report.reporter && (
                    <span className="text-[11px] text-slate-400">
                      Reported by @{report.reporter.username}
                    </span>
                  )}
                </div>

                {report.details && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{report.details}"
                  </p>
                )}

                {/* Target Content Snippet */}
                {report.post && (
                  <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    {report.post.media?.[0]?.media_url && (
                      <img
                        src={report.post.media[0].media_url}
                        alt="Reported content"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">Post by @{report.post.user?.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{report.post.caption}</p>
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                  {report.post_id && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteReportedPost(report)}
                      className="h-8 text-xs font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Remove Post</span>
                    </Button>
                  )}

                  {report.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateReport(report.id, 'dismissed')}
                        className="h-8 text-xs"
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateReport(report.id, 'reviewed')}
                        className="h-8 text-xs"
                      >
                        Mark Reviewed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

