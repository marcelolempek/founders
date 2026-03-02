-- ============================================
-- CODE6MM - 044: RELAX POST CONSTRAINTS
-- ============================================
-- Allows text posts / general posts to have NULL category and condition
-- ============================================

-- Make category nullable
ALTER TABLE public.posts ALTER COLUMN category DROP NOT NULL;

-- Make condition nullable
ALTER TABLE public.posts ALTER COLUMN condition DROP NOT NULL;
