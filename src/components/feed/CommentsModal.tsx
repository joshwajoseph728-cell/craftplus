import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment } from '../../types/database.types';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatShortRelativeTime } from '../../lib/utils';
import { Heart, Reply, Trash2, Send, CornerDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface CommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && post) {
      loadComments();
    }
  }, [isOpen, post?.id]);

  const loadComments = async () => {
    if (!post) return;
    setLoading(true);
    try {
      const data = await commentService.getComments(post.id, user?.id);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication Required', 'Please sign in to comment', 'warning');
      return;
    }
    if (!commentText.trim() || !post) return;

    setIsSubmitting(true);
    try {
      const { comment, error } = await commentService.addComment({
        postId: post.id,
        user,
        content: commentText.trim(),
        parentCommentId: replyingTo?.id
      });

      if (error || !comment) throw new Error(error || 'Failed to post comment');

      setCommentText('');
      setReplyingTo(null);
      await loadComments();
      if (onCommentAdded) onCommentAdded();
      showToast('Comment Added', 'Your comment has been posted', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to post comment', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    const ok = await commentService.deleteComment(post.id, commentId);
    if (ok) {
      await loadComments();
      showToast('Deleted', 'Comment removed', 'info');
    }
  };

  const handleStartReply = (targetComment: Comment) => {
    setReplyingTo(targetComment);
    setCommentText(`@${targetComment.user.username} `);
    inputRef.current?.focus();
  };

  if (!post) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conversation & Comments"
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[70vh] flex flex-col">
        {/* Post Caption Preview */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          <Avatar src={post.user.avatar_url} alt={post.user.username} size="sm" isVerified={post.user.is_verified} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white">@{post.user.username}</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{post.caption}</p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[220px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-xs text-slate-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No comments yet</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map(c => {
              const isOwnComment = user?.id === c.user_id;

              return (
                <div key={c.id} className="space-y-3">
                  {/* Root Comment */}
                  <div className="flex items-start gap-3 group">
                    <Link to={`/profile/${c.user.username}`}>
                      <Avatar src={c.user.avatar_url} alt={c.user.username} size="sm" isVerified={c.user.is_verified} />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="bg-slate-100/80 dark:bg-slate-800/70 p-3 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <Link to={`/profile/${c.user.username}`} className="text-xs font-bold hover:underline text-slate-900 dark:text-white">
                            @{c.user.username}
                          </Link>
                          <span className="text-[10px] text-slate-400">{formatShortRelativeTime(c.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-1.5 ml-2 text-[11px] font-semibold text-slate-500">
                        <button
                          onClick={() => handleStartReply(c)}
                          className="hover:text-brand-500 flex items-center gap-1"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Reply</span>
                        </button>

                        {isOwnComment && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="hover:text-rose-500 text-slate-400 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {c.replies && c.replies.length > 0 && (
                    <div className="pl-8 space-y-2.5 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                      {c.replies.map(reply => (
                        <div key={reply.id} className="flex items-start gap-2.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                          <Link to={`/profile/${reply.user.username}`}>
                            <Avatar src={reply.user.avatar_url} alt={reply.user.username} size="xs" isVerified={reply.user.is_verified} />
                          </Link>
                          <div className="flex-1 bg-slate-100/60 dark:bg-slate-800/50 p-2.5 rounded-xl">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                                @{reply.user.username}
                              </span>
                              <span className="text-[10px] text-slate-400">{formatShortRelativeTime(reply.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-semibold">
              <span>Replying to @{replyingTo.user.username}</span>
              <button onClick={() => setReplyingTo(null)} className="hover:underline">Cancel</button>
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment... Type @ to mention"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-brand-500"
            />
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={!commentText.trim() || isSubmitting}
              isLoading={isSubmitting}
              className="h-9 px-3 rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

