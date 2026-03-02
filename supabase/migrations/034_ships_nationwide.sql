-- ============================================
-- CODE6MM - SHIPS NATIONWIDE
-- Migration 034: Adiciona suporte para envio nacional
-- ============================================

BEGIN;

-- 1. Adicionar campo na tabela posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS ships_nationwide BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.posts.ships_nationwide IS
'Indica se o vendedor envia para todo o Brasil';

-- 2. Adicionar campo padrao no perfil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS default_ships_nationwide BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.default_ships_nationwide IS
'Preferencia padrao de envio nacional do vendedor';

-- 3. Criar indice para performance
CREATE INDEX IF NOT EXISTS idx_posts_ships_nationwide
ON public.posts(ships_nationwide)
WHERE status = 'active';

-- 4. Funcao auxiliar para determinar regiao
CREATE OR REPLACE FUNCTION public.get_region(p_state TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_state IN ('SP', 'RJ', 'MG', 'ES') THEN 'sudeste'
        WHEN p_state IN ('RS', 'SC', 'PR') THEN 'sul'
        WHEN p_state IN ('BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA') THEN 'nordeste'
        WHEN p_state IN ('MT', 'MS', 'GO', 'DF') THEN 'centro-oeste'
        WHEN p_state IN ('AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO') THEN 'norte'
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;
