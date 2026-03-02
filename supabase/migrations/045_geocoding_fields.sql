-- ============================================
-- CODE6MM - GEOCODING FIELDS
-- Migration 045: Campos de geolocalização
-- ============================================
-- Adiciona latitude, longitude e dados de geocodificação
-- Cria função de cálculo de distância Haversine
-- Atualiza get_feed_posts para incluir distância
-- ============================================

BEGIN;

-- 1. Adicionar campos de geolocalização na tabela posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS formatted_address TEXT,
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

COMMENT ON COLUMN public.posts.latitude IS 'Latitude obtida via geocodificação do CEP/endereço';
COMMENT ON COLUMN public.posts.longitude IS 'Longitude obtida via geocodificação do CEP/endereço';
COMMENT ON COLUMN public.posts.postal_code IS 'CEP utilizado para geocodificação';
COMMENT ON COLUMN public.posts.formatted_address IS 'Endereço formatado retornado pela API de geocodificação';
COMMENT ON COLUMN public.posts.neighborhood IS 'Bairro extraído da geocodificação';

-- 2. Adicionar campos de geolocalização na tabela profiles (para cálculo de distância no feed)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

COMMENT ON COLUMN public.profiles.latitude IS 'Latitude do usuário para cálculos de proximidade';
COMMENT ON COLUMN public.profiles.longitude IS 'Longitude do usuário para cálculos de proximidade';
COMMENT ON COLUMN public.profiles.postal_code IS 'CEP do usuário';

-- 3. Criar índice para otimizar queries por coordenadas
CREATE INDEX IF NOT EXISTS idx_posts_coordinates ON public.posts(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. Função para cálculo de distância usando fórmula de Haversine (retorna km)
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    earth_radius_km CONSTANT DECIMAL := 6371.0;
    d_lat DECIMAL;
    d_lon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Se alguma coordenada for NULL, retorna NULL
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;

    -- Converter para radianos
    d_lat := RADIANS(lat2 - lat1);
    d_lon := RADIANS(lon2 - lon1);

    -- Fórmula de Haversine
    a := SIN(d_lat / 2) * SIN(d_lat / 2) +
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
         SIN(d_lon / 2) * SIN(d_lon / 2);
    c := 2 * ATAN2(SQRT(a), SQRT(1 - a));

    RETURN ROUND((earth_radius_km * c)::DECIMAL, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.calculate_distance_km IS 'Calcula distância em km entre duas coordenadas usando Haversine';

-- 5. Dropar função antiga e criar nova com parâmetros de geolocalização
DROP FUNCTION IF EXISTS public.get_feed_posts(UUID, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.get_feed_posts(
    p_user_id UUID DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_user_lat DECIMAL DEFAULT NULL,
    p_user_lon DECIMAL DEFAULT NULL
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
        (SELECT pi.url FROM public.post_images pi WHERE pi.post_id = p.id AND pi.is_cover = TRUE LIMIT 1) AS cover_image_url,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.likes l WHERE l.user_id = p_user_id AND l.post_id = p.id)
        ELSE FALSE END AS is_liked,
        CASE WHEN p_user_id IS NOT NULL THEN
            EXISTS (SELECT 1 FROM public.saved_posts sp WHERE sp.user_id = p_user_id AND sp.post_id = p.id)
        ELSE FALSE END AS is_saved,
        -- Distância calculada
        public.calculate_distance_km(v_user_lat, v_user_lon, p.latitude, p.longitude) AS distance_km,
        (
            -- BOOST PAGO (1000 pts)
            CASE WHEN p.is_boosted = TRUE AND (p.boosted_until IS NULL OR p.boosted_until > NOW()) THEN 1000 ELSE 0 END +

            -- SCORE PROXIMIDADE GEOGRÁFICA (0-250 pts) - Usando coordenadas quando disponíveis
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

COMMENT ON FUNCTION public.get_feed_posts IS 'Retorna posts do feed com scoring de relevância e distância';

-- 6. Função para buscar posts por distância (para página Explorar)
CREATE OR REPLACE FUNCTION public.search_posts_by_distance(
    p_user_lat DECIMAL,
    p_user_lon DECIMAL,
    p_max_distance_km DECIMAL DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_condition TEXT DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_order_by TEXT DEFAULT 'distance' -- 'distance', 'recent', 'price_low', 'price_high'
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
    neighborhood VARCHAR,
    category TEXT,
    condition public.post_condition,
    views_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    status public.post_status,
    type public.listing_type,
    ships_nationwide BOOLEAN,
    created_at TIMESTAMPTZ,
    author_username TEXT,
    author_avatar TEXT,
    author_is_verified BOOLEAN,
    cover_image_url TEXT,
    distance_km DECIMAL
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
        p.latitude,
        p.longitude,
        p.neighborhood,
        p.category,
        p.condition,
        p.views_count,
        p.likes_count,
        p.comments_count,
        p.status,
        p.type,
        p.ships_nationwide,
        p.created_at,
        pr.username AS author_username,
        pr.avatar_url AS author_avatar,
        pr.is_verified AS author_is_verified,
        (SELECT pi.url FROM public.post_images pi WHERE pi.post_id = p.id AND pi.is_cover = TRUE LIMIT 1) AS cover_image_url,
        public.calculate_distance_km(p_user_lat, p_user_lon, p.latitude, p.longitude) AS distance_km
    FROM public.posts p
    INNER JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.status = 'active'
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
    AND (p_condition IS NULL OR p.condition::TEXT = p_condition)
    AND (p_search_query IS NULL OR (
        p.title ILIKE '%' || p_search_query || '%' OR
        p.description ILIKE '%' || p_search_query || '%'
    ))
    AND (
        p_max_distance_km IS NULL
        OR p.ships_nationwide = TRUE
        OR (
            p.latitude IS NOT NULL
            AND public.calculate_distance_km(p_user_lat, p_user_lon, p.latitude, p.longitude) <= p_max_distance_km
        )
    )
    ORDER BY
        CASE WHEN p_order_by = 'distance' THEN public.calculate_distance_km(p_user_lat, p_user_lon, p.latitude, p.longitude) END ASC NULLS LAST,
        CASE WHEN p_order_by = 'recent' THEN p.created_at END DESC,
        CASE WHEN p_order_by = 'price_low' THEN p.price END ASC NULLS LAST,
        CASE WHEN p_order_by = 'price_high' THEN p.price END DESC NULLS LAST,
        p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.search_posts_by_distance IS 'Busca posts com filtros e ordenação por distância';

COMMIT;

-- ============================================
-- CAMPOS DE GEOLOCALIZAÇÃO ADICIONADOS
-- ============================================
-- posts: latitude, longitude, postal_code, formatted_address, neighborhood
-- profiles: latitude, longitude, postal_code
-- Função calculate_distance_km para cálculo de distância
-- get_feed_posts atualizada com suporte a coordenadas
-- search_posts_by_distance para busca no Explorar
-- ============================================
