-- ============================================
-- CODE6MM - WHATSAPP ANALYTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW public.v_whatsapp_stats AS
SELECT 
    p.id as post_id,
    p.title as post_title,
    p.user_id as seller_id,
    pr.username as seller_username,
    count(cv.id) as total_clicks,
    count(distinct cv.user_id) as unique_users
FROM public.posts p
LEFT JOIN public.contact_views cv ON p.id = cv.post_id
JOIN public.profiles pr ON p.user_id = pr.id
GROUP BY p.id, p.title, p.user_id, pr.username;

-- Grant access to authenticated users (admin checks should be done at app level)
GRANT SELECT ON public.v_whatsapp_stats TO authenticated;
