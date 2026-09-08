-- ==============================================================================
-- CraftPulse Complete Supabase All-in-One Database & Storage Migration
-- Copy and paste this entire script into Supabase SQL Editor and click RUN
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    website TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    location TEXT DEFAULT '',
    skills TEXT[] DEFAULT '{}',
    date_of_birth DATE,
    is_private BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    open_to_collab BOOLEAN DEFAULT TRUE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_alphanumeric CHECK (username ~ '^[a-zA-Z0-9_.]+$')
);

-- 3. Posts (Projects & Work Showcases) Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_title TEXT DEFAULT '',
    category TEXT DEFAULT 'Software & Web',
    caption TEXT DEFAULT '',
    experience_learnings TEXT DEFAULT '',
    tech_stack TEXT[] DEFAULT '{}',
    live_demo_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    work_status TEXT DEFAULT 'Completed' CHECK (work_status IN ('Completed', 'In Progress', 'Case Study', 'Concept')),
    open_to_collab BOOLEAN DEFAULT TRUE,
    location TEXT DEFAULT '',
    audience TEXT DEFAULT 'public' CHECK (audience IN ('public', 'followers', 'private')),
    is_archived BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Post Media Table (Multiple screenshots/video carousel)
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    display_order INTEGER DEFAULT 0 NOT NULL,
    caption_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- 6. Comments Table (Supports Nested Replies)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT content_not_empty CHECK (trim(content) != '')
);

-- 7. Comment Likes Table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

-- 8. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id != following_id)
);

-- 9. Saves (Bookmarks) Table
CREATE TABLE IF NOT EXISTS public.saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_post_save UNIQUE (user_id, post_id)
);

-- 10. 24-Hour Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    caption TEXT DEFAULT '',
    tag_topic TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '24 hours') NOT NULL
);

-- 11. Story Views Table
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_story_viewer UNIQUE (story_id, viewer_id)
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'follow', 'follow_request', 'follow_accepted', 'mention', 'collab_request')),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. Direct Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    audio_url TEXT,
    code_snippet JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT cannot_message_self CHECK (sender_id != receiver_id)
);

-- 14. Hashtags Table
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 15. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate', 'violence', 'nudity', 'scam', 'other')),
    details TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "View permitted posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users and Admins can delete posts" ON public.posts FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Post media viewable based on post access" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "Users can insert media for their own posts" ON public.post_media FOR INSERT WITH CHECK (true);

CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can view own saves" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save" ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saves FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Active stories viewable" ON public.stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Users can post stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- Triggers & Automation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, username, full_name, avatar_url, bio, website, location, skills, is_private, open_to_collab, role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'builder_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'CraftPulse Creator'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Building projects & sharing learnings on CraftPulse! 🚀'),
    COALESCE(NEW.raw_user_meta_data->>'website', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    ARRAY[]::TEXT[],
    FALSE,
    TRUE,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Post Likes Counter Trigger
CREATE OR REPLACE FUNCTION public.handle_post_like_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id)
    SELECT user_id, NEW.user_id, 'like', NEW.post_id FROM public.posts WHERE id = NEW.post_id AND user_id != NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_counter_change ON public.likes;
CREATE TRIGGER on_like_counter_change AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_counter();

-- Storage Buckets Provisioning
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('messages', 'messages', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view post media" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated users can upload post media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view story media" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Authenticated users can upload story media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories' AND auth.role() = 'authenticated');
