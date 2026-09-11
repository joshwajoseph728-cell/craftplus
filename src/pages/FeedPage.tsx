import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';
import { postService } from '../services/postService';
import { Post, ProjectCategory } from '../types/database.types';
import { StoriesBar } from '../components/stories/StoriesBar';
import { PostCard } from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Code2,
  Palette,
  BrainCircuit,
  Smartphone,
  Box,
  Cpu,
  Trophy,
  Users,
  Flame,
  Clock,
  Radio
} from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'All', label: 'All Works', icon: Sparkles },
  { id: 'Software & Web', label: 'Software & Web', icon: Code2 },
  { id: 'UI/UX & Product Design', label: 'UI/UX Design', icon: Palette },
  { id: 'AI & Machine Learning', label: 'AI & ML', icon: BrainCircuit },
  { id: 'Robotics & Embedded', label: 'Robotics & IoT', icon: Cpu },
  { id: 'Creative & 3D Art', label: 'Creative & 3D', icon: Box },
  { id: 'Mobile Applications', label: 'Mobile Apps', icon: Smartphone }
];

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const { toggleLike, toggleSave, deletePost } = usePosts();

  const [feedMode, setFeedMode] = useState<'recommended' | 'following' | 'latest'>('recommended');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async (cat: string, mode: string) => {
    setLoading(true);
    try {
      const data = await postService.getFeedPosts(user?.id, cat);
      let filtered = [...data];

      if (mode === 'following') {
        filtered = filtered.filter(p => p.user.is_following || p.user_id === user?.id);
      } else if (mode === 'latest') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setPosts(filtered);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(selectedCategory, feedMode);
  }, [selectedCategory, feedMode, user?.id]);

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      {/* 24-Hour Stories Carousel */}
      <StoriesBar />

      {/* Feed Stream Tabs (Recommended, Following, Latest) */}
      <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setFeedMode('recommended')}
          className={cn(
            'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            feedMode === 'recommended'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>For You</span>
        </button>

        <button
          type="button"
          onClick={() => setFeedMode('following')}
          className={cn(
            'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            feedMode === 'following'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Users className="w-3.5 h-3.5 text-pink-500" />
          <span>Following</span>
        </button>

        <button
          type="button"
          onClick={() => setFeedMode('latest')}
          className={cn(
            'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            feedMode === 'latest'
              ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span>Latest Builds</span>
        </button>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none',
                isSelected
                  ? 'bg-gradient-to-r from-brand-600 via-pink-600 to-accent-500 text-white shadow-sm'
                  : 'bg-white dark:bg-surface-cardDark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed Status Bar & Refresh */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h1 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>
            {feedMode === 'following'
              ? 'Works from Creators You Follow'
              : feedMode === 'latest'
              ? 'Freshly Published Builds'
              : selectedCategory === 'All'
              ? 'Curated Creator Showcases'
              : `${selectedCategory} Projects`}
          </span>
        </h1>

        <button
          onClick={() => loadFeed(selectedCategory, feedMode)}
          className="text-xs text-slate-500 hover:text-brand-500 flex items-center gap-1 font-semibold transition-colors p-1 rounded-lg"
          title="Refresh Feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {feedMode === 'following' ? 'No posts from your network yet' : 'No works found in this category'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {feedMode === 'following'
                ? 'Discover talented creators in the Explore tab or switch to "For You" to see global highlights.'
                : `Be the first to publish a project in ${selectedCategory} and share your building experience!`}
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => {
              if (feedMode === 'following') setFeedMode('recommended');
              else setSelectedCategory('All');
            }}
          >
            {feedMode === 'following' ? 'Switch to For You' : 'View All Categories'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onDeletePost={(id) => {
                deletePost(id);
                setPosts(prev => prev.filter(p => p.id !== id));
              }}
              onPostUpdated={() => loadFeed(selectedCategory, feedMode)}
            />
          ))}

          {/* End of Feed Banner */}
          <div className="py-8 text-center space-y-2 border-t border-slate-200/80 dark:border-slate-800/80 mt-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">You're all caught up!</p>
            <p className="text-xs text-slate-400">You have explored all shared project showcases and experiences.</p>
          </div>
        </div>
      )}
    </div>
  );
};
