import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Profile, Post } from '../types/database.types';
import { profileService } from '../services/profileService';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { usePosts } from '../hooks/usePosts';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { PostCard } from '../components/feed/PostCard';
import {
  MapPin,
  Globe,
  Grid,
  Bookmark,
  Heart,
  Lock,
  Share2,
  MessageSquare,
  Settings,
  Sparkles,
  Check,
  UserPlus
} from 'lucide-react';
import { formatCompactNumber } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { setActiveUser } = useChat();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
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
      setProfile(p);

      if (p) {
        const userPosts = await postService.getUserPosts(p.id);
        setPosts(userPosts);

        if (isMe && currentUser) {
          const [saved, liked] = await Promise.all([
            postService.getSavedPosts(currentUser.id),
            postService.getLikedPosts(currentUser.id)
          ]);
          setSavedPosts(saved);
          setLikedPosts(liked);
        }
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
      <div className="max-w-2xl mx-auto py-12 text-center text-xs text-slate-400 animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-xs text-slate-400">The profile you requested does not exist or may have been removed.</p>
        <Link to="/feed">
          <Button variant="gradient" size="sm">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const isPrivateLocked = profile.is_private && !isMe && !profile.is_following;

  const tabsList = [
    { id: 'posts', label: 'Posts', icon: <Grid className="w-4 h-4" />, count: posts.length }
  ];

  if (isMe) {
    tabsList.push(
      { id: 'saved', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, count: savedPosts.length },
      { id: 'liked', label: 'Liked', icon: <Heart className="w-4 h-4" />, count: likedPosts.length }
    );
  }

  const currentTabPosts = activeTab === 'saved' ? savedPosts : activeTab === 'liked' ? likedPosts : posts;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <Avatar
            src={profile.avatar_url}
            alt={profile.full_name}
            size="2xl"
            isVerified={profile.is_verified}
          />

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{profile.full_name}</span>
                </h1>
                <p className="text-xs text-slate-400">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2">
                {isMe ? (
                  <>
                    <Link to="/settings">
                      <Button variant="secondary" size="sm">
                        <Settings className="w-4 h-4 mr-1.5" />
                        <span>Edit Profile</span>
                      </Button>
                    </Link>
                  </>
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

            {/* Bio & Details */}
            {profile.bio && (
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}

            {/* Meta tags (Location, Website) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-brand-500 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>

            {/* Stats Counter Bar */}
            <div className="flex items-center justify-center sm:justify-start gap-8 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center sm:text-left">
                <p className="text-base font-bold text-slate-900 dark:text-white">{posts.length}</p>
                <p className="text-[11px] text-slate-400">Posts</p>
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
            Follow this account to see their photos, creative vibes, and stories.
          </p>
          <Button variant="gradient" size="sm" onClick={handleFollowToggle}>
            Follow Account
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

          {/* Posts Media Grid */}
          {currentTabPosts.length === 0 ? (
            <div className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center space-y-2">
              <Grid className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No posts in this collection</p>
              <p className="text-xs text-slate-400">When vibes are shared, they will appear right here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {currentTabPosts.map(post => {
                const firstMedia = post.media?.[0]?.media_url;

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-black cursor-pointer shadow-sm"
                  >
                    <img
                      src={firstMedia || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

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

      {/* Selected Post Modal Lightbox */}
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
  );
};
