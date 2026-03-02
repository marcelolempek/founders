-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    icon text,
    type text NOT NULL DEFAULT 'achievement', -- 'achievement', 'role', 'status'
    default_duration_days integer, -- Default validity in days. NULL means permanent.
    created_at timestamptz DEFAULT now(),
    CONSTRAINT badges_pkey PRIMARY KEY (id),
    CONSTRAINT badges_name_key UNIQUE (name)
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    verified boolean DEFAULT false,
    verified_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT user_badges_pkey PRIMARY KEY (id),
    CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
DROP POLICY IF EXISTS "Authenticated users can select badges" ON public.badges;
DROP POLICY IF EXISTS "Authenticated users can insert badges" ON public.badges;
DROP POLICY IF EXISTS "Authenticated users can update badges" ON public.badges;

DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
DROP POLICY IF EXISTS "Authenticated users can insert user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Authenticated users can update user_badges" ON public.user_badges;
DROP POLICY IF EXISTS "Authenticated users can delete user_badges" ON public.user_badges;

-- Badges Policies
CREATE POLICY "Badges are viewable by everyone" ON public.badges
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert badges" ON public.badges
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update badges" ON public.badges
    FOR UPDATE TO authenticated USING (true);

-- User Badges Policies
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert user_badges" ON public.user_badges
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update user_badges" ON public.user_badges
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete user_badges" ON public.user_badges
    FOR DELETE TO authenticated USING (true);
