import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import { postService } from '../services/postService';
import { Post, ProjectCategory } from '../types/database.types';
import { StoriesBar } from '../components/stories/StoriesBar';
import { PostCard } from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
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
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'All', label: 'All Works', icon: Sparkles },
  { id: 'Software & Web', label: 'Software & Web', icon: Code2 },
  { id: 'UI/UX & Product Design', label: 'UI/UX Design', icon: Palette },
  { id: 'AI & Machine Learning', label: 'AI & ML', icon: BrainCircuit },
  { id: 'Creative & 3D Art', label: 'Creative 3D', icon: Box },
  { id: 'Mobile Applications', label: 'Mobile Apps', icon: Smartphone }
];

export const FeedPage: React.FC = () => {
  const { toggleLike, toggleSave, deletePost } = usePosts();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async (cat: string) => {
    setLoading(true);
    try {
      const data = await postService.getFeedPosts(undefined, cat);
      setPosts(data);
    } catch (err) {
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* 24-Hour Stories Carousel */}
      <StoriesBar />

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

      {/* Feed Status Bar */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h1 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>{selectedCategory === 'All' ? 'Creator Project Showcases' : `${selectedCategory} Projects`}</span>
        </h1>

        <button
          onClick={() => loadFeed(selectedCategory)}
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No works found in this category</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to publish a project in {selectedCategory} and share your building experience with the community!
            </p>
          </div>
          <Button variant="gradient" onClick={() => setSelectedCategory('All')}>
            View All Categories
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
              onPostUpdated={() => loadFeed(selectedCategory)}
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
