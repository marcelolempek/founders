-- ============================================
-- MIGRATION 039: FIX DESCRIPTION CONSTRAINT
-- ============================================
-- Reduz o mínimo de caracteres da descrição de 10 para 5
-- Permite descrições mais curtas como "teste"
-- ============================================

BEGIN;

-- Remover a constraint antiga
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_description_check;

-- Adicionar nova constraint com mínimo de 5 caracteres
ALTER TABLE public.posts 
ADD CONSTRAINT posts_description_check 
CHECK (char_length(description) >= 5);

COMMIT;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Agora é possível criar posts com descrições de 5+ caracteres
-- Exemplo: "teste" (5 chars) ✅
-- ============================================
