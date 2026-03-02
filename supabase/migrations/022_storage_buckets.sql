-- ============================================
-- CODE6MM - 022: STORAGE BUCKETS SETUP
-- ============================================
-- Configura buckets do Supabase Storage para imagens
-- Preparado para futura migração para Cloudflare R2/Images
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('post-images', 'post-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Post Images Policies
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all post images
CREATE POLICY "Public read access to post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Avatar Policies
-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all avatars
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- HELPER COMMENTS
-- ============================================

-- COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration. Currently using Supabase Storage, prepared for migration to Cloudflare R2/Images';
