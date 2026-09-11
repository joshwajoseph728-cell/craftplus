import React, { useState, useEffect, useRef } from 'react';
import { StoryGroup } from '../../types/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { messageService } from '../../services/messageService';
import { storyService } from '../../services/storyService';
import { Avatar } from '../ui/Avatar';
import { formatShortRelativeTime } from '../../lib/utils';
import { X, ChevronLeft, ChevronRight, Send, Trash2, Eye, Pause, Play } from 'lucide-react';

export interface StoryViewerModalProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStoryViewed?: (storyId: string) => void;
  onStoryDeleted?: () => void;
}

const STORY_DURATION_MS = 5000;

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  groups,
  initialGroupIndex,
  isOpen,
  onClose,
  onStoryViewed,
  onStoryDeleted
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const progressInterval = useRef<any>(null);

  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(0);
    setProgress(0);
  }, [initialGroupIndex, isOpen]);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  // Mark viewed
  useEffect(() => {
    if (isOpen && currentStory && onStoryViewed) {
      onStoryViewed(currentStory.id);
    }
  }, [isOpen, currentStory?.id]);

  // Story Progress Timer
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / STORY_DURATION_MS) * 100;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isOpen, currentStory?.id, isPaused, groupIndex, storyIndex]);

  const handleNext = () => {
    setProgress(0);
    if (!currentGroup) return;

    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(prev => prev + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(prev => prev - 1);
      const prevGroup = groups[groupIndex - 1];
      setStoryIndex(Math.max(0, (prevGroup?.stories.length || 1) - 1));
    }
  };

  const handleDeleteStory = async () => {
    if (!currentStory) return;
    const ok = await storyService.deleteStory(currentStory.id);
    if (ok) {
      showToast('Story Deleted', 'Story was deleted', 'info');
      if (onStoryDeleted) onStoryDeleted();
      handleNext();
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentStory || !replyText.trim()) return;

    setIsSendingReply(true);
    try {
      await messageService.sendMessage({
        sender: user,
        receiverId: currentStory.user_id,
        content: `Replied to your story: "${replyText.trim()}"`
      });
      showToast('Reply Sent', 'Direct message sent to creator', 'success');
      setReplyText('');
    } catch {
      showToast('Error', 'Failed to send reply', 'warning');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (!isOpen || !currentGroup || !currentStory) return null;

  const isOwnStory = user?.id === currentStory.user_id;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center select-none">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2 text-white/80 hover:text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story Container */}
      <div className="relative w-full max-w-md h-[88vh] max-h-[750px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Top Progress Segment Bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-1.5">
          {currentGroup.stories.map((s, idx) => {
            let widthPercent = 0;
            if (idx < storyIndex) widthPercent = 100;
            else if (idx === storyIndex) widthPercent = progress;

            return (
              <div
                key={s.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Avatar src={currentStory.user.avatar_url} alt={currentStory.user.full_name} size="sm" isVerified={currentStory.user.is_verified} />
            <div>
              <p className="text-xs font-bold leading-none">{currentStory.user.username}</p>
              <p className="text-[10px] text-white/70 mt-0.5">{formatShortRelativeTime(currentStory.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white/90"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {isOwnStory && (
              <button
                onClick={handleDeleteStory}
                className="p-1.5 rounded-full bg-black/30 hover:bg-rose-600/80 text-white/90"
                title="Delete Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Story Media (Click zones for prev/next) */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={currentStory.media_url}
            alt="Story content"
            className="w-full h-full object-cover"
          />

          {/* Left Click Zone */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-10 cursor-pointer"
          />

          {/* Right Click Zone */}
          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-10 cursor-pointer"
          />

          {/* Text Overlay */}
          {currentStory.caption && (
            <div className="absolute bottom-20 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-center text-white text-sm font-semibold shadow-lg">
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Footer / Reply Bar */}
        <div className="absolute bottom-3 left-4 right-4 z-20">
          {isOwnStory ? (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-black/50 backdrop-blur-md rounded-2xl text-xs font-bold text-white">
              <Eye className="w-4 h-4 text-brand-400" />
              <span>{currentStory.views_count || 1} Views</span>
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${currentStory.user.username}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs placeholder:text-white/60 outline-none focus:border-brand-400"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSendingReply}
                className="p-2.5 rounded-full bg-gradient-to-r from-brand-600 to-pink-600 text-white disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Outer Next / Prev Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

