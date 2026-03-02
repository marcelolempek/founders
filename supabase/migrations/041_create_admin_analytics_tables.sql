-- Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'user', 'comment')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create Verification Requests Table
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Reports Policies
DROP POLICY IF EXISTS "Reports are viewable by admins and creator" ON public.reports;
CREATE POLICY "Reports are viewable by admins and creator" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authenticated users can create reports" ON public.reports
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Verification Request Policies
DROP POLICY IF EXISTS "Users can view own requests" ON public.verification_requests;
CREATE POLICY "Users can view own requests" ON public.verification_requests
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create requests" ON public.verification_requests
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- WhatsApp Stats View
CREATE OR REPLACE VIEW public.v_whatsapp_stats AS
SELECT 
    p.id AS post_id,
    p.title AS post_title,
    seller.username AS seller_username,
    COUNT(cv.id) AS total_clicks,
    COUNT(DISTINCT cv.user_id) AS unique_users
FROM 
    public.posts p
    JOIN public.profiles seller ON p.user_id = seller.id
    LEFT JOIN public.contact_views cv ON p.id = cv.post_id
WHERE 
    cv.id IS NOT NULL
GROUP BY 
    p.id, p.title, seller.username;
