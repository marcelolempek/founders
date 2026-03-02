# Plano de Refatoração: Componentes de Post

## Resumo Executivo

O sistema atual possui componentes de post funcionais, mas com **lógica de permissão espalhada** entre telas e componentes. Isso causa inconsistência, dificulta manutenção e bloqueia features futuras (slug público, SEO, moderação admin).

---

## 1. Diagnóstico Atual

### 1.1 Componentes Existentes

| Componente | Localização | Responsabilidade |
|------------|-------------|------------------|
| `PostHeader` | `src/components/post/` | Avatar, username, localização, timestamp |
| `PostGallery` | `src/components/post/` | Galeria de imagens, preço, tag de troca |
| `PostActions` | `src/components/post/` | Like, bookmark, share, WhatsApp |
| `PostDescription` | `src/components/post/` | Descrição com hashtags clicáveis |
| `PostCard` | `src/components/shared/` | Composição dos componentes acima |
| `FeedPostCard` | `src/components/shared/` | Versão otimizada para feed infinito |
| `PostDetail` | `src/components/screens/post/` | Tela completa de detalhes |

### 1.2 Problema Central

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO ATUAL                             │
├─────────────────────────────────────────────────────────────┤
│  PostCard          →  Não sabe se é owner/viewer            │
│  PostActions       →  Mesmas ações para todos               │
│  PostDetail (tela) →  Toda lógica de permissão hardcoded    │
│  Profile           →  Não usa PostCard, renderiza custom    │
│  SavedPosts        →  Não usa PostCard, renderiza custom    │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Código Problemático (Exemplos)

**PostDetail.tsx - Lógica espalhada na tela:**
```typescript
// Linha 68: Cálculo manual de owner
const isOwner = currentUserId && post?.user_id === currentUserId;

// Linha 274: Report só se NÃO é owner
onMenuClick={!isOwner ? () => setShowReportModal(true) : undefined}

// Linha 352: Seção inteira condicional
{isOwner && (
    // Editar, Marcar Vendido, Impulsionar - tudo inline
)}

// Linha 442: Barra fixa condicional
{!isOwner && (
    // WhatsApp button
)}
```

**PostCard.tsx - Cego para contexto:**
```typescript
// Linha 84: Tem userId mas não usa para ações
const currentUserId = propCurrentUserId || user?.id;

// PostActions recebe sempre as mesmas props
<PostActions
    postId={post.id}
    onLike={handleLike}
    onShare={handleShare}
    onBookmark={handleBookmark}
    // Não há: viewerRole, isOwner, onEdit, onDelete, onReport
/>
```

---

## 2. Diferença de Ações por Papel

### 2.1 Owner (Meu Post)

| Ação | Permitido | Componente Responsável |
|------|-----------|------------------------|
| Editar | ✅ | PostActions |
| Excluir/Arquivar | ✅ | PostActions |
| Marcar Vendido | ✅ | PostActions |
| Impulsionar (Boost) | ✅ | PostActions |
| Ver Métricas | ✅ | PostCard |
| Compartilhar | ✅ | PostActions |
| Denunciar | ❌ | - |
| Bloquear Autor | ❌ | - |
| Ver WhatsApp | ❌ | - |

### 2.2 Viewer (Post de Outro)

| Ação | Permitido | Componente Responsável |
|------|-----------|------------------------|
| Curtir | ✅ | PostActions |
| Salvar | ✅ | PostActions |
| Compartilhar | ✅ | PostActions |
| Ver WhatsApp | ✅ | PostActions |
| Denunciar | ✅ | PostActions/PostHeader |
| Bloquear Autor | ✅ | PostHeader |
| Editar | ❌ | - |
| Excluir | ❌ | - |

### 2.3 Admin/Moderador

| Ação | Permitido | Componente Responsável |
|------|-----------|------------------------|
| Ver Reports | ✅ | PostCard (badge) |
| Remover Post | ✅ | PostActions |
| Banir Post | ✅ | PostActions |
| Suspender Usuário | ✅ | PostHeader |
| Ver Histórico | ✅ | PostCard |

### 2.4 Guest (Não Logado)

| Ação | Permitido | Componente Responsável |
|------|-----------|------------------------|
| Visualizar | ✅ | PostCard |
| Compartilhar | ✅ | PostActions |
| Curtir | ❌ (redirect login) | PostActions |
| Salvar | ❌ (redirect login) | PostActions |
| Ver WhatsApp | ❌ (redirect login) | PostActions |

---

## 3. Solução Proposta

### 3.1 Novo Tipo ViewerRole

```typescript
// src/types/post.ts
export type ViewerRole = 'owner' | 'viewer' | 'admin' | 'guest';

export interface PostContextProps {
    viewerRole: ViewerRole;
    postId: string;
    authorId: string;
}
```

### 3.2 Nova Interface do PostCard

```typescript
interface PostCardProps {
    post: PostCardData;
    variant?: 'feed' | 'grid' | 'compact' | 'detail';
    viewerRole?: ViewerRole; // NOVO - default calculado automaticamente

    // Callbacks opcionais (PostCard gerencia internamente se não fornecidos)
    onEdit?: () => void;
    onDelete?: () => void;
    onReport?: () => void;
    onBlock?: () => void;
    onBoost?: () => void;
    onMarkSold?: () => void;
}
```

### 3.3 Nova Interface do PostActions

```typescript
interface PostActionsProps {
    postId: string;
    viewerRole: ViewerRole;
    postType: 'sale' | 'text';
    status?: 'active' | 'sold' | 'archived';

    // Estados
    isLiked?: boolean;
    isBookmarked?: boolean;

    // Callbacks base (sempre disponíveis)
    onLike?: () => void;
    onBookmark?: () => void;
    onShare?: () => void;

    // Callbacks condicionais (baseados em viewerRole)
    onWhatsApp?: () => void;      // viewer only
    onEdit?: () => void;          // owner only
    onDelete?: () => void;        // owner only
    onMarkSold?: () => void;      // owner only
    onBoost?: () => void;         // owner only
    onReport?: () => void;        // viewer only
}
```

### 3.4 Lógica Centralizada

```typescript
// src/lib/utils/postPermissions.ts
export function getViewerRole(
    currentUserId: string | null,
    authorId: string,
    userRole?: 'user' | 'admin' | 'moderator'
): ViewerRole {
    if (!currentUserId) return 'guest';
    if (userRole === 'admin' || userRole === 'moderator') return 'admin';
    if (currentUserId === authorId) return 'owner';
    return 'viewer';
}

export function canPerformAction(
    action: PostAction,
    viewerRole: ViewerRole
): boolean {
    const permissions: Record<PostAction, ViewerRole[]> = {
        edit: ['owner'],
        delete: ['owner', 'admin'],
        markSold: ['owner'],
        boost: ['owner'],
        report: ['viewer'],
        block: ['viewer'],
        like: ['owner', 'viewer', 'admin'],
        bookmark: ['owner', 'viewer', 'admin'],
        share: ['owner', 'viewer', 'admin', 'guest'],
        whatsapp: ['viewer', 'admin'],
    };

    return permissions[action]?.includes(viewerRole) ?? false;
}
```

---

## 4. Ordem de Priorização

### Fase 1: Fundação (Crítico)
**Objetivo**: Criar base sem quebrar código existente

| # | Tarefa | Arquivo | Impacto |
|---|--------|---------|---------|
| 1.1 | Criar tipo `ViewerRole` | `src/types/post.ts` | [x] Concluído |
| 1.2 | Criar `postPermissions.ts` | `src/lib/utils/postPermissions.ts` | [x] Concluído |
| 1.3 | Criar hook `useViewerRole` | `src/lib/hooks/useViewerRole.ts` | [x] Concluído |

### Fase 2: PostActions Refactor (Alto)
**Objetivo**: Centralizar ações no componente

| # | Tarefa | Arquivo | Impacto |
|---|--------|---------|---------|
| 2.1 | Adicionar prop `viewerRole` ao PostActions | `src/components/post/PostActions.tsx` | [x] Concluído |
| 2.2 | Implementar renderização condicional de botões | `src/components/post/PostActions.tsx` | [x] Concluído |
| 2.3 | Adicionar botões de owner (edit, delete, sold) | `src/components/post/PostActions.tsx` | [x] Concluído |
| 2.4 | Adicionar botão de report para viewer | `src/components/post/PostActions.tsx` | [x] Concluído |

### Fase 3: PostCard Integration (Alto)
**Objetivo**: PostCard calcula e passa viewerRole

| # | Tarefa | Arquivo | Impacto |
|---|--------|---------|---------|
| 3.1 | Adicionar prop `viewerRole` ao PostCard | `src/components/shared/PostCard.tsx` | [x] Concluído |
| 3.2 | Auto-calcular viewerRole se não fornecido | `src/components/shared/PostCard.tsx` | [x] Concluído |
| 3.3 | Passar viewerRole para PostActions | `src/components/shared/PostCard.tsx` | [x] Concluído |
| 3.4 | Replicar para FeedPostCard | `src/components/shared/FeedPostCard.tsx` | [x] Concluído |

### Fase 4: Migrar Telas (Médio)
**Objetivo**: Telas declaram contexto, não implementam lógica

| # | Tarefa | Arquivo | Impacto |
|---|--------|---------|---------|
| 4.1 | Simplificar PostDetail removendo lógica duplicada | `src/components/screens/post/PostDetail.tsx` | [x] Concluído |
| 4.2 | Migrar Profile para usar PostCard | `src/components/screens/profile/Profile.tsx` | [x] Concluído |
| 4.3 | Migrar PublicProfile para usar PostCard | `src/components/screens/profile/PublicProfile.tsx` | [x] Concluído |
| 4.4 | Migrar SavedPosts para usar PostCard | `src/components/screens/post/SavedPosts.tsx` | [x] Concluído |

### Fase 5: Features Desbloqueadas (Baixo - Futuro)
**Objetivo**: Aproveitar a nova arquitetura

| # | Tarefa | Descrição |
|---|--------|-----------|
| 5.1 | Slug público `/p/[slug]` | Página pública usando PostCard com viewerRole dinâmico |
| 5.2 | SEO e meta tags | Open Graph, Twitter Cards baseados no post |
| 5.3 | Admin moderation view | PostCard com viewerRole='admin' |
| 5.4 | Embed de post | PostCard variant='embed' para compartilhamento externo |

---

## 5. Estimativa de Arquivos Afetados

### Criação (3 arquivos)
- `src/types/post.ts`
- `src/lib/utils/postPermissions.ts`
- `src/lib/hooks/useViewerRole.ts`

### Modificação (8 arquivos)
- `src/components/post/PostActions.tsx`
- `src/components/post/PostHeader.tsx`
- `src/components/shared/PostCard.tsx`
- `src/components/shared/FeedPostCard.tsx`
- `src/components/screens/post/PostDetail.tsx`
- `src/components/screens/post/SavedPosts.tsx`
- `src/components/screens/profile/Profile.tsx`
- `src/components/screens/profile/PublicProfile.tsx`

---

## 6. Critérios de Sucesso

### Funcional
- [ ] PostCard renderiza ações corretas baseado em viewerRole
- [ ] Owner vê: editar, excluir, marcar vendido, boost
- [ ] Viewer vê: WhatsApp, denunciar, curtir, salvar
- [ ] Guest vê: compartilhar, redirect para login em outras ações
- [ ] Admin vê: todas as ações + moderação

### Técnico
- [ ] Zero duplicação de lógica de permissão
- [ ] Telas apenas declaram contexto
- [ ] Backward compatible (props opcionais)
- [ ] Tipos TypeScript completos

### UX
- [ ] Comportamento consistente em todas as telas
- [ ] Transições suaves entre estados
- [ ] Feedback claro de ações disponíveis

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebrar telas existentes | Média | Alto | Props backward compatible |
| Performance em listas | Baixa | Médio | Memoização de cálculo de role |
| Complexidade de testes | Média | Médio | Testes unitários por fase |

---

## 8. Próximos Passos

1. **Aprovar este plano**
2. **Iniciar Fase 1** - Criação dos tipos e utilitários
3. **Review de código** após cada fase
4. **Testes manuais** em cada tela afetada

---

*Documento criado em: 2026-01-02*
*Última atualização: 2026-01-02*
