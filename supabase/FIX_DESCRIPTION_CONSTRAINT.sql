-- ============================================
-- EXECUTE ESTE SQL NO SUPABASE DASHBOARD
-- SQL Editor → New Query → Cole e Execute
-- ============================================
-- Fix: Reduz mínimo de caracteres da descrição
-- De: 10 caracteres → Para: 5 caracteres
-- ============================================

BEGIN;

-- 1. Remover constraint antiga
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_description_check;

-- 2. Adicionar nova constraint (mínimo 5 caracteres)
ALTER TABLE public.posts 
ADD CONSTRAINT posts_description_check 
CHECK (char_length(description) >= 5);

-- 3. Recarregar schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute para confirmar a mudança:
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.posts'::regclass
AND conname = 'posts_description_check';

-- ============================================
-- RESULTADO ESPERADO:
-- posts_description_check | CHECK (char_length(description) >= 5)
-- ============================================
