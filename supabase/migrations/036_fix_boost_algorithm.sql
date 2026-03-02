-- ============================================
-- CODE6MM - FIX BOOST ALGORITHM
-- Migration 036: Corrige sistema de impulsionamento
-- ============================================
-- PROBLEMAS CORRIGIDOS:
-- 1. Feed usava is_bumped mas pagamento setava is_boosted
-- 2. Sem verificacao de boosted_until (expiracao)
-- 3. Sistema gratuito e pago confusos
-- ============================================

BEGIN;

-- 1. Atualizar funcao get_feed_posts para usar is_boosted corretamente
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
    relevance_score NUMERIC
) AS $$
DECLARE
    v_user_city TEXT;
    v_user_state TEXT;
    v_user_region TEXT;
BEGIN
    -- Obter localizacao do usuario logado para personalizacao
    IF p_user_id IS NOT NULL THEN
        SELECT location_city, location_state INTO v_user_city, v_user_state
        FROM public.profiles WHERE id = p_user_id;

        -- Determinar regiao do usuario
        v_user_region := public.get_region(v_user_state);
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
        (
            -- BOOST IMPULSIONADO PAGO (1000 pontos) - CORRIGIDO!
            -- Verifica is_boosted E que ainda nao expirou
            CASE WHEN p.is_boosted = TRUE AND (p.boosted_until IS NULL OR p.boosted_until > NOW()) THEN 1000 ELSE 0 END +

            -- SCORE LOCALIZACAO (0-200 pontos)
            CASE WHEN v_user_city IS NOT NULL AND p.location_city = v_user_city THEN 100 ELSE 0 END +
            CASE WHEN v_user_state IS NOT NULL AND p.location_state = v_user_state THEN 50 ELSE 0 END +
            CASE WHEN p.ships_nationwide = TRUE THEN 75 ELSE 0 END +
            CASE WHEN v_user_region IS NOT NULL AND public.get_region(p.location_state) = v_user_region THEN 25 ELSE 0 END +

            -- SCORE CONFIANCA (0-150 pontos)
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

            -- SCORE ENGAJAMENTO (0-100 pontos)
            LEAST((p.likes_count / 10) * 5, 30)::INTEGER +
            LEAST((p.views_count / 100) * 5, 20)::INTEGER +
            LEAST((p.comments_count / 5) * 5, 20)::INTEGER +
            LEAST((SELECT COUNT(*)::INTEGER FROM public.saved_posts WHERE post_id = p.id) * 2, 30) +

            -- SCORE FRESHNESS (0-50 pontos)
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

-- 2. Criar tabela para tracking de views com deduplicacao
CREATE TABLE IF NOT EXISTS public.post_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT, -- Para usuarios nao logados
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indice unico para deduplicacao: 1 view por usuario por post por dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique_user_day
ON public.post_views (user_id, post_id, (timezone('UTC', viewed_at)::date))
WHERE user_id IS NOT NULL;

-- Indice para usuarios nao logados (por session_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique_session_day
ON public.post_views (session_id, post_id, (timezone('UTC', viewed_at)::date))
WHERE session_id IS NOT NULL AND user_id IS NULL;

-- Indice para performance
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);

-- RLS para post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert post views" ON public.post_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own views" ON public.post_views
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- 3. Nova funcao para incrementar views com deduplicacao
CREATE OR REPLACE FUNCTION public.increment_post_views_deduplicated(
    p_post_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_new_view BOOLEAN := FALSE;
BEGIN
    -- Tentar inserir view (vai falhar silenciosamente se duplicado)
    INSERT INTO public.post_views (user_id, post_id, session_id)
    VALUES (p_user_id, p_post_id, p_session_id)
    ON CONFLICT DO NOTHING;

    -- Verificar se foi inserido
    GET DIAGNOSTICS v_is_new_view = ROW_COUNT;

    -- Se foi view nova, incrementar contador
    IF v_is_new_view THEN
        UPDATE public.posts
        SET views_count = views_count + 1
        WHERE id = p_post_id;
    END IF;

    RETURN v_is_new_view;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Funcao para verificar se post esta impulsionado ativamente
CREATE OR REPLACE FUNCTION public.is_post_actively_boosted(p_post_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.posts
        WHERE id = p_post_id
        AND is_boosted = TRUE
        AND (boosted_until IS NULL OR boosted_until > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Funcao para obter dias restantes do boost
CREATE OR REPLACE FUNCTION public.get_boost_remaining_days(p_post_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_boosted_until TIMESTAMPTZ;
BEGIN
    SELECT boosted_until INTO v_boosted_until
    FROM public.posts
    WHERE id = p_post_id AND is_boosted = TRUE;

    IF v_boosted_until IS NULL THEN
        RETURN 0;
    END IF;

    RETURN GREATEST(0, EXTRACT(DAY FROM (v_boosted_until - NOW()))::INTEGER);
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- ============================================
-- BENEFICIOS
-- ============================================
-- ✅ Boost pago agora funciona corretamente no feed
-- ✅ Verifica expiracao do boost (boosted_until)
-- ✅ Views com deduplicacao por usuario/dia
-- ✅ Funcoes auxiliares para UI
-- ============================================
