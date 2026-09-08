-- ==============================================================================
-- VibeSphere Supabase Storage Buckets and Storage RLS Policies
-- Migration 04: Storage Configuration
-- ==============================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('messages', 'messages', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for Avatars
CREATE POLICY "Public can view avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Storage Policies for Posts
CREATE POLICY "Public can view post media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload post media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their post media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Storage Policies for Stories
CREATE POLICY "Public can view story media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'stories');

CREATE POLICY "Authenticated users can upload story media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their story media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Storage Policies for Direct Messages (Private)
CREATE POLICY "Authenticated users can upload message media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'messages' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view message media they sent or received" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'messages' 
  AND auth.role() = 'authenticated'
);
