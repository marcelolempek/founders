-- ============================================
-- CODE6MM - INTELLIGENT FEED ALGORITHM
-- ============================================
-- Melhora a ordenação do feed para priorizar:
-- 1. Proximidade (Cidade/Estado do usuário)
-- 2. Confiança (Sellers Verificados)
-- 3. Recência (Data e Bumped)
-- ============================================

BEGIN;

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
    author_is_verified BOOLEAN,
    cover_image_url TEXT,
    is_liked BOOLEAN,
    is_saved BOOLEAN
) AS $$
DECLARE
    v_user_city TEXT;
    v_user_state TEXT;
BEGIN
    -- Obter localização do usuário logado para personalização
    IF p_user_id IS NOT NULL THEN
        SELECT location_city, location_state INTO v_user_city, v_user_state
        FROM public.profiles WHERE id = p_user_id;
    END IF;

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
    ORDER BY 
        p.is_bumped DESC,
        -- PONTUAÇÃO DE RELEVÂNCIA (Intelligent Scoring)
        (
            CASE WHEN v_user_city IS NOT NULL AND p.location_city = v_user_city THEN 100 ELSE 0 END +
            CASE WHEN v_user_state IS NOT NULL AND p.location_state = v_user_state THEN 50 ELSE 0 END +
            CASE WHEN pr.is_verified = TRUE THEN 25 ELSE 0 END
        ) DESC,
        p.bumped_at DESC NULLS LAST,
        p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================
-- BENEFICIOS
-- ============================================
-- ✅ Vendedores locais aparecem primeiro
-- ✅ Vendedores verificados ganham destaque
-- ✅ Mantém performance via SQL ORDER BY
-- ✅ Retrocompatível com usuários deslogados
-- ============================================
