-- ==============================================================================
-- CraftPulse Database Triggers, Functions & Automation
-- Migration 03: Automation Triggers & Functions
-- ==============================================================================

-- 1. Handle New User Registration Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    website,
    github_url,
    linkedin_url,
    location,
    skills,
    date_of_birth,
    is_private,
    open_to_collab,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'builder_' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'CraftPulse Creator'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Building projects & sharing learnings on CraftPulse! 🚀'),
    COALESCE(NEW.raw_user_meta_data->>'website', ''),
    COALESCE(NEW.raw_user_meta_data->>'github_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'linkedin_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    ARRAY[]::TEXT[],
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'is_private')::boolean, FALSE),
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

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Post Likes Counter Trigger
CREATE OR REPLACE FUNCTION public.handle_post_like_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    
    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id)
    SELECT user_id, NEW.user_id, 'like', NEW.post_id
    FROM public.posts
    WHERE id = NEW.post_id AND user_id != NEW.user_id;

    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_counter_change ON public.likes;
CREATE TRIGGER on_like_counter_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like_counter();

-- 3. Post Comments Counter Trigger
CREATE OR REPLACE FUNCTION public.handle_post_comment_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;

    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id, comment_id)
    SELECT user_id, NEW.user_id, 
      CASE WHEN NEW.parent_comment_id IS NOT NULL THEN 'reply' ELSE 'comment' END,
      NEW.post_id, NEW.id
    FROM public.posts
    WHERE id = NEW.post_id AND user_id != NEW.user_id;

    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_counter_change ON public.comments;
CREATE TRIGGER on_comment_counter_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_counter();

-- 4. Follow & Collab Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type)
    VALUES (
      NEW.following_id, 
      NEW.follower_id, 
      CASE WHEN NEW.status = 'pending' THEN 'follow_request' ELSE 'follow' END
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'active') THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type)
    VALUES (NEW.follower_id, NEW.following_id, 'follow_accepted');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_notification ON public.follows;
CREATE TRIGGER on_follow_notification
  AFTER INSERT OR UPDATE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();
