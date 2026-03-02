-- ============================================
-- CODE6MM - 004: INDICES
-- ============================================
-- Indices para otimizacao de performance
-- Dependencias: 003_tables.sql
-- ============================================

-- --------------------------------------------
-- PROFILES
-- --------------------------------------------
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_location ON public.profiles(location_state, location_city);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified) WHERE is_verified = TRUE;

-- --------------------------------------------
-- FOLLOWS
-- --------------------------------------------
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- --------------------------------------------
-- POSTS
-- --------------------------------------------
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_type ON public.posts(type);
CREATE INDEX idx_posts_condition ON public.posts(condition);
CREATE INDEX idx_posts_location ON public.posts(location_state, location_city);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_price ON public.posts(price) WHERE price IS NOT NULL;
CREATE INDEX idx_posts_is_bumped ON public.posts(is_bumped, bumped_at DESC) WHERE is_bumped = TRUE;
CREATE INDEX idx_posts_active ON public.posts(status, created_at DESC) WHERE status = 'active';

-- Indice composto para busca no feed
CREATE INDEX idx_posts_feed ON public.posts(status, created_at DESC, category);

-- --------------------------------------------
-- POST_IMAGES
-- --------------------------------------------
CREATE INDEX idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX idx_post_images_cover ON public.post_images(post_id) WHERE is_cover = TRUE;

-- --------------------------------------------
-- LIKES
-- --------------------------------------------
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_post_id ON public.likes(post_id);

-- --------------------------------------------
-- COMMENTS
-- --------------------------------------------
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_created_at ON public.comments(post_id, created_at DESC);

-- --------------------------------------------
-- REVIEWS
-- --------------------------------------------
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_user_id ON public.reviews(reviewed_user_id);
CREATE INDEX idx_reviews_post_id ON public.reviews(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_reviews_rating ON public.reviews(reviewed_user_id, rating);

-- --------------------------------------------
-- REPORTS
-- --------------------------------------------
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_priority ON public.reports(priority);
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX idx_reports_pending ON public.reports(priority DESC, created_at ASC) WHERE status = 'pending';

-- Indice composto para fila de moderacao
CREATE INDEX idx_reports_moderation_queue ON public.reports(status, priority DESC, created_at ASC);

-- --------------------------------------------
-- VERIFICATION_REQUESTS
-- --------------------------------------------
CREATE INDEX idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_pending ON public.verification_requests(submitted_at ASC) WHERE status = 'pending';

-- --------------------------------------------
-- SUBSCRIPTIONS
-- --------------------------------------------
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_subscriptions_expires ON public.subscriptions(expires_at) WHERE is_active = TRUE;

-- --------------------------------------------
-- SUPPORT_TICKETS
-- --------------------------------------------
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_open ON public.support_tickets(created_at ASC) WHERE status = 'open';

-- --------------------------------------------
-- ADMIN_LOGS
-- --------------------------------------------
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX idx_admin_logs_target ON public.admin_logs(target_type, target_id) WHERE target_id IS NOT NULL;

-- --------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON public.notifications(user_id, type);
