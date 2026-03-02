# CHECKLIST DE PRODUÇÃO - Code6mm MVP1

**Data de Criação:** 2026-01-01
**Status do Build:** :white_check_mark: Compilando sem erros
**Versão:** Next.js 16.1.1 + Supabase

---

## RESUMO EXECUTIVO

| Categoria | Status | Prioridade |
|-----------|--------|------------|
| Build & TypeScript | :white_check_mark: OK | - |
| Variáveis de Ambiente | :warning: Verificar | CRÍTICA |
| Migrations Supabase | :warning: Executar | CRÍTICA |
| Autenticação | :white_check_mark: Implementado | - |
| Sistema de Posts | :white_check_mark: Implementado | - |
| WhatsApp Protegido | :white_check_mark: Implementado | - |
| Edição de Posts | :white_check_mark: Implementado | - |
| Scroll Infinito | :white_check_mark: Implementado | - |
| Logout | :white_check_mark: Implementado | - |
| Mercado Pago | :warning: Testar em Prod | ALTA |
| Painel Admin | :white_check_mark: Implementado | - |
| Denúncias | :white_check_mark: Implementado | - |
| Verificação | :white_check_mark: Implementado | - |
| Notificações | :white_check_mark: Implementado | - |

---

## PRIORIDADE 1: CRÍTICO (Bloqueia Deploy)

### 1.1 Variáveis de Ambiente de Produção

```bash
# Obrigatórias - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-producao]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Obrigatórias - App
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br

# Obrigatórias - Storage (Cloudflare R2)
R2_ACCESS_KEY_ID=[access-key]
R2_SECRET_ACCESS_KEY=[secret-key]
R2_ENDPOINT=https://[accountid].r2.cloudflarestorage.com
R2_BUCKET_NAME=code6mm-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-[hash].r2.dev

# Obrigatórias - Pagamentos
MERCADOPAGO_ACCESS_TOKEN=[token-producao]
```

**Checklist:**
- [ ] Criar projeto Supabase de produção
- [ ] Configurar todas as variáveis de ambiente
- [ ] Verificar que não está usando credenciais de dev/sandbox
- [ ] Configurar R2 bucket com CORS correto
- [ ] Configurar domínio para webhooks do Mercado Pago

---

### 1.2 Migrations do Supabase (33 arquivos)

**Localização:** `supabase/migrations/`

**Ordem de execução:**
```
001_extensions.sql       - Extensões PostgreSQL
002_types.sql            - ENUMs e tipos
003_tables.sql           - 20 tabelas principais
004_indexes.sql          - 101 índices
005_functions.sql        - 19+ funções
006_triggers.sql         - 22 triggers
007_rls_policies.sql     - 54 políticas RLS
008_views.sql            - 10 views
009_security_antifraude.sql - Rate limiting
010_edge_functions_support.sql
022_storage_buckets.sql  - Buckets storage
023_saved_posts.sql
024_fix_rate_limits_rls.sql
025_profile_comments.sql
026_optimize_feed_performance.sql
027_profile_stats_rpc.sql
028_payment_tables.sql
030_contact_views.sql
031_get_post_contact_rpc.sql
032_whatsapp_analytics_view.sql
033_intelligent_feed.sql
```

**Checklist:**
- [ ] Executar migrations em ordem no Supabase de produção
- [ ] Verificar que todas as tabelas foram criadas
- [ ] Verificar que RLS está ativo em todas as tabelas
- [ ] Testar que triggers estão funcionando
- [ ] Verificar índices criados

**Comando:**
```bash
supabase db push --project-ref [seu-projeto]
```

---

## PRIORIDADE 2: ALTA (Testar antes do Launch)

### 2.1 Integração Mercado Pago

**Arquivos:**
- `src/app/api/mercadopago/create-preference/route.ts`
- `src/app/api/mercadopago/webhook/route.ts`
- `src/app/api/mercadopago/payment-status/route.ts`

**Planos configurados:**
| Plano | Preço | ID |
|-------|-------|-----|
| Vendedor Verificado | R$ 29.90 | verified_seller |
| Loja Física | R$ 99.90 | physical_store |
| Parceiro Oficial | R$ 299.90 | official_partner |
| Impulsionar | R$ 9.90 | bump_post |

**Checklist:**
- [ ] Trocar token Sandbox para Produção
- [ ] Configurar URL de webhook no Mercado Pago Dashboard
- [ ] Testar criação de preferência
- [ ] Testar webhook recebe notificações
- [ ] Testar fluxo completo de pagamento
- [ ] Testar páginas de retorno (success, failure, pending)
- [ ] Verificar que badges são concedidas após pagamento

---

### 2.2 Fluxo de Verificação

**Páginas:**
- `/verification` - Dashboard
- `/verification/request-badge` - Solicitar
- `/verification/identity` - Identidade
- `/verification/payment` - Pagamento
- `/verification/application-success` - Sucesso

**Checklist:**
- [ ] Testar verificação de elegibilidade (30 dias, telefone, transações)
- [ ] Testar upload de documentos para R2
- [ ] Testar fluxo de pagamento integrado
- [ ] Testar aprovação pelo admin
- [ ] Verificar badge aparece no perfil após aprovação

---

### 2.3 Painel Administrativo

**Rotas:** `/admin/*`

**Funcionalidades:**
- Dashboard com estatísticas
- Gerenciamento de usuários
- Moderação de denúncias
- Revisão de verificações
- Gerenciamento de badges
- Configurações da plataforma

**Checklist:**
- [ ] Criar primeiro usuário admin no banco
- [ ] Testar acesso restrito (não-admins recebem 403)
- [ ] Testar dashboard carrega estatísticas
- [ ] Testar moderação de denúncias funciona
- [ ] Testar aprovação/rejeição de verificações
- [ ] Testar ban/unban de usuários

**SQL para criar admin:**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'seu-email@admin.com';
```

---

## PRIORIDADE 3: MÉDIA (Importante para UX)

### 3.1 Sistema de Notificações

**Funcionalidades implementadas:**
- [x] Notificações real-time via Supabase
- [x] Contador de não-lidas no header
- [x] Página de listagem `/notifications`
- [x] Marcar como lida

**Checklist:**
- [ ] Testar notificação aparece em tempo real
- [ ] Testar contador atualiza corretamente
- [ ] Testar marcar todas como lidas

---

### 3.2 Sistema de Denúncias

**Tipos de denúncia:**
- Posts
- Usuários
- Comentários

**Motivos:**
- spam, scam, inappropriate, illegal, harassment, other

**Checklist:**
- [ ] Testar denúncia de post
- [ ] Testar denúncia de usuário
- [ ] Verificar aparece no painel admin
- [ ] Testar resolução de denúncia

---

### 3.3 WhatsApp Protegido

**Implementação:**
- Exige login para ver contato
- Rate limiting (20/hora)
- Tracking de cliques

**Checklist:**
- [ ] Testar que usuário não logado é redirecionado
- [ ] Testar que usuário logado vê o WhatsApp
- [ ] Verificar rate limiting funciona
- [ ] Verificar analytics no admin

---

## PRIORIDADE 4: BAIXA (Melhorias Pós-Launch)

### 4.1 Melhorias de Performance

- [ ] Implementar cache de queries frequentes
- [ ] Otimizar imagens (lazy loading)
- [ ] Implementar CDN para assets estáticos
- [ ] Monitorar Core Web Vitals

### 4.2 Melhorias de Segurança

- [ ] Implementar CAPTCHA após X tentativas de login
- [ ] Adicionar 2FA opcional
- [ ] Implementar detecção de dispositivo suspeito
- [ ] Rate limiting mais agressivo para scrapers

### 4.3 Funcionalidades Futuras

- [ ] Sistema de mensagens diretas
- [ ] Sistema de drafts real
- [ ] Filtro por localização no feed
- [ ] Algoritmo de recomendação por engajamento

---

## ARQUIVOS MODIFICADOS NESTA SESSÃO

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/Header.tsx` | Dropdown menu com logout |
| `src/lib/supabase.ts` | Função `signOut()` |
| `src/components/screens/post/CreatePost.tsx` | Botão "Voltar" no lugar de "Drafts" |
| `src/lib/hooks/usePosts.ts` | Hook `useUpdatePost()` |
| `src/components/screens/post/PostDetail.tsx` | Modal de edição |
| `src/components/post/PostActions.tsx` | Verificação de login em Like/Salvar/WhatsApp |
| `src/lib/hooks/useFeed.ts` | Scroll infinito com paginação |
| `src/components/screens/feed/Search.tsx` | IntersectionObserver |
| `src/components/screens/support/Rules.tsx` | Removida função duplicada |
| `src/app/api/posts/[id]/contact/route.ts` | Corrigido para Next.js 16 |

---

## COMANDOS DE DEPLOY

### Desenvolvimento Local
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

### Verificar TypeScript
```bash
npx tsc --noEmit
```

### Deploy Vercel
```bash
vercel --prod
```

### Executar Migrations
```bash
supabase db push --project-ref [projeto]
```

---

## TABELAS PRINCIPAIS DO BANCO

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| profiles | Usuários | :white_check_mark: |
| posts | Anúncios | :white_check_mark: |
| post_images | Imagens | :white_check_mark: |
| likes | Curtidas | :white_check_mark: |
| comments | Comentários | :white_check_mark: |
| follows | Seguidores | :white_check_mark: |
| saved_posts | Posts salvos | :white_check_mark: |
| reports | Denúncias | :white_check_mark: |
| notifications | Notificações | :white_check_mark: |
| verification_requests | Verificações | :white_check_mark: |
| transactions | Pagamentos | :white_check_mark: |
| subscriptions | Assinaturas | :white_check_mark: |
| admin_logs | Auditoria admin | :white_check_mark: |
| audit_trail | Auditoria geral | :white_check_mark: |
| rate_limits | Controle de rate | :white_check_mark: |
| banned_words | Palavras banidas | :white_check_mark: |
| support_tickets | Tickets suporte | :white_check_mark: |
| contact_views | Views WhatsApp | :white_check_mark: |

---

## RESUMO FINAL

### O que foi implementado nesta sessão:

1. **Logout do usuário** - Menu dropdown no avatar com opção de sair
2. **Remoção do link Drafts** - Substituído por botão "Voltar"
3. **Edição de posts** - Modal completo com título, descrição e preço
4. **Scroll infinito no Explorar** - Carrega 20 posts por vez
5. **Proteção do WhatsApp** - Exige login para ver contato
6. **Botões protegidos** - Like, Salvar e WhatsApp redirecionam para login

### O que já estava pronto:

- Autenticação completa com Supabase
- Sistema de denúncias funcional
- Verificação de usuários com pagamento
- Painel administrativo completo
- Integração com Mercado Pago
- Notificações em tempo real
- RLS em todas as tabelas
- Rate limiting e segurança

### Próximos passos obrigatórios:

1. Configurar variáveis de ambiente de produção
2. Executar migrations no Supabase de produção
3. Testar integração Mercado Pago em produção
4. Criar primeiro usuário admin
5. Testar fluxos críticos em staging
6. Deploy para produção

---

**Última atualização:** 2026-01-01
**Build Status:** :white_check_mark: Sucesso
