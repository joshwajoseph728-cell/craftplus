import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Hashtag } from '../types/database.types';
import { INITIAL_PROFILES, CURRENT_DEMO_USER, INITIAL_HASHTAGS } from '../lib/mockData';

const LOCAL_STORAGE_PROFILES = 'vibesphere_profiles';
const LOCAL_STORAGE_FOLLOWS = 'vibesphere_follows';

const getStoredProfiles = (): Profile[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [CURRENT_DEMO_USER, ...INITIAL_PROFILES];
    }
  }
  const initial = [CURRENT_DEMO_USER, ...INITIAL_PROFILES];
  localStorage.setItem(LOCAL_STORAGE_PROFILES, JSON.stringify(initial));
  return initial;
};

export const profileService = {
  async getProfileByUsername(username: string, currentUserId?: string): Promise<Profile | null> {
    const cleanUsername = username.replace('@', '').toLowerCase();

    if (!isSupabaseConfigured()) {
      const profiles = getStoredProfiles();
      const profile = profiles.find(p => p.username.toLowerCase() === cleanUsername);
      if (!profile) return null;

      // check follow status
      const follows: { follower_id: string; following_id: string; status: 'active' | 'pending' }[] =
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_FOLLOWS) || '[]');

      const followEntry = currentUserId ? follows.find(f => f.follower_id === currentUserId && f.following_id === profile.id) : null;

      return {
        ...profile,
        is_following: followEntry?.status === 'active',
        follow_status: followEntry ? followEntry.status : 'none'
      };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          followers:follows!following_id(follower_id, status),
          following:follows!follower_id(following_id, status)
        `)
        .ilike('username', cleanUsername)
        .single();

      if (error || !data) return null;

      const activeFollowers = (data.followers || []).filter((f: any) => f.status === 'active');
      const activeFollowing = (data.following || []).filter((f: any) => f.status === 'active');
      const myFollow = currentUserId ? (data.followers || []).find((f: any) => f.follower_id === currentUserId) : null;

      return {
        ...data,
        followers_count: activeFollowers.length,
        following_count: activeFollowing.length,
        is_following: myFollow?.status === 'active',
        follow_status: myFollow ? myFollow.status : 'none'
      };
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  },

  async toggleFollow(
    followerId: string,
    targetUser: Profile,
    currentStatus: 'none' | 'active' | 'pending'
  ): Promise<{ status: 'none' | 'active' | 'pending'; followersCountDelta: number }> {
    if (!isSupabaseConfigured()) {
      const follows: { follower_id: string; following_id: string; status: 'active' | 'pending' }[] =
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_FOLLOWS) || '[]');

      let nextStatus: 'none' | 'active' | 'pending' = 'none';
      let delta = 0;

      if (currentStatus === 'active' || currentStatus === 'pending') {
        const filtered = follows.filter(f => !(f.follower_id === followerId && f.following_id === targetUser.id));
        localStorage.setItem(LOCAL_STORAGE_FOLLOWS, JSON.stringify(filtered));
        nextStatus = 'none';
        delta = currentStatus === 'active' ? -1 : 0;
      } else {
        const statusToSet = targetUser.is_private ? 'pending' : 'active';
        follows.push({ follower_id: followerId, following_id: targetUser.id, status: statusToSet });
        localStorage.setItem(LOCAL_STORAGE_FOLLOWS, JSON.stringify(follows));
        nextStatus = statusToSet;
        delta = statusToSet === 'active' ? 1 : 0;
      }

      return { status: nextStatus, followersCountDelta: delta };
    }

    try {
      if (currentStatus === 'active' || currentStatus === 'pending') {
        await supabase.from('follows').delete().match({ follower_id: followerId, following_id: targetUser.id });
        return { status: 'none', followersCountDelta: currentStatus === 'active' ? -1 : 0 };
      } else {
        const statusToSet = targetUser.is_private ? 'pending' : 'active';
        await supabase.from('follows').insert({
          follower_id: followerId,
          following_id: targetUser.id,
          status: statusToSet
        });
        return { status: statusToSet, followersCountDelta: statusToSet === 'active' ? 1 : 0 };
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      return { status: currentStatus, followersCountDelta: 0 };
    }
  },

  async searchUsersAndHashtags(query: string): Promise<{ users: Profile[]; hashtags: Hashtag[] }> {
    const q = query.toLowerCase().trim().replace(/^[@#]/, '');
    if (!q) {
      return {
        users: INITIAL_PROFILES.slice(0, 4),
        hashtags: INITIAL_HASHTAGS.slice(0, 6)
      };
    }

    if (!isSupabaseConfigured()) {
      const allProfiles = getStoredProfiles();
      const users = allProfiles.filter(p =>
        p.username.toLowerCase().includes(q) ||
        p.full_name.toLowerCase().includes(q)
      );
      const hashtags = INITIAL_HASHTAGS.filter(h => h.name.toLowerCase().includes(q));
      return { users, hashtags };
    }

    try {
      const [usersRes, tagsRes] = await Promise.all([
        supabase.from('profiles').select('*').or(`username.ilike.%${q}%,full_name.ilike.%${q}%`).limit(10),
        supabase.from('hashtags').select('*').ilike('name', `%${q}%`).limit(10)
      ]);

      return {
        users: (usersRes.data || []) as Profile[],
        hashtags: (tagsRes.data || []) as Hashtag[]
      };
    } catch (err) {
      console.error('Error during search:', err);
      return { users: [], hashtags: [] };
    }
  },

  async getSuggestedUsers(currentUserId?: string): Promise<Profile[]> {
    if (!isSupabaseConfigured()) {
      const all = getStoredProfiles();
      return all.filter(p => p.id !== currentUserId).slice(0, 8);
    }

    try {
      let query = supabase.from('profiles').select('*').limit(8);
      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return INITIAL_PROFILES.filter(p => p.id !== currentUserId).slice(0, 6);
      }
      return data as Profile[];
    } catch {
      return INITIAL_PROFILES.filter(p => p.id !== currentUserId).slice(0, 6);
    }
  }
};

