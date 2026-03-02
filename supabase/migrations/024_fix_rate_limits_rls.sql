-- ============================================
-- CODE6MM - 024: FIX RATE LIMITS RLS
-- ============================================
-- Permite que usuários autenticados possam inserir
-- em rate_limits via função check_rate_limit
-- ============================================

BEGIN;

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "rate_limits_system_only" ON rate_limits;

-- Allow authenticated users to insert/update their own rate limits
CREATE POLICY "Users can manage their own rate limits"
ON rate_limits FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow the check_rate_limit function to work
-- (function runs with SECURITY DEFINER so it can bypass RLS)

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
