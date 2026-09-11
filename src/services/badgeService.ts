import { Badge, Profile, Post } from '../types/database.types';
import { INITIAL_BADGES } from '../lib/mockData';

export const badgeService = {
  /**
   * Computes unlocked achievements and badges for a given creator
   */
  calculateUserBadges(profile: Profile, posts: Post[]): Badge[] {
    const unlocked: Badge[] = [...(profile.badges || [])];
    const unlockedIds = new Set(unlocked.map(b => b.id));

    // First Project Badge
    if (posts.length >= 1 && !unlockedIds.has('badge-first-project')) {
      unlocked.push({
        ...INITIAL_BADGES[0],
        unlocked_at: posts[posts.length - 1]?.created_at
      });
      unlockedIds.add('badge-first-project');
    }

    // 10 Projects Master
    if (posts.length >= 10 && !unlockedIds.has('badge-10-projects')) {
      unlocked.push({
        ...INITIAL_BADGES[1],
        unlocked_at: new Date().toISOString()
      });
      unlockedIds.add('badge-10-projects');
    }

    // Rising Creator (Total likes > 250)
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    if (totalLikes >= 250 && !unlockedIds.has('badge-rising-creator')) {
      unlocked.push({
        ...INITIAL_BADGES[2],
        unlocked_at: new Date().toISOString()
      });
      unlockedIds.add('badge-rising-creator');
    }

    // Top Creator (Verified profile or admin)
    if (profile.is_verified && !unlockedIds.has('badge-top-creator')) {
      unlocked.push({
        ...INITIAL_BADGES[5],
        unlocked_at: profile.created_at
      });
      unlockedIds.add('badge-top-creator');
    }

    // Community Builder
    const hasCollabs = posts.some(p => (p.contributors && p.contributors.length > 0) || p.open_to_collab);
    if (hasCollabs && !unlockedIds.has('badge-community-builder')) {
      unlocked.push({
        ...INITIAL_BADGES[4],
        unlocked_at: new Date().toISOString()
      });
      unlockedIds.add('badge-community-builder');
    }

    return unlocked;
  },

  getAllAvailableBadges(): Badge[] {
    return INITIAL_BADGES;
  }
};

