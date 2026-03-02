-- =============================================
-- Migration: Payment Tables for Mercado Pago Integration
-- =============================================

-- Payment preferences table (stores Mercado Pago preferences)
CREATE TABLE IF NOT EXISTS public.payment_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    preference_id TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('verified_seller', 'physical_store', 'partner', 'boost_post')),
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'in_process', 'refunded')),
    payment_id TEXT,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (stores completed payments)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'payout')),
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (stores active subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('verified_seller', 'physical_store', 'partner')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    payment_id TEXT,
    amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL CHECK (topic IN ('report', 'account', 'partnership', 'bug', 'other')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add boosted fields to posts table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_boosted') THEN
        ALTER TABLE public.posts ADD COLUMN is_boosted BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'boosted_until') THEN
        ALTER TABLE public.posts ADD COLUMN boosted_until TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_preferences_user ON public.payment_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_preferences_status ON public.payment_preferences(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON public.transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON public.posts(is_boosted) WHERE is_boosted = true;

-- Enable RLS
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_preferences
CREATE POLICY "Users can view own payment preferences"
    ON public.payment_preferences FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all preferences"
    ON public.payment_preferences FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all transactions"
    ON public.transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions"
    ON public.subscriptions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own tickets"
    ON public.support_tickets FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets"
    ON public.support_tickets FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all tickets"
    ON public.support_tickets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Admins can update tickets"
    ON public.support_tickets FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'moderator')
        )
    );

-- Function to expire old subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.subscriptions
    SET
        status = 'expired',
        is_active = false,
        updated_at = NOW()
    WHERE
        is_active = true
        AND expires_at < NOW();

    -- Also update profile verification status
    UPDATE public.profiles
    SET is_verified = false
    WHERE id IN (
        SELECT user_id FROM public.subscriptions
        WHERE status = 'expired'
        AND NOT EXISTS (
            SELECT 1 FROM public.subscriptions s2
            WHERE s2.user_id = subscriptions.user_id
            AND s2.is_active = true
        )
    );
END;
$$;

-- Function to reset boosted posts
CREATE OR REPLACE FUNCTION reset_expired_boosts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET
        is_boosted = false,
        boosted_until = NULL
    WHERE
        is_boosted = true
        AND boosted_until < NOW();
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_preferences_modtime
    BEFORE UPDATE ON public.payment_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_subscriptions_modtime
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_support_tickets_modtime
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
