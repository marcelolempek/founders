-- ============================================
-- CODE6MM - FIX CONTACT ENDPOINT
-- Migration 056: Re-apply contact views table and RPC function to ensure they exist
-- ============================================

-- 1. Ensure contact_views table exists
CREATE TABLE IF NOT EXISTS public.contact_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS unique_contact_view_per_day 
ON public.contact_views (user_id, post_id, (timezone('UTC', viewed_at)::date));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_views_user ON public.contact_views(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_views_post ON public.contact_views(post_id);

-- Enable RLS
ALTER TABLE public.contact_views ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Users can view their own contact history" ON public.contact_views;
CREATE POLICY "Users can view their own contact history"
    ON public.contact_views FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert contact views" ON public.contact_views;
CREATE POLICY "System can insert contact views"
    ON public.contact_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- 2. Ensure RPC function exists
CREATE OR REPLACE FUNCTION public.get_post_contact(
    p_post_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    phone TEXT,
    username TEXT
) AS $$
DECLARE
    v_author_id UUID;
BEGIN
    -- Obter o autor do post
    SELECT user_id INTO v_author_id FROM public.posts WHERE id = p_post_id;
    
    IF v_author_id IS NULL THEN
        RETURN;
    END IF;

    -- Registrar visualização (ON CONFLICT garante apenas uma por dia por usuário/post)
    INSERT INTO public.contact_views (user_id, post_id)
    VALUES (p_user_id, p_post_id)
    ON CONFLICT (user_id, post_id, (timezone('UTC', viewed_at)::date)) DO NOTHING;
    
    -- Retornar contato
    RETURN QUERY
    SELECT 
        pr.phone,
        pr.username
    FROM public.profiles pr
    WHERE pr.id = v_author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution
GRANT EXECUTE ON FUNCTION public.get_post_contact(UUID, UUID) TO authenticated;
