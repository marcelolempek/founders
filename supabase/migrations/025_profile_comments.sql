-- Migration: Profile Comments System
-- Description: Adds the ability for users to comment on other users' profiles (like a wall/mural)

-- Create profile_comments table
CREATE TABLE IF NOT EXISTS profile_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES profile_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT profile_comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- Create profile_comment_likes table for tracking likes on profile comments
CREATE TABLE IF NOT EXISTS profile_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES profile_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(comment_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_comments_profile_id ON profile_comments(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_user_id ON profile_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_parent_id ON profile_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_profile_comments_created_at ON profile_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_comment_likes_comment_id ON profile_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_profile_comment_likes_user_id ON profile_comment_likes(user_id);

-- Function to update likes count on profile comments
CREATE OR REPLACE FUNCTION update_profile_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profile_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profile_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating likes count
DROP TRIGGER IF EXISTS trg_update_profile_comment_likes_count ON profile_comment_likes;
CREATE TRIGGER trg_update_profile_comment_likes_count
    AFTER INSERT OR DELETE ON profile_comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_comment_likes_count();

-- RLS Policies for profile_comments
ALTER TABLE profile_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read profile comments
CREATE POLICY "profile_comments_select_policy" ON profile_comments
    FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "profile_comments_insert_policy" ON profile_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own comments
CREATE POLICY "profile_comments_update_policy" ON profile_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments, or profile owners can delete comments on their profile
CREATE POLICY "profile_comments_delete_policy" ON profile_comments
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = profile_id);

-- RLS Policies for profile_comment_likes
ALTER TABLE profile_comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "profile_comment_likes_select_policy" ON profile_comment_likes
    FOR SELECT USING (true);

-- Authenticated users can insert likes
CREATE POLICY "profile_comment_likes_insert_policy" ON profile_comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "profile_comment_likes_delete_policy" ON profile_comment_likes
    FOR DELETE USING (auth.uid() = user_id);
