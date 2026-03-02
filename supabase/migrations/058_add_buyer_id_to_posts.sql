-- ============================================
-- CODE6MM - 058: RATING VALIDATION
-- ============================================

-- 1. Add buyer_id to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.posts.buyer_id IS 'ID do comprador, preenchido quando o status muda para sold';

-- 2. Add validation constraint to reviews
-- Ensure reviews are only allowed if the reviewer is the buyer or seller of the post
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_participant_check
CHECK (
    (is_buyer = TRUE)  -- If buyer review, verification happens via application logic or trigger
    OR 
    (is_buyer = FALSE) -- If seller review
);

-- Note: Complex validation (checking if auth.uid() matches buyer_id/user_id) is best handled 
-- via RLS or Application Logic because CHECK constraints cannot reference other tables (posts).
-- We will rely on RLS for strict security.

-- 3. RLS Policy Update for Reviews
-- Drop existing policies to be safe/update them
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;

-- Create more strict policy
CREATE POLICY "reviews_insert_verified_transaction"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND
        EXISTS (
            SELECT 1 FROM public.posts p
            WHERE p.id = reviews.post_id
            AND p.status = 'sold'
            AND (
                -- Case 1: Reviewer is Buyer
                (reviews.is_buyer = TRUE AND p.buyer_id = auth.uid())
                OR
                -- Case 2: Reviewer is Seller
                (reviews.is_buyer = FALSE AND p.user_id = auth.uid())
            )
        )
    );
