-- Add expires_at column to user_badges
ALTER TABLE user_badges 
ADD COLUMN expires_at TIMESTAMPTZ NULL;

-- Add index for efficient querying of expired badges
CREATE INDEX idx_user_badges_expires_at ON user_badges(expires_at);

-- Update RLS policies to allow admins to manage this column (assuming existing policies cover update)
-- If policies are restrictive, we might need to add:
-- CREATE POLICY "Admins can update user_badges"ON user_badges FOR UPDATE TO authenticated USING (get_my_claim('userrole') = '"admin"');
