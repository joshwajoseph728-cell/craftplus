import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Story, StoryGroup, Profile } from '../types/database.types';
import { INITIAL_STORIES } from '../lib/mockData';

const LOCAL_STORAGE_STORIES = 'vibesphere_stories';

const getStoredStories = (): Story[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_STORIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_STORIES;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_STORIES, JSON.stringify(INITIAL_STORIES));
  return INITIAL_STORIES;
};

const setStoredStories = (stories: Story[]) => {
  localStorage.setItem(LOCAL_STORAGE_STORIES, JSON.stringify(stories));
};

export const storyService = {
  async getActiveStoryGroups(currentUserId?: string): Promise<StoryGroup[]> {
    let stories: Story[] = [];

    if (!isSupabaseConfigured()) {
      const now = new Date().getTime();
      stories = getStoredStories().filter(s => new Date(s.expires_at).getTime() > now);
    } else {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            user:profiles!user_id(*),
            story_views(viewer_id)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        stories = (data || []).map((s: any) => ({
          ...s,
          has_viewed: currentUserId ? s.story_views?.some((v: any) => v.viewer_id === currentUserId) : false,
          views_count: s.story_views?.length || 0
        }));
      } catch (err) {
        console.error('Error loading stories from Supabase:', err);
        stories = getStoredStories();
      }
    }

    // Group by User
    const groupMap = new Map<string, StoryGroup>();
    stories.forEach(story => {
      const uId = story.user.id;
      if (!groupMap.has(uId)) {
        groupMap.set(uId, {
          user: story.user,
          stories: [],
          hasUnviewed: false
        });
      }
      const group = groupMap.get(uId)!;
      group.stories.push(story);
      if (!story.has_viewed && story.user.id !== currentUserId) {
        group.hasUnviewed = true;
      }
    });

    return Array.from(groupMap.values());
  },

  async createStory(params: {
    user: Profile;
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    caption?: string;
  }): Promise<{ story: Story | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newStory: Story = {
        id: `story-${Date.now()}`,
        user_id: params.user.id,
        media_url: params.mediaUrl,
        media_type: params.mediaType || 'image',
        caption: params.caption || '',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 3600000).toISOString(),
        user: params.user,
        views_count: 0,
        has_viewed: false
      };

      const existing = getStoredStories();
      setStoredStories([newStory, ...existing]);
      return { story: newStory, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: params.user.id,
          media_url: params.mediaUrl,
          media_type: params.mediaType || 'image',
          caption: params.caption || '',
          expires_at: new Date(Date.now() + 24 * 3600000).toISOString()
        })
        .select(`*, user:profiles!user_id(*)`)
        .single();

      if (error) throw error;
      return { story: data as Story, error: null };
    } catch (err: any) {
      return { story: null, error: err.message || 'Failed to post story' };
    }
  },

  async markStoryViewed(storyId: string, viewerId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const stories = getStoredStories();
      const updated = stories.map(s => s.id === storyId ? { ...s, has_viewed: true, views_count: (s.views_count || 0) + 1 } : s);
      setStoredStories(updated);
      return;
    }

    try {
      await supabase.from('story_views').insert({ story_id: storyId, viewer_id: viewerId });
    } catch (err) {
      // Ignore duplicate view record errors
    }
  },

  async deleteStory(storyId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      const stories = getStoredStories();
      setStoredStories(stories.filter(s => s.id !== storyId));
      return true;
    }

    try {
      const { error } = await supabase.from('stories').delete().eq('id', storyId);
      return !error;
    } catch {
      return false;
    }
  }
};

