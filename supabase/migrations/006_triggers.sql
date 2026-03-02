-- ============================================
-- CODE6MM - 006: TRIGGERS
-- ============================================
-- Todos os triggers do sistema
-- Dependencias: 003_tables.sql, 005_functions.sql
-- ============================================

-- --------------------------------------------
-- TRIGGERS: updated_at automatico
-- --------------------------------------------

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --------------------------------------------
-- TRIGGER: Criar perfil ao registrar usuario
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------
-- TRIGGERS: Contadores de likes
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_like_insert ON public.likes;
CREATE TRIGGER on_like_insert
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

DROP TRIGGER IF EXISTS on_like_delete ON public.likes;
CREATE TRIGGER on_like_delete
    AFTER DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- --------------------------------------------
-- TRIGGERS: Contadores de comments
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_comment_insert ON public.comments;
CREATE TRIGGER on_comment_insert
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

DROP TRIGGER IF EXISTS on_comment_delete ON public.comments;
CREATE TRIGGER on_comment_delete
    AFTER DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- --------------------------------------------
-- TRIGGERS: Contadores de followers
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_follow_insert ON public.follows;
CREATE TRIGGER on_follow_insert
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_followers_count();

DROP TRIGGER IF EXISTS on_follow_delete ON public.follows;
CREATE TRIGGER on_follow_delete
    AFTER DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_followers_count();

-- --------------------------------------------
-- TRIGGERS: Contadores de posts do usuario
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_post_insert ON public.posts;
CREATE TRIGGER on_post_insert
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_user_posts_count();

DROP TRIGGER IF EXISTS on_post_delete ON public.posts;
CREATE TRIGGER on_post_delete
    AFTER DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_user_posts_count();

-- --------------------------------------------
-- TRIGGER: Atualizar reputacao com reviews
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_review_insert ON public.reviews;
CREATE TRIGGER on_review_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();

DROP TRIGGER IF EXISTS on_review_update ON public.reviews;
CREATE TRIGGER on_review_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();

DROP TRIGGER IF EXISTS on_review_delete ON public.reviews;
CREATE TRIGGER on_review_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_user_reputation();

-- --------------------------------------------
-- TRIGGER: Atualizar sales_count quando vendido
-- --------------------------------------------

DROP TRIGGER IF EXISTS on_post_status_change ON public.posts;
CREATE TRIGGER on_post_status_change
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.update_sales_count();
