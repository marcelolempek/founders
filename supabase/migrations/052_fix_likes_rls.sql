-- ============================================
-- CODE6MM - 052: FIX LIKES RLS & TRIGGERS
-- ============================================

-- First, ensure the function exists and is robust
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
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

-- Drop existing policies to be safe
DROP POLICY IF EXISTS "likes_select_public" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_authenticated" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;

-- Re-enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Re-create policies with explicit definitions

-- 1. Everyone can see likes (needed for public pages)
CREATE POLICY "likes_select_public"
  ON public.likes FOR SELECT
  USING (true);

-- 2. Authenticated users can insert (like)
CREATE POLICY "likes_insert_authenticated"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Authenticated users can delete (unlike) THEIR OWN likes
CREATE POLICY "likes_delete_own"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure triggers are properly set (drop and recreate to be sure)
DROP TRIGGER IF EXISTS on_like_insert ON public.likes;
CREATE TRIGGER on_like_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS on_like_delete ON public.likes;
CREATE TRIGGER on_like_delete
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_likes_count();
