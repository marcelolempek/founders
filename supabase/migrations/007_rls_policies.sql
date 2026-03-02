-- ============================================
-- CODE6MM - 007: ROW LEVEL SECURITY
-- ============================================
-- Politicas de seguranca para todas as tabelas
-- Dependencias: 003_tables.sql, 005_functions.sql
-- ============================================

-- --------------------------------------------
-- HABILITAR RLS EM TODAS AS TABELAS
-- --------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: PROFILES
-- ============================================

-- Todos podem ver perfis ativos
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (
        status = 'active'
        OR id = auth.uid()
        OR public.is_admin_or_moderator(auth.uid())
    );

-- Usuarios podem atualizar seu proprio perfil
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins podem atualizar qualquer perfil
CREATE POLICY "profiles_update_admin"
    ON public.profiles FOR UPDATE
    USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: FOLLOWS
-- ============================================

-- Todos podem ver follows
CREATE POLICY "follows_select_public"
    ON public.follows FOR SELECT
    USING (TRUE);

-- Usuarios autenticados podem seguir outros
CREATE POLICY "follows_insert_authenticated"
    ON public.follows FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

-- Usuarios podem deixar de seguir
CREATE POLICY "follows_delete_own"
    ON public.follows FOR DELETE
    USING (auth.uid() = follower_id);

-- ============================================
-- POLICIES: POSTS
-- ============================================

-- Posts ativos visiveis por todos, dono ve todos os seus
CREATE POLICY "posts_select_public"
    ON public.posts FOR SELECT
    USING (
        status = 'active'
        OR user_id = auth.uid()
        OR public.is_admin_or_moderator(auth.uid())
    );

-- Usuarios autenticados podem criar posts
CREATE POLICY "posts_insert_authenticated"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Donos podem atualizar seus posts
CREATE POLICY "posts_update_own"
    ON public.posts FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- Donos podem deletar seus posts
CREATE POLICY "posts_delete_own"
    ON public.posts FOR DELETE
    USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: POST_IMAGES
-- ============================================

-- Imagens visiveis se post eh visivel
CREATE POLICY "post_images_select_public"
    ON public.post_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_images.post_id
            AND (p.status = 'active' OR p.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
        )
    );

-- Donos do post podem adicionar imagens
CREATE POLICY "post_images_insert_owner"
    ON public.post_images FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_images.post_id AND p.user_id = auth.uid()
        )
    );

-- Donos do post podem atualizar imagens (ex: mudar cover)
CREATE POLICY "post_images_update_owner"
    ON public.post_images FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_images.post_id AND p.user_id = auth.uid()
        )
    );

-- Donos do post podem deletar imagens
CREATE POLICY "post_images_delete_owner"
    ON public.post_images FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = post_images.post_id AND p.user_id = auth.uid()
        )
        OR public.is_admin_or_moderator(auth.uid())
    );

-- ============================================
-- POLICIES: LIKES
-- ============================================

-- Todos podem ver likes
CREATE POLICY "likes_select_public"
    ON public.likes FOR SELECT
    USING (TRUE);

-- Usuarios autenticados podem dar like
CREATE POLICY "likes_insert_authenticated"
    ON public.likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuarios podem remover seus likes
CREATE POLICY "likes_delete_own"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: COMMENTS
-- ============================================

-- Comentarios visiveis em posts visiveis
CREATE POLICY "comments_select_public"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = comments.post_id
            AND (p.status = 'active' OR p.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
        )
    );

-- Usuarios autenticados podem comentar
CREATE POLICY "comments_insert_authenticated"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuarios podem editar seus comentarios
CREATE POLICY "comments_update_own"
    ON public.comments FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Usuarios podem deletar seus comentarios, donos do post tambem
CREATE POLICY "comments_delete_own_or_post_owner"
    ON public.comments FOR DELETE
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = comments.post_id AND p.user_id = auth.uid()
        )
        OR public.is_admin_or_moderator(auth.uid())
    );

-- ============================================
-- POLICIES: REVIEWS
-- ============================================

-- Todos podem ver reviews
CREATE POLICY "reviews_select_public"
    ON public.reviews FOR SELECT
    USING (TRUE);

-- Usuarios autenticados podem criar reviews
CREATE POLICY "reviews_insert_authenticated"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Usuarios podem editar suas reviews
CREATE POLICY "reviews_update_own"
    ON public.reviews FOR UPDATE
    USING (reviewer_id = auth.uid())
    WITH CHECK (reviewer_id = auth.uid());

-- Usuarios podem deletar suas reviews
CREATE POLICY "reviews_delete_own"
    ON public.reviews FOR DELETE
    USING (reviewer_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: REPORTS
-- ============================================

-- Usuarios veem seus reports, admins veem todos
CREATE POLICY "reports_select_own_or_admin"
    ON public.reports FOR SELECT
    USING (reporter_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- Usuarios autenticados podem criar reports
CREATE POLICY "reports_insert_authenticated"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Apenas admins podem atualizar reports
CREATE POLICY "reports_update_admin"
    ON public.reports FOR UPDATE
    USING (public.is_admin_or_moderator(auth.uid()));

-- Apenas admins podem deletar reports
CREATE POLICY "reports_delete_admin"
    ON public.reports FOR DELETE
    USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: VERIFICATION_REQUESTS
-- ============================================

-- Usuarios veem suas solicitacoes, admins veem todas
CREATE POLICY "verification_requests_select_own_or_admin"
    ON public.verification_requests FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- Usuarios autenticados podem criar solicitacoes
CREATE POLICY "verification_requests_insert_authenticated"
    ON public.verification_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Apenas admins podem atualizar solicitacoes
CREATE POLICY "verification_requests_update_admin"
    ON public.verification_requests FOR UPDATE
    USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: SUBSCRIPTIONS
-- ============================================

-- Usuarios veem suas assinaturas
CREATE POLICY "subscriptions_select_own_or_admin"
    ON public.subscriptions FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- Admins podem gerenciar assinaturas
CREATE POLICY "subscriptions_all_admin"
    ON public.subscriptions FOR ALL
    USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: SUPPORT_TICKETS
-- ============================================

-- Usuarios veem seus tickets
CREATE POLICY "support_tickets_select_own_or_admin"
    ON public.support_tickets FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()));

-- Usuarios podem criar tickets (mesmo anonimos)
CREATE POLICY "support_tickets_insert_public"
    ON public.support_tickets FOR INSERT
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Apenas admins podem atualizar tickets
CREATE POLICY "support_tickets_update_admin"
    ON public.support_tickets FOR UPDATE
    USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: ADMIN_LOGS
-- ============================================

-- Apenas admins podem ver logs
CREATE POLICY "admin_logs_select_admin"
    ON public.admin_logs FOR SELECT
    USING (public.is_admin_or_moderator(auth.uid()));

-- Apenas admins podem criar logs
CREATE POLICY "admin_logs_insert_admin"
    ON public.admin_logs FOR INSERT
    WITH CHECK (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- POLICIES: NOTIFICATIONS
-- ============================================

-- Usuarios veem suas notificacoes
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

-- Sistema pode criar notificacoes (admins/moderadores ou para si mesmo via triggers)
CREATE POLICY "notifications_insert_service"
    ON public.notifications FOR INSERT
    WITH CHECK (
        user_id = auth.uid()  -- Usuario pode criar notificacao para si (via triggers)
        OR public.is_admin_or_moderator(auth.uid())  -- Admins podem criar para qualquer um
    );

-- Usuarios podem atualizar suas notificacoes (marcar como lida)
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Usuarios podem deletar suas notificacoes
CREATE POLICY "notifications_delete_own"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid());
