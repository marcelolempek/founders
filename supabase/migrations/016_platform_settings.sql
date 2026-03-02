-- ============================================
-- CODE6MM - 011: PLATFORM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure singleton
    platform_name TEXT NOT NULL DEFAULT 'CODE6MM',
    support_email TEXT NOT NULL DEFAULT 'admin@code6mm.com',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Seed initial value if not exists
INSERT INTO public.platform_settings (id, platform_name, support_email)
VALUES (1, 'CODE6MM', 'admin@code6mm.com')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (or everyone if needed for public maintenance page)
CREATE POLICY "Everyone can read platform settings"
    ON public.platform_settings FOR SELECT
    USING (true);

-- Allow update access only to admins
CREATE POLICY "Admins can update platform settings"
    ON public.platform_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
