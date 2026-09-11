import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { formatRelativeTime, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />;
      case 'follow':
      case 'follow_request':
      case 'follow_accepted':
        return <UserPlus className="w-3.5 h-3.5 text-pink-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getText = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your post.';
      case 'comment':
        return 'commented on your vibe.';
      case 'reply':
        return 'replied to your comment.';
      case 'follow':
        return 'started following you.';
      case 'follow_request':
        return 'requested to follow your private profile.';
      case 'follow_accepted':
        return 'accepted your follow request.';
      default:
        return 'interacted with your profile.';
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-500" />
            <span>Activity & Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time alerts when people interact with your vibes</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No notifications yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            When someone likes your photos, comments, or follows you, you'll see it here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(item => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markAsRead(item.id)}
              className={cn(
                'flex items-center justify-between gap-3 p-3.5 rounded-2xl transition-colors border',
                item.is_read
                  ? 'bg-white dark:bg-surface-cardDark border-slate-200/80 dark:border-slate-800/80'
                  : 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/20'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <Link to={`/profile/${item.actor.username}`}>
                    <Avatar src={item.actor.avatar_url} alt={item.actor.username} size="md" isVerified={item.actor.is_verified} />
                  </Link>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm">
                    {getIcon(item.type)}
                  </div>
                </div>

                <div className="min-w-0 text-xs">
                  <p className="text-slate-800 dark:text-slate-200 leading-snug">
                    <Link to={`/profile/${item.actor.username}`} className="font-bold hover:underline text-slate-900 dark:text-white">
                      {item.actor.username}
                    </Link>{' '}
                    <span>{getText(item.type)}</span>
                  </p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Preview / Target Post thumbnail */}
              {item.post?.media?.[0]?.media_url ? (
                <Link to="/feed" className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                  <img src={item.post.media[0].media_url} alt="Post preview" className="w-full h-full object-cover" />
                </Link>
              ) : item.type === 'follow' || item.type === 'follow_request' ? (
                <Link
                  to={`/profile/${item.actor.username}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  View
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

