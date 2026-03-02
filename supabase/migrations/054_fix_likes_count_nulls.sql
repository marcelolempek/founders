-- ============================================
-- CODE6MM - 054: FIX LIKES COUNT NULLABILITY
-- ============================================

-- 1. Update existing nulls to 0
UPDATE public.posts
SET likes_count = 0
WHERE likes_count IS NULL;

-- 2. Alter column to be NOT NULL and DEFAULT 0
ALTER TABLE public.posts
ALTER COLUMN likes_count SET DEFAULT 0,
ALTER COLUMN likes_count SET NOT NULL;

-- 3. Re-verify triggers (just in case)
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
