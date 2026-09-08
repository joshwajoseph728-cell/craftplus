import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, PostMedia, Profile, ProjectCategory } from '../types/database.types';
import { INITIAL_POSTS, CURRENT_DEMO_USER } from '../lib/mockData';

const LOCAL_STORAGE_POSTS = 'vibesphere_posts';
const LOCAL_STORAGE_SAVED = 'vibesphere_saved_post_ids';

const getStoredPosts = (): Post[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_POSTS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_POSTS;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
};

const setStoredPosts = (posts: Post[]) => {
  localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(posts));
};

export const postService = {
  async getFeedPosts(currentUserId?: string, category?: string): Promise<Post[]> {
    let posts: Post[] = [];

    if (!isSupabaseConfigured()) {
      posts = getStoredPosts();
      const savedIds = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED) || '[]');
      posts = posts.map(p => ({
        ...p,
        is_saved: savedIds.includes(p.id)
      }));
    } else {
      try {
        let query = supabase
          .from('posts')
          .select(`
            *,
            user:profiles!user_id(*),
            media:post_media(*),
            likes(user_id),
            saves(user_id)
          `)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        posts = (data || []).map((post: any) => ({
          ...post,
          is_liked: currentUserId ? post.likes?.some((l: any) => l.user_id === currentUserId) : false,
          is_saved: currentUserId ? post.saves?.some((s: any) => s.user_id === currentUserId) : false,
          media: (post.media || []).sort((a: PostMedia, b: PostMedia) => a.display_order - b.display_order)
        }));
      } catch (err) {
        console.error('Error fetching feed posts, fallback to memory:', err);
        posts = getStoredPosts();
      }
    }

    if (category && category !== 'All') {
      return posts.filter(p => p.category === category);
    }
    return posts;
  },

  async getExplorePosts(query?: string, tag?: string, category?: string): Promise<Post[]> {
    const allPosts = await this.getFeedPosts();
    let filtered = allPosts;

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (tag) {
      const formattedTag = tag.replace('#', '').toLowerCase();
      filtered = filtered.filter(p =>
        p.caption.toLowerCase().includes(`#${formattedTag}`) ||
        p.hashtags?.some(h => h.toLowerCase() === formattedTag) ||
        p.tech_stack?.some(t => t.toLowerCase() === formattedTag)
      );
    }
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.caption.toLowerCase().includes(q) ||
        p.project_title?.toLowerCase().includes(q) ||
        p.user.username.toLowerCase().includes(q) ||
        p.user.full_name.toLowerCase().includes(q) ||
        p.tech_stack?.some(t => t.toLowerCase().includes(q)) ||
        p.location?.toLowerCase().includes(q)
      );
    }
    return filtered;
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    const posts = await this.getFeedPosts();
    return posts.filter(p => p.user_id === userId || p.user.id === userId);
  },

  async getSavedPosts(currentUserId: string): Promise<Post[]> {
    const posts = await this.getFeedPosts(currentUserId);
    return posts.filter(p => p.is_saved);
  },

  async getLikedPosts(currentUserId: string): Promise<Post[]> {
    const posts = await this.getFeedPosts(currentUserId);
    return posts.filter(p => p.is_liked);
  },

  async createPost(params: {
    user: Profile;
    project_title?: string;
    category?: ProjectCategory;
    caption: string;
    experience_learnings?: string;
    tech_stack?: string[];
    live_demo_url?: string;
    github_url?: string;
    work_status?: 'Completed' | 'In Progress' | 'Case Study' | 'Concept';
    open_to_collab?: boolean;
    location?: string;
    audience: 'public' | 'followers' | 'private';
    mediaUrls: string[];
    hashtags?: string[];
  }): Promise<{ post: Post | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newPostId = `post-${Date.now()}`;
      const newPost: Post = {
        id: newPostId,
        user_id: params.user.id,
        project_title: params.project_title,
        category: params.category || 'Software & Web',
        caption: params.caption,
        experience_learnings: params.experience_learnings,
        tech_stack: params.tech_stack || [],
        live_demo_url: params.live_demo_url,
        github_url: params.github_url,
        work_status: params.work_status || 'Completed',
        open_to_collab: params.open_to_collab ?? true,
        location: params.location,
        audience: params.audience,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        user: params.user,
        media: params.mediaUrls.map((url, index) => ({
          id: `media-${newPostId}-${index}`,
          post_id: newPostId,
          media_url: url,
          media_type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image',
          display_order: index
        })),
        is_liked: false,
        is_saved: false,
        hashtags: params.hashtags || []
      };

      const existing = getStoredPosts();
      setStoredPosts([newPost, ...existing]);
      return { post: newPost, error: null };
    }

    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: params.user.id,
          project_title: params.project_title,
          category: params.category || 'Software & Web',
          caption: params.caption,
          experience_learnings: params.experience_learnings,
          tech_stack: params.tech_stack,
          live_demo_url: params.live_demo_url,
          github_url: params.github_url,
          work_status: params.work_status || 'Completed',
          open_to_collab: params.open_to_collab ?? true,
          location: params.location || '',
          audience: params.audience
        })
        .select(`*, user:profiles!user_id(*)`)
        .single();

      if (postError) throw postError;

      const mediaInserts = params.mediaUrls.map((url, idx) => ({
        post_id: postData.id,
        media_url: url,
        media_type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image',
        display_order: idx
      }));

      const { data: mediaData, error: mediaError } = await supabase
        .from('post_media')
        .insert(mediaInserts)
        .select();

      if (mediaError) throw mediaError;

      return {
        post: {
          ...postData,
          media: mediaData || [],
          is_liked: false,
          is_saved: false
        },
        error: null
      };
    } catch (err: any) {
      return { post: null, error: err.message || 'Failed to create project post' };
    }
  },

  async toggleLike(postId: string, userId: string, currentlyLiked: boolean): Promise<{ success: boolean; likesCount: number }> {
    if (!isSupabaseConfigured()) {
      const posts = getStoredPosts();
      let updatedCount = 0;
      const updated = posts.map(p => {
        if (p.id === postId) {
          const newLiked = !currentlyLiked;
          const count = newLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1);
          updatedCount = count;
          return { ...p, is_liked: newLiked, likes_count: count };
        }
        return p;
      });
      setStoredPosts(updated);
      return { success: true, likesCount: updatedCount };
    }

    try {
      if (currentlyLiked) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
      }
      return { success: true, likesCount: currentlyLiked ? -1 : 1 };
    } catch (err) {
      console.error('Like toggle error:', err);
      return { success: false, likesCount: 0 };
    }
  },

  async toggleSave(postId: string, userId: string, currentlySaved: boolean): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured()) {
      const savedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED) || '[]');
      let updatedIds: string[];
      if (currentlySaved) {
        updatedIds = savedIds.filter(id => id !== postId);
      } else {
        updatedIds = Array.from(new Set([...savedIds, postId]));
      }
      localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(updatedIds));

      const posts = getStoredPosts();
      setStoredPosts(posts.map(p => p.id === postId ? { ...p, is_saved: !currentlySaved } : p));
      return { success: true };
    }

    try {
      if (currentlySaved) {
        await supabase.from('saves').delete().match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('saves').insert({ post_id: postId, user_id: userId });
      }
      return { success: true };
    } catch (err) {
      console.error('Save toggle error:', err);
      return { success: false };
    }
  },

  async deletePost(postId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const posts = getStoredPosts();
      setStoredPosts(posts.filter(p => p.id !== postId));
      return true;
    }
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      return !error;
    } catch {
      return false;
    }
  }
};
