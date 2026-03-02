-- ============================================
-- CODE6MM - PROFILE STATS RE-APPLY
-- ============================================
-- Ensures get_profile_stats function exists
-- ============================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_profile_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats_json JSON;
BEGIN
    SELECT json_build_object(
        'followers_count', (
            SELECT COUNT(*) 
            FROM public.follows 
            WHERE following_id = p_user_id
        ),
        'following_count', (
            SELECT COUNT(*) 
            FROM public.follows 
            WHERE follower_id = p_user_id
        ),
        'posts_count', (
            SELECT COUNT(*) 
            FROM public.posts 
            WHERE user_id = p_user_id 
            AND status != 'archived'
        ),
        'sold_count', (
            SELECT COUNT(*) 
            FROM public.posts 
            WHERE user_id = p_user_id 
            AND status = 'sold'
        ),
        'active_posts_count', (
            SELECT COUNT(*) 
            FROM public.posts 
            WHERE user_id = p_user_id 
            AND status = 'active'
        )
    ) INTO stats_json;
    
    RETURN stats_json;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
