import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Hashtag } from '../types/database.types';
import { INITIAL_HASHTAGS } from '../lib/mockData';

const LOCAL_STORAGE_PROFILES = 'vibesphere_profiles';
const LOCAL_STORAGE_FOLLOWS = 'vibesphere_follows';

export const getStoredProfiles = (): Profile[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveToStoredProfiles = (profile: Profile) => {
  if (!profile || !profile.id) return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES);
    let profiles: Profile[] = raw ? JSON.parse(raw) : [];
    profiles = profiles.filter(p => p.id !== profile.id && p.username.toLowerCase() !== profile.username.toLowerCase());
    profiles.unshift(profile);
    localStorage.setItem(LOCAL_STORAGE_PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error('Error saving profile to storage:', err);
  }
};

export const profileService = {
  async getProfileByUsername(username: string, currentUserId?: string): Promise<Profile | null> {
    const cleanUsername = username.replace('@', '').toLowerCase().trim();

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

      if (error || !data) {
        // Fallback to local storage
        const profiles = getStoredProfiles();
        const profile = profiles.find(p => p.username.toLowerCase() === cleanUsername);
        return profile || null;
      }

      saveToStoredProfiles(data as Profile);

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
      const profiles = getStoredProfiles();
      return profiles.find(p => p.username.toLowerCase() === cleanUsername) || null;
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
    const localProfiles = getStoredProfiles();

    if (!q) {
      return {
        users: localProfiles.slice(0, 6),
        hashtags: INITIAL_HASHTAGS.slice(0, 6)
      };
    }

    const matchingLocal = localProfiles.filter(p =>
      p.username.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q) ||
      (p.skills && p.skills.some(s => s.toLowerCase().includes(q))) ||
      (p.headline && p.headline.toLowerCase().includes(q)) ||
      (p.bio && p.bio.toLowerCase().includes(q))
    );

    if (!isSupabaseConfigured()) {
      const hashtags = INITIAL_HASHTAGS.filter(h => h.name.toLowerCase().includes(q));
      return { users: matchingLocal, hashtags };
    }

    try {
      const [usersRes, tagsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%,headline.ilike.%${q}%,bio.ilike.%${q}%`)
          .limit(25),
        supabase
          .from('hashtags')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(10)
      ]);

      const map = new Map<string, Profile>();
      (usersRes.data || []).forEach((u: Profile) => {
        map.set(u.id, u);
        saveToStoredProfiles(u);
      });
      matchingLocal.forEach((u: Profile) => map.set(u.id, u));

      return {
        users: Array.from(map.values()),
        hashtags: (tagsRes.data || []) as Hashtag[]
      };
    } catch (err) {
      console.error('Error during search:', err);
      return { users: matchingLocal, hashtags: [] };
    }
  },

  async getSuggestedUsers(currentUserId?: string): Promise<Profile[]> {
    const local = getStoredProfiles().filter(p => p.id !== currentUserId);

    if (!isSupabaseConfigured()) {
      return local.slice(0, 8);
    }

    try {
      let query = supabase.from('profiles').select('*').limit(15);
      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return local.slice(0, 8);
      }

      const map = new Map<string, Profile>();
      (data as Profile[]).forEach(p => {
        map.set(p.id, p);
        saveToStoredProfiles(p);
      });
      local.forEach(p => map.set(p.id, p));

      return Array.from(map.values()).slice(0, 8);
    } catch {
      return local.slice(0, 8);
    }
  }
};

