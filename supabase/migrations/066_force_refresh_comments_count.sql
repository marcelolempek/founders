-- ============================================
-- CODE6MM - 066: FORCE REFRESH COMMENTS COUNT
-- ============================================
-- Força refresh do comments_count em produção
-- Recria triggers e reconta todos os comentários
-- ============================================

BEGIN;

-- 1. Recriar função de atualização de comments_count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar triggers
DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;
CREATE TRIGGER on_comment_insert
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

DROP TRIGGER IF EXISTS on_comment_delete ON public.comments;
CREATE TRIGGER on_comment_delete
    AFTER DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- 3. Recontar TODOS os comentários (força atualização)
UPDATE public.posts
SET comments_count = (
    SELECT COUNT(*)::INTEGER
    FROM public.comments
    WHERE comments.post_id = posts.id
);

-- 4. Adicionar comentário na função get_feed_posts para forçar atualização
COMMENT ON FUNCTION public.get_feed_posts(UUID, TEXT, INTEGER, INTEGER, DECIMAL, DECIMAL, TEXT) IS 
'Retorna posts do feed com scoring de relevância, distância e status de following. Atualizado em 2026-01-06 18:30 para garantir comments_count correto.';

COMMIT;

