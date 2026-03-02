-- ============================================
-- FIX: Add missing is_boosted column to posts table
-- ============================================
-- This script adds the boost-related columns that are required
-- by the get_feed_posts function
-- ============================================

BEGIN;

-- Add boosted fields to posts table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_boosted') THEN
        ALTER TABLE public.posts ADD COLUMN is_boosted BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added column is_boosted to posts table';
    ELSE
        RAISE NOTICE 'Column is_boosted already exists';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'boosted_until') THEN
        ALTER TABLE public.posts ADD COLUMN boosted_until TIMESTAMPTZ;
        RAISE NOTICE 'Added column boosted_until to posts table';
    ELSE
        RAISE NOTICE 'Column boosted_until already exists';
    END IF;
END $$;

-- Create index for boosted posts
CREATE INDEX IF NOT EXISTS idx_posts_boosted ON public.posts(is_boosted) WHERE is_boosted = true;

COMMIT;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'posts' AND column_name IN ('is_boosted', 'boosted_until');
