import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Profile, Post } from '../types/database.types';
import { profileService } from '../services/profileService';
import { postService } from '../services/postService';
import { badgeService } from '../services/badgeService';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { usePosts } from '../hooks/usePosts';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/feed/PostCard';
import { PortfolioView } from '../components/profile/PortfolioView';
import { BadgeList } from '../components/profile/BadgeList';
import {
  MapPin,
  Globe,
  Grid,
  Bookmark,
  Heart,
  Lock,
  MessageSquare,
  Settings,
  Sparkles,
  Check,
  UserPlus,
  Briefcase,
  LayoutGrid,
  Award
} from 'lucide-react';
import { formatCompactNumber, cn } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { setActiveUser } = useChat();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'portfolio'>('portfolio'); // Default to portfolio for creator focus
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const { toggleLike, toggleSave, deletePost } = usePosts();

  const isMe = currentUser?.username.toLowerCase() === username?.toLowerCase();

  const loadProfileData = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const p = await profileService.getProfileByUsername(username, currentUser?.id);
      if (p) {
        const userPosts = await postService.getUserPosts(p.id);
        const enrichedBadges = badgeService.calculateUserBadges(p, userPosts);
        setProfile({ ...p, badges: enrichedBadges });
        setPosts(userPosts);

        if (isMe && currentUser) {
          const [saved, liked] = await Promise.all([
            postService.getSavedPosts(currentUser.id),
            postService.getLikedPosts(currentUser.id)
          ]);
          setSavedPosts(saved);
          setLikedPosts(liked);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [username, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return;
    const currentStatus = profile.follow_status || 'none';
    const res = await profileService.toggleFollow(currentUser.id, profile, currentStatus);

    setProfile(prev => prev ? {
      ...prev,
      follow_status: res.status,
      is_following: res.status === 'active',
      followers_count: Math.max(0, (prev.followers_count || 0) + res.followersCountDelta)
    } : null);
  };

  const handleStartChat = () => {
    if (!profile) return;
    setActiveUser(profile);
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-xs text-slate-400 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-3" />
        Loading creator profile & portfolio...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Creator not found</h2>
        <p className="text-xs text-slate-400">The profile you requested does not exist or may have been removed.</p>
        <Link to="/feed">
          <Button variant="gradient" size="sm">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const isPrivateLocked = profile.is_private && !isMe && !profile.is_following;

  const tabsList = [
    { id: 'posts', label: 'Works', icon: <Grid className="w-4 h-4" />, count: posts.length }
  ];

  if (isMe) {
    tabsList.push(
      { id: 'saved', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" />, count: savedPosts.length },
      { id: 'liked', label: 'Liked', icon: <Heart className="w-4 h-4" />, count: likedPosts.length }
    );
  }

  const currentTabPosts = activeTab === 'saved' ? savedPosts : activeTab === 'liked' ? likedPosts : posts;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View Mode Toggle Switcher */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">View Mode:</span>
          <span className="text-[11px] text-slate-400">
            {viewMode === 'portfolio' ? 'Professional Showcase Mode' : 'Social Grid View'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('portfolio')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              viewMode === 'portfolio'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Portfolio View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Social Grid</span>
          </button>
        </div>
      </div>

      {/* Render View Depending on Toggle */}
      {viewMode === 'portfolio' ? (
        <PortfolioView
          profile={profile}
          posts={posts}
          isMe={isMe}
          onToggleFollow={handleFollowToggle}
        />
      ) : (
        /* Social Header & Grid View */
        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={profile.avatar_url}
                alt={profile.full_name}
                size="2xl"
                isVerified={profile.is_verified}
              />

              <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <span>{profile.full_name}</span>
                    </h1>
                    <p className="text-xs text-slate-400">@{profile.username}</p>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    {isMe ? (
                      <Link to="/settings">
                        <Button variant="secondary" size="sm">
                          <Settings className="w-4 h-4 mr-1.5" />
                          <span>Edit Profile</span>
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button
                          variant={profile.is_following ? 'secondary' : 'gradient'}
                          size="sm"
                          onClick={handleFollowToggle}
                        >
                          {profile.follow_status === 'pending' ? (
                            'Requested'
                          ) : profile.is_following ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              <span>Follow</span>
                            </>
                          )}
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleStartChat}>
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          <span>Message</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                )}

                {/* Skills Chips */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    {profile.skills.slice(0, 5).map(s => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Badges Preview */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="pt-2">
                    <BadgeList badges={profile.badges} compact={true} />
                  </div>
                )}

                {/* Stats Counter Bar */}
                <div className="flex items-center justify-center sm:justify-start gap-8 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-center sm:text-left">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{posts.length}</p>
                    <p className="text-[11px] text-slate-400">Projects</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatCompactNumber(profile.followers_count || 0)}</p>
                    <p className="text-[11px] text-slate-400">Followers</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatCompactNumber(profile.following_count || 0)}</p>
                    <p className="text-[11px] text-slate-400">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Private Account Check */}
          {isPrivateLocked ? (
            <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">This Account is Private</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Follow this account to see their projects, case studies, and engineering updates.
              </p>
              <Button variant="gradient" size="sm" onClick={handleFollowToggle}>
                Follow Creator
              </Button>
            </div>
          ) : (
            <>
              {/* Content Tabs */}
              <div className="flex justify-center border-b border-slate-200/80 dark:border-slate-800/80">
                <Tabs
                  tabs={tabsList}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  variant="underline"
                />
              </div>

              {/* Grid */}
              {currentTabPosts.length === 0 ? (
                <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
                  <Grid className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No projects in this collection</p>
                  <p className="text-xs text-slate-400">When projects are published, they will appear right here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {currentTabPosts.map(post => {
                    const firstMedia = post.media?.[0]?.media_url;

                    return (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-black cursor-pointer shadow-sm"
                      >
                        <img
                          src={firstMedia || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                          alt={post.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Title pill */}
                        {post.project_title && (
                          <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-[11px] font-bold truncate">
                            {post.project_title}
                          </div>
                        )}

                        {/* Hover Stats */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold backdrop-blur-[2px]">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white" />
                            <span>{formatCompactNumber(post.likes_count)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Selected Post Lightbox */}
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
                    loadProfileData();
                  }}
                />
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};
