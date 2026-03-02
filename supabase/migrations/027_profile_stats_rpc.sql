-- ============================================
-- CODE6MM - PROFILE STATS OPTIMIZATION
-- ============================================
-- Cria funcao para buscar stats do perfil em 1 query
-- ao invés de 4 queries separadas
-- ============================================

BEGIN;

-- Funcao para buscar stats do perfil de uma vez
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

-- ============================================
-- BENEFICIOS
-- ============================================
-- ✅ Reduz de 4-5 queries para 1 query
-- ✅ Profile screen: de 11 para 7 requests
-- ✅ Economiza ~36% de requests no profile
-- ============================================
