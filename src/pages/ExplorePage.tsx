import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Post, Profile, Hashtag } from '../types/database.types';
import { postService } from '../services/postService';
import { profileService } from '../services/profileService';
import { SearchInput } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/feed/PostCard';
import { usePosts } from '../hooks/usePosts';
import { INITIAL_HASHTAGS } from '../lib/mockData';
import { useDebounce } from '../hooks/useDebounce';
import {
  Compass,
  TrendingUp,
  Heart,
  MessageCircle,
  Hash,
  Sparkles,
  Users
} from 'lucide-react';
import { formatCompactNumber, cn } from '../lib/utils';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [posts, setPosts] = useState<Post[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<Profile[]>([]);
  const [matchingTags, setMatchingTags] = useState<Hashtag[]>([]);
  const [activeTag, setActiveTag] = useState(tagParam);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const { toggleLike, toggleSave, deletePost } = usePosts();

  useEffect(() => {
    if (tagParam) {
      setActiveTag(tagParam);
    }
  }, [tagParam]);

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      try {
        if (debouncedQuery.trim()) {
          const [explorePosts, searchRes] = await Promise.all([
            postService.getExplorePosts(debouncedQuery),
            profileService.searchUsersAndHashtags(debouncedQuery)
          ]);
          setPosts(explorePosts);
          setMatchingUsers(searchRes.users);
          setMatchingTags(searchRes.hashtags);
        } else if (activeTag) {
          const tagPosts = await postService.getExplorePosts(undefined, activeTag);
          setPosts(tagPosts);
          setMatchingUsers([]);
          setMatchingTags([]);
        } else {
          const allExplore = await postService.getExplorePosts();
          setPosts(allExplore);
          setMatchingUsers([]);
          setMatchingTags([]);
        }
      } catch (err) {
        console.error('Error in explore:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, [debouncedQuery, activeTag]);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag('');
      setSearchParams({});
    } else {
      setActiveTag(tag);
      setSearchParams({ tag });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search creators, hashtags (#cyberpunk), or keywords..."
            className="py-3 text-sm rounded-2xl shadow-sm"
          />
        </div>

        {/* Trending Hashtag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 px-1">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
            <span>Trending:</span>
          </div>

          {INITIAL_HASHTAGS.map(t => {
            const isSelected = activeTag.toLowerCase() === t.name.toLowerCase();

            return (
              <button
                key={t.id}
                onClick={() => handleTagClick(t.name)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1',
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm'
                    : 'bg-white dark:bg-surface-cardDark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500'
                )}
              >
                <Hash className="w-3 h-3 opacity-70" />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Search Results if searching */}
      {matchingUsers.length > 0 && (
        <div className="space-y-3 bg-white dark:bg-surface-cardDark p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            <span>Matching Creators</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingUsers.map(user => (
              <Link
                key={user.id}
                to={`/profile/${user.username}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800/40"
              >
                <Avatar src={user.avatar_url} alt={user.username} size="md" isVerified={user.is_verified} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Explore Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 aspect-square rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No explore posts found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try searching for a different keyword or reset hashtag filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {posts.map(post => {
            const firstMedia = post.media?.[0]?.media_url;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-black cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
              >
                <img
                  src={firstMedia || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Multiple Media Indicator Icon */}
                {post.media && post.media.length > 1 && (
                  <div className="absolute top-2.5 right-2.5 p-1 bg-black/60 rounded-md text-white backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 text-white text-xs font-bold backdrop-blur-[2px]">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{formatCompactNumber(post.likes_count)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{formatCompactNumber(post.comments_count)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Post Detail Lightbox Modal */}
      {selectedPost && (
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          maxWidth="2xl"
          showCloseButton={true}
        >
          <div className="-m-6">
            <PostCard
              post={selectedPost}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onDeletePost={(id) => {
                deletePost(id);
                setSelectedPost(null);
                setPosts(prev => prev.filter(p => p.id !== id));
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
