-- Migration: Add image_id column for Cloudflare R2
-- This allows storing R2 image UUIDs separately from legacy Supabase URLs
-- Backward compatible: existing records use 'url', new records use 'image_id'

ALTER TABLE public.post_images
ADD COLUMN image_id UUID;

-- Index for performance when querying by image_id
CREATE INDEX idx_post_images_image_id ON public.post_images(image_id);

-- Add comment for documentation
COMMENT ON COLUMN public.post_images.image_id IS 'UUID of image in Cloudflare R2. NULL = legacy Supabase image (use url column)';
