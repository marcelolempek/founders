# Persistência de Estado de Página

## Visão Geral

O sistema de persistência de estado permite que as páginas mantenham seu estado (filtros, dados carregados, posição de scroll) quando o usuário navega para outra página e depois retorna.

## Como Funciona

- **PageStateContext**: Gerencia o armazenamento de estado usando `Map` em memória e `sessionStorage` para persistência
- **usePersistedPageState**: Hook customizado que simplifica o uso do contexto
- **Scroll automático**: A posição do scroll é salva automaticamente durante a navegação

## Como Usar

### 1. Importar o Hook

```tsx
import { usePersistedPageState } from '@/lib/hooks/usePersistedPageState';
```

### 2. Definir a Interface de Dados

```tsx
interface MyPageData {
    searchQuery: string;
    items: Item[];
    filters: FilterState;
    // ... outros dados que você quer persistir
}
```

### 3. Usar o Hook no Componente

```tsx
export default function MyPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    
    const { restoreState, saveState, isRestored } = usePersistedPageState<MyPageData>('/my-page');

    // Restaurar estado ao montar
    useEffect(() => {
        const restored = restoreState();
        if (restored) {
            setSearchQuery(restored.searchQuery || '');
            setItems(restored.items || []);
            setLoading(false);
        }
    }, []);

    // Salvar estado quando os dados mudarem
    useEffect(() => {
        if (!loading && isRestored) {
            saveState({
                searchQuery,
                items
            });
        }
    }, [searchQuery, items, loading, isRestored, saveState]);

    // Carregar dados apenas se não restaurou
    useEffect(() => {
        if (isRestored) return;

        const loadData = async () => {
            setLoading(true);
            // ... carregar dados
            setLoading(false);
        };
        
        loadData();
    }, [isRestored]);

    // ... resto do componente
}
```

## Exemplo Completo: Feed Principal

```tsx
'use client';

import { useState, useEffect } from 'react';
import { usePersistedPageState } from '@/lib/hooks/usePersistedPageState';

interface FeedPageData {
    posts: Post[];
    filters: {
        category: string;
        sortBy: string;
    };
}

export default function Feed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [loading, setLoading] = useState(true);
    
    const { restoreState, saveState, isRestored } = usePersistedPageState<FeedPageData>('/');

    // Restaurar
    useEffect(() => {
        const restored = restoreState();
        if (restored) {
            setPosts(restored.posts || []);
            setCategory(restored.filters?.category || 'all');
            setSortBy(restored.filters?.sortBy || 'recent');
            setLoading(false);
        }
    }, []);

    // Salvar
    useEffect(() => {
        if (!loading && isRestored) {
            saveState({
                posts,
                filters: { category, sortBy }
            });
        }
    }, [posts, category, sortBy, loading, isRestored, saveState]);

    // Carregar apenas se necessário
    useEffect(() => {
        if (isRestored) return;
        
        loadPosts();
    }, [isRestored, category, sortBy]);

    return (
        // ... JSX
    );
}
```

## Páginas que Devem Usar Esta Funcionalidade

1. **Feed Principal (`/`)** - Preservar posts carregados e filtros
2. **Discover (`/discover`)** ✅ - Já implementado
3. **Explore (`/explore`)** - Preservar resultados de busca
4. **Saved Posts (`/post/saved-posts`)** - Preservar lista de posts salvos
5. **Profile (`/profile/[id]`)** - Preservar posts do perfil e tab ativa
6. **Notifications (`/notifications`)** - Preservar lista de notificações

## Benefícios

- ✅ Melhor UX - Usuário não perde o contexto ao navegar
- ✅ Performance - Evita recarregar dados desnecessariamente
- ✅ Menos requisições - Dados são reutilizados quando possível
- ✅ Scroll preservado - Usuário volta exatamente onde estava

## Notas Importantes

- O estado é mantido apenas durante a sessão (sessionStorage)
- Ao recarregar a página (F5), o estado é perdido
- Use `isRestored` para evitar carregar dados duplicados
- O scroll é salvo automaticamente, não precisa de código extra
