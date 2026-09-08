-- ==============================================================================
-- VibeSphere Seed Data for Quick Initial Setup & Demo
-- ==============================================================================

-- Seed Hashtags
INSERT INTO public.hashtags (id, name, post_count) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'vibesphere', 42),
  ('a2222222-2222-2222-2222-222222222222', 'photography', 128),
  ('a3333333-3333-3333-3333-333333333333', 'cyberpunk', 85),
  ('a4444444-4444-4444-4444-444444444444', 'design', 94),
  ('a5555555-5555-5555-5555-555555555555', 'techvibes', 67),
  ('a6666666-6666-6666-6666-666666666666', 'minimalism', 53),
  ('a7777777-7777-7777-7777-777777777777', 'creators', 110)
ON CONFLICT (name) DO UPDATE SET post_count = EXCLUDED.post_count;
