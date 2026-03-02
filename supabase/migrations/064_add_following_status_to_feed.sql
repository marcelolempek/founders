-- ============================================
-- CODE6MM - FEED PERFORMANCE
-- Migration 064: Add author_is_followed to get_feed_posts to avoid N+1 queries
-- ============================================

BEGIN;

-- Drop function because we are changing the return table signature
DROP FUNCTION IF EXISTS public.get_feed_posts(UUID, TEXT, INTEGER, INTEGER, DECIMAL, DECIMAL, TEXT);

CREATE OR REPLACE FUNCTION public.get_feed_posts(
    p_user_id UUID DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_user_lat DECIMAL DEFAULT NULL,
    p_user_lon DECIMAL DEFAULT NULL,
    p_cdn_url TEXT DEFAULT NULL
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
    latitude DECIMAL,
    longitude DECIMAL,
    postal_code VARCHAR,
    neighborhood VARCHAR,
    category TEXT,
    condition public.post_condition,
    views_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    status public.post_status,
    type public.listing_type,
    is_boosted BOOLEAN,
    boosted_until TIMESTAMPTZ,
    ships_nationwide BOOLEAN,
    created_at TIMESTAMPTZ,
    author_username TEXT,
    author_avatar TEXT,
    author_is_verified BOOLEAN,
    author_reputation_score DECIMAL,
    author_sales_count INTEGER,
    cover_image_url TEXT,
    is_liked BOOLEAN,
    is_saved BOOLEAN,
    author_is_followed BOOLEAN, -- New field
    distance_km DECIMAL,
    relevance_score NUMERIC
) AS $$
DECLARE
    v_user_city TEXT;
    v_user_state TEXT;
    v_user_region TEXT;
    v_user_lat DECIMAL;
    v_user_lon DECIMAL;
BEGIN
    -- Obter dados do usuário
    IF p_user_id IS NOT NULL THEN
        SELECT
            pr.location_city,
            pr.location_state,
            COALESCE(p_user_lat, pr.latitude),
            COALESCE(p_user_lon, pr.longitude)
        INTO v_user_city, v_user_state, v_user_lat, v_user_lon
        FROM public.profiles pr WHERE pr.id = p_user_id;

        v_user_region := public.get_region(v_user_state);
    ELSE
        v_user_lat := p_user_lat;
        v_user_lon := p_user_lon;
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
        p.latitude,
        p.longitude,
        p.postal_code,
        p.neighborhood,
        p.category,
        p.condition,
        p.views_count,
        p.likes_count,
        p.comments_count,
        p.shares_count,
        p.status,
        p.type,
        p.is_boosted,
        p.boosted_until,
        p.ships_nationwide,
        p.created_at,
        pr.username AS author_username,
        pr.avatar_url AS author_avatar,
        pr.is_verified AS author_is_verified,
        pr.reputation_score AS author_reputation_score,
        pr.sales_count AS author_sales_count,
        (
            SELECT 
                CASE 
                    WHEN pi.image_id IS NOT NULL AND p_cdn_url IS NOT NULL THEN p_cdn_url || '/posts/' || p.id || '/feed/' || pi.image_id || '.webp'
                    WHEN pi.image_id IS NOT NULL THEN '/posts/' || p.id || '/feed/' || pi.image_id || '.webp'
                    ELSE pi.url 
                END
            FROM public.post_images pi 
            WHERE pi.post_id = p.id AND pi.is_cover = TRUE 
            LIMIT 1
        ) AS cover_image_url,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.likes l WHERE l.user_id = p_user_id AND l.post_id = p.id)
        ELSE FALSE END AS is_liked,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.saved_posts sp WHERE sp.user_id = p_user_id AND sp.post_id = p.id)
        ELSE FALSE END AS is_saved,
        -- Check if user follows author
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = p_user_id AND f.following_id = p.user_id)
        ELSE FALSE END AS author_is_followed,
        
        -- Distância calculada
        public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) AS distance_km,
        (
            -- BOOST PAGO (1000 pts)
            CASE WHEN p.is_boosted = TRUE AND (p.boosted_until IS NULL OR p.boosted_until > NOW()) THEN 1000 ELSE 0 END +

            -- SCORE PROXIMIDADE GEOGRÁFICA (0-250 pts)
            CASE
                WHEN v_user_lat IS NOT NULL AND p.latitude IS NOT NULL THEN
                    CASE
                        WHEN public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) < 25 THEN 150
                        WHEN public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) < 50 THEN 120
                        WHEN public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) < 100 THEN 90
                        WHEN public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) < 200 THEN 60
                        WHEN public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) < 500 THEN 30
                        ELSE 0
                    END
                -- Fallback para cidade/estado quando não há coordenadas
                WHEN v_user_city IS NOT NULL AND p.location_city = v_user_city THEN 100
                WHEN v_user_state IS NOT NULL AND p.location_state = v_user_state THEN 50
                ELSE 0
            END +
            -- Bônus envio nacional
            CASE WHEN p.ships_nationwide = TRUE THEN 75 ELSE 0 END +
            -- Bônus mesma região (fallback)
            CASE WHEN v_user_region IS NOT NULL AND public.get_region(p.location_state) = v_user_region THEN 25 ELSE 0 END +

            -- SCORE CONFIANÇA (0-150 pts)
            CASE WHEN pr.is_verified THEN 30 ELSE 0 END +
            CASE
                WHEN pr.reputation_score >= 4.5 THEN 40
                WHEN pr.reputation_score >= 4.0 THEN 25
                WHEN pr.reputation_score >= 3.5 THEN 10
                ELSE 0
            END +
            CASE
                WHEN pr.sales_count >= 100 THEN 60
                WHEN pr.sales_count >= 50 THEN 40
                WHEN pr.sales_count >= 10 THEN 20
                ELSE 0
            END +

            -- SCORE ENGAJAMENTO (0-100 pts)
            LEAST((p.likes_count / 10) * 5, 30)::INTEGER +
            LEAST((p.views_count / 100) * 5, 20)::INTEGER +
            LEAST((p.comments_count / 5) * 5, 20)::INTEGER +
            LEAST((SELECT COUNT(*)::INTEGER FROM public.saved_posts WHERE post_id = p.id) * 2, 30) +

            -- SCORE FRESHNESS (0-50 pts)
            CASE
                WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 50
                WHEN p.created_at > NOW() - INTERVAL '3 days' THEN 40
                WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 30
                WHEN p.created_at > NOW() - INTERVAL '14 days' THEN 20
                WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 10
                ELSE 0
            END
        )::NUMERIC AS relevance_score
    FROM public.posts p
    INNER JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.status = 'active'
    AND (p_category IS NULL OR p.category = p_category)
    ORDER BY relevance_score DESC, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMIT;
