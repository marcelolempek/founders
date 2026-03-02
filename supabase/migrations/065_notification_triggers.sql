-- ============================================
-- CODE6MM - 065: TRIGGERS DE NOTIFICAÇÕES
-- ============================================
-- Cria triggers para gerar notificações automaticamente
-- ============================================

-- --------------------------------------------
-- FUNÇÃO: Criar notificação de comentário em post
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_comment_on_post()
RETURNS TRIGGER AS $$
DECLARE
    v_post_author_id UUID;
    v_post_title TEXT;
    v_commenter_username TEXT;
BEGIN
    -- Buscar o autor do post e o título
    SELECT user_id, title INTO v_post_author_id, v_post_title
    FROM public.posts
    WHERE id = NEW.post_id;

    -- Buscar username de quem comentou
    SELECT username INTO v_commenter_username
    FROM public.profiles
    WHERE id = NEW.user_id;

    -- Só notificar se quem comentou não é o próprio autor do post
    IF v_post_author_id != NEW.user_id THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            data,
            is_read,
            created_at
        ) VALUES (
            v_post_author_id,
            'comment',
            'Novo comentário',
            v_commenter_username || ' comentou: "' || LEFT(NEW.content, 100) || '"',
            jsonb_build_object(
                'post_id', NEW.post_id,
                'comment_id', NEW.id,
                'commenter_id', NEW.user_id,
                'commenter_username', v_commenter_username,
                'post_title', v_post_title
            ),
            FALSE,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- FUNÇÃO: Criar notificação de resposta a comentário
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_comment_author_id UUID;
    v_post_id UUID;
    v_replier_username TEXT;
BEGIN
    -- Só processar se for uma resposta (tem parent_id)
    IF NEW.parent_id IS NOT NULL THEN
        -- Buscar o autor do comentário pai e o post_id
        SELECT user_id, post_id INTO v_parent_comment_author_id, v_post_id
        FROM public.comments
        WHERE id = NEW.parent_id;

        -- Buscar username de quem respondeu
        SELECT username INTO v_replier_username
        FROM public.profiles
        WHERE id = NEW.user_id;

        -- Só notificar se quem respondeu não é o próprio autor do comentário
        IF v_parent_comment_author_id != NEW.user_id THEN
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message,
                data,
                is_read,
                created_at
            ) VALUES (
                v_parent_comment_author_id,
                'comment_reply',
                'Nova resposta',
                v_replier_username || ' respondeu seu comentário: "' || LEFT(NEW.content, 100) || '"',
                jsonb_build_object(
                    'post_id', v_post_id,
                    'comment_id', NEW.id,
                    'parent_comment_id', NEW.parent_id,
                    'replier_id', NEW.user_id,
                    'replier_username', v_replier_username
                ),
                FALSE,
                NOW()
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- FUNÇÃO: Criar notificação de avaliação
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_review()
RETURNS TRIGGER AS $$
DECLARE
    v_reviewer_username TEXT;
BEGIN
    -- Buscar username de quem avaliou
    SELECT username INTO v_reviewer_username
    FROM public.profiles
    WHERE id = NEW.reviewer_id;

    -- Criar notificação para quem foi avaliado
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data,
        is_read,
        created_at
    ) VALUES (
        NEW.reviewed_user_id,
        'review',
        'Nova avaliação',
        v_reviewer_username || ' avaliou você com ' || NEW.rating || ' estrelas' ||
        CASE WHEN NEW.comment IS NOT NULL THEN ': "' || LEFT(NEW.comment, 100) || '"' ELSE '' END,
        jsonb_build_object(
            'review_id', NEW.id,
            'reviewer_id', NEW.reviewer_id,
            'reviewer_username', v_reviewer_username,
            'rating', NEW.rating,
            'post_id', NEW.post_id
        ),
        FALSE,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- TRIGGERS
-- --------------------------------------------

-- Trigger para comentários em posts
DROP TRIGGER IF EXISTS trigger_notify_comment_on_post ON public.comments;
CREATE TRIGGER trigger_notify_comment_on_post
    AFTER INSERT ON public.comments
    FOR EACH ROW
    WHEN (NEW.parent_id IS NULL) -- Só para comentários diretos no post
    EXECUTE FUNCTION public.notify_comment_on_post();

-- Trigger para respostas a comentários
DROP TRIGGER IF EXISTS trigger_notify_comment_reply ON public.comments;
CREATE TRIGGER trigger_notify_comment_reply
    AFTER INSERT ON public.comments
    FOR EACH ROW
    WHEN (NEW.parent_id IS NOT NULL) -- Só para respostas
    EXECUTE FUNCTION public.notify_comment_reply();

-- Trigger para avaliações
DROP TRIGGER IF EXISTS trigger_notify_review ON public.reviews;
CREATE TRIGGER trigger_notify_review
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_review();

-- --------------------------------------------
-- COMENTÁRIOS
-- --------------------------------------------
COMMENT ON FUNCTION public.notify_comment_on_post() IS 'Cria notificação quando alguém comenta em um post';
COMMENT ON FUNCTION public.notify_comment_reply() IS 'Cria notificação quando alguém responde um comentário';
COMMENT ON FUNCTION public.notify_review() IS 'Cria notificação quando alguém recebe uma avaliação';
