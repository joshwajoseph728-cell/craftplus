import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Avatar } from '../ui/Avatar';
import { Home, Compass, PlusCircle, MessageSquare, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MobileNavProps {
  onOpenCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCreate }) => {
  const { user } = useAuth();
  const { unreadCount: chatCount } = useChat();
  const { unreadCount: notifCount } = useNotifications();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-dark/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            cn(
              'p-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Feed</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            cn(
              'p-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        {/* Center Create Post Action */}
        <button
          onClick={onOpenCreate}
          className="p-1.5 -mt-3 rounded-full bg-gradient-to-tr from-brand-600 to-pink-600 text-white shadow-glow-brand active:scale-95 transition-transform"
          aria-label="Create Post"
        >
          <PlusCircle className="w-7 h-7" />
        </button>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            cn(
              'relative p-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Messages</span>
          {chatCount > 0 && (
            <span className="absolute top-1.5 right-3 w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
          )}
        </NavLink>

        <NavLink
          to={user ? `/profile/${user.username}` : '/auth/login'}
          className={({ isActive }) =>
            cn(
              'p-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          {user ? (
            <Avatar src={user.avatar_url} alt={user.full_name} size="xs" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px]">{user ? 'Profile' : 'Sign In'}</span>
        </NavLink>
      </div>
    </nav>
  );
};
