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
          return CURRENT_DEMO_USER;
        }
      }
      return CURRENT_DEMO_USER;
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
      const newUser: Profile = {
        id: `user-${Date.now()}`,
        username: params.username.toLowerCase().trim(),
        full_name: params.full_name.trim(),
        avatar_url: params.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        bio: 'Just joined VibeSphere! ✨',
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

      // Allow trigger a moment or fetch directly
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { user: profile as Profile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Signup failed' };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      // In demo mode, sign in Jordan Hayes or mock user
      const demoUser = {
        ...CURRENT_DEMO_USER,
        username: email.split('@')[0] || CURRENT_DEMO_USER.username
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(demoUser));
      return { user: demoUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Sign in failed' };

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

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      return;
    }
    await supabase.auth.signOut();
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
