-- ============================================
-- CODE6MM - 008: VIEWS
-- ============================================
-- Views uteis para consultas frequentes
-- Dependencias: 003_tables.sql
-- ============================================

-- --------------------------------------------
-- VIEW: Posts com informacoes do autor
-- --------------------------------------------
CREATE OR REPLACE VIEW public.posts_with_author AS
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
    p.bumped_at,
    p.sold_at,
    p.created_at,
    p.updated_at,
    pr.username AS author_username,
    pr.full_name AS author_full_name,
    pr.avatar_url AS author_avatar,
    pr.is_verified AS author_is_verified,
    pr.reputation_score AS author_reputation,
    pr.sales_count AS author_sales_count,
    (
        SELECT pi.url
        FROM public.post_images pi
        WHERE pi.post_id = p.id AND pi.is_cover = TRUE
        LIMIT 1
    ) AS cover_image_url
FROM public.posts p
INNER JOIN public.profiles pr ON p.user_id = pr.id;

COMMENT ON VIEW public.posts_with_author IS 'Posts com dados do autor para exibicao no feed';

-- --------------------------------------------
-- VIEW: Estatisticas de moderacao
-- --------------------------------------------
CREATE OR REPLACE VIEW public.moderation_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_reports,
    COUNT(*) FILTER (WHERE status = 'investigating') AS investigating_reports,
    COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_reports,
    COUNT(*) FILTER (WHERE status = 'dismissed') AS dismissed_reports,
    COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '24 hours') AS resolved_today,
    COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '7 days') AS resolved_this_week,
    COUNT(*) FILTER (WHERE priority = 'urgent' AND status = 'pending') AS urgent_pending,
    COUNT(*) FILTER (WHERE priority = 'high' AND status = 'pending') AS high_pending
FROM public.reports;

COMMENT ON VIEW public.moderation_stats IS 'Estatisticas da fila de moderacao';

-- --------------------------------------------
-- VIEW: Estatisticas de verificacao
-- --------------------------------------------
CREATE OR REPLACE VIEW public.verification_stats AS
SELECT
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_requests,
    COUNT(*) FILTER (WHERE status = 'approved') AS total_approved,
    COUNT(*) FILTER (WHERE status = 'rejected') AS total_rejected,
    COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at > NOW() - INTERVAL '30 days') AS approved_this_month,
    COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at > NOW() - INTERVAL '30 days') AS rejected_this_month,
    COUNT(*) FILTER (WHERE type = 'identity') AS identity_requests,
    COUNT(*) FILTER (WHERE type = 'store') AS store_requests,
    COUNT(*) FILTER (WHERE type = 'partner') AS partner_requests
FROM public.verification_requests;

COMMENT ON VIEW public.verification_stats IS 'Estatisticas de solicitacoes de verificacao';

-- --------------------------------------------
-- VIEW: Estatisticas gerais do admin
-- --------------------------------------------
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE status = 'active') AS total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '24 hours') AS new_users_today,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_this_week,
    (SELECT COUNT(*) FROM public.profiles WHERE is_verified = TRUE) AS verified_users,
    (SELECT COUNT(*) FROM public.posts WHERE status = 'active') AS active_posts,
    (SELECT COUNT(*) FROM public.posts WHERE created_at > NOW() - INTERVAL '24 hours') AS new_posts_today,
    (SELECT COUNT(*) FROM public.posts WHERE status = 'sold') AS sold_posts,
    (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports,
    (SELECT COUNT(*) FROM public.verification_requests WHERE status = 'pending') AS pending_verifications,
    (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open') AS open_tickets;

COMMENT ON VIEW public.admin_dashboard_stats IS 'Estatisticas gerais para o dashboard admin';

-- --------------------------------------------
-- VIEW: Fila de moderacao
-- --------------------------------------------
CREATE OR REPLACE VIEW public.moderation_queue AS
SELECT
    r.id,
    r.reporter_id,
    r.target_type,
    r.target_id,
    r.reason,
    r.details,
    r.status,
    r.priority,
    r.assigned_to,
    r.resolution_notes,
    r.resolved_at,
    r.created_at,
    r.updated_at,
    reporter.username AS reporter_username,
    reporter.avatar_url AS reporter_avatar,
    assigned.username AS assigned_username,
    CASE r.target_type
        WHEN 'post' THEN (SELECT title FROM public.posts WHERE id = r.target_id)
        WHEN 'user' THEN (SELECT username FROM public.profiles WHERE id = r.target_id)
        WHEN 'comment' THEN (SELECT LEFT(content, 100) FROM public.comments WHERE id = r.target_id)
    END AS target_preview
FROM public.reports r
LEFT JOIN public.profiles reporter ON r.reporter_id = reporter.id
LEFT JOIN public.profiles assigned ON r.assigned_to = assigned.id
ORDER BY
    CASE r.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    r.created_at ASC;

COMMENT ON VIEW public.moderation_queue IS 'Fila de moderacao ordenada por prioridade';

-- --------------------------------------------
-- VIEW: Fila de verificacao
-- --------------------------------------------
CREATE OR REPLACE VIEW public.verification_queue AS
SELECT
    vr.id,
    vr.user_id,
    vr.type,
    vr.document_urls,
    vr.status,
    vr.notes,
    vr.reviewed_by,
    vr.submitted_at,
    vr.reviewed_at,
    u.username,
    u.full_name,
    u.avatar_url,
    u.phone,
    u.location_city,
    u.location_state,
    u.created_at AS user_created_at,
    reviewer.username AS reviewer_username
FROM public.verification_requests vr
INNER JOIN public.profiles u ON vr.user_id = u.id
LEFT JOIN public.profiles reviewer ON vr.reviewed_by = reviewer.id
ORDER BY vr.submitted_at ASC;

COMMENT ON VIEW public.verification_queue IS 'Fila de solicitacoes de verificacao';

-- --------------------------------------------
-- VIEW: Comentarios com autor
-- --------------------------------------------
CREATE OR REPLACE VIEW public.comments_with_author AS
SELECT
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.parent_id,
    c.is_edited,
    c.created_at,
    c.updated_at,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    u.is_verified AS author_is_verified
FROM public.comments c
INNER JOIN public.profiles u ON c.user_id = u.id;

COMMENT ON VIEW public.comments_with_author IS 'Comentarios com dados do autor';

-- --------------------------------------------
-- VIEW: Reviews com detalhes
-- --------------------------------------------
CREATE OR REPLACE VIEW public.reviews_with_details AS
SELECT
    r.id,
    r.reviewer_id,
    r.reviewed_user_id,
    r.post_id,
    r.rating,
    r.comment,
    r.is_buyer,
    r.created_at,
    r.updated_at,
    reviewer.username AS reviewer_username,
    reviewer.avatar_url AS reviewer_avatar,
    reviewer.is_verified AS reviewer_is_verified,
    reviewed.username AS reviewed_username,
    p.title AS post_title
FROM public.reviews r
INNER JOIN public.profiles reviewer ON r.reviewer_id = reviewer.id
INNER JOIN public.profiles reviewed ON r.reviewed_user_id = reviewed.id
LEFT JOIN public.posts p ON r.post_id = p.id;

COMMENT ON VIEW public.reviews_with_details IS 'Reviews com dados do avaliador e avaliado';

-- --------------------------------------------
-- VIEW: Perfil completo do usuario
-- --------------------------------------------
CREATE OR REPLACE VIEW public.profile_complete AS
SELECT
    p.*,
    (
        SELECT COUNT(*)
        FROM public.posts
        WHERE user_id = p.id AND status = 'active'
    ) AS active_posts_count,
    (
        SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2)
        FROM public.reviews
        WHERE reviewed_user_id = p.id
    ) AS calculated_reputation,
    (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewed_user_id = p.id AND rating >= 4
    ) AS positive_reviews_count,
    (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE reviewed_user_id = p.id AND rating <= 2
    ) AS negative_reviews_count
FROM public.profiles p;

COMMENT ON VIEW public.profile_complete IS 'Perfil completo com estatisticas calculadas';
