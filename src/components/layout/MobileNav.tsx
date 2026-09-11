import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Avatar } from '../ui/Avatar';
import { Home, Compass, PlusCircle, MessageSquare, Trophy, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MobileNavProps {
  onOpenCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCreate }) => {
  const { user } = useAuth();
  const { unreadCount: chatCount } = useChat();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-dark/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            cn(
              'p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Feed</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            cn(
              'p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px]">Explore</span>
        </NavLink>

        {/* Center Create Post Action */}
        <button
          onClick={onOpenCreate}
          className="p-1.5 -mt-3 rounded-full bg-gradient-to-tr from-brand-600 to-pink-600 text-white shadow-glow-brand active:scale-95 transition-transform"
          aria-label="Showcase Work"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <NavLink
          to="/challenges"
          className={({ isActive }) =>
            cn(
              'p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[9px]">Challenges</span>
        </NavLink>

        <NavLink
          to="/collaborate"
          className={({ isActive }) =>
            cn(
              'p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <Users className="w-4 h-4" />
          <span className="text-[9px]">Collab</span>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            cn(
              'relative p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px]">DMs</span>
          {chatCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
          )}
        </NavLink>

        <NavLink
          to={user ? `/profile/${user.username}` : '/auth/login'}
          className={({ isActive }) =>
            cn(
              'p-1.5 rounded-xl flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors',
              isActive ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'
            )
          }
        >
          {user ? (
            <Avatar src={user.avatar_url} alt={user.full_name} size="xs" />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="text-[9px]">{user ? 'Portfolio' : 'Sign In'}</span>
        </NavLink>
      </div>
    </nav>
  );
};
