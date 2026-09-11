import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useChat } from '../../contexts/ChatContext';
import { Avatar } from '../ui/Avatar';
import { AICreatorModal } from '../ai/AICreatorModal';
import { MoodSwitcher } from './MoodSwitcher';
import {
  Home,
  Compass,
  PlusSquare,
  MessageSquare,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Cpu,
  LogOut,
  Activity,
  Trophy,
  Users,
  Bot,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  onOpenCreate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreate }) => {
  const { user, logout } = useAuth();
  const { unreadCount: notifCount } = useNotifications();
  const { unreadCount: chatCount } = useChat();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const navItems = [
    { label: 'Project Feed', path: '/feed', icon: Home },
    { label: 'Explore Hub', path: '/explore', icon: Compass },
    { label: 'Creator Challenges', path: '/challenges', icon: Trophy },
    { label: 'Collaborate', path: '/collaborate', icon: Users },
    { label: 'Direct Messages (DM)', path: '/messages', icon: MessageSquare, badge: chatCount },
    { label: 'Activity', path: '/notifications', icon: Bell, badge: notifCount },
    { label: 'My Portfolio', path: user ? `/profile/${user.username}` : '/auth/login', icon: User },
    { label: 'System Architecture', path: '/tech-stack', icon: Cpu, highlight: true }
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Moderation Portal', path: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-surface-dark transition-colors select-none">
        {/* Brand Header */}
        <div className="space-y-4">
          <Link to="/feed" className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-pink-600 to-accent-500 p-[2px] shadow-glow-brand">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Craft<span className="bg-gradient-to-r from-brand-500 via-pink-500 to-accent-500 bg-clip-text text-transparent">Plus</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Show what you create
              </p>
            </div>
          </Link>

          {/* Mood Switcher Toggle */}
          <div className="px-2">
            <MoodSwitcher />
          </div>

          {/* Action Buttons: Showcase Project + AI Studio */}
          <div className="px-2 space-y-2">
            <button
              onClick={onOpenCreate}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white font-bold text-xs shadow-md hover:shadow-glow-brand flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Showcase Work</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAIModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-brand-500" />
              <span>AI Creator Studio</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 px-2">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 group',
                    isActive
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                    item.highlight && !isActive && 'text-brand-500 dark:text-brand-400/90'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Settings Controls */}
        <div className="space-y-2 px-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-xs transition-colors',
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            <Settings className="w-4 h-4" />
            <span>Profile & Safety</span>
          </NavLink>

          {user ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <Link to={`/profile/${user.username}`} className="flex items-center gap-2.5 min-w-0 pr-2">
                <Avatar src={user.avatar_url} alt={user.full_name} size="sm" isVerified={user.is_verified} />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{user.full_name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Link
                to="/auth/login"
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-center font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 block transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white text-center font-bold text-xs shadow-sm hover:opacity-95 block transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Standalone AI Creator Studio Modal */}
      <AICreatorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </>
  );
};
