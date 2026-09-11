import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Post } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { CommentsModal } from './CommentsModal';
import { ShareModal } from './ShareModal';
import { ReportModal } from './ReportModal';
import { CollabRequestModal } from '../collaboration/CollabRequestModal';
import { Modal } from '../ui/Modal';
import { formatRelativeTime, formatCompactNumber } from '../../lib/utils';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trash2,
  ShieldAlert,
  EyeOff,
  Copy,
  ExternalLink,
  Github,
  Code2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Layers,
  Send,
  HelpCircle,
  AlertTriangle,
  Award,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PostCardProps {
  post: Post;
  onToggleLike: (post: Post) => void;
  onToggleSave: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onPostUpdated?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onToggleLike,
  onToggleSave,
  onDeletePost,
  onPostUpdated
}) => {
  const { user } = useAuth();
  const { setActiveUser } = useChat();
  const navigate = useNavigate();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastTapRef = useRef<number>(0);

  if (isHidden) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500 mb-6">
        <span>Post hidden from your feed.</span>{' '}
        <button onClick={() => setIsHidden(false)} className="font-bold text-brand-500 hover:underline">
          Undo
        </button>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id || user?.id === post.user?.id;
  const isAdmin = user?.role === 'admin';
  const mediaList = post.media || [];
  const currentMedia = mediaList[activeMediaIndex];

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.is_liked) {
        onToggleLike(post);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  };

  const moreItems: DropdownItem[] = [
    {
      id: 'why',
      label: 'Why am I seeing this?',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: () => setShowWhyModal(true)
    },
    {
      id: 'share',
      label: 'Share Project',
      icon: <Share2 className="w-4 h-4" />,
      onClick: () => setIsShareOpen(true)
    },
    {
      id: 'copy',
      label: 'Copy Project Link',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
      }
    },
    {
      id: 'hide',
      label: 'Hide from Feed',
      icon: <EyeOff className="w-4 h-4" />,
      onClick: () => setIsHidden(true)
    }
  ];

  if (isOwner || isAdmin) {
    moreItems.push({
      id: 'delete',
      label: 'Delete Work Showcase',
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        if (confirm('Are you sure you want to permanently delete this project?')) {
          if (onDeletePost) onDeletePost(post.id);
        }
      }
    });
  } else {
    moreItems.push({
      id: 'report',
      label: 'Report Content',
      icon: <ShieldAlert className="w-4 h-4" />,
      danger: true,
      onClick: () => setIsReportOpen(true)
    });
  }

  return (
    <>
      <article className="bg-white dark:bg-surface-cardDark border border-slate-200/80 dark:border-slate-800/80 rounded-3xl mb-6 shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700/80">
        {/* Creator Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/profile/${post.user.username}`}>
              <Avatar
                src={post.user.avatar_url}
                alt={post.user.full_name || post.user.username}
                size="md"
                isVerified={post.user.is_verified}
              />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/profile/${post.user.username}`}
                  className="font-bold text-xs md:text-sm text-slate-900 dark:text-white hover:underline truncate"
                >
                  {post.user.full_name}
                </Link>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-[11px] text-slate-400">
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{post.user.username}</p>
                {post.location && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                    {post.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {post.challenge_badge && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Award className="w-3 h-3 text-amber-500" />
                <span>{post.challenge_badge}</span>
              </span>
            )}

            {post.category && (
              <Badge variant="brand" size="sm" className="hidden sm:inline-flex">
                {post.category}
              </Badge>
            )}

            <Dropdown
              trigger={
                <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              }
              items={moreItems}
            />
          </div>
        </div>

        {/* Project Title Banner */}
        {post.project_title && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-transparent border-y border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {post.project_title}
              </h3>
            </div>
            {post.work_status && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                {post.work_status}
              </span>
            )}
          </div>
        )}

        {/* Media Container */}
        {mediaList.length > 0 && (
          <div
            className="relative w-full aspect-[16/10] bg-black flex items-center justify-center select-none overflow-hidden cursor-pointer"
            onClick={handleDoubleTap}
          >
            {currentMedia?.media_type === 'video' ? (
              <video
                src={currentMedia.media_url}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentMedia?.media_url}
                alt={currentMedia?.alt_text || post.project_title || 'Work media'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}

            {/* Heart burst */}
            {showHeartBurst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-like-bounce z-20">
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-xl" />
              </div>
            )}

            {/* Slider Arrows */}
            {mediaList.length > 1 && (
              <>
                {activeMediaIndex > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex(prev => prev - 1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {activeMediaIndex < mediaList.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMediaIndex(prev => prev + 1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                  {mediaList.map((_, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-all',
                        activeMediaIndex === idx ? 'w-3 bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Project Links & Tech Stack Bar */}
        {(post.tech_stack?.length || post.live_demo_url || post.github_url) && (
          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
            {/* Tech Stack Pills */}
            {post.tech_stack && post.tech_stack.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <Code2 className="w-3 h-3 text-brand-500" />
                  <span>Stack:</span>
                </span>
                {post.tech_stack.map(tech => (
                  <span
                    key={tech}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Clickable Links & Collab Button */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {post.live_demo_url && (
                <a
                  href={post.live_demo_url.startsWith('http') ? post.live_demo_url : `https://${post.live_demo_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Demo</span>
                </a>
              )}

              {post.github_url && (
                <a
                  href={post.github_url.startsWith('http') ? post.github_url : `https://${post.github_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source Code</span>
                </a>
              )}

              {!isOwner && post.open_to_collab && (
                <button
                  type="button"
                  onClick={() => setIsCollabModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/25 transition-colors ml-auto"
                >
                  <Users className="w-3.5 h-3.5 text-brand-500" />
                  <span>Collaborate</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => onToggleLike(post)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90',
                  post.is_liked
                    ? 'text-rose-500'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
                )}
                title="Like Project"
              >
                <Heart className={cn('w-5 h-5', post.is_liked && 'fill-rose-500 animate-like-bounce')} />
                <span>{formatCompactNumber(post.likes_count)}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
                title="Feedback & Comments"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{formatCompactNumber(post.comments_count)}</span>
              </button>

              {/* Direct Message / Send to Creator */}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/auth/login');
                    return;
                  }
                  setActiveUser(post.user);
                  navigate('/messages');
                }}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
                title="Send Direct Message (DM)"
              >
                <Send className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
                title="Share Project"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onToggleSave(post)}
              className={cn(
                'p-1 transition-all active:scale-90',
                post.is_saved
                  ? 'text-brand-500'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-500'
              )}
              title="Bookmark Work"
            >
              <Bookmark className={cn('w-5 h-5', post.is_saved && 'fill-brand-500')} />
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              <Link to={`/profile/${post.user.username}`} className="font-bold mr-1.5 hover:underline">
                {post.user.username}
              </Link>
              <span>{post.caption}</span>
            </div>
          )}

          {/* Contributors Bar if set */}
          {post.contributors && post.contributors.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Co-Builders:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {post.contributors.map(c => (
                  <Link
                    key={c.id}
                    to={`/profile/${c.username}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
                  >
                    <Avatar src={c.avatar_url} alt={c.full_name} size="xs" />
                    <span>{c.full_name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Case Study / Experience Learnings */}
          {post.experience_learnings && (
            <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 dark:bg-brand-500/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowExperience(!showExperience)}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-brand-500" />
                  <span>Key Learnings & Challenges Overcome</span>
                </div>
                {showExperience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExperience && (
                <div className="p-3.5 pt-0 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-brand-500/15 whitespace-pre-wrap">
                  {post.experience_learnings}
                </div>
              )}
            </div>
          )}

          {/* Comments shortcut */}
          {post.comments_count > 0 && (
            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium block"
            >
              View feedback ({post.comments_count})
            </button>
          )}
        </div>
      </article>

      {/* Modals */}
      <CommentsModal
        post={post}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onCommentAdded={onPostUpdated}
      />

      <ShareModal
        post={post}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <ReportModal
        postId={post.id}
        reportedUserId={post.user_id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Collaboration Proposal Modal */}
      <CollabRequestModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        targetUser={post.user}
        project={post}
      />

      {/* Why Am I Seeing This Modal */}
      {showWhyModal && (
        <Modal
          isOpen={showWhyModal}
          onClose={() => setShowWhyModal(false)}
          title="Why am I seeing this?"
          description="CraftPlus Feed Transparency & Skill Match"
          maxWidth="sm"
        >
          <div className="space-y-3 py-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 space-y-1">
              <p className="font-bold text-brand-600 dark:text-brand-400">Recommendation Signal:</p>
              <p>{post.recommendation_reason || 'Trending in creator categories matching your followed topics and skills.'}</p>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              CraftPlus prioritizes high-quality engineering case studies, open-source repositories, and interactive design prototypes from active creators in your community.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

