-- ============================================
-- CODE6MM - 013: CORREÇÕES DA REVISÃO
-- ============================================
-- Correções identificadas durante revisão de código
-- Data: 2025-12-31
-- ============================================

-- ============================================
-- FIX 1: Corrigir função check_rate_limit
-- ============================================
-- Problema: A função contava a primeira ação como 2 em vez de 1
-- Solução: Usar UPSERT corretamente com lógica de janela temporal

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_count INTEGER,
    p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start_time TIMESTAMPTZ;
BEGIN
    window_start_time := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

    -- Buscar contagem atual
    SELECT COALESCE(SUM(action_count), 0) INTO current_count
    FROM public.rate_limits
    WHERE user_id = p_user_id
    AND action_type = p_action
    AND window_start > window_start_time;

    IF current_count >= p_max_count THEN
        -- Registrar atividade suspeita se exceder muito
        IF current_count > p_max_count * 2 THEN
            INSERT INTO public.suspicious_activities (user_id, activity_type, severity, details)
            VALUES (p_user_id, 'rate_limit_abuse', 'medium',
                jsonb_build_object('action', p_action, 'count', current_count, 'limit', p_max_count));
        END IF;
        RETURN FALSE;
    END IF;

    -- Inserir ou atualizar contagem usando UPSERT
    INSERT INTO public.rate_limits (user_id, action_type, action_count, window_start)
    VALUES (p_user_id, p_action, 1, NOW())
    ON CONFLICT (user_id, action_type) DO UPDATE
    SET action_count = CASE
        -- Se a janela expirou, reiniciar contagem
        WHEN public.rate_limits.window_start <= window_start_time THEN 1
        -- Senao, incrementar
        ELSE public.rate_limits.action_count + 1
    END,
    window_start = CASE
        WHEN public.rate_limits.window_start <= window_start_time THEN NOW()
        ELSE public.rate_limits.window_start
    END;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.check_rate_limit IS 'Verifica e registra rate limit por usuario/acao. Retorna TRUE se permitido, FALSE se bloqueado.';

-- ============================================
-- FIX 2: Corrigir política de notificações
-- ============================================
-- Problema: Política permitia qualquer usuário criar notificações para outros (spam)
-- Solução: Restringir para próprio usuário ou admins

DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;

CREATE POLICY "notifications_insert_service"
    ON public.notifications FOR INSERT
    WITH CHECK (
        user_id = auth.uid()  -- Usuario pode criar notificacao para si (via triggers)
        OR public.is_admin_or_moderator(auth.uid())  -- Admins podem criar para qualquer um
    );

COMMENT ON POLICY "notifications_insert_service" ON public.notifications IS 'Permite criar notificações apenas para si mesmo ou se for admin/moderador';

-- ============================================
-- FIX 3: Garantir constraint UNIQUE em rate_limits
-- ============================================
-- Adicionar constraint se não existir (idempotente)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'rate_limits_user_action_unique'
    ) THEN
        ALTER TABLE public.rate_limits
        ADD CONSTRAINT rate_limits_user_action_unique UNIQUE (user_id, action_type);
    END IF;
END $$;

-- ============================================
-- VALIDAÇÃO: Verificar integridade
-- ============================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Verificar se todas as tabelas principais existem
    SELECT COUNT(*) INTO v_count FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('profiles', 'posts', 'follows', 'likes', 'comments', 'reviews', 'reports', 'notifications');

    IF v_count < 8 THEN
        RAISE EXCEPTION 'Tabelas principais faltando! Encontradas: %', v_count;
    END IF;

    -- Verificar se função is_admin_or_moderator existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'is_admin_or_moderator'
    ) THEN
        RAISE EXCEPTION 'Função is_admin_or_moderator não encontrada!';
    END IF;

    RAISE NOTICE 'Validação concluída com sucesso!';
END $$;
