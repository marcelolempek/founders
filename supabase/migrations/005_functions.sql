-- ============================================
-- CODE6MM - 005: FUNCOES
-- ============================================
-- Funcoes auxiliares e stored procedures
-- Dependencias: 003_tables.sql
-- ============================================

-- --------------------------------------------
-- Funcao: Atualizar updated_at automaticamente
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Criar perfil quando usuario se registra
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_')) || '_' || SUBSTR(NEW.id::TEXT, 1, 4)
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- Funcao: Atualizar contadores de likes
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Atualizar contadores de comments
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Atualizar contadores de followers
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Atualizar contadores de posts do usuario
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Atualizar reputacao do usuario
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
    total_reviews INTEGER;
    target_user_id UUID;
BEGIN
    -- Determinar o usuario alvo
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.reviewed_user_id;
    ELSE
        target_user_id := NEW.reviewed_user_id;
    END IF;

    -- Calcular media e total
    SELECT AVG(rating)::DECIMAL(3, 2), COUNT(*)
    INTO avg_rating, total_reviews
    FROM public.reviews
    WHERE reviewed_user_id = target_user_id;

    -- Atualizar perfil
    UPDATE public.profiles
    SET
        reputation_score = COALESCE(avg_rating, 0),
        reviews_count = total_reviews
    WHERE id = target_user_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Atualizar sales_count quando post eh vendido
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.update_sales_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'sold' AND OLD.status != 'sold' THEN
        UPDATE public.profiles SET sales_count = sales_count + 1 WHERE id = NEW.user_id;
        NEW.sold_at = NOW();
    ELSIF OLD.status = 'sold' AND NEW.status != 'sold' THEN
        UPDATE public.profiles SET sales_count = GREATEST(sales_count - 1, 0) WHERE id = NEW.user_id;
        NEW.sold_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Verificar se eh admin/moderador
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- Funcao: Verificar se usuario pode visualizar post
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.can_view_post(p_post_id UUID, p_viewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    post_record RECORD;
BEGIN
    SELECT status, user_id INTO post_record FROM public.posts WHERE id = p_post_id;

    IF post_record IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Post ativo pode ser visto por todos
    IF post_record.status = 'active' THEN
        RETURN TRUE;
    END IF;

    -- Dono pode ver seus proprios posts
    IF post_record.user_id = p_viewer_id THEN
        RETURN TRUE;
    END IF;

    -- Admin/mod pode ver tudo
    IF public.is_admin_or_moderator(p_viewer_id) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- Funcao: Marcar notificacao como lida
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Marcar todas notificacoes como lidas
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = p_user_id AND is_read = FALSE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Incrementar visualizacoes do post
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET views_count = views_count + 1
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Bump de post (destacar)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_post(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    post_owner UUID;
BEGIN
    SELECT user_id INTO post_owner FROM public.posts WHERE id = p_post_id;

    IF post_owner != p_user_id THEN
        RETURN FALSE;
    END IF;

    UPDATE public.posts
    SET is_bumped = TRUE, bumped_at = NOW()
    WHERE id = p_post_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Verificar se usuario segue outro
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.follows
        WHERE follower_id = p_follower_id AND following_id = p_following_id
    );
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Verificar se usuario curtiu post
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.has_liked_post(p_user_id UUID, p_post_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.likes
        WHERE user_id = p_user_id AND post_id = p_post_id
    );
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Contar seguidores mutuos
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.count_mutual_followers(p_user_id_1 UUID, p_user_id_2 UUID)
RETURNS INTEGER AS $$
DECLARE
    mutual_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO mutual_count
    FROM public.follows f1
    INNER JOIN public.follows f2 ON f1.follower_id = f2.follower_id
    WHERE f1.following_id = p_user_id_1
    AND f2.following_id = p_user_id_2
    AND f1.follower_id != p_user_id_1
    AND f1.follower_id != p_user_id_2;

    RETURN mutual_count;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Buscar posts do feed
-- --------------------------------------------
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
-- PROFILE STATS RPC (Optimization)
-- ============================================
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
