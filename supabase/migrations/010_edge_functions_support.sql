-- ============================================
-- CODE6MM - 010: SUPORTE A EDGE FUNCTIONS
-- ============================================
-- Habilita extensoes de rede e cria logs para Edge Functions
-- Dependencias: 001_extensions.sql, 003_tables.sql
-- ============================================

-- --------------------------------------------
-- Habilitar pg_net (Database Webhooks)
-- --------------------------------------------
-- Permite que o banco faca requisicoes HTTP para Edge Functions
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- --------------------------------------------
-- EDGE_FUNCTION_LOGS (Logs de execucao)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    function_name TEXT NOT NULL,
    trigger_type TEXT CHECK (trigger_type IN ('webhook', 'cron', 'manual')),
    status TEXT CHECK (status IN ('pending', 'success', 'error')),
    payload JSONB,
    response JSONB,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.edge_function_logs IS 'Logs de chamadas para Edge Functions a partir do banco';

CREATE INDEX idx_edge_logs_created ON public.edge_function_logs(created_at DESC);
CREATE INDEX idx_edge_logs_status ON public.edge_function_logs(status);
CREATE INDEX idx_edge_logs_function ON public.edge_function_logs(function_name);

-- RLS para logs (Apenas admin ve)
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edge_logs_admin_only" ON public.edge_function_logs
    FOR ALL USING (public.is_admin_or_moderator(auth.uid()));

-- --------------------------------------------
-- TEMPLATE: Funcao generica para chamar Webhook
-- --------------------------------------------
-- Esta funcao serve como base para triggers que precisam chamar Edge Functions
-- Exemplo: Notificar sistema de pagamento quando status muda
-- --------------------------------------------

CREATE OR REPLACE FUNCTION public.trigger_edge_function_webhook()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
    request_id BIGINT;
    function_url TEXT;
    service_role_key TEXT;
BEGIN
    -- CONFIGURACAO:
    -- Obter URL e Key de segredos (Vault) ou hardcoded em dev
    -- Em produção, usar vault.secrets!
    -- function_url := 'https://project-ref.supabase.co/functions/v1/' || TG_ARGV[0];
    function_url := current_setting('app.edge_function_base_url', true) || '/' || TG_ARGV[0];
    
    -- Payload padrao com dados da mudanca
    payload = jsonb_build_object(
        'table', TG_TABLE_NAME,
        'action', TG_OP,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
    );

    -- Logar a tentativa
    INSERT INTO public.edge_function_logs (function_name, trigger_type, status, payload)
    VALUES (TG_ARGV[0], 'webhook', 'pending', payload);

    -- Fazer a chamada HTTP assincrona via pg_net
    -- NOTA: pg_net roda em schema 'net' ou 'extensions' dependendo da instalacao
    -- Verify extension schema first, assuming 'net' alias provided by extensions setup
    
    -- Exemplo de chamada (comentado pois requer config de URL valida):
    /*
    SELECT net.http_post(
        url := function_url,
        body := payload::jsonb,
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
    ) INTO request_id;
    */
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log de erro silencioso para nao travar a transacao do banco
    INSERT INTO public.edge_function_logs (function_name, trigger_type, status, error_message)
    VALUES (TG_ARGV[0], 'webhook', 'error', SQLERRM);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------
-- Exemplo de Trigger (Comentado)
-- --------------------------------------------
/*
CREATE TRIGGER on_payment_update
    AFTER UPDATE OF payment_status ON public.subscriptions
    FOR EACH ROW
    WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
    EXECUTE FUNCTION public.trigger_edge_function_webhook('handle-payment-update');
*/
