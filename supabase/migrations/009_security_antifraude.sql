-- ============================================
-- CODE6MM - 009: SEGURANCA E ANTIFRAUDE
-- ============================================
-- Tabelas e funcoes adicionais para seguranca
-- Dependencias: 003_tables.sql, 005_functions.sql
-- ============================================

-- ============================================
-- PARTE 1: CAMPOS ADICIONAIS EM TABELAS EXISTENTES
-- ============================================

-- Campos adicionais em profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Campos adicionais em posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reported_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS auto_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- ============================================
-- PARTE 2: TABELAS DE SEGURANCA
-- ============================================

-- --------------------------------------------
-- BLOCKED_USERS (Bloqueio entre usuarios)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT blocked_users_no_self_block CHECK (blocker_id != blocked_id),
    CONSTRAINT blocked_users_unique UNIQUE (blocker_id, blocked_id)
);

COMMENT ON TABLE public.blocked_users IS 'Usuarios bloqueados por outros usuarios';

CREATE INDEX idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- --------------------------------------------
-- RATE_LIMITS (Controle de taxa de acoes)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address INET,
    action_type TEXT NOT NULL,
    action_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT rate_limits_user_action_unique UNIQUE (user_id, action_type)
);

COMMENT ON TABLE public.rate_limits IS 'Controle de rate limiting por usuario/IP';
COMMENT ON COLUMN public.rate_limits.action_type IS 'Tipo de acao: post_create, comment, report, login, etc';

CREATE INDEX idx_rate_limits_user ON public.rate_limits(user_id, action_type, window_start);
CREATE INDEX idx_rate_limits_ip ON public.rate_limits(ip_address, action_type, window_start);
CREATE INDEX idx_rate_limits_cleanup ON public.rate_limits(window_start);

-- --------------------------------------------
-- AUDIT_TRAIL (Trilha de auditoria completa)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.audit_trail IS 'Log de auditoria de todas as acoes do sistema';

CREATE INDEX idx_audit_trail_user ON public.audit_trail(user_id, created_at DESC);
CREATE INDEX idx_audit_trail_entity ON public.audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_trail_action ON public.audit_trail(action, created_at DESC);
CREATE INDEX idx_audit_trail_date ON public.audit_trail(created_at DESC);

-- --------------------------------------------
-- BANNED_WORDS (Palavras proibidas)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.banned_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('warning', 'block', 'ban')) DEFAULT 'warning',
    category TEXT CHECK (category IN ('offensive', 'illegal', 'spam', 'scam', 'other')),
    is_regex BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT banned_words_unique UNIQUE (word)
);

COMMENT ON TABLE public.banned_words IS 'Lista de palavras banidas para moderacao automatica';

CREATE INDEX idx_banned_words_active ON public.banned_words(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_banned_words_severity ON public.banned_words(severity);

-- --------------------------------------------
-- USER_SESSIONS (Sessoes de usuario)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    device_fingerprint TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_sessions IS 'Sessoes ativas dos usuarios para seguranca';

CREATE INDEX idx_sessions_user ON public.user_sessions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_sessions_fingerprint ON public.user_sessions(device_fingerprint);
CREATE INDEX idx_sessions_expires ON public.user_sessions(expires_at) WHERE is_active = TRUE;

-- --------------------------------------------
-- SUSPICIOUS_ACTIVITIES (Atividades suspeitas)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    details JSONB DEFAULT '{}',
    ip_address INET,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.suspicious_activities IS 'Registro de atividades suspeitas para analise';

CREATE INDEX idx_suspicious_user ON public.suspicious_activities(user_id);
CREATE INDEX idx_suspicious_unresolved ON public.suspicious_activities(severity DESC, created_at) WHERE resolved = FALSE;

-- ============================================
-- PARTE 3: FUNCOES DE SEGURANCA
-- ============================================

-- --------------------------------------------
-- Funcao: Verificar rate limit
-- --------------------------------------------
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

-- --------------------------------------------
-- Funcao: Verificar palavras banidas
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.check_banned_words(p_text TEXT)
RETURNS TABLE (word TEXT, severity TEXT, category TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT bw.word, bw.severity, bw.category
    FROM public.banned_words bw
    WHERE bw.is_active = TRUE
    AND (
        (bw.is_regex = FALSE AND LOWER(p_text) LIKE '%' || LOWER(bw.word) || '%')
        OR (bw.is_regex = TRUE AND p_text ~* bw.word)
    )
    ORDER BY
        CASE bw.severity WHEN 'ban' THEN 1 WHEN 'block' THEN 2 ELSE 3 END;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Auto-flag de posts suspeitos
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_flag_post()
RETURNS TRIGGER AS $$
DECLARE
    flagged_word RECORD;
    flag_reasons TEXT[] := '{}';
BEGIN
    -- Verificar palavras banidas no titulo e descricao
    FOR flagged_word IN
        SELECT * FROM public.check_banned_words(NEW.title || ' ' || NEW.description)
    LOOP
        IF flagged_word.severity = 'ban' THEN
            NEW.status := 'banned';
            NEW.auto_flagged := TRUE;
            flag_reasons := array_append(flag_reasons, 'Palavra proibida: ' || flagged_word.word);
        ELSIF flagged_word.severity = 'block' THEN
            NEW.auto_flagged := TRUE;
            flag_reasons := array_append(flag_reasons, 'Palavra suspeita: ' || flagged_word.word);
        END IF;
    END LOOP;

    -- Verificar preco muito baixo (possivel golpe)
    IF NEW.price IS NOT NULL AND NEW.price > 0 AND NEW.price < 10 AND NEW.type = 'sale' THEN
        NEW.auto_flagged := TRUE;
        flag_reasons := array_append(flag_reasons, 'Preco suspeito: R$ ' || NEW.price);
    END IF;

    -- Verificar preco muito alto (possivel erro ou golpe)
    IF NEW.price IS NOT NULL AND NEW.price > 50000 THEN
        NEW.auto_flagged := TRUE;
        flag_reasons := array_append(flag_reasons, 'Preco muito alto: R$ ' || NEW.price);
    END IF;

    -- Salvar razoes
    IF array_length(flag_reasons, 1) > 0 THEN
        NEW.flagged_reason := array_to_string(flag_reasons, '; ');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-flag
DROP TRIGGER IF EXISTS auto_flag_new_post ON public.posts;
CREATE TRIGGER auto_flag_new_post
    BEFORE INSERT OR UPDATE OF title, description, price ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.auto_flag_post();

-- --------------------------------------------
-- Funcao: Registrar tentativa de login
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.record_login_attempt(
    p_user_id UUID,
    p_success BOOLEAN,
    p_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_fails INTEGER;
    is_locked BOOLEAN;
BEGIN
    -- Verificar se esta bloqueado
    SELECT
        failed_login_count,
        locked_until > NOW()
    INTO current_fails, is_locked
    FROM public.profiles
    WHERE id = p_user_id;

    IF is_locked THEN
        RETURN FALSE;
    END IF;

    IF p_success THEN
        -- Login bem sucedido
        UPDATE public.profiles
        SET
            last_login_at = NOW(),
            login_count = login_count + 1,
            failed_login_count = 0,
            locked_until = NULL
        WHERE id = p_user_id;

        -- Registrar no audit
        INSERT INTO public.audit_trail (user_id, action, ip_address, user_agent)
        VALUES (p_user_id, 'login_success', p_ip, p_user_agent);

        RETURN TRUE;
    ELSE
        -- Login falhou
        UPDATE public.profiles
        SET
            failed_login_count = failed_login_count + 1,
            locked_until = CASE
                WHEN failed_login_count >= 4 THEN NOW() + INTERVAL '15 minutes'
                WHEN failed_login_count >= 9 THEN NOW() + INTERVAL '1 hour'
                WHEN failed_login_count >= 14 THEN NOW() + INTERVAL '24 hours'
                ELSE NULL
            END
        WHERE id = p_user_id;

        -- Registrar no audit
        INSERT INTO public.audit_trail (user_id, action, ip_address, user_agent)
        VALUES (p_user_id, 'login_failed', p_ip, p_user_agent);

        -- Registrar atividade suspeita se muitas falhas
        IF current_fails >= 5 THEN
            INSERT INTO public.suspicious_activities (user_id, activity_type, severity, ip_address, details)
            VALUES (p_user_id, 'brute_force_attempt', 'high', p_ip,
                jsonb_build_object('failed_count', current_fails + 1));
        END IF;

        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Verificar se usuario esta bloqueado
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.is_user_blocked(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blocked_users
        WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id
    );
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Bloquear usuario
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Nao pode bloquear a si mesmo
    IF p_blocker_id = p_blocked_id THEN
        RETURN FALSE;
    END IF;

    -- Inserir bloqueio
    INSERT INTO public.blocked_users (blocker_id, blocked_id, reason)
    VALUES (p_blocker_id, p_blocked_id, p_reason)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

    -- Remover follow mutuo se existir
    DELETE FROM public.follows
    WHERE (follower_id = p_blocker_id AND following_id = p_blocked_id)
       OR (follower_id = p_blocked_id AND following_id = p_blocker_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Funcao: Calcular prioridade de report automaticamente
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_report_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Definir prioridade baseada no motivo
    NEW.priority := CASE NEW.reason
        WHEN 'illegal' THEN 'urgent'::public.report_priority
        WHEN 'scam' THEN 'urgent'::public.report_priority
        WHEN 'harassment' THEN 'high'::public.report_priority
        WHEN 'inappropriate' THEN 'medium'::public.report_priority
        WHEN 'spam' THEN 'low'::public.report_priority
        ELSE 'medium'::public.report_priority
    END;

    -- Aumentar prioridade se alvo ja foi reportado antes
    IF NEW.target_type = 'post' THEN
        UPDATE public.posts
        SET reported_count = reported_count + 1
        WHERE id = NEW.target_id;

        IF (SELECT reported_count FROM public.posts WHERE id = NEW.target_id) > 3 THEN
            NEW.priority := 'high'::public.report_priority;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_report_priority ON public.reports;
CREATE TRIGGER set_report_priority
    BEFORE INSERT ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.calculate_report_priority();

-- --------------------------------------------
-- Funcao: Limpar dados antigos (manutencao)
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Limpar rate limits antigos (mais de 24h)
    DELETE FROM public.rate_limits
    WHERE window_start < NOW() - INTERVAL '24 hours';

    -- Limpar sessoes expiradas
    UPDATE public.user_sessions
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;

    -- Limpar audit trail muito antigo (mais de 90 dias)
    DELETE FROM public.audit_trail
    WHERE created_at < NOW() - INTERVAL '90 days';

    -- Limpar notificacoes lidas antigas (mais de 30 dias)
    DELETE FROM public.notifications
    WHERE is_read = TRUE AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 4: RLS PARA NOVAS TABELAS
-- ============================================

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;

-- Blocked users: usuario ve seus bloqueios
CREATE POLICY "blocked_users_select_own" ON public.blocked_users
    FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "blocked_users_insert_own" ON public.blocked_users
    FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "blocked_users_delete_own" ON public.blocked_users
    FOR DELETE USING (blocker_id = auth.uid());

-- Rate limits: apenas sistema
CREATE POLICY "rate_limits_system_only" ON public.rate_limits
    FOR ALL USING (FALSE);

-- Audit trail: apenas admins
CREATE POLICY "audit_trail_admin_only" ON public.audit_trail
    FOR SELECT USING (public.is_admin_or_moderator(auth.uid()));

-- Banned words: apenas admins
CREATE POLICY "banned_words_admin_select" ON public.banned_words
    FOR SELECT USING (public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "banned_words_admin_all" ON public.banned_words
    FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- User sessions: usuario ve suas sessoes
CREATE POLICY "user_sessions_select_own" ON public.user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_sessions_delete_own" ON public.user_sessions
    FOR DELETE USING (user_id = auth.uid());

-- Suspicious activities: apenas admins
CREATE POLICY "suspicious_activities_admin_only" ON public.suspicious_activities
    FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- ============================================
-- PARTE 5: DADOS INICIAIS DE SEGURANCA
-- ============================================

-- Palavras banidas iniciais
INSERT INTO public.banned_words (word, severity, category) VALUES
    -- Armas reais
    ('arma de fogo', 'ban', 'illegal'),
    ('munição real', 'ban', 'illegal'),
    ('calibre .', 'block', 'illegal'),
    ('9mm real', 'ban', 'illegal'),
    ('.22 real', 'ban', 'illegal'),
    ('pistola real', 'ban', 'illegal'),
    ('revolver real', 'ban', 'illegal'),
    -- Golpes
    ('pix antecipado', 'block', 'scam'),
    ('deposito antes', 'block', 'scam'),
    ('pagamento adiantado', 'block', 'scam'),
    ('so envio depois', 'block', 'scam'),
    -- Spam
    ('ganhe dinheiro', 'warning', 'spam'),
    ('trabalhe de casa', 'warning', 'spam'),
    ('renda extra', 'warning', 'spam')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- PARTE 6: VIEW DE SEGURANCA PARA ADMIN
-- ============================================

CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT
    (SELECT COUNT(*) FROM public.suspicious_activities WHERE resolved = FALSE) AS pending_suspicious,
    (SELECT COUNT(*) FROM public.suspicious_activities WHERE severity = 'critical' AND resolved = FALSE) AS critical_suspicious,
    (SELECT COUNT(*) FROM public.profiles WHERE locked_until > NOW()) AS locked_users,
    (SELECT COUNT(*) FROM public.user_sessions WHERE is_active = TRUE) AS active_sessions,
    (SELECT COUNT(*) FROM public.posts WHERE auto_flagged = TRUE AND status = 'active') AS flagged_posts,
    (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') AS pending_reports;

COMMENT ON VIEW public.security_dashboard IS 'Dashboard de seguranca para admins';

-- ============================================
-- PARTE 7: ATUALIZACAO DE TRIGGERS E DADOS
-- ============================================

-- --------------------------------------------
-- Funcao: Atualizar handle_new_user para salvar email
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_')) || '_' || SUBSTR(NEW.id::TEXT, 1, 4)
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------
-- Backfill de emails para usuarios existentes
-- --------------------------------------------
DO $$
BEGIN
    -- Tenta fazer o update apenas se tiver permissao de acesso a auth.users
    -- Em ambiente Supabase normal, triggers e funcoes security definer tem acesso
    -- Mas blocos DO anonimos podem nao ter dependendo do usuario que roda a migration
    -- O ideal eh rodar isso como superuser/postgres
    BEGIN
        UPDATE public.profiles p
        SET email = u.email
        FROM auth.users u
        WHERE p.id = u.id
        AND p.email IS NULL;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Nao foi possivel fazer backfill de emails: %', SQLERRM;
    END;
END $$;
