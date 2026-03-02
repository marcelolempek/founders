-- Execute este SQL no Supabase SQL Editor para corrigir o erro de schema cache
-- Problema: ships_nationwide não está no schema cache

-- Recarregar schema
NOTIFY pgrst, 'reload schema';

-- Verificar se a coluna existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'posts'
AND column_name IN ('ships_nationwide', 'is_boosted', 'boosted_until')
ORDER BY column_name;

-- Se ships_nationwide NÃO aparecer, execute:
-- ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS ships_nationwide BOOLEAN DEFAULT FALSE;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_ships_nationwide BOOLEAN DEFAULT FALSE;
