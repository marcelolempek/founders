-- ============================================
-- CODE6MM - MEUS ANUNCIOS ATIVOS
-- Migration 055: Criar função RPC para retornar anúncios ativos do usuário com imagens corrigidas
-- ============================================

CREATE OR REPLACE FUNCTION public.get_my_active_listings(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 4,
    p_cdn_url TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    price DECIMAL,
    currency TEXT,
    cover_image TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.price,
        p.currency,
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
        ) AS cover_image
    FROM public.posts p
    WHERE p.user_id = p_user_id
    AND p.status = 'active'
    AND p.type = 'sale'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
