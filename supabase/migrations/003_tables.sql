-- ============================================
-- CODE6MM - 003: TABELAS
-- ============================================
-- Todas as tabelas do sistema
-- Dependencias: 001_extensions.sql, 002_types.sql
-- ============================================

-- --------------------------------------------
-- PROFILES (Extensao de auth.users)
-- --------------------------------------------
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    location_city TEXT,
    location_state TEXT,
    reputation_score DECIMAL(3, 2) DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 5),
    is_verified BOOLEAN DEFAULT FALSE,
    role public.user_role DEFAULT 'user',
    status public.user_status DEFAULT 'active',
    followers_count INTEGER DEFAULT 0 CHECK (followers_count >= 0),
    following_count INTEGER DEFAULT 0 CHECK (following_count >= 0),
    posts_count INTEGER DEFAULT 0 CHECK (posts_count >= 0),
    sales_count INTEGER DEFAULT 0 CHECK (sales_count >= 0),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfis publicos dos usuarios, extensao da tabela auth.users';
COMMENT ON COLUMN public.profiles.reputation_score IS 'Pontuacao de reputacao de 0.00 a 5.00';
COMMENT ON COLUMN public.profiles.phone IS 'WhatsApp/telefone para contato em negociacoes';

-- --------------------------------------------
-- FOLLOWS (Sistema de Seguidores)
-- --------------------------------------------
CREATE TABLE public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT follows_no_self_follow CHECK (follower_id != following_id),
    CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

COMMENT ON TABLE public.follows IS 'Relacionamentos de seguidor/seguindo entre usuarios';

-- --------------------------------------------
-- POSTS (Anuncios/Listagens)
-- --------------------------------------------
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    description TEXT NOT NULL CHECK (char_length(description) >= 10),
    price DECIMAL(10, 2) CHECK (price IS NULL OR price >= 0),
    currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
    location_city TEXT,
    location_state TEXT CHECK (location_state IS NULL OR char_length(location_state) = 2),
    category TEXT NOT NULL,
    condition public.post_condition NOT NULL,
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
    status public.post_status DEFAULT 'active',
    type public.listing_type DEFAULT 'sale',
    is_bumped BOOLEAN DEFAULT FALSE,
    bumped_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.posts IS 'Anuncios de venda/troca/leilao de itens';
COMMENT ON COLUMN public.posts.price IS 'Preco do item. NULL para anuncios apenas de troca';
COMMENT ON COLUMN public.posts.location_state IS 'Sigla do estado (UF) com 2 caracteres';

-- --------------------------------------------
-- POST_IMAGES (Imagens dos Anuncios)
-- --------------------------------------------
CREATE TABLE public.post_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.post_images IS 'Imagens associadas aos anuncios (max 10 por post)';
COMMENT ON COLUMN public.post_images.is_cover IS 'Indica se eh a imagem de capa do anuncio';

-- --------------------------------------------
-- LIKES (Curtidas/Posts Salvos)
-- --------------------------------------------
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT likes_unique UNIQUE (user_id, post_id)
);

COMMENT ON TABLE public.likes IS 'Curtidas e posts salvos pelos usuarios';

-- --------------------------------------------
-- COMMENTS (Comentarios/Perguntas)
-- --------------------------------------------
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS 'Comentarios e perguntas nos anuncios, com suporte a respostas aninhadas';
COMMENT ON COLUMN public.comments.parent_id IS 'ID do comentario pai para respostas (replies)';

-- --------------------------------------------
-- REVIEWS (Avaliacoes de Vendedores)
-- --------------------------------------------
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (comment IS NULL OR char_length(comment) <= 1000),
    is_buyer BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT reviews_no_self_review CHECK (reviewer_id != reviewed_user_id),
    CONSTRAINT reviews_unique_per_post UNIQUE (reviewer_id, post_id)
);

COMMENT ON TABLE public.reviews IS 'Avaliacoes de vendedores apos transacoes';
COMMENT ON COLUMN public.reviews.is_buyer IS 'TRUE se quem avaliou foi o comprador, FALSE se foi o vendedor';

-- --------------------------------------------
-- REPORTS (Denuncias/Moderacao)
-- --------------------------------------------
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type public.report_target_type NOT NULL,
    target_id UUID NOT NULL,
    reason public.report_reason NOT NULL,
    details TEXT,
    status public.report_status DEFAULT 'pending',
    priority public.report_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.reports IS 'Sistema de denuncias para moderacao de conteudo';
COMMENT ON COLUMN public.reports.assigned_to IS 'Admin/Moderador responsavel pela analise';

-- --------------------------------------------
-- VERIFICATION_REQUESTS (Solicitacoes de Badge)
-- --------------------------------------------
CREATE TABLE public.verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.verification_type NOT NULL,
    document_urls TEXT[] NOT NULL DEFAULT '{}',
    status public.verification_status DEFAULT 'pending',
    notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.verification_requests IS 'Solicitacoes de verificacao de identidade/loja/parceiro';
COMMENT ON COLUMN public.verification_requests.document_urls IS 'Array de URLs dos documentos enviados';

-- --------------------------------------------
-- SUBSCRIPTIONS (Assinaturas de Verificacao)
-- --------------------------------------------
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    verification_request_id UUID REFERENCES public.verification_requests(id) ON DELETE SET NULL,
    plan_type public.verification_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'BRL',
    payment_method public.payment_method,
    payment_status public.payment_status DEFAULT 'pending',
    payment_reference TEXT,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Assinaturas de planos de verificacao';

-- --------------------------------------------
-- SUPPORT_TICKETS (Tickets de Suporte)
-- --------------------------------------------
CREATE TABLE public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) >= 10),
    status public.ticket_status DEFAULT 'open',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.support_tickets IS 'Tickets de suporte ao usuario';

-- --------------------------------------------
-- ADMIN_LOGS (Auditoria de Acoes Admin)
-- --------------------------------------------
CREATE TABLE public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.admin_logs IS 'Log de auditoria de todas as acoes administrativas';

-- --------------------------------------------
-- NOTIFICATIONS (Notificacoes)
-- --------------------------------------------
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Notificacoes in-app para usuarios';
