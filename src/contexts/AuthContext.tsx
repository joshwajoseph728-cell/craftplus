import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '../types/database.types';
import { authService } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    date_of_birth?: string;
    avatar_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const loadUser = async () => {
    setLoading(true);
    try {
      const activeUser = await authService.getInitialUser();
      setUser(activeUser);
    } catch (err) {
      console.error('Error in AuthProvider loadUser:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (data) setUser(data as Profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const { user: loggedIn, error } = await authService.signIn(email, pass);
    if (error) return { success: false, error };
    setUser(loggedIn);
    return { success: true };
  };

  const signup = async (params: {
    email: string;
    password: string;
    username: string;
    full_name: string;
    date_of_birth?: string;
    avatar_url?: string;
  }) => {
    const { user: registered, error } = await authService.signUp(params);
    if (error) return { success: false, error };
    setUser(registered);
    return { success: true };
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const { profile, error } = await authService.updateProfile(user.id, updates);
    if (error) return { success: false, error };
    if (profile) setUser(profile);
    return { success: true };
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
