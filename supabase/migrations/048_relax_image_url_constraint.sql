-- Migration: Relax post_images url constraint for R2 support
-- When using Cloudflare R2, image_id is used and url can be NULL

ALTER TABLE public.post_images 
ALTER COLUMN url DROP NOT NULL;

COMMENT ON COLUMN public.post_images.url IS 'Legacy Supabase storage URL. Can be NULL if image_id is present (R2 storage)';
