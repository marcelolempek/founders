-- ============================================
-- CODE6MM - 002: TIPOS ENUMERADOS
-- ============================================
-- Todos os ENUMs e tipos customizados
-- ============================================

-- Tipo de listagem do anuncio
CREATE TYPE public.listing_type AS ENUM ('sale', 'trade', 'auction');

-- Condicao do item
CREATE TYPE public.post_condition AS ENUM ('new', 'like-new', 'good', 'fair', 'poor');

-- Status do post/anuncio
CREATE TYPE public.post_status AS ENUM ('active', 'sold', 'archived', 'banned');

-- Papel do usuario no sistema
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');

-- Status da conta do usuario
CREATE TYPE public.user_status AS ENUM ('active', 'suspended', 'banned');

-- Razoes para denuncia
CREATE TYPE public.report_reason AS ENUM ('spam', 'scam', 'inappropriate', 'illegal', 'harassment', 'other');

-- Status da denuncia
CREATE TYPE public.report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- Tipo de verificacao
CREATE TYPE public.verification_type AS ENUM ('identity', 'store', 'partner');

-- Status de verificacao
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Prioridade de reports
CREATE TYPE public.report_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tipo de alvo de denuncia
CREATE TYPE public.report_target_type AS ENUM ('post', 'user', 'comment');

-- Status de ticket de suporte
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Metodo de pagamento
CREATE TYPE public.payment_method AS ENUM ('pix', 'credit_card', 'bank_transfer');

-- Status de pagamento
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
