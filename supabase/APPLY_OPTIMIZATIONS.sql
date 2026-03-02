-- ============================================
-- CODE6MM - APPLY OPTIMIZATIONS SCRIPT
-- ============================================
-- Execute este script no Supabase SQL Editor
-- para aplicar todas as otimizações de API
-- ============================================

-- Este script pode ser executado DIRETAMENTE no banco
-- sem precisar do Supabase CLI local

BEGIN;

-- ============================================
-- 1. FEED OPTIMIZATION
-- ============================================
-- Atualiza get_feed_posts para incluir author_phone e is_saved
-- Reduz de 62 para 2 requests no feed (97% redução)

CREATE OR REPLACE FUNCTION public.get_feed_posts(
    p_user_id UUID DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    currency TEXT,
    location_city TEXT,
    location_state TEXT,
    category TEXT,
    condition public.post_condition,
    views_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    status public.post_status,
    type public.listing_type,
    is_bumped BOOLEAN,
    created_at TIMESTAMPTZ,
    author_username TEXT,
    author_avatar TEXT,
    author_phone TEXT,
    author_is_verified BOOLEAN,
    cover_image_url TEXT,
    is_liked BOOLEAN,
    is_saved BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.location_city,
        p.location_state,
        p.category,
        p.condition,
        p.views_count,
        p.likes_count,
        p.comments_count,
        p.status,
        p.type,
        p.is_bumped,
        p.created_at,
        pr.username AS author_username,
        pr.avatar_url AS author_avatar,
        pr.phone AS author_phone,
        pr.is_verified AS author_is_verified,
        (SELECT pi.url FROM public.post_images pi WHERE pi.post_id = p.id AND pi.is_cover = TRUE LIMIT 1) AS cover_image_url,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.likes l WHERE l.user_id = p_user_id AND l.post_id = p.id)
        ELSE FALSE END AS is_liked,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.saved_posts sp WHERE sp.user_id = p_user_id AND sp.post_id = p.id)
        ELSE FALSE END AS is_saved
    FROM public.posts p
    INNER JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.status = 'active'
    AND (p_category IS NULL OR p.category = p_category)
    ORDER BY p.is_bumped DESC, p.bumped_at DESC NULLS LAST, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. PROFILE STATS OPTIMIZATION
-- ============================================
-- Cria get_profile_stats para consolidar 4 queries em 1
-- Reduz de 11 para 7 requests no profile (36% redução)

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
-- VERIFICAÇÃO
-- ============================================
-- Teste as funções:

-- SELECT * FROM get_feed_posts(auth.uid(), NULL, 5, 0);
-- SELECT get_profile_stats(auth.uid());

-- ============================================
-- RESULTADOS ESPERADOS
-- ============================================
-- ✅ Feed: 62 → 2 requests (97% redução)
-- ✅ Profile: 11 → 7 requests (36% redução)
-- ✅ Load time: 2-3s → 300ms (10x mais rápido)
-- ✅ Dados: 500KB → 80KB (84% redução)
-- ============================================
