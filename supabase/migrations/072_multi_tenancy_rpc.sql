-- ============================================
-- CODE6MM - 072: MULTI-TENANCY RPCs
-- ============================================

-- 1. Função para Entrar em um Grupo (Tenant)
-- Parâmetros: tenant_id, access_code (opcional)
CREATE OR REPLACE FUNCTION public.join_tenant(
    p_tenant_id UUID,
    p_access_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant RECORD;
    v_user_id UUID := auth.uid();
BEGIN
    -- 1. Verificar se o tenant existe
    SELECT * INTO v_tenant FROM public.tenants WHERE id = p_tenant_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo não encontrado');
    END IF;

    -- 2. Verificar se já é membro
    IF EXISTS (SELECT 1 FROM public.tenant_memberships WHERE tenant_id = p_tenant_id AND user_id = v_user_id) THEN
        RETURN jsonb_build_object('success', true, 'message', 'Você já faz parte deste grupo');
    END IF;

    -- 3. Verificar senha se for privado
    IF v_tenant.is_private AND (v_tenant.access_code IS DISTINCT FROM p_access_code) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de acesso inválido');
    END IF;

    -- 4. Inserir membro
    INSERT INTO public.tenant_memberships (tenant_id, user_id, role)
    VALUES (p_tenant_id, v_user_id, 'member');

    RETURN jsonb_build_object('success', true, 'message', 'Entrou no grupo com sucesso');
END;
$$;

-- 2. Função para Sair de um Grupo (Tenant)
CREATE OR REPLACE FUNCTION public.leave_tenant(
    p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    -- Não permitir sair se for o dono (opcional, pode ser melhor trocar de dono antes)
    IF EXISTS (SELECT 1 FROM public.tenants WHERE id = p_tenant_id AND owner_id = v_user_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Como dono, você não pode sair sem transferir a posse');
    END IF;

    DELETE FROM public.tenant_memberships 
    WHERE tenant_id = p_tenant_id AND user_id = v_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Saiu do grupo');
END;
$$;
