# Empreendedores de Cristo - Migrations

> **Status:** ✅ PRONTO PARA PRODUÇÃO (Validado em 2025-12-31)

## Estrutura dos Arquivos

Os scripts de migracao foram modularizados para facilitar a manutencao:

| Arquivo | Descricao | Dependencias | Status |
|---------|-----------|--------------|--------|
| `001_extensions.sql` | Extensoes PostgreSQL necessarias | - | ✅ |
| `002_types.sql` | Tipos enumerados (ENUMs) | 001 | ✅ |
| `003_tables.sql` | Todas as tabelas do sistema | 001, 002 | ✅ |
| `004_indexes.sql` | Indices para performance | 003 | ✅ |
| `005_functions.sql` | Funcoes auxiliares e stored procedures | 003 | ✅ |
| `006_triggers.sql` | Triggers automaticos | 003, 005 | ✅ |
| `007_rls_policies.sql` | Row Level Security (RLS) | 003, 005 | ✅ |
| `008_views.sql` | Views para consultas frequentes | 003 | ✅ |
| `009_security_antifraude.sql` | Seguranca, rate limiting, auditoria | 003, 005 | ✅ |
| `010_edge_functions_support.sql` | Suporte a Edge Functions e Webhooks | 001, 003 | ✅ |
| `011_seed_fake_data.sql` | Dados de teste (desenvolvimento) | 003 | ✅ |
| `012_cleanup_seed.sql` | Limpeza dos dados de teste | 011 | ✅ |
| `013_fixes_review.sql` | Correções de bugs identificados em revisão | 007, 009 | ✅ |
| `014_validation_test.sql` | Script de validação completa | * | ✅ |

## Ordem de Execucao

**IMPORTANTE:** Execute os arquivos na ordem numerica para garantir que as dependencias sejam atendidas.

```bash
# Via psql
psql -U postgres -d seu_banco -f 001_extensions.sql
psql -U postgres -d seu_banco -f 002_types.sql
psql -U postgres -d seu_banco -f 003_tables.sql
psql -U postgres -d seu_banco -f 004_indexes.sql
psql -U postgres -d seu_banco -f 005_functions.sql
psql -U postgres -d seu_banco -f 006_triggers.sql
psql -U postgres -d seu_banco -f 007_rls_policies.sql
psql -U postgres -d seu_banco -f 008_views.sql
```

## Estrutura do Banco

### Tabelas Principais (20 total)

| Tabela | Descricao |
|--------|-----------|
| `profiles` | Perfis de usuarios (extensao de auth.users) |
| `follows` | Relacionamentos seguidor/seguindo |
| `posts` | Anuncios de venda/troca/leilao |
| `post_images` | Imagens dos anuncios |
| `likes` | Curtidas e posts salvos |
| `comments` | Comentarios com suporte a replies |
| `reviews` | Avaliacoes de vendedores |
| `reports` | Denuncias para moderacao |
| `verification_requests` | Solicitacoes de badge |
| `subscriptions` | Assinaturas de planos |
| `support_tickets` | Tickets de suporte |
| `admin_logs` | Auditoria de acoes admin |
| `notifications` | Notificacoes in-app |
| `blocked_users` | Bloqueio entre usuarios |
| `rate_limits` | Controle de taxa de acoes |
| `audit_trail` | Trilha de auditoria completa |
| `banned_words` | Palavras proibidas para moderacao |
| `user_sessions` | Sessoes de usuario |
| `suspicious_activities` | Registro de atividades suspeitas |
| `edge_function_logs` | Logs de Edge Functions |

### Tipos Enumerados

- `listing_type`: sale, trade, auction
- `post_condition`: new, like-new, good, fair, poor
- `post_status`: active, sold, archived, banned
- `user_role`: user, moderator, admin
- `user_status`: active, suspended, banned
- `report_reason`: spam, scam, inappropriate, illegal, harassment, other
- `report_status`: pending, investigating, resolved, dismissed
- `verification_type`: identity, store, partner
- `verification_status`: pending, approved, rejected
- `report_priority`: low, medium, high, urgent
- `report_target_type`: post, user, comment
- `ticket_status`: open, in_progress, resolved, closed
- `payment_method`: pix, credit_card, bank_transfer
- `payment_status`: pending, paid, failed, refunded, cancelled

### Funcionalidades Cobertas

- [x] Autenticacao (integracao com Supabase Auth)
- [x] Perfis de usuario com reputacao
- [x] Sistema de seguidores
- [x] Anuncios (venda, troca, leilao)
- [x] Upload de multiplas imagens
- [x] Sistema de curtidas/salvos
- [x] Comentarios com replies aninhados
- [x] Avaliacoes de vendedores
- [x] Sistema de denuncias
- [x] Moderacao com fila de prioridades
- [x] Verificacao de identidade/loja/parceiro
- [x] Assinaturas e pagamentos
- [x] Tickets de suporte
- [x] Logs de auditoria
- [x] Notificacoes in-app
- [x] Row Level Security completo
- [x] Triggers para contadores automaticos
- [x] Views otimizadas para consultas

## Manutencao

### Adicionar nova tabela

1. Adicione a tabela em `003_tables.sql`
2. Adicione indices em `004_indexes.sql`
3. Adicione funcoes relacionadas em `005_functions.sql`
4. Adicione triggers em `006_triggers.sql`
5. Adicione policies RLS em `007_rls_policies.sql`
6. Adicione views se necessario em `008_views.sql`

### Modificar tabela existente

Crie um novo arquivo de migracao:
```
009_alter_xxx.sql
```

## Rollback

Para reverter uma migracao, crie scripts de rollback separados:
```
001_extensions_rollback.sql
002_types_rollback.sql
...
```

## Estatísticas de Validação (2025-12-31)

| Métrica | Quantidade |
|---------|------------|
| Tabelas | 20 |
| ENUMs | 14 |
| Funções | 19+ |
| Triggers | 22 |
| Políticas RLS | 54 |
| Índices | 101 |
| Views | 10 |

### Funcionalidades de Segurança

- [x] Rate Limiting por usuário/ação
- [x] Detecção de palavras banidas
- [x] Auto-flag de posts suspeitos
- [x] Bloqueio de conta após falhas de login
- [x] Registro de atividades suspeitas
- [x] Trilha de auditoria completa
- [x] Controle de sessões de usuário
- [x] RLS em todas as tabelas
