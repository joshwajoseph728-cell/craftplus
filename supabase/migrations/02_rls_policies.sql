-- ==============================================================================
-- VibeSphere Row Level Security (RLS) Policies
-- Migration 02: Row Level Security Configuration
-- ==============================================================================

-- 1. Enable RLS on all tables
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
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper function to check if current user is admin
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can insert their own profile upon signup
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g., ban/moderate role)
CREATE POLICY "Admins can manage any profile" 
ON public.profiles FOR ALL 
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- POSTS POLICIES
-- ------------------------------------------------------------------------------
-- View public posts or posts from followed users (or own posts)
CREATE POLICY "View permitted posts" 
ON public.posts FOR SELECT 
USING (
  audience = 'public' 
  OR user_id = auth.uid()
  OR (
    audience = 'followers' AND EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = auth.uid() 
      AND following_id = public.posts.user_id 
      AND status = 'active'
    )
  )
  OR public.is_admin()
);

-- Users can create posts for themselves
CREATE POLICY "Users can create their own posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users or Admins can delete posts
CREATE POLICY "Users and Admins can delete posts" 
ON public.posts FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- POST MEDIA POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Post media viewable based on post access" 
ON public.post_media FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = public.post_media.post_id
  )
);

CREATE POLICY "Users can insert media for their own posts" 
ON public.post_media FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = public.post_media.post_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete media for their own posts" 
ON public.post_media FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = public.post_media.post_id AND (user_id = auth.uid() OR public.is_admin())
  )
);

-- ------------------------------------------------------------------------------
-- LIKES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Likes are viewable by anyone who can view the post" 
ON public.likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like posts" 
ON public.likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.likes FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- COMMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Comments viewable by anyone who can view the post" 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and Admins can delete comments" 
ON public.comments FOR DELETE 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = public.comments.post_id AND user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------------------
-- COMMENT LIKES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Comment likes viewable by everyone" 
ON public.comment_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like comments" 
ON public.comment_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their comment likes" 
ON public.comment_likes FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- FOLLOWS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT 
USING (true);

CREATE POLICY "Users can follow or request follow" 
ON public.follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Target users can accept/reject follow requests" 
ON public.follows FOR UPDATE 
USING (auth.uid() = following_id);

CREATE POLICY "Follower can unfollow or cancel request" 
ON public.follows FOR DELETE 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- ------------------------------------------------------------------------------
-- SAVES (BOOKMARKS) POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view only their own saved posts" 
ON public.saves FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON public.saves FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON public.saves FOR DELETE 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- STORIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Active stories viewable by allowed users" 
ON public.stories FOR SELECT 
USING (
  expires_at > NOW() AND (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = public.stories.user_id AND is_private = false
    )
    OR EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() AND following_id = public.stories.user_id AND status = 'active'
    )
    OR public.is_admin()
  )
);

CREATE POLICY "Users can post stories" 
ON public.stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and Admins can delete stories" 
ON public.stories FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- STORY VIEWS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Story owners and viewers can see views" 
ON public.story_views FOR SELECT 
USING (
  viewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.stories 
    WHERE id = public.story_views.story_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can record story views" 
ON public.story_views FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "System/Users can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Users can mark their own notifications as read" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = recipient_id);

-- ------------------------------------------------------------------------------
-- DIRECT MESSAGES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view messages they sent or received" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can mark message as read" 
ON public.messages FOR UPDATE 
USING (auth.uid() = receiver_id);

CREATE POLICY "Sender or Admin can delete messages" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- HASHTAGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Hashtags are viewable by everyone" 
ON public.hashtags FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert hashtags" 
ON public.hashtags FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Post hashtags are viewable by everyone" 
ON public.post_hashtags FOR SELECT 
USING (true);

CREATE POLICY "Post owners can tag hashtags" 
ON public.post_hashtags FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE id = public.post_hashtags.post_id AND user_id = auth.uid()
  )
);

-- ------------------------------------------------------------------------------
-- REPORTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view reports they created" 
ON public.reports FOR SELECT 
USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Authenticated users can submit reports" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Only Admins can update report status" 
ON public.reports FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- BLOCKED USERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their blocked list" 
ON public.blocked_users FOR SELECT 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block accounts" 
ON public.blocked_users FOR INSERT 
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock accounts" 
ON public.blocked_users FOR DELETE 
USING (auth.uid() = blocker_id);
