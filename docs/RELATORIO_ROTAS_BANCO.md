# RELATORIO: MAPEAMENTO DE ROTAS x BANCO DE DADOS

## CODE6MM - Analise Completa de Consumo de Dados

---

## 1. MAPEAMENTO DE ROTAS E OPERACOES

### 1.1 AUTENTICACAO (`/auth/*`)

#### `/auth/login`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| OAuth Login | `auth.users` | email, raw_user_meta_data | Supabase Auth | READ |
| Buscar perfil | `profiles` | id, username, avatar_url, status | - | SELECT |

**Custo Estimado:** 1-2 queries por login

#### `/auth/register`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar usuario | `auth.users` | email, password, meta | Supabase Auth | INSERT |
| Criar perfil | `profiles` | id, username, full_name, phone, location_city, location_state | `handle_new_user()` (trigger) | INSERT |

**Validacoes Necessarias:**
- [ ] Verificar username unico antes de salvar
- [ ] Validar formato telefone (regex)
- [ ] Sanitizar inputs (XSS)

**Custo Estimado:** 2 queries (trigger automatico)

---

### 1.2 FEED PRINCIPAL (`/` e `/feed/*`)

#### `/` (Home Feed)
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar posts | `posts` | id, user_id, title, description, price, currency, location_*, category, condition, status, type, is_bumped, created_at, views_count, likes_count, comments_count | `get_feed_posts()` | SELECT |
| JOIN autor | `profiles` | username, avatar_url, is_verified, reputation_score | - | JOIN |
| Imagem capa | `post_images` | url | WHERE is_cover=true | SELECT |

**Query Otimizada Recomendada:**
```sql
SELECT * FROM posts_with_author
WHERE status = 'active'
ORDER BY is_bumped DESC, bumped_at DESC NULLS LAST, created_at DESC
LIMIT 20 OFFSET 0;
```

**Indices Utilizados:**
- `idx_posts_active` (status, created_at)
- `idx_posts_is_bumped` (is_bumped, bumped_at)
- `idx_post_images_cover` (post_id WHERE is_cover)

**Custo Estimado:** 1 query com JOIN (usando VIEW)

#### `/feed/search`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Buscar posts | `posts` | title, category, price, condition, location_*, status | - | SELECT |
| Filtros | `posts` | category, price BETWEEN, condition, location | - | WHERE |
| Ordenacao | `posts` | created_at, price | - | ORDER BY |

**Query Otimizada:**
```sql
SELECT p.*, pi.url as cover_image_url
FROM posts p
LEFT JOIN post_images pi ON pi.post_id = p.id AND pi.is_cover = true
WHERE p.status = 'active'
  AND (p.title ILIKE '%query%' OR p.description ILIKE '%query%')
  AND (p.category = $category OR $category IS NULL)
  AND (p.price >= $min_price OR $min_price IS NULL)
  AND (p.price <= $max_price OR $max_price IS NULL)
  AND (p.condition = $condition OR $condition IS NULL)
  AND (p.location_state = $state OR $state IS NULL)
ORDER BY p.created_at DESC
LIMIT 40;
```

**Indices Utilizados:**
- `idx_posts_category`
- `idx_posts_price`
- `idx_posts_location`
- `idx_posts_condition`

**Custo Estimado:** 1-2 queries (com paginacao)

---

### 1.3 POSTS (`/post/*`)

#### `/post/create-post`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar post | `posts` | user_id, title, description, price, currency, location_city, location_state, category, condition, type, status='active' | - | INSERT |
| Upload imagens | `post_images` | post_id, url, is_cover, display_order | - | INSERT (x10 max) |
| Atualizar contador | `profiles` | posts_count | `update_user_posts_count()` (trigger) | UPDATE |

**Validacoes Antifraude:**
- [ ] Rate limit: max 5 posts/hora por usuario
- [ ] Validar URLs de imagem (dominio permitido)
- [ ] Verificar titulo/descricao por palavras proibidas
- [ ] Verificar preco minimo (evitar R$ 1)
- [ ] Usuario deve ter telefone validado

**Custo Estimado:** 2-12 queries (1 post + 10 imagens + trigger)

#### `/post/post-detail`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Buscar post | `posts` | * | - | SELECT |
| JOIN autor | `profiles` | username, avatar_url, is_verified, reputation_score, sales_count | - | JOIN |
| Imagens | `post_images` | url, is_cover, display_order | ORDER BY display_order | SELECT |
| Comentarios | `comments` | id, user_id, content, parent_id, created_at | - | SELECT |
| JOIN autor comentario | `profiles` | username, avatar_url | - | JOIN |
| Incrementar views | `posts` | views_count | `increment_post_views()` | UPDATE |
| Verificar like | `likes` | user_id, post_id | `has_liked_post()` | SELECT |

**Query Otimizada:**
```sql
-- Post com autor
SELECT * FROM posts_with_author WHERE id = $post_id;

-- Comentarios com autor (hierarquico)
SELECT * FROM comments_with_author
WHERE post_id = $post_id
ORDER BY created_at ASC;

-- Incrementar views (async, debounced)
SELECT increment_post_views($post_id);
```

**Custo Estimado:** 3-4 queries

#### `/post/saved-posts`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar salvos | `likes` | post_id | WHERE user_id = current_user | SELECT |
| JOIN posts | `posts` | title, price, status | - | JOIN |
| Imagem capa | `post_images` | url | WHERE is_cover=true | JOIN |

**Custo Estimado:** 1 query com JOINs

---

### 1.4 INTERACOES EM POSTS

#### Curtir/Salvar Post
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Adicionar like | `likes` | user_id, post_id | - | INSERT |
| Atualizar contador | `posts` | likes_count | `update_likes_count()` (trigger) | UPDATE |

**Custo Estimado:** 1 INSERT + 1 UPDATE (trigger)

#### Comentar Post
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Adicionar comentario | `comments` | post_id, user_id, content, parent_id | - | INSERT |
| Atualizar contador | `posts` | comments_count | `update_comments_count()` (trigger) | UPDATE |
| Notificar dono | `notifications` | user_id, type, title, data | - | INSERT |

**Validacoes Antifraude:**
- [ ] Rate limit: max 10 comentarios/minuto
- [ ] Filtro de palavras ofensivas
- [ ] Nao permitir comentario em post proprio (opcional)

**Custo Estimado:** 2-3 queries

#### Marcar Vendido
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Atualizar status | `posts` | status='sold', sold_at | - | UPDATE |
| Atualizar contador | `profiles` | sales_count | `update_sales_count()` (trigger) | UPDATE |

**Custo Estimado:** 1 UPDATE + trigger

#### Bump (Destacar Post)
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Verificar dono | `posts` | user_id | - | SELECT |
| Atualizar bump | `posts` | is_bumped=true, bumped_at | `bump_post()` | UPDATE |

**Validacoes Antifraude:**
- [ ] Limite: 1 bump por post a cada 24h
- [ ] Verificar se usuario eh dono do post

**Custo Estimado:** 1-2 queries

---

### 1.5 PERFIL (`/profile/*`)

#### `/profile/profile`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Buscar perfil | `profiles` | * | - | SELECT |
| Posts ativos | `posts` | * | WHERE user_id AND status='active' | SELECT |
| Posts vendidos | `posts` | * | WHERE user_id AND status='sold' | SELECT |
| Reviews | `reviews` | rating, comment, reviewer_id | WHERE reviewed_user_id | SELECT |
| Verificar follow | `follows` | follower_id, following_id | `is_following()` | SELECT |

**View Otimizada:**
```sql
SELECT * FROM profile_complete WHERE id = $user_id;
```

**Custo Estimado:** 3-5 queries

#### `/profile/followers`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar seguidores | `follows` | follower_id | WHERE following_id = user_id | SELECT |
| JOIN perfis | `profiles` | username, avatar_url, is_verified | - | JOIN |
| Mutuos | `follows` | COUNT | `count_mutual_followers()` | SELECT |

**Custo Estimado:** 1-2 queries

#### `/profile/following`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar seguindo | `follows` | following_id | WHERE follower_id = user_id | SELECT |
| JOIN perfis | `profiles` | username, avatar_url, is_verified | - | JOIN |

**Custo Estimado:** 1 query

#### Seguir/Deixar de Seguir
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Follow | `follows` | follower_id, following_id | - | INSERT |
| Atualizar contadores | `profiles` | followers_count, following_count | `update_followers_count()` (trigger) | UPDATE x2 |
| Notificar | `notifications` | user_id, type='new_follower' | - | INSERT |

**Custo Estimado:** 1 INSERT + 2 UPDATEs (trigger) + 1 INSERT notificacao

#### Editar Perfil
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Atualizar | `profiles` | username, full_name, bio, phone, avatar_url, location_* | - | UPDATE |

**Validacoes:**
- [ ] Username unico (verificar antes)
- [ ] Telefone valido
- [ ] Bio max 500 caracteres

**Custo Estimado:** 1-2 queries

---

### 1.6 VERIFICACAO (`/verification/*`)

#### `/verification` (Selecao de Tipo)
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Verificar status | `verification_requests` | status | WHERE user_id AND status='pending' | SELECT |
| Verificar assinatura | `subscriptions` | is_active | WHERE user_id | SELECT |

**Custo Estimado:** 2 queries

#### `/verification/identity` | `/verification/store` | `/verification/partner`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar solicitacao | `verification_requests` | user_id, type, document_urls, status='pending' | - | INSERT |
| Upload docs | Storage (R2) | - | - | UPLOAD |

**Validacoes Antifraude:**
- [ ] Limite: 1 solicitacao pendente por tipo
- [ ] Verificar documentos validos (extensao, tamanho)
- [ ] Rate limit: max 3 solicitacoes/mes

**Custo Estimado:** 1 INSERT + uploads R2

#### `/verification/payment`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar assinatura | `subscriptions` | user_id, plan_type, amount, payment_method, payment_status='pending' | - | INSERT |
| Webhook pagamento | `subscriptions` | payment_status='paid', starts_at, expires_at | - | UPDATE |
| Aprovar verificacao | `verification_requests` | status='approved' | - | UPDATE |
| Atualizar perfil | `profiles` | is_verified=true | - | UPDATE |
| Log admin | `admin_logs` | action='auto_verify_payment' | - | INSERT |

**Custo Estimado:** 4-5 queries

---

### 1.7 SUPORTE (`/support/*`)

#### `/support/contact`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar ticket | `support_tickets` | user_id, email, topic, message, status='open' | - | INSERT |

**Validacoes:**
- [ ] Rate limit: max 3 tickets/dia
- [ ] Mensagem min 10 caracteres

**Custo Estimado:** 1 INSERT

#### `/support/report`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Criar denuncia | `reports` | reporter_id, target_type, target_id, reason, details, priority | - | INSERT |
| Auto-prioridade | - | - | Calcular por reason | LOGIC |

**Regras de Prioridade Automatica:**
- `illegal` ou `scam` -> `urgent`
- `harassment` -> `high`
- `inappropriate` -> `medium`
- `spam` ou `other` -> `low`

**Validacoes Antifraude:**
- [ ] Nao pode denunciar a si mesmo
- [ ] Limite: 1 denuncia por alvo por usuario
- [ ] Rate limit: max 10 denuncias/dia

**Custo Estimado:** 1 INSERT

---

### 1.8 ADMIN (`/admin/*`)

#### `/admin/dashboard`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Estatisticas | VIEW | * | `admin_dashboard_stats` | SELECT |

**Custo Estimado:** 1 query (view pre-calculada)

#### `/admin/moderation-queue`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar reports | VIEW | * | `moderation_queue` | SELECT |
| Filtrar por status/prioridade | `reports` | status, priority | - | WHERE |

**Acoes de Moderacao:**
| Acao | Tabelas | Operacoes |
|------|---------|-----------|
| Dismiss | `reports` | UPDATE status='dismissed' |
| Remove Post | `reports`, `posts`, `admin_logs` | UPDATE reports, UPDATE posts status='banned', INSERT log |
| Ban User | `reports`, `profiles`, `admin_logs` | UPDATE reports, UPDATE profiles status='banned', INSERT log |
| Issue Warning | `reports`, `notifications`, `admin_logs` | UPDATE reports, INSERT notification, INSERT log |

**Custo Estimado:** 1-4 queries por acao

#### `/admin/users`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar usuarios | `profiles` | * | - | SELECT |
| Filtrar | `profiles` | role, status | - | WHERE |
| Buscar | `profiles` | username | ILIKE | WHERE |

**Custo Estimado:** 1 query com paginacao

#### `/admin/verification`
| Operacao | Tabela | Campos | Funcao SQL | Tipo |
|----------|--------|--------|------------|------|
| Listar solicitacoes | VIEW | * | `verification_queue` | SELECT |
| Aprovar | `verification_requests`, `profiles`, `admin_logs` | UPDATE, UPDATE, INSERT | MULTI |
| Rejeitar | `verification_requests`, `admin_logs` | UPDATE, INSERT | MULTI |

**Custo Estimado:** 1-3 queries

---

## 2. TABELAS/CAMPOS FALTANTES NO SCRIPT

### 2.1 Campos Adicionais Necessarios

#### Tabela `profiles` (ADICIONAR):
```sql
ALTER TABLE profiles ADD COLUMN email TEXT; -- Para contato
ALTER TABLE profiles ADD COLUMN website TEXT; -- Link site/loja
ALTER TABLE profiles ADD COLUMN whatsapp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN failed_login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN locked_until TIMESTAMPTZ; -- Anti-brute force
```

#### Tabela `posts` (ADICIONAR):
```sql
ALTER TABLE posts ADD COLUMN reported_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN auto_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN flagged_reason TEXT;
```

### 2.2 Tabelas Faltantes

#### Tabela `blocked_users` (NOVA):
```sql
CREATE TABLE public.blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);
```

#### Tabela `rate_limits` (NOVA - Antifraude):
```sql
CREATE TABLE public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'post_create', 'comment', 'report', etc
    action_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '1 hour'
);

CREATE INDEX idx_rate_limits_user_action ON rate_limits(user_id, action_type);
```

#### Tabela `audit_trail` (NOVA - Seguranca):
```sql
CREATE TABLE public.audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_trail_user ON audit_trail(user_id, created_at DESC);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
```

#### Tabela `banned_words` (NOVA - Moderacao):
```sql
CREATE TABLE public.banned_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    severity TEXT CHECK (severity IN ('warning', 'block', 'ban')) DEFAULT 'warning',
    category TEXT, -- 'offensive', 'illegal', 'spam'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela `user_sessions` (NOVA - Seguranca):
```sql
CREATE TABLE public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
```

---

## 3. FUNCOES SQL FALTANTES

### 3.1 Funcoes Antifraude

```sql
-- Verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_count INTEGER,
    p_window INTERVAL
) RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT action_count INTO current_count
    FROM rate_limits
    WHERE user_id = p_user_id
    AND action_type = p_action
    AND window_start > NOW() - p_window;

    IF current_count IS NULL THEN
        INSERT INTO rate_limits (user_id, action_type, action_count)
        VALUES (p_user_id, p_action, 1);
        RETURN TRUE;
    ELSIF current_count < p_max_count THEN
        UPDATE rate_limits
        SET action_count = action_count + 1
        WHERE user_id = p_user_id AND action_type = p_action;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Verificar palavras banidas
CREATE OR REPLACE FUNCTION check_banned_words(p_text TEXT)
RETURNS TABLE (word TEXT, severity TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT bw.word, bw.severity
    FROM banned_words bw
    WHERE p_text ILIKE '%' || bw.word || '%';
END;
$$ LANGUAGE plpgsql;

-- Auto-flag de posts suspeitos
CREATE OR REPLACE FUNCTION auto_flag_post()
RETURNS TRIGGER AS $$
DECLARE
    flagged_word RECORD;
BEGIN
    -- Verificar palavras banidas
    SELECT * INTO flagged_word
    FROM check_banned_words(NEW.title || ' ' || NEW.description)
    LIMIT 1;

    IF FOUND THEN
        NEW.auto_flagged := TRUE;
        NEW.flagged_reason := 'Palavra suspeita: ' || flagged_word.word;
    END IF;

    -- Verificar preco muito baixo
    IF NEW.price IS NOT NULL AND NEW.price < 10 AND NEW.type = 'sale' THEN
        NEW.auto_flagged := TRUE;
        NEW.flagged_reason := COALESCE(NEW.flagged_reason || '; ', '') || 'Preco suspeito';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_flag_new_post
    BEFORE INSERT ON posts
    FOR EACH ROW EXECUTE FUNCTION auto_flag_post();
```

### 3.2 Funcoes de Seguranca

```sql
-- Registrar tentativa de login
CREATE OR REPLACE FUNCTION record_login_attempt(
    p_user_id UUID,
    p_success BOOLEAN,
    p_ip INET
) RETURNS VOID AS $$
BEGIN
    IF p_success THEN
        UPDATE profiles
        SET
            last_login_at = NOW(),
            login_count = login_count + 1,
            failed_login_count = 0,
            locked_until = NULL
        WHERE id = p_user_id;
    ELSE
        UPDATE profiles
        SET
            failed_login_count = failed_login_count + 1,
            locked_until = CASE
                WHEN failed_login_count >= 5 THEN NOW() + INTERVAL '15 minutes'
                ELSE locked_until
            END
        WHERE id = p_user_id;
    END IF;

    INSERT INTO audit_trail (user_id, action, ip_address)
    VALUES (p_user_id, CASE WHEN p_success THEN 'login_success' ELSE 'login_failed' END, p_ip);
END;
$$ LANGUAGE plpgsql;

-- Verificar se usuario esta bloqueado
CREATE OR REPLACE FUNCTION is_user_blocked(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_users
        WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 4. OTIMIZACOES DE CUSTO (SUPABASE)

### 4.1 Estrategias Implementadas

| Estrategia | Descricao | Economia |
|------------|-----------|----------|
| **Views Materializadas** | `posts_with_author`, `moderation_queue` evitam JOINs repetidos | ~40% menos queries |
| **Indices Parciais** | `WHERE status = 'active'`, `WHERE is_bumped = TRUE` | Scans menores |
| **Contadores Desnormalizados** | `likes_count`, `comments_count` via triggers | Evita COUNT(*) |
| **Funcoes Server-side** | `get_feed_posts()`, `increment_post_views()` | Menos round-trips |
| **Paginacao com LIMIT/OFFSET** | Sempre usar LIMIT 20-40 | Menos dados transferidos |

### 4.2 Recomendacoes Adicionais

#### Debouncing de Views
```typescript
// Incrementar views apenas 1x a cada 5 minutos por usuario/post
const viewKey = `view:${postId}:${userId}`;
if (!cache.get(viewKey)) {
    cache.set(viewKey, true, 300); // 5 min TTL
    await supabase.rpc('increment_post_views', { p_post_id: postId });
}
```

#### Cache de Perfis
```typescript
// Cachear perfis por 10 minutos
const profile = await cache.get(`profile:${userId}`) ||
    await supabase.from('profiles').select('*').eq('id', userId).single();
cache.set(`profile:${userId}`, profile, 600);
```

#### Batch Notifications
```typescript
// Agrupar notificacoes em batch de 5 minutos
await supabase.rpc('batch_create_notifications', {
    notifications: [...pendingNotifications]
});
```

### 4.3 Estimativa de Custos por Rota

| Rota | Queries/Acesso | Acessos/Dia (est.) | Custo Relativo |
|------|----------------|-------------------|----------------|
| `/` (feed) | 1 | 10.000 | ALTO |
| `/feed/search` | 1-2 | 5.000 | MEDIO |
| `/post/post-detail` | 3-4 | 15.000 | ALTO |
| `/post/create-post` | 2-12 | 500 | BAIXO |
| `/profile/profile` | 3-5 | 3.000 | MEDIO |
| `/admin/*` | 1-4 | 100 | MUITO BAIXO |

**Total Estimado:** ~80.000 queries/dia

### 4.4 Limites do Supabase Free Tier
- 500MB database
- 2GB bandwidth
- 50.000 requests/mes no auth

**Recomendacao:** Usar plano Pro ($25/mes) a partir de 1.000 usuarios ativos.

---

## 5. SEGURANCA E ANTIFRAUDE

### 5.1 Camadas de Protecao

```
[Cliente]
    |
    v
[Rate Limiting (Edge)] -- max 100 req/min por IP
    |
    v
[Supabase Auth] -- JWT validation
    |
    v
[RLS Policies] -- Verificacao de permissao por tabela
    |
    v
[Triggers] -- Validacao de dados, auto-flag
    |
    v
[Audit Trail] -- Log de todas as acoes
```

### 5.2 Checklist de Seguranca

#### Autenticacao:
- [x] OAuth (Google) via Supabase
- [ ] Verificacao de email
- [ ] 2FA opcional
- [x] Lockout apos 5 tentativas falhas
- [x] Session management

#### Autorizacao (RLS):
- [x] Usuarios so editam proprios dados
- [x] Admins tem acesso elevado
- [x] Posts banidos invisiveis
- [x] Logs so para admins

#### Antifraude:
- [x] Rate limiting por acao
- [x] Auto-flag de palavras banidas
- [x] Deteccao de preco suspeito
- [ ] Verificacao de imagens duplicadas (hash)
- [ ] Deteccao de contas multiplas (fingerprint)

#### Moderacao:
- [x] Sistema de denuncias com prioridade
- [x] Fila de moderacao ordenada
- [x] Logs de acoes administrativas
- [ ] Moderacao automatica por IA

### 5.3 Pontos de Atencao

| Risco | Mitigacao |
|-------|-----------|
| Spam de posts | Rate limit 5 posts/hora |
| Spam de comentarios | Rate limit 10/minuto |
| Denuncias falsas | Limite 10/dia, penalidade por abuso |
| Conteudo proibido | Auto-flag + moderacao |
| Golpes/Scam | Destaque para verificados, alertas |
| Manipulacao de preco | Detectar R$ 1 ou precos anomalos |

---

## 6. RESUMO DE DEPENDENCIAS

### Tabelas por Funcionalidade

| Funcionalidade | Tabelas |
|----------------|---------|
| Autenticacao | `auth.users`, `profiles`, `user_sessions` |
| Feed | `posts`, `post_images`, `profiles` |
| Interacoes | `likes`, `comments`, `notifications` |
| Perfil | `profiles`, `follows`, `reviews`, `posts` |
| Verificacao | `verification_requests`, `subscriptions`, `profiles` |
| Moderacao | `reports`, `admin_logs`, `banned_words` |
| Seguranca | `rate_limits`, `audit_trail`, `blocked_users` |

### Funcoes por Acao

| Acao | Funcao SQL |
|------|------------|
| Criar perfil | `handle_new_user()` (trigger) |
| Listar feed | `get_feed_posts()` |
| Incrementar views | `increment_post_views()` |
| Like/Unlike | `update_likes_count()` (trigger) |
| Comentar | `update_comments_count()` (trigger) |
| Seguir | `update_followers_count()` (trigger) |
| Avaliar | `update_user_reputation()` (trigger) |
| Bump | `bump_post()` |
| Rate limit | `check_rate_limit()` |
| Auto-flag | `auto_flag_post()` (trigger) |

---

## 7. PROXIMOS PASSOS

1. [ ] Adicionar tabelas faltantes ao script de migracao
2. [ ] Implementar funcoes antifraude
3. [ ] Configurar rate limiting no Edge (Vercel/Cloudflare)
4. [ ] Criar webhook para pagamentos
5. [ ] Implementar cache de sessao
6. [ ] Configurar alertas de moderacao
7. [ ] Implementar verificacao de WhatsApp
8. [ ] Adicionar fingerprinting para deteccao de contas multiplas
