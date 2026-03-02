-- ============================================
-- CODE6MM - 057: BLOCKED USERS
-- ============================================

-- 1. Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT blocked_users_unique UNIQUE (blocker_id, blocked_id),
    CONSTRAINT blocked_users_no_self_block CHECK (blocker_id != blocked_id)
);

COMMENT ON TABLE public.blocked_users IS 'Usuarios bloqueados por outros usuarios';

-- 2. RLS Policies
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can see who they blocked
CREATE POLICY "Users can view their blocked users"
    ON public.blocked_users FOR SELECT
    USING (auth.uid() = blocker_id);

-- Check if I am blocked (for query filtering purposes, usually hidden but needed for logic)
-- Actually, usually we don't want users to list who blocked them easily, but for RPCs it might be needed.
-- Let's stick to blocker visibility for now.

-- Users can insert their own blocks
CREATE POLICY "Users can block others"
    ON public.blocked_users FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

-- Users can unblock
CREATE POLICY "Users can unblock"
    ON public.blocked_users FOR DELETE
    USING (auth.uid() = blocker_id);

-- 3. RPC Function to block user (and remove follow)
CREATE OR REPLACE FUNCTION public.block_user(
    p_blocker_id UUID,
    p_blocked_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Prevent self-block
    IF p_blocker_id = p_blocked_id THEN
        RAISE EXCEPTION 'Cannot block yourself';
    END IF;

    -- Insert into blocked_users
    INSERT INTO public.blocked_users (blocker_id, blocked_id)
    VALUES (p_blocker_id, p_blocked_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

    -- Remove any existing follow relationships
    DELETE FROM public.follows 
    WHERE (follower_id = p_blocker_id AND following_id = p_blocked_id)
       OR (follower_id = p_blocked_id AND following_id = p_blocker_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.block_user(UUID, UUID) TO authenticated;

-- 4. RPC to get blocked users (Simple wrapper or just use SELECT)
-- The UI uses direct select, but we need to ensure the foreign key alias matches what useSocial expects:
-- blocked:profiles!blocked_users_blocked_id_fkey
-- The default FK name might be different. Let's name it explicitly if needed, but standard naming is usually blocked_users_blocked_id_fkey.
