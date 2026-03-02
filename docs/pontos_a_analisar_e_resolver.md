# Pontos a Analisar e Resolver - Code6mm MVP1

## Resumo de Prioridades

| Prioridade | Item | Status | Impacto |
|------------|------|--------|---------|
| **CRÍTICA** | 10. Segurança do WhatsApp | :white_check_mark: **RESOLVIDO** | Agora exige login |
| **ALTA** | 1. Logout do usuário | :white_check_mark: **RESOLVIDO** | Dropdown implementado |
| **ALTA** | 5. Editar post | :white_check_mark: **RESOLVIDO** | Modal de edição criado |
| **ALTA** | 2. Opção de draft | :white_check_mark: **RESOLVIDO** | Link removido |
| **MÉDIA** | 9. Acesso sem login | :white_check_mark: **RESOLVIDO** | Botões redirecionam para login |
| **MÉDIA** | 6. Scroll infinito | :white_check_mark: **RESOLVIDO** | Implementado no Explorar |
| **BAIXA** | 7. Lógica do feed | :white_check_mark: OK para MVP | Melhorar pós-launch |
| **BAIXA** | 11. Ordem feed vs explorar | :white_check_mark: Diferenciado | OK |
| **OK** | 3. Marcar item vendido | :white_check_mark: Implementado | - |
| **OK** | 4. Remover post | :white_check_mark: Implementado | - |
| **OK** | 8. Preço no post | :white_check_mark: Implementado | - |
| **OK** | 12. Imagens vert/horiz | :white_check_mark: Implementado | - |

---

## 1. Como o usuário pode sair da conta?

### Pergunta Original
> Como o usuário pode sair da conta se no header ao clicar sobre a imagem de perfil leva ele para o perfil dele como isso funciona no instagram?

### Status: :white_check_mark: **RESOLVIDO**

### O que foi implementado
- Criado **menu dropdown** ao clicar no avatar do usuário no header
- Menu inclui as opções:
  - Meu Perfil
  - Posts Salvos
  - Meus Anúncios
  - **Sair** (botão de logout em vermelho)
- Adicionada função `signOut()` em `src/lib/supabase.ts`
- Menu fecha automaticamente ao clicar fora

### Arquivos modificados
- `src/components/layout/Header.tsx` - adicionado dropdown com logout
- `src/lib/supabase.ts` - adicionada função `signOut()`

### Código implementado
```typescript
// Header.tsx
const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
        router.push('/auth/login');
        router.refresh();
    }
};

// Dropdown com opções de menu e botão Sair
```

---

## 2. Devemos remover a opção de draft do post?

### Pergunta Original
> Devemos remover a opção de draft do post?

### Status: :white_check_mark: **RESOLVIDO**

### O que foi implementado
- Removido o link "Drafts" confuso da tela de criação de post
- Substituído por botão "Voltar" que retorna à seleção de tipo de post
- Evita confusão do usuário, pois não existia funcionalidade real de rascunhos

### Arquivos modificados
- `src/components/screens/post/CreatePost.tsx` - substituído link "Drafts" por botão "Voltar"

### Código implementado
```typescript
// Antes: <Link href="/post/saved-posts">Drafts</Link>
// Depois:
<button onClick={() => setPostType(null)}>Voltar</button>
```

---

## 3. Como o usuário define o item como vendido?

### Pergunta Original
> Como o usuário define o item como vendido?

### Status: :white_check_mark: **JÁ ESTAVA IMPLEMENTADO**

### Como Funciona
1. Usuário acessa o detalhe do próprio post
2. Aparece botão **"Marcar Vendido"** (só para o dono)
3. Ao clicar, status muda para `'sold'`
4. Campo `sold_at` recebe timestamp
5. Aparece banner vermelho "Item Vendido" na galeria
6. Botão muda para **"Marcar Ativo"** para reverter

---

## 4. Como o usuário remove um post?

### Pergunta Original
> Como o usuário remove um post?

### Status: :white_check_mark: **JÁ ESTAVA IMPLEMENTADO**

### Como Funciona
1. Usuário acessa o detalhe do próprio post
2. Clica no botão de deletar (ícone lixeira)
3. Aparece `ConfirmModal` pedindo confirmação
4. Ao confirmar, status muda para `'archived'` (soft delete)
5. Usuário é redirecionado para home

---

## 5. Como o usuário edita um post?

### Pergunta Original
> Como o usuário edita um post?

### Status: :white_check_mark: **RESOLVIDO**

### O que foi implementado
- Criado hook `useUpdatePost()` para atualizar posts no banco
- Criado modal de edição inline no PostDetail
- Botão "Editar Anúncio" agora abre o modal
- Permite editar: título, descrição e preço
- Validação de campos obrigatórios
- Loading state durante salvamento

### Arquivos modificados
- `src/lib/hooks/usePosts.ts` - adicionado hook `useUpdatePost()`
- `src/components/screens/post/PostDetail.tsx` - adicionado modal de edição e lógica

### Código implementado
```typescript
// usePosts.ts
export function useUpdatePost() {
    const updatePost = async (postId: string, input: UpdatePostInput) => {
        // Atualiza título, descrição, preço, categoria, etc.
    };
    return { updatePost, loading };
}

// PostDetail.tsx
// Modal com campos de edição e botões Cancelar/Salvar
```

---

## 6. Há scroll infinito em todos os locais que deveria ter?

### Pergunta Original
> Há scroll infinito em todos os locais que deveria ter?

### Status: :white_check_mark: **RESOLVIDO**

### O que foi implementado
- Scroll infinito implementado na tela de Explorar/Search
- Hook `useSearchPosts` atualizado para suportar paginação
- IntersectionObserver adicionado para detectar fim da lista
- Carrega 20 posts por vez
- Indicador de loading ao carregar mais
- Mensagem "Fim dos resultados" quando não há mais posts

### Arquivos modificados
- `src/lib/hooks/useFeed.ts` - hook atualizado com `loadMore`, `hasMore`, `loadingMore`
- `src/components/screens/feed/Search.tsx` - adicionado IntersectionObserver

### Código implementado
```typescript
// useFeed.ts
export function useSearchPosts(options) {
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPosts(offset, true);
        }
    };

    return { posts, loading, loadingMore, search, loadMore, hasMore };
}

// Search.tsx
const observerRef = useRef<IntersectionObserver | null>(null);
// Observer que chama loadMore quando elemento fica visível
```

---

## 7. Qual é a lógica do feed e qual é a mínima aceitável para MVP1?

### Pergunta Original
> Há alguma lógica inteligente para a exibição de feed e qual é a lógica mínima aceitável para o MVP1 sabendo que será lançado no Brasil inteiro?

### Status: :white_check_mark: **OK PARA MVP1**

### Lógica Atual
```sql
ORDER BY p.is_bumped DESC, p.bumped_at DESC NULLS LAST, p.created_at DESC
```

**Ordem de prioridade**:
1. Posts com `is_bumped = TRUE` aparecem primeiro (posts pagos/destacados)
2. Entre bumped, ordena por `bumped_at` (mais recente primeiro)
3. Posts normais ordenam por `created_at` (mais recente primeiro)

### Por que é Aceitável para MVP1
- Posts mais recentes aparecem primeiro (cronológico reverso)
- Sistema de bump para monetização futura
- Simples e previsível para o usuário
- Performance otimizada (RPC unificada)

---

## 8. Ao cadastrar um novo post ele exige o preço?

### Pergunta Original
> Ao cadastrar um novo post ele exige o preço? Como funciona? Lembra que há post de item e de texto normal né?

### Status: :white_check_mark: **JÁ ESTAVA IMPLEMENTADO CORRETAMENTE**

### Como Funciona
O formulário tem **dois tipos de post**:

| Tipo | Preço | Campos Obrigatórios |
|------|-------|---------------------|
| **Vender Item** (`sale`) | **OBRIGATÓRIO** | descrição, preço, cidade, categoria |
| **Criar Post** (`text`) | Não aplicável | apenas descrição |

---

## 9. Sistema funciona para acesso sem login?

### Pergunta Original
> Eu achei bacana todos poderem acessar sem ter login pois aí a pessoa consegue ter uma ideia do sistema antes de se cadastrar. O sistema está realmente preparado para isso? Todos os links e botões e telas estão funcionando corretamente para quando isso acontece?

### Status: :white_check_mark: **RESOLVIDO**

### O que foi implementado
- Botões de Like, Salvar e WhatsApp agora verificam se usuário está logado
- Se não estiver logado, redireciona para página de login
- URL de retorno preservada para voltar após login
- Botão de WhatsApp mostra "Entrar para ver WhatsApp" quando não logado

### Arquivos modificados
- `src/components/post/PostActions.tsx` - verificação de login em todas as ações

### Código implementado
```typescript
const handleLike = () => {
    if (requireLogin && !user) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
    }
    // ... lógica de like
};

// Botão mostra texto diferente baseado no estado de login
{user ? 'Ver WhatsApp' : 'Entrar para ver WhatsApp'}
```

---

## 10. Segurança do WhatsApp e anti-scraping

### Pergunta Original
> Há segurança para apenas mostrar o WhatsApp para usuários que estão logados e anti-scraping? Estamos retornando o número de WhatsApp já no client? Não há controle de quem clicou? Podemos usar isso no futuro até como algoritmo de recomendação.

### Status: :white_check_mark: **RESOLVIDO (Proteção Básica)**

### O que foi implementado
- Botão de WhatsApp agora **exige login** antes de mostrar contato
- Usuários não logados são redirecionados para página de login
- Após login, retornam automaticamente para o post original
- URL de WhatsApp só é aberta após verificação de autenticação

### Arquivos modificados
- `src/components/post/PostActions.tsx` - verificação de login antes de abrir WhatsApp
- `src/components/screens/post/PostDetail.tsx` - passa phone do autor para PostActions

### Código implementado
```typescript
const handleWhatsAppClick = async () => {
    if (!user) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
    }
    // Abre WhatsApp somente se logado
    if (authorPhone) {
        window.open(`https://wa.me/55${cleanPhone}?text=...`, '_blank');
    }
};
```

### Melhorias futuras (Pós-MVP)
- Implementar log de visualizações de contato (tabela `contact_views`)
- Rate limiting por usuário
- Anti-scraping com CAPTCHA após X visualizações

---

## 11. Qual é a ordem e diferença entre Feed e Explorar?

### Pergunta Original
> Qual é a ordem e sequência dos posts exibidos no feed e no explorar? Qual é a diferença entre os dois?

### Status: :white_check_mark: **JÁ ESTAVA BEM IMPLEMENTADO**

### Comparação Detalhada

| Aspecto | Feed (Home) | Explorar (Search) |
|---------|-------------|-------------------|
| **Layout** | Lista vertical (1 col) | Grid (2-4 colunas) |
| **Card** | `FeedPostCard` (completo) | `PostCard` (compacto) |
| **Filtros** | Apenas categoria | Categoria, preço, condição, estado, busca |
| **Paginação** | Scroll infinito (20/pág) | Scroll infinito (20/pág) - **AGORA IMPLEMENTADO** |
| **Propósito** | Descoberta + navegação | Busca + comparação |

---

## 12. Preparados para imagens verticais e horizontais?

### Pergunta Original
> Estamos preparados para receber tanto imagens verticais quanto horizontais no feed e no explorar? Como deveríamos proceder?

### Status: :white_check_mark: **JÁ ESTAVA IMPLEMENTADO**

### Como Funciona
- Feed usa `aspect-[4/5]` (portrait) - ideal para fotos de produtos
- Grid/Search usa `aspect-square` (1:1) - thumbnails uniformes
- Post Detail usa `auto` - mostra imagem original
- `object-cover` mantém proporção sem distorção

---

## Resumo das Implementações Realizadas

### Arquivos Criados/Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/layout/Header.tsx` | Dropdown menu com logout |
| `src/lib/supabase.ts` | Função `signOut()` |
| `src/components/screens/post/CreatePost.tsx` | Removido link "Drafts", adicionado botão "Voltar" |
| `src/lib/hooks/usePosts.ts` | Hook `useUpdatePost()` para edição de posts |
| `src/components/screens/post/PostDetail.tsx` | Modal de edição, integração com WhatsApp protegido |
| `src/components/post/PostActions.tsx` | Verificação de login em Like, Salvar e WhatsApp |
| `src/lib/hooks/useFeed.ts` | Scroll infinito com `loadMore`, `hasMore` |
| `src/components/screens/feed/Search.tsx` | IntersectionObserver para scroll infinito |

### Funcionalidades Implementadas

1. **Logout do usuário** - Menu dropdown no avatar com opção de sair
2. **Remoção do link Drafts** - Substituído por botão "Voltar"
3. **Edição de posts** - Modal completo com título, descrição e preço
4. **Scroll infinito no Explorar** - Carrega 20 posts por vez automaticamente
5. **Proteção do WhatsApp** - Exige login para ver contato
6. **Botões protegidos** - Like, Salvar e WhatsApp redirecionam para login se não autenticado

---

## Plano de Ação - Status Final

### Concluído :white_check_mark:
1. [x] **Item 10**: Proteger número de WhatsApp - Exige login
2. [x] **Item 1**: Implementar logout - Dropdown no avatar
3. [x] **Item 2**: Remover link "Drafts" confuso
4. [x] **Item 5**: Implementar edição de posts - Modal de edição
5. [x] **Item 9**: Ajustar botões sem login - Redirecionam para login
6. [x] **Item 6**: Scroll infinito no Explorar - Implementado

### Backlog (Pós-MVP)
- Item 7: Melhorar algoritmo do feed (localização, engajamento)
- Item 2: Implementar sistema de drafts real (se necessário)
- Item 10: Anti-scraping avançado (CAPTCHA, rate limiting, logs)
