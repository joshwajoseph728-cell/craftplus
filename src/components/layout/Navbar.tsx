import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatContext';
import { Avatar } from '../ui/Avatar';
import { MoodSwitcher } from './MoodSwitcher';
import { AccountSearchModal } from '../search/AccountSearchModal';
import { Sun, Moon, Bell, MessageSquare, PlusSquare, Sparkles, ShieldAlert, Cpu, Activity, Search } from 'lucide-react';

export interface NavbarProps {
  onOpenCreate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreate }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount: notifCount } = useNotifications();
  const { unreadCount: chatCount } = useChat();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/feed" : "/"} className="flex items-center gap-2.5 select-none shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-pink-600 to-accent-500 p-[2px] shadow-sm">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Craft<span className="bg-gradient-to-r from-brand-500 via-pink-500 to-accent-500 bg-clip-text text-transparent">Pulse</span>
            </span>
          </Link>

          {/* Search Bar / Trigger */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-brand-500/50 transition-all max-w-[200px] md:max-w-xs w-full mx-2 md:mx-4"
            title="Search creators, usernames, or skills"
          >
            <Search className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="text-xs truncate font-medium">Search accounts...</span>
          </button>

          {/* Center: Mood Switcher */}
          <div className="hidden md:block">
            <MoodSwitcher compact={true} />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Tech Architecture Link */}
          <Link
            to="/tech-stack"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
            title="System Architecture & Database Design"
          >
            <Cpu className="w-4 h-4" />
            <span>Tech Stack</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {user ? (
            <>
              {/* Quick Create (Mobile/Tablet) */}
              <button
                onClick={onOpenCreate}
                className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Showcase Work"
              >
                <PlusSquare className="w-5 h-5" />
              </button>

              {/* Direct Messages */}
              <Link
                to="/messages"
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Direct Messages & Collabs"
              >
                <MessageSquare className="w-5 h-5" />
                {chatCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-500 rounded-full ring-2 ring-white dark:ring-surface-dark animate-pulse" />
                )}
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>

              {/* Admin Shield (if user is admin) */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Admin Moderation"
                >
                  <ShieldAlert className="w-5 h-5" />
                </Link>
              )}

              {/* User Avatar */}
              <Link to={`/profile/${user.username}`} className="ml-1">
                <Avatar
                  src={user.avatar_url}
                  alt={user.full_name}
                  size="sm"
                  isVerified={user.is_verified}
                />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm hover:opacity-90"
              >
                Join CraftPlus
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Global Account Search Modal */}
    <AccountSearchModal
      isOpen={isSearchModalOpen}
      onClose={() => setIsSearchModalOpen(false)}
    />
  </>
  );
};

