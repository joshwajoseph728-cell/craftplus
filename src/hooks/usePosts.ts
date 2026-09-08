import { useState, useEffect, useCallback } from 'react';
import { Post } from '../types/database.types';
import { postService } from '../services/postService';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import confetti from 'canvas-confetti';

export function usePosts() {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getFeedPosts(user?.id);
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleToggleLike = async (post: Post) => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to like posts', 'warning');
      return;
    }

    const currentlyLiked = !!post.is_liked;
    const nextLiked = !currentlyLiked;
    const countDelta = nextLiked ? 1 : -1;

    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            is_liked: nextLiked,
            likes_count: Math.max(0, p.likes_count + countDelta)
          };
        }
        return p;
      })
    );

    if (nextLiked) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#ec4899', '#f43f5e']
        });
      } catch {}
    }

    const { success } = await postService.toggleLike(post.id, user.id, currentlyLiked);
    if (!success) {
      // Revert if failed
      setPosts(prev =>
        prev.map(p => {
          if (p.id === post.id) {
            return {
              ...p,
              is_liked: currentlyLiked,
              likes_count: Math.max(0, p.likes_count - countDelta)
            };
          }
          return p;
        })
      );
      showToast('Error', 'Failed to update like status', 'warning');
    }
  };

  const handleToggleSave = async (post: Post) => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in to save posts', 'warning');
      return;
    }

    const currentlySaved = !!post.is_saved;
    const nextSaved = !currentlySaved;

    // Optimistic update
    setPosts(prev =>
      prev.map(p => (p.id === post.id ? { ...p, is_saved: nextSaved } : p))
    );

    showToast(
      nextSaved ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
      nextSaved ? 'You can review this anytime in your profile' : 'Post unsaved',
      'success'
    );

    const { success } = await postService.toggleSave(post.id, user.id, currentlySaved);
    if (!success) {
      // Revert
      setPosts(prev =>
        prev.map(p => (p.id === post.id ? { ...p, is_saved: currentlySaved } : p))
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    const success = await postService.deletePost(postId);
    if (success) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Post Deleted', 'Your post has been removed successfully', 'info');
    } else {
      showToast('Error', 'Failed to delete post', 'warning');
    }
    return success;
  };

  const addOptimisticPost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return {
    posts,
    loading,
    error,
    refreshPosts: fetchPosts,
    toggleLike: handleToggleLike,
    toggleSave: handleToggleSave,
    deletePost: handleDeletePost,
    addOptimisticPost
  };
}
