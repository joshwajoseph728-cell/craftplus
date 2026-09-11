import { supabase, isSupabaseConfigured, getStoragePublicUrl } from '../lib/supabase';

const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

export const storageService = {
  validateFile(file: File): { valid: boolean; error: string | null } {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Unsupported file type. Please select JPEG, PNG, WEBP, GIF, or MP4.' };
    }
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_IMAGE_SIZE_MB) {
      return { valid: false, error: `File size exceeds ${MAX_IMAGE_SIZE_MB}MB limit.` };
    }
    return { valid: true, error: null };
  },

  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async uploadMedia(
    file: File,
    bucket: 'avatars' | 'posts' | 'stories' | 'messages',
    userId: string
  ): Promise<{ url: string | null; error: string | null }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error };
    }

    if (!isSupabaseConfigured()) {
      try {
        const dataUrl = await this.fileToDataUrl(file);
        return { url: dataUrl, error: null };
      } catch (err: any) {
        return { url: null, error: 'Failed to process image locally' };
      }
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const publicUrl = getStoragePublicUrl(bucket, data.path);
      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error('Storage upload error:', err);
      // Fallback to local DataURL so user experience is not blocked
      const dataUrl = await this.fileToDataUrl(file);
      return { url: dataUrl, error: null };
    }
  }
};

