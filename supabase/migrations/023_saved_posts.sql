-- ============================================
-- CODE6MM - 023: SAVED POSTS TABLE
-- ============================================
-- Cria tabela para posts salvos/favoritos
-- ============================================

BEGIN;

-- Create saved_posts table if not exists
CREATE TABLE IF NOT EXISTS saved_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Prevent duplicate saves
  UNIQUE(user_id, post_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved posts
CREATE POLICY "Users can view their own saved posts"
ON saved_posts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can save posts
CREATE POLICY "Users can save posts"
ON saved_posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can unsave their own posts
CREATE POLICY "Users can unsave their own posts"
ON saved_posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
