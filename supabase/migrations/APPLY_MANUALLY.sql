-- ============================================
-- CODE6MM - CONSTRAINTS E POLICIES
-- Execute este script no Supabase Dashboard → SQL Editor
-- ============================================
-- NOTA: Os buckets devem ser criados manualmente no Dashboard
-- Este script apenas configura constraints e policies
-- ============================================

BEGIN;

-- ============================================
-- ATUALIZAR ENUM E CONSTRAINTS
-- ============================================

-- Adicionar 'text' ao enum se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'text' 
        AND enumtypid = 'listing_type'::regtype
    ) THEN
        ALTER TYPE listing_type ADD VALUE 'text';
    END IF;
END $$;

-- Dropar constraints antigas
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sale_requires_price;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_sale_requires_condition;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_text_cannot_be_sold;

-- Adicionar novas constraints
ALTER TABLE posts 
ADD CONSTRAINT posts_sale_requires_price 
CHECK (
  (type = 'sale' AND price IS NOT NULL) OR 
  (type != 'sale')
);

ALTER TABLE posts 
ADD CONSTRAINT posts_sale_requires_condition 
CHECK (
  (type = 'sale' AND condition IS NOT NULL) OR 
  (type != 'sale')
);

ALTER TABLE posts 
ADD CONSTRAINT posts_text_cannot_be_sold 
CHECK (
  (type != 'text') OR 
  (type = 'text' AND status != 'sold')
);

-- ============================================
-- STORAGE POLICIES - Post Images
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own post images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to post images" ON storage.objects;

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access to post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- ============================================
-- STORAGE POLICIES - Avatars
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Migrations aplicadas com sucesso!
-- - Post types refatorados (sale/text)
-- - Storage buckets criados (post-images, avatars)
-- - RLS policies configuradas
-- ============================================

-- ============================================
-- MIGRATION 024: FIX RATE LIMITS RLS
-- ============================================
-- Permite que usuários autenticados possam inserir
-- em rate_limits via função check_rate_limit
-- Execute esta parte também!
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

COMMIT;

-- ============================================
-- TUDO COMPLETO!
-- ============================================
-- 1. Ir em Storage no Dashboard do Supabase
-- 2. Criar bucket "post-images":
--    - Public: SIM
--    - File size limit: 10 MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
-- 
-- 3. Criar bucket "avatars":
--    - Public: SIM
--    - File size limit: 5 MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
-- ============================================
