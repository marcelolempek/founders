-- Recalculate followers count for all profiles based on actual follows table
UPDATE profiles
SET followers_count = (
    SELECT count(*)
    FROM follows
    WHERE following_id = profiles.id
);

-- Recalculate following count for all profiles based on actual follows table
UPDATE profiles
SET following_count = (
    SELECT count(*)
    FROM follows
    WHERE follower_id = profiles.id
);
