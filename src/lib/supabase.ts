import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate whether real credentials have been configured
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 20 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

// Create the Supabase client (or safe fallback mock client if keys are not yet entered)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://mock-vibesphere.supabase.co', 'mock-anon-key-vibesphere-demo', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

// Helper to get public URL for storage assets
export const getStoragePublicUrl = (bucket: 'avatars' | 'posts' | 'stories' | 'messages', path: string): string => {
  if (!isSupabaseConfigured()) {
    return path; // In demo mode, URLs are already direct web URLs
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || path;
};
