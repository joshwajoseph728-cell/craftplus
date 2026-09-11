import { useState, useEffect, useCallback } from 'react';
import { StoryGroup } from '../types/database.types';
import { storyService } from '../services/storyService';
import { useAuth } from '../contexts/AuthContext';

export function useStories() {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storyService.getActiveStoryGroups(user?.id);
      setStoryGroups(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const markViewed = async (storyId: string) => {
    if (!user) return;
    await storyService.markStoryViewed(storyId, user.id);
    setStoryGroups(prev =>
      prev.map(g => ({
        ...g,
        stories: g.stories.map(s => s.id === storyId ? { ...s, has_viewed: true } : s),
        hasUnviewed: g.stories.some(s => s.id !== storyId && !s.has_viewed)
      }))
    );
  };

  return {
    storyGroups,
    loading,
    refreshStories: fetchStories,
    markViewed
  };
}

