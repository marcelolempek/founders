# Checklist de Funcionalidades - Code6mm

> Documento de acompanhamento de funcionalidades pendentes, incompletas e melhorias necessárias.

---

## Legenda de Prioridade

| Prioridade | Descrição | Critério |
|------------|-----------|----------|
| **P0** | Crítico | Bloqueia uso do app ou causa erros |
| **P1** | Alto | Funcionalidade core incompleta |
| **P2** | Médio | Melhoria importante de UX |
| **P3** | Baixo | Nice-to-have, polish |

---

## 1. Funcionalidades Faltando (P0 - Crítico)

### 1.1 Hook useCreatePost Não Existe
- [ ] **Arquivo:** `src/lib/hooks/usePosts.ts`
- **Problema:** O hook `useCreatePost` é importado em `CreatePost.tsx` mas não existe no arquivo `usePosts.ts`
- **Impacto:** Criação de posts pode estar quebrada
- **Ação:** Implementar hook `useCreatePost` com lógica de upload de imagens e criação de post

### 1.2 ~~Sistema de Mensagens~~ - DESCARTADO
- **Decisão:** Comunicação será apenas via WhatsApp (já implementado)
- **Ação:** Remover botão "Mensagens" da SidebarLeft (`src/components/layout/SidebarLeft.tsx:18-21`)

---

## 2. Funcionalidades Incompletas (P1 - Alto)

### 2.1 Denúncia de Usuário no Profile - Apenas console.log
- [ ] **Arquivo:** `src/components/screens/profile/Profile.tsx:79-82`
- **Código atual:**
```typescript
const handleReport = async (reason: string, details: string) => {
    console.log('Report submitted:', { reason, details });
    setShowReportModal(false);
};
```
- **Ação:** Implementar insert na tabela `reports` do Supabase (igual ao `PostDetail.tsx`)

### 2.2 Fluxo de Complete Profile Desconectado
- [ ] **Arquivo:** `src/app/auth/complete-profile/page.tsx`
- **Problema:** Página existe mas não há redirecionamento automático após signup
- **Ação:** Adicionar redirect no `SignUp.tsx` após criação de conta para completar perfil

### 2.3 Botão Criar Post Sem Verificação de Auth
- [ ] **Arquivo:** `src/components/layout/MobileBottomNav.tsx:35-40`
- **Problema:** `openCreatePost()` é chamado sem verificar se usuário está logado
- **Ação:** Adicionar verificação de `user` antes de abrir modal, redirect para login se não autenticado

### 2.4 Notificações Admin Sem Funcionalidade
- [ ] **Arquivo:** `src/app/admin/layout.tsx:61-64`
- **Problema:** Botão de notificações no header admin não tem onClick
- **Ação:** Implementar dropdown de notificações ou remover badge de "não lidas"

### 2.5 ReportCard Admin Sem Ação de Resolução
- [ ] **Arquivo:** `src/app/admin/dashboard/page.tsx:136-137`
- **Problema:** Card de denúncia apenas abre o post, não permite marcar como resolvido
- **Ação:** Adicionar botões "Resolver" e "Dispensar" com update na tabela `reports`

### 2.6 Formulário de Contato (Support) Sem Submit Real
- [ ] **Arquivo:** `src/components/screens/support/Contact.tsx`
- **Problema:** Formulário provavelmente não envia dados
- **Ação:** Implementar envio via API ou Supabase function

---

## 3. Rotas Duplicadas/Confusas (P1 - Alto)

### 3.1 Rotas de Autenticação
- [ ] **Problema:** `/auth/register` e `/auth/signup` fazem a mesma coisa
- **Ação:** Manter apenas `/auth/signup` e remover `/auth/register` ou criar redirect

### 3.2 Rotas de Verificação Duplicadas
| Rota Atual | Duplicada Com | Ação |
|------------|---------------|------|
| `/verification/parceira` | `/verification/partner` | Manter `partner`, remover `parceira` |
| `/verification/identity` | `/verification/apply-identity` | Consolidar em uma única |
| `/verification/store` | `/verification/apply-physical-store` | Consolidar em uma única |

- [ ] Consolidar rotas de verificação para evitar confusão

---

## 4. Problemas de UI/UX (P2 - Médio)

### 4.1 AdminSidebar com Ícone Inválido
- [ ] **Arquivo:** `src/components/admin/AdminSidebar.tsx:58`
- **Código:**
```tsx
<AdminNavLink href="/admin/settings" icon="Configurações" label="Configurações" />
```
- **Problema:** `icon` recebe string "Configurações" ao invés de nome de ícone Material
- **Ação:** Trocar para `icon="settings"`

### 4.2 Links Admin Usando `<a>` ao Invés de `<Link>`
- [ ] **Arquivo:** `src/app/admin/dashboard/page.tsx:118, 178`
- **Problema:** Links diretos quebram prefetch do Next.js
- **Ação:** Trocar `<a href=` por `<Link href=`

### 4.3 Dados Mockados no Feed (Stories)
- [ ] **Arquivo:** `src/components/screens/feed/Feed.tsx:61-72`
- **Problema:** "SpecOps" é usuário hardcoded nos stories
- **Ação:** Carregar stories reais ou remover seção

### 4.4 Sidebar com Anúncios Mockados
- [ ] **Arquivo:** `src/components/layout/SidebarLeft.tsx:52-59`
- **Problema:** "JPC 2.0 Multicam" é anúncio hardcoded
- **Ação:** Usar hook `useUserPosts` para carregar anúncios reais do usuário logado

---

## 5. Código Legado/Limpeza (P3 - Baixo)

### 5.0 Remover Botão de Mensagens
- [ ] **Arquivo:** `src/components/layout/SidebarLeft.tsx:18-21`
- **Ação:** Remover botão "Mensagens" disabled (comunicação será apenas via WhatsApp)

### 5.1 Arquivo useFeed.ts.new Não Utilizado
- [ ] **Arquivo:** `src/lib/hooks/useFeed.ts.new`
- **Ação:** Comparar com `useFeed.ts`, consolidar melhorias e deletar `.new`

### 5.2 @ts-ignore Espalhados
- [ ] **Arquivos:**
  - `src/lib/hooks/usePosts.ts:108, 66-67`
  - `src/components/screens/notifications/NotificationList.tsx:53, 73`
  - `src/lib/hooks/useProfile.ts:49-50`
- **Ação:** Corrigir tipos para remover @ts-ignore

### 5.3 Type Casting Excessivo
- [ ] **Arquivo:** `src/lib/hooks/usePosts.ts:145-146`
- **Problema:** Casting de tipos indica desalinhamento entre API e frontend
- **Ação:** Criar tipos corretos alinhados com schema do Supabase

---

## 6. Integrações Pendentes (P2 - Médio)

### 6.1 Mercado Pago - Verificar Implementação
- [ ] **Arquivos:**
  - `src/lib/hooks/useMercadoPago.ts`
  - `src/app/api/mercadopago/payment-status/route.ts`
  - `src/app/api/mercadopago/webhook/route.ts`
- **Ação:** Testar fluxo completo de pagamento (criar preferência → pagar → webhook → status)

### 6.2 Post Contact API - Dados Reais
- [ ] **Arquivo:** `src/app/api/posts/[id]/contact/route.ts`
- **Ação:** Verificar se retorna dados reais do vendedor (phone do profile)

### 6.3 useSupport Hook - Verificar Dados
- [ ] **Arquivo:** `src/lib/hooks/useSupport.ts`
- **Ação:** Verificar se `useSubscription()` e `useMyReports()` retornam dados reais

---

## 7. Features Futuras (P3 - Backlog)

### 7.1 Sistema de Histórias/Stories
- [ ] Definir se terá stories (temporários 24h) ou apenas highlights (permanentes)
- [ ] Criar tabelas necessárias
- [ ] Implementar upload e visualização
- [ ] Implementar expiração automática (se stories)

### 7.2 Sistema de Busca Avançada
- [ ] Filtros por categoria
- [ ] Filtros por preço (min/max)
- [ ] Filtros por localização
- [ ] Filtros por condição do item
- [ ] Ordenação (mais recentes, mais baratos, mais caros)

### 7.3 Sistema de Avaliações de Transação
- [ ] Avaliação pós-venda (comprador avalia vendedor)
- [ ] Badge de vendedor confiável baseado em avaliações
- [ ] Histórico de transações

---

## 8. Ordem de Execução Recomendada

### Sprint 1 - Crítico (1-2 dias)
1. [ ] Implementar/verificar `useCreatePost` hook
2. [ ] Corrigir `handleReport` no Profile.tsx
3. [ ] Adicionar verificação de auth no botão criar post

### Sprint 2 - Core Features (3-5 dias)
4. [ ] Conectar fluxo complete-profile após signup
5. [ ] Consolidar rotas duplicadas de verificação
6. [ ] Implementar ações de resolução em ReportCard admin
7. [ ] Implementar formulário de contato do Support

### Sprint 3 - Polish (2-3 dias)
8. [ ] Corrigir ícone AdminSidebar
9. [ ] Trocar `<a>` por `<Link>` no admin
10. [ ] Remover/substituir dados mockados (stories, sidebar)
11. [ ] Limpar arquivo `useFeed.ts.new`

### Sprint 4 - Integrações (3-5 dias)
12. [ ] Testar fluxo completo Mercado Pago
13. [ ] Verificar Post Contact API
14. [ ] Remover @ts-ignore e corrigir tipos

### Sprint 5 - Features Novas (backlog)
15. [ ] Sistema de Stories
16. [ ] Busca Avançada
17. [ ] Sistema de Avaliações de Transação

---

## 9. Métricas de Progresso

### Totais por Prioridade
| Prioridade | Total | Concluídos | Pendentes |
|------------|-------|------------|-----------|
| P0 - Crítico | 1 | 0 | 1 |
| P1 - Alto | 8 | 0 | 8 |
| P2 - Médio | 7 | 0 | 7 |
| P3 - Baixo | 7 | 0 | 7 |
| **Total** | **23** | **0** | **23** |

> **Nota:** Sistema de Mensagens foi DESCARTADO - comunicação será via WhatsApp

### Progresso Geral
```
[                    ] 0%
```

---

## 10. Como Usar Este Documento

1. **Marcar como concluído:** Trocar `[ ]` por `[x]` quando finalizar item
2. **Atualizar métricas:** Ajustar contadores na seção 9
3. **Adicionar novos itens:** Seguir formato existente com arquivo, problema e ação
4. **Revisar semanalmente:** Verificar progresso e repriorizar se necessário

---

*Documento criado em: 2026-01-02*
*Última atualização: 2026-01-02*
