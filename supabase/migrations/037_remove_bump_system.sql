-- ============================================
-- CODE6MM - REMOVE FREE BUMP SYSTEM
-- Migration 037: Remove sistema de bump gratuito
-- ============================================
-- DECISÃO: Manter apenas boost pago (R$ 9,90)
-- REMOVE: is_bumped, bumped_at, bump_post()
-- ============================================

BEGIN;

-- 1. Dropar função bump_post
DROP FUNCTION IF EXISTS public.bump_post(UUID, UUID);

-- 2. Remover colunas is_bumped e bumped_at da tabela posts
-- CASCADE remove views dependentes automaticamente
ALTER TABLE public.posts DROP COLUMN IF EXISTS is_bumped CASCADE;
ALTER TABLE public.posts DROP COLUMN IF EXISTS bumped_at CASCADE;

-- 3. Dropar índice relacionado
DROP INDEX IF EXISTS public.idx_posts_is_bumped;

-- 4. Atualizar get_feed_posts para remover referências a is_bumped
-- (Já foi atualizado na migration 036 para usar is_boosted)

COMMIT;

-- ============================================
-- LIMPEZA COMPLETA
-- ============================================
-- ✅ Função bump_post removida
-- ✅ Coluna is_bumped removida
-- ✅ Coluna bumped_at removida
-- ✅ Índice idx_posts_is_bumped removido
-- ✅ Sistema simplificado: apenas boost pago
-- ============================================
