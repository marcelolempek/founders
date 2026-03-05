-- ============================================
-- CODE6MM - 071: MULTI-TENANCY (GRUPOS)
-- ============================================

-- 1. Tabela de Tenants (Grupos/Universos)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    access_code VARCHAR(4), -- Código alfa-numérico de 4 caracteres
    owner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Membros (Participação nos Grupos)
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- 3. Adicionar tenant_id em tabelas de conteúdo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 4. Criar um Tenant Padrão (Global) para migração
DO $$
DECLARE
    global_tenant_id UUID;
BEGIN
    INSERT INTO public.tenants (name, slug, description)
    VALUES ('Global', 'global', 'Universo principal da rede social')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO global_tenant_id;

    -- Associar dados órfãos ao Global
    UPDATE public.profiles SET tenant_id = global_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.posts SET tenant_id = global_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.likes SET tenant_id = global_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.comments SET tenant_id = global_tenant_id WHERE tenant_id IS NULL;
    UPDATE public.notifications SET tenant_id = global_tenant_id WHERE tenant_id IS NULL;
END $$;

-- 5. Habilitar RLS e Criar Políticas Baseadas no Token (JWT)
-- O tenant_id ativo virá de: (auth.jwt() -> 'user_metadata' ->> 'active_tenant_id')::uuid

-- Função auxiliar para pegar o tenant ativo
CREATE OR REPLACE FUNCTION public.active_tenant_id() 
RETURNS UUID AS $$
  SELECT (NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'active_tenant_id', ''))::uuid;
$$ LANGUAGE sql STABLE;

-- Exemplo de política para Posts (ajustar conforme necessário para as outras tabelas)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant Isolation" ON public.posts;
CREATE POLICY "Tenant Isolation" ON public.posts
AS PERMISSIVE FOR ALL
TO authenticated
USING (tenant_id = public.active_tenant_id());

-- Aplicar o mesmo padrão para as outras tabelas críticas
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.likes;
CREATE POLICY "Tenant Isolation" ON public.likes
AS PERMISSIVE FOR ALL
TO authenticated
USING (tenant_id = public.active_tenant_id());

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.comments;
CREATE POLICY "Tenant Isolation" ON public.comments
AS PERMISSIVE FOR ALL
TO authenticated
USING (tenant_id = public.active_tenant_id());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant Isolation" ON public.profiles;
CREATE POLICY "Tenant Isolation" ON public.profiles
AS PERMISSIVE FOR ALL
TO authenticated
USING (tenant_id = public.active_tenant_id() OR id = auth.uid());
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read" ON public.tenants;
CREATE POLICY "Public Read" ON public.tenants
AS PERMISSIVE FOR SELECT
TO authenticated
USING (TRUE);

-- Apenas admins podem criar (exemplo simplificado, pode ser expandido)
DROP POLICY IF EXISTS "Admin Create" ON public.tenants;
CREATE POLICY "Admin Create" ON public.tenants
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
