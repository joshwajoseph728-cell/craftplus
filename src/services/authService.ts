import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database.types';
import { CURRENT_DEMO_USER } from '../lib/mockData';

const LOCAL_STORAGE_KEY_USER = 'vibesphere_active_user';

export const authService = {
  async getInitialUser(): Promise<Profile | null> {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (err) {
      console.error('Error fetching current user:', err);
      return null;
    }
  },

  async signUp(params: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    date_of_birth?: string;
    avatar_url?: string;
  }): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const cleanUsername = params.username.toLowerCase().trim();
      const newUser: Profile = {
        id: `user-${cleanUsername}`,
        username: cleanUsername,
        full_name: params.full_name.trim(),
        avatar_url: params.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        bio: 'Creator & Builder on CraftPlus âœ¨',
        website: '',
        location: '',
        date_of_birth: params.date_of_birth,
        is_private: false,
        is_verified: false,
        role: 'user',
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newUser));
      return { user: newUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            username: params.username.toLowerCase().trim(),
            full_name: params.full_name.trim(),
            avatar_url: params.avatar_url || '',
            date_of_birth: params.date_of_birth,
            role: 'user'
          }
        }
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Registration failed' };

      // Ensure profile row exists and update
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: params.username.toLowerCase().trim(),
            full_name: params.full_name.trim(),
            avatar_url: params.avatar_url || '',
            role: 'user',
            is_online: true,
            last_seen_at: new Date().toISOString()
          })
          .select()
          .single();
        profile = newProf;
      } else {
        await supabase
          .from('profiles')
          .update({ is_online: true, last_seen_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      // Record audit signup in Supabase
      try {
        await supabase.from('auth_logs').insert({
          user_id: data.user.id,
          event_type: 'signup',
          email: params.email,
          created_at: new Date().toISOString()
        });
      } catch {
        // Table created optionally by user SQL migration
      }

      return { user: profile as Profile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Signup failed' };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g, '_');
      const userProfile: Profile = {
        id: `user-${username}`,
        username: username,
        full_name: username.replace(/[_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        bio: 'Creator & Builder on CraftPlus âœ¨',
        website: '',
        location: '',
        is_private: false,
        is_verified: false,
        role: 'user',
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(userProfile));
      return { user: userProfile, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Sign in failed' };

      // Update Supabase profile status to online with current timestamp
      await supabase
        .from('profiles')
        .update({
          is_online: true,
          last_seen_at: new Date().toISOString()
        })
        .eq('id', data.user.id);

      // Record audit login event in Supabase
      try {
        await supabase.from('auth_logs').insert({
          user_id: data.user.id,
          event_type: 'login',
          email,
          created_at: new Date().toISOString()
        });
      } catch {
        // Silent catch if auth_logs table is not yet migrated
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) return { user: null, error: profileError.message };
      return { user: profile as Profile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Sign in failed' };
    }
  },

  async signOut(userId?: string): Promise<void> {
    const activeStored = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    const storedUser = activeStored ? JSON.parse(activeStored) : null;
    const targetId = userId || storedUser?.id;

    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);

    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = targetId || session?.user?.id;

        if (currentUserId) {
          // Update profile in Supabase to offline
          await supabase
            .from('profiles')
            .update({
              is_online: false,
              last_seen_at: new Date().toISOString()
            })
            .eq('id', currentUserId);

          // Record audit logout event in Supabase
          await supabase.from('auth_logs').insert({
            user_id: currentUserId,
            event_type: 'logout',
            created_at: new Date().toISOString()
          });
        }
      } catch {
        // Continue with signOut
      }
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send reset link' };
    }
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed' };
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const current = (await this.getInitialUser()) || CURRENT_DEMO_USER;
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(updated));
      return { profile: updated, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) return { profile: null, error: error.message };
      return { profile: data as Profile, error: null };
    } catch (err: any) {
      return { profile: null, error: err.message || 'Profile update failed' };
    }
  }
};

