-- Fix reviews RLS to allow profile reviews (without post_id)
-- Currently reviews are only allowed for sold posts, but we also want to allow
-- general profile reviews

DROP POLICY IF EXISTS "reviews_insert_verified_transaction" ON public.reviews;

-- New policy: Allow authenticated users to review other users
-- Either via a sold post OR as a general profile review
CREATE POLICY "reviews_insert_authenticated"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND reviewer_id != reviewed_user_id  -- Can't review yourself
        AND (
            -- Case 1: Review via sold post (original logic)
            (
                post_id IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM public.posts p
                    WHERE p.id = reviews.post_id
                    AND p.status = 'sold'
                    AND (
                        (reviews.is_buyer = TRUE AND p.buyer_id = auth.uid())
                        OR
                        (reviews.is_buyer = FALSE AND p.user_id = auth.uid())
                    )
                )
            )
            OR
            -- Case 2: General profile review (no post required)
            (
                post_id IS NULL
                -- Could add additional checks here, like:
                -- - User must have interacted with the reviewed user
                -- - User must have completed at least one transaction
                -- For now, we allow any authenticated user to review
            )
        )
    );

COMMENT ON POLICY "reviews_insert_authenticated" ON public.reviews IS 
'Allows authenticated users to create reviews either for sold posts or as general profile reviews';
