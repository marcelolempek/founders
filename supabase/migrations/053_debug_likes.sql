-- ============================================
-- DEBUG: TEMPORARILY DISABLE RLS ON LIKES
-- ============================================

ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;

-- Also force the policy to be permissive just in case we re-enable it later without noticing
DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;
CREATE POLICY "likes_delete_own"
    ON public.likes FOR DELETE
    USING (true); -- Allow anyone to delete anything for debugging (DANGEROUS - DO NOT KEEP IN PROD)

DROP POLICY IF EXISTS "likes_insert_authenticated" ON public.likes;
CREATE POLICY "likes_insert_authenticated"
    ON public.likes FOR INSERT
    WITH CHECK (true); -- Allow anyone to insert anything
