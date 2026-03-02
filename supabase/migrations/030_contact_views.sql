-- ============================================
-- CODE6MM - CONTACT VIEWS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.contact_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Unique index to prevent duplicate views in the same day
-- Using AT TIME ZONE 'UTC' makes the cast to date immutable
CREATE UNIQUE INDEX IF NOT EXISTS unique_contact_view_per_day 
ON public.contact_views (user_id, post_id, (timezone('UTC', viewed_at)::date));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_views_user ON public.contact_views(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_views_post ON public.contact_views(post_id);

-- Enable RLS
ALTER TABLE public.contact_views ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own contact history"
    ON public.contact_views FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert contact views"
    ON public.contact_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.contact_views IS 'Tracks when a user views a post contact information (WhatsApp)';
