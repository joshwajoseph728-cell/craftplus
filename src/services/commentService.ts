import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Comment, Profile } from '../types/database.types';

const LOCAL_STORAGE_COMMENTS = 'vibesphere_comments';

const INITIAL_MOCK_COMMENTS: Record<string, Comment[]> = {};

const getStoredComments = (postId: string): Comment[] => {
  const stored = localStorage.getItem(`${LOCAL_STORAGE_COMMENTS}_${postId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_COMMENTS[postId] || [];
    }
  }
  return INITIAL_MOCK_COMMENTS[postId] || [];
};

const setStoredComments = (postId: string, comments: Comment[]) => {
  localStorage.setItem(`${LOCAL_STORAGE_COMMENTS}_${postId}`, JSON.stringify(comments));
};

export const commentService = {
  async getComments(postId: string, currentUserId?: string): Promise<Comment[]> {
    if (!isSupabaseConfigured()) {
      return getStoredComments(postId);
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles!user_id(*),
          comment_likes(user_id)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Structure into parent comments + nested replies
      const all: Comment[] = (data || []).map((c: any) => ({
        ...c,
        is_liked: currentUserId ? c.comment_likes?.some((l: any) => l.user_id === currentUserId) : false,
        replies: []
      }));

      const roots: Comment[] = [];
      const map = new Map<string, Comment>();

      all.forEach(c => map.set(c.id, c));
      all.forEach(c => {
        if (c.parent_comment_id && map.has(c.parent_comment_id)) {
          const parent = map.get(c.parent_comment_id)!;
          parent.replies = parent.replies || [];
          parent.replies.push(c);
        } else {
          roots.push(c);
        }
      });

      return roots;
    } catch (err) {
      console.error('Error loading comments from Supabase:', err);
      return getStoredComments(postId);
    }
  },

  async addComment(params: {
    postId: string;
    user: Profile;
    content: string;
    parentCommentId?: string;
  }): Promise<{ comment: Comment | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        user_id: params.user.id,
        post_id: params.postId,
        parent_comment_id: params.parentCommentId || null,
        content: params.content.trim(),
        likes_count: 0,
        created_at: new Date().toISOString(),
        user: params.user,
        is_liked: false,
        replies: []
      };

      const existing = getStoredComments(params.postId);
      if (params.parentCommentId) {
        const updated = existing.map(parent => {
          if (parent.id === params.parentCommentId) {
            return {
              ...parent,
              replies: [...(parent.replies || []), newComment]
            };
          }
          return parent;
        });
        setStoredComments(params.postId, updated);
      } else {
        setStoredComments(params.postId, [...existing, newComment]);
      }

      return { comment: newComment, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: params.postId,
          user_id: params.user.id,
          parent_comment_id: params.parentCommentId || null,
          content: params.content.trim()
        })
        .select(`*, user:profiles!user_id(*)`)
        .single();

      if (error) throw error;
      return { comment: { ...data, replies: [], is_liked: false }, error: null };
    } catch (err: any) {
      return { comment: null, error: err.message || 'Failed to add comment' };
    }
  },

  async deleteComment(postId: string, commentId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const comments = getStoredComments(postId);
      const filtered = comments.filter(c => c.id !== commentId).map(c => ({
        ...c,
        replies: (c.replies || []).filter(r => r.id !== commentId)
      }));
      setStoredComments(postId, filtered);
      return true;
    }

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      return !error;
    } catch {
      return false;
    }
  }
};

