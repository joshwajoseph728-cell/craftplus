import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Post, Profile, Hashtag, ProjectCategory } from '../types/database.types';
import { postService } from '../services/postService';
import { profileService } from '../services/profileService';
import { SearchInput } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/feed/PostCard';
import { CollabRequestModal } from '../components/collaboration/CollabRequestModal';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';
import { INITIAL_HASHTAGS } from '../lib/mockData';
import { useDebounce } from '../hooks/useDebounce';
import {
  Compass,
  TrendingUp,
  Heart,
  MessageCircle,
  Hash,
  Sparkles,
  Users,
  Code2,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Send,
  Check,
  UserPlus
} from 'lucide-react';
import { formatCompactNumber, cn } from '../lib/utils';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Fields' },
  { id: 'Software & Web', label: 'Software & Web' },
  { id: 'AI & Machine Learning', label: 'AI & ML' },
  { id: 'UI/UX & Product Design', label: 'UI/UX Design' },
  { id: 'Creative & 3D Art', label: 'Creative & 3D' },
  { id: 'Robotics & Embedded', label: 'Robotics & Hardware' },
  { id: 'Music & Sound Design', label: 'Music & Audio' },
  { id: 'Research & Case Studies', label: 'Research & Case Studies' }
];

export const ExplorePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') || '';
  const tabParam = (searchParams.get('tab') as any) || 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'creators' | 'skills' | 'casestudies'>(tabParam);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<Post[]>([]);
  const [creators, setCreators] = useState<Profile[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<Profile[]>([]);
  const [matchingTags, setMatchingTags] = useState<Hashtag[]>([]);
  const [activeTag, setActiveTag] = useState(tagParam);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [collabTarget, setCollabTarget] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { toggleLike, toggleSave, deletePost } = usePosts();

  useEffect(() => {
    const loadCreators = async () => {
      const users = await profileService.getSuggestedUsers(currentUser?.id);
      setCreators(users);
    };
    loadCreators();
  }, [currentUser?.id]);

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
          const cat = selectedCategory === 'All' ? undefined : selectedCategory;
          const allExplore = await postService.getExplorePosts(undefined, cat);
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
  }, [debouncedQuery, activeTag, selectedCategory]);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag('');
      setSearchParams({});
    } else {
      setActiveTag(tag);
      setSearchParams({ tag });
    }
  };

  const caseStudyPosts = posts.filter(p => !!p.experience_learnings || p.work_status === 'Case Study');

  // Extract all distinct skills across creators & posts
  const allSkillsMap: Record<string, number> = {};
  creators.forEach(p => {
    p.skills?.forEach(s => {
      allSkillsMap[s] = (allSkillsMap[s] || 0) + 1;
    });
  });
  posts.forEach(p => {
    p.tech_stack?.forEach(s => {
      allSkillsMap[s] = (allSkillsMap[s] || 0) + 1;
    });
  });

  const popularSkills = Object.entries(allSkillsMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search creators, skills (#WebGPU, #PyTorch), or project keywords..."
            className="py-3 text-sm rounded-2xl shadow-sm"
          />
        </div>

        {/* Discovery Sub-Tabs */}
        <div className="flex items-center justify-center gap-1.5 max-w-xl mx-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>All Works</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('creators')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'creators'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Creators</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'skills'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Skill Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('casestudies')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'casestudies'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Case Studies</span>
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 select-none',
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-pink-600 text-white shadow-sm'
                    : 'bg-white dark:bg-surface-cardDark text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500'
                )}
              >
                {cat.label}
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
                  <p className="text-[11px] text-slate-400 truncate">@{user.username} • {user.skills?.[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: ALL WORKS GRID */}
      {activeTab === 'all' && (
        <>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 aspect-square rounded-2xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-3 shadow-sm">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No explore projects found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try searching for a different keyword or reset filters.
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

                    {/* Title & Category Badge */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
                      <p className="text-xs font-bold text-white truncate">{post.project_title || post.caption}</p>
                      <p className="text-[10px] text-slate-300 font-semibold truncate">{post.user.full_name}</p>
                    </div>

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
        </>
      )}

      {/* TAB 2: CREATORS ROSTER */}
      {activeTab === 'creators' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {creators.map(creator => (
            <div
              key={creator.id}
              className="p-5 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-sm hover:border-brand-500/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <Link to={`/profile/${creator.username}`} className="flex items-center gap-3 min-w-0">
                  <Avatar src={creator.avatar_url} alt={creator.full_name} size="lg" isVerified={creator.is_verified} />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-brand-500">
                      {creator.full_name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">@{creator.username}</p>
                    <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-0.5 truncate">
                      {creator.headline || 'Creator & Builder'}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setCollabTarget(creator)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-colors shrink-0"
                >
                  Collaborate
                </button>
              </div>

              {creator.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {creator.bio}
                </p>
              )}

              {/* Skills Chips */}
              {creator.skills && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {creator.skills.slice(0, 4).map(s => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                  {creator.skills.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-bold px-1">
                      +{creator.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                <span>{formatCompactNumber(creator.followers_count || 0)} followers</span>
                <Link
                  to={`/profile/${creator.username}`}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>View Portfolio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SKILL HUB */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-950/40 via-purple-950/40 to-slate-900 border border-brand-500/30 text-white space-y-2">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-400" />
              <span>Explore by Creator Skills & Technologies</span>
            </h3>
            <p className="text-xs text-slate-300">
              Discover real-world engineering case studies and creators using specific frameworks and tools.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {popularSkills.map(({ skill, count }) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSearchQuery(skill)}
                className="p-4 rounded-2xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 text-left transition-all hover:scale-[1.02] shadow-2xs group"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {skill}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {count} {count === 1 ? 'project/builder' : 'projects & builders'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CASE STUDIES */}
      {activeTab === 'casestudies' && (
        <div className="space-y-4">
          {caseStudyPosts.map(post => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="p-6 rounded-3xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 space-y-3 cursor-pointer hover:border-brand-500/50 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar src={post.user.avatar_url} alt={post.user.full_name} size="sm" isVerified={post.user.is_verified} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{post.user.full_name}</p>
                    <p className="text-[10px] text-slate-400">@{post.user.username}</p>
                  </div>
                </div>

                {post.category && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {post.category}
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-500 transition-colors">
                {post.project_title || 'Engineering Case Study'}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {post.caption}
              </p>

              {post.experience_learnings && (
                <div className="p-3 bg-brand-500/5 dark:bg-brand-500/10 rounded-2xl border border-brand-500/15 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {post.experience_learnings}
                </div>
              )}

              {post.tech_stack && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tech_stack.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
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

      {/* Direct Collab Proposal Modal */}
      {collabTarget && (
        <CollabRequestModal
          isOpen={!!collabTarget}
          onClose={() => setCollabTarget(null)}
          targetUser={collabTarget}
        />
      )}
    </div>
  );
};

