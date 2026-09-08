import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Profile, Hashtag } from '../../types/database.types';
import { profileService } from '../../services/profileService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { INITIAL_HASHTAGS } from '../../lib/mockData';
import { Sparkles, TrendingUp, Cpu, Database, ShieldCheck, Check, Code2, Users } from 'lucide-react';
import { formatCompactNumber } from '../../lib/utils';

export const RightPanel: React.FC = () => {
  const { user } = useAuth();
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [hashtags] = useState<Hashtag[]>(INITIAL_HASHTAGS.slice(0, 5));
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadSuggestions = async () => {
      const users = await profileService.getSuggestedUsers(user?.id);
      setSuggested(users);
    };
    loadSuggestions();
  }, [user?.id]);

  const handleFollow = async (targetUser: Profile) => {
    if (!user) return;
    const isCurrently = !!followedMap[targetUser.id];
    setFollowedMap(prev => ({ ...prev, [targetUser.id]: !isCurrently }));
    await profileService.toggleFollow(user.id, targetUser, isCurrently ? 'active' : 'none');
  };

  return (
    <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 px-6 py-6 border-l border-slate-200/80 dark:border-slate-800/80 space-y-6 overflow-y-auto bg-white dark:bg-surface-dark transition-colors select-none">
      {/* Current User Snapshot */}
      {user && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <Link to={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
            <Avatar src={user.avatar_url} alt={user.full_name} size="md" isVerified={user.is_verified} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
            </div>
          </Link>
          <Link
            to="/settings"
            className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            Edit
          </Link>
        </div>
      )}

      {/* Suggested Builders & Creators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            <span>Featured Builders</span>
          </h4>
          <Link to="/explore" className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">
            See All
          </Link>
        </div>

        <div className="space-y-2.5">
          {suggested.map(item => {
            const isFollowed = followedMap[item.id] ?? item.is_following;

            return (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <Link to={`/profile/${item.username}`} className="flex items-center gap-2.5 min-w-0">
                  <Avatar src={item.avatar_url} alt={item.full_name} size="sm" isVerified={item.is_verified} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate hover:text-brand-500">
                      @{item.username}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {formatCompactNumber(item.followers_count || 0)} followers • {item.skills?.[0] || 'Engineer'}
                    </p>
                  </div>
                </Link>

                <Button
                  size="sm"
                  variant={isFollowed ? 'secondary' : 'outline'}
                  onClick={() => handleFollow(item)}
                  className="h-7 px-2.5 text-xs font-bold rounded-lg shrink-0"
                >
                  {isFollowed ? <Check className="w-3 h-3 text-emerald-500" /> : 'Connect'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics & Tech Tags */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
          <span>Trending Technologies & Tags</span>
        </h4>

        <div className="space-y-2">
          {hashtags.map(tag => (
            <Link
              key={tag.id}
              to={`/explore?tag=${tag.name}`}
              className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors">
                  #{tag.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {formatCompactNumber(tag.post_count)} works shared
                </p>
              </div>
              <span className="text-[11px] font-bold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* College Project Architecture Highlight Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/40 via-purple-950/30 to-slate-900/40 border border-brand-500/20 text-slate-300 space-y-2.5">
        <div className="flex items-center gap-2 text-brand-400 font-bold text-xs">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span>Capstone Project Showcase</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          CraftPulse Full-Stack Social Architecture with PostgreSQL RLS Security, 24h Stories, Realtime Direct Messaging, and Media Buckets.
        </p>
        <Link
          to="/tech-stack"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors pt-1"
        >
          <span>View Technical Flow</span> &rarr;
        </Link>
      </div>

      {/* Footer Meta */}
      <div className="text-[11px] text-slate-400 dark:text-slate-600 space-y-1 pt-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link to="/tech-stack" className="hover:underline">About</Link>
          <span>•</span>
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:underline">Supabase</a>
          <span>•</span>
          <span className="hover:underline">Privacy</span>
          <span>•</span>
          <span className="hover:underline">Terms</span>
        </div>
        <p>© 2026 CraftPulse Inc. All rights reserved.</p>
      </div>
    </aside>
  );
};
