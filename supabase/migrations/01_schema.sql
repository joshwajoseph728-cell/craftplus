-- ==============================================================================
-- CraftPulse PostgreSQL Database Schema
-- Migration 01: Core Tables, Relationships, and Indexes
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
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

-- 2. Posts (Work & Project Showcases) Table
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

-- 3. Post Media Table (Multiple screenshots/video carousel)
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    display_order INTEGER DEFAULT 0 NOT NULL,
    caption_note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- 5. Comments Table (Supports Nested Replies)
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

-- 6. Comment Likes Table
CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

-- 7. Follows Table (Supports follow requests for private profiles)
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id != following_id)
);

-- 8. Saves (Bookmarks) Table
CREATE TABLE IF NOT EXISTS public.saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_user_post_save UNIQUE (user_id, post_id)
);

-- 9. 24-Hour Stories Table
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

-- 10. Story Views Table
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_story_viewer UNIQUE (story_id, viewer_id)
);

-- 11. Notifications Table
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

-- 12. Direct Messages Table
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

-- 13. Hashtags Table
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. Reports Table (Content Moderation)
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

-- ==============================================================================
-- Performance & Lookup Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_media_post_id ON public.post_media(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON public.hashtags(name);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
