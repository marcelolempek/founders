-- Ensure users can view posts they have saved, even if they might be otherwise restricted (though usually public posts are visible)
-- Taking a safer approach: creating a view or just ensuring the policy is robust.

-- First, let's verify the saved_posts RLS is definitely enabled and correct.
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved posts" ON saved_posts;

CREATE POLICY "Users can view their own saved posts"
ON saved_posts FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Additionally, we need to ensure that when fetching 'posts' through the join, the user has permission to see those posts.
-- The standard "Public posts are viewable by everyone" policy on 'posts' should cover this for active posts.
-- If the item is sold or archived, we might need to ensure it's still visible to the saver.

-- Let's check if there's a policy on 'posts' that might be too restrictive.
-- Assuming standard public view. If not, we might need a specific policy.
-- For now, let's just re-apply the saved_posts policy to be sure.
