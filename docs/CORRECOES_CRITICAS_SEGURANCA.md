# 🚨 CORREÇÕES CRÍTICAS DE SEGURANÇA - CODE 6MM

**Data:** 05/01/2026
**Prioridade:** P0 - MÁXIMA URGÊNCIA
**Status:** AÇÃO IMEDIATA OBRIGATÓRIA

---

## ⚠️ ALERTA DE SEGURANÇA

Este documento contém **VULNERABILIDADES CRÍTICAS DE SEGURANÇA** que devem ser corrigidas **IMEDIATAMENTE** antes de qualquer outro desenvolvimento ou correção.

**RISCO ATUAL:** 🔴 CRÍTICO - Sistema comprometido

---

## 🔴 PROBLEMA #1 - FALHA CRÍTICA DE SEGURANÇA: Acesso Administrativo Desprotegido

### SEVERIDADE: CRÍTICO - P0 MÁXIMA
### STATUS: 🚨 VULNERABILIDADE ATIVA

### DESCRIÇÃO DO PROBLEMA:

**TODOS OS USUÁRIOS TÊM ACESSO À ROTA `/admin/dashboard`**

Isso significa que:
- ❌ Qualquer usuário comum pode acessar painel administrativo
- ❌ Podem ver dados sensíveis de outros usuários
- ❌ Podem ter acesso a ferramentas de moderação
- ❌ Podem modificar configurações do sistema
- ❌ Podem acessar analytics e métricas privadas
- ❌ Violação grave de segurança (OWASP A01:2021 - Broken Access Control)

### IMPACTO:

| Aspecto | Impacto |
|---------|---------|
| **Segurança** | CRÍTICO - Acesso não autorizado a dados sensíveis |
| **Privacidade** | CRÍTICO - Exposição de dados de usuários |
| **Compliance** | CRÍTICO - Violação LGPD/GDPR |
| **Reputação** | ALTO - Comprometimento total da confiança |
| **Legal** | ALTO - Responsabilidade civil e criminal |

### LOCALIZAÇÃO DO PROBLEMA:

1. **Middleware de Autenticação:**
   - `src/middleware.ts` - Verificar proteção de rotas admin

2. **Páginas Admin:**
   - `src/app/admin/dashboard/page.tsx`
   - `src/app/admin/moderation/page.tsx`
   - `src/app/admin/users/page.tsx`
   - `src/app/admin/verification/page.tsx`
   - `src/app/admin/badge-management/page.tsx`
   - `src/app/admin/analytics/page.tsx`
   - `src/app/admin/settings/page.tsx`
   - `src/app/admin/layout.tsx` - Layout admin

3. **Verificação de Role:**
   - Banco de dados: tabela `profile` campo `role` (enum: user|moderator|admin)
   - Context/Hook de autenticação que verifica role

---

## 🔧 SOLUÇÃO - IMPLEMENTAÇÃO DE PROTEÇÃO ADMIN

### PASSO 1: Proteger Rotas no Middleware

**Arquivo:** `src/middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Se não está autenticado, redirecionar para login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // CRÍTICO: Verificar acesso a rotas admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Buscar role do usuário
    const { data: profile } = await supabase
      .from('profile')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Verificar se é admin ou moderator
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
      // BLOQUEAR ACESSO - Redirecionar para home com erro
      const url = new URL('/', req.url)
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/post/create',
    // Adicione outras rotas protegidas aqui
  ],
}
```

---

### PASSO 2: Proteção Server-Side nas Páginas Admin

**Arquivo:** `src/app/admin/layout.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // CRÍTICO: Verificar role
  const { data: profile, error } = await supabase
    .from('profile')
    .select('role, username, avatar_url')
    .eq('id', session.user.id)
    .single()

  // Bloquear se não for admin ou moderator
  if (error || !profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <p>Usuário: {profile.username} | Role: {profile.role}</p>
      </div>
      {children}
    </div>
  )
}
```

---

### PASSO 3: Proteção em Cada Página Admin

**Exemplo:** `src/app/admin/dashboard/page.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Dupla verificação de segurança
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    redirect('/?error=unauthorized')
  }

  // Continuar com lógica da página...
  return (
    <div>
      <h1>Dashboard Administrativo</h1>
      {/* Conteúdo do dashboard */}
    </div>
  )
}
```

---

### PASSO 4: Proteção de API Routes Admin

**Exemplo:** `src/app/api/admin/[...endpoint]/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // CRÍTICO: Verificar role
  const { data: profile } = await supabase
    .from('profile')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    )
  }

  // Lógica da API...
  return NextResponse.json({ success: true })
}
```

---

### PASSO 5: Row Level Security (RLS) no Supabase

**Criar políticas RLS para proteger dados administrativos:**

```sql
-- Política para tabela de analytics administrativos
CREATE POLICY "admin_analytics_select"
ON admin_analytics
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profile
    WHERE role IN ('admin', 'moderator')
  )
);

-- Política para tabela de reports
CREATE POLICY "admin_reports_select"
ON report
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profile
    WHERE role IN ('admin', 'moderator')
  )
);

-- Política para ações de moderação
CREATE POLICY "admin_only_update_user_status"
ON profile
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profile
    WHERE role = 'admin'
  )
);
```

---

### PASSO 6: Hook Customizado para Verificação de Role

**Arquivo:** `src/lib/hooks/useAdmin.ts`

```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModerator, setIsModerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase
          .from('profile')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile) {
          router.push('/?error=unauthorized')
          return
        }

        setIsAdmin(profile.role === 'admin')
        setIsModerator(profile.role === 'moderator' || profile.role === 'admin')

        if (profile.role !== 'admin' && profile.role !== 'moderator') {
          router.push('/?error=unauthorized')
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/?error=unauthorized')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [router, supabase])

  return { isAdmin, isModerator, loading }
}
```

**Uso:**
```typescript
'use client'

import { useAdmin } from '@/lib/hooks/useAdmin'

export default function AdminComponent() {
  const { isAdmin, isModerator, loading } = useAdmin()

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      {isAdmin && <p>Você é Admin</p>}
      {isModerator && <p>Você é Moderador</p>}
    </div>
  )
}
```

---

## 🧪 CHECKLIST DE TESTES DE SEGURANÇA

Após implementar as correções, TESTAR:

### ✅ Teste 1: Usuário Comum
- [ ] Criar conta como usuário comum (role = 'user')
- [ ] Tentar acessar `/admin/dashboard`
- [ ] **ESPERADO:** Redirecionamento para home com erro
- [ ] **NÃO DEVE:** Conseguir ver conteúdo admin

### ✅ Teste 2: Sem Autenticação
- [ ] Fazer logout
- [ ] Tentar acessar `/admin/dashboard`
- [ ] **ESPERADO:** Redirecionamento para `/auth/login`

### ✅ Teste 3: Moderador
- [ ] Criar conta com role = 'moderator'
- [ ] Tentar acessar `/admin/dashboard`
- [ ] **ESPERADO:** Acesso permitido (se moderadores tiverem acesso)

### ✅ Teste 4: Admin
- [ ] Criar conta com role = 'admin'
- [ ] Tentar acessar `/admin/dashboard`
- [ ] **ESPERADO:** Acesso total permitido

### ✅ Teste 5: API Routes
- [ ] Usuário comum tenta chamar API admin
- [ ] **ESPERADO:** HTTP 403 Forbidden

### ✅ Teste 6: Manipulação de Role no Frontend
- [ ] Tentar manipular role no localStorage/cookies
- [ ] Tentar acessar admin
- [ ] **ESPERADO:** Bloqueio no servidor (RLS)

### ✅ Teste 7: Direct URL Access
- [ ] Usuário comum digita diretamente `/admin/users`
- [ ] **ESPERADO:** Bloqueio imediato

---

## 🔴 PROBLEMA #2 - Botão "Atualizar Feed" Desnecessário

### SEVERIDADE: BAIXA - P2
### STATUS: Melhoria de UX

### DESCRIÇÃO DO PROBLEMA:

Existe um botão "Refresh / Atualizar feed" no feed principal que:
- É desnecessário em aplicações modernas
- Confunde usuários (não sabem quando usar)
- Ocupa espaço na interface
- Feeds modernos atualizam automaticamente ou com scroll

### MOTIVOS PARA REMOVER:

1. **UX Moderna:** Apps como Instagram, Twitter, TikTok não têm botão de refresh explícito
2. **Auto-refresh:** Feed pode atualizar automaticamente ao abrir
3. **Pull-to-refresh:** No mobile, gesto de "puxar para baixo" é mais intuitivo
4. **Simplificação:** Menos opções = interface mais limpa

### LOCALIZAÇÃO:

- `src/app/page.tsx` - Feed principal
- `src/components/feed/FeedHeader.tsx` ou similar
- Componente que renderiza o botão de refresh

### SOLUÇÃO:

**Opção 1 - Remover Completamente (Recomendado):**
```typescript
// Remover o botão do componente
// Antes:
<button onClick={refreshFeed}>
  <span className="material-symbols-outlined">refresh</span>
  Atualizar feed
</button>

// Depois: (remover)
```

**Opção 2 - Substituir por Pull-to-Refresh (Mobile):**
```typescript
// Implementar pull-to-refresh nativo mobile
// Biblioteca recomendada: react-simple-pull-to-refresh

import PullToRefresh from 'react-simple-pull-to-refresh'

<PullToRefresh onRefresh={handleRefresh}>
  <FeedContent />
</PullToRefresh>
```

**Opção 3 - Auto-refresh Inteligente:**
```typescript
// Atualizar feed automaticamente quando:
// 1. Usuário retorna à aba
// 2. A cada X minutos (ex: 5min)
// 3. Quando detectar novos posts (polling ou websocket)

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      refreshFeed()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])
```

### BENEFÍCIOS:

- ✅ Interface mais limpa
- ✅ Melhor UX (segue padrões modernos)
- ✅ Menos confusão para usuários
- ✅ Atualização mais natural (automática ou gesto)

---

## 📋 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### 1️⃣ URGENTE - Proteger Rotas Admin (PROBLEMA #1)
**Tempo estimado:** 2-4 horas
**Complexidade:** Média
**Impacto:** CRÍTICO

**Ordem de implementação:**
1. Middleware (proteção inicial)
2. Layout admin (proteção server-side)
3. Cada página admin (dupla verificação)
4. API routes admin
5. RLS policies
6. Testes completos

### 2️⃣ IMPORTANTE - Remover Botão Atualizar Feed (PROBLEMA #2)
**Tempo estimado:** 30 minutos
**Complexidade:** Baixa
**Impacto:** Baixo

**Ordem de implementação:**
1. Remover botão do componente
2. (Opcional) Implementar pull-to-refresh
3. (Opcional) Implementar auto-refresh
4. Testar UX

---

## ⚠️ AVISOS IMPORTANTES

### PROBLEMA #1 - Proteção Admin:

1. **NÃO CONFIAR NO FRONTEND:**
   - Ocultar botões admin no frontend NÃO é segurança
   - Sempre validar no servidor (middleware + server components)

2. **MÚLTIPLAS CAMADAS:**
   - Middleware (primeira linha)
   - Server Components (segunda linha)
   - RLS no banco (terceira linha)
   - API Routes (quarta linha)

3. **LOGGING:**
   - Registrar todas as tentativas de acesso não autorizado
   - Criar alerta para admins quando houver tentativas suspeitas

4. **AUDITORIA:**
   - Após implementar, fazer auditoria de segurança completa
   - Considerar contratar pentest profissional

5. **COMPLIANCE:**
   - Documentar as medidas de segurança (LGPD)
   - Ter política clara de acesso administrativo

---

## 🔍 VERIFICAÇÃO FINAL

Antes de considerar resolvido, verificar:

- [ ] Middleware protege rotas `/admin/*`
- [ ] Layout admin verifica role
- [ ] Cada página admin tem verificação
- [ ] API routes admin têm proteção
- [ ] RLS policies implementadas
- [ ] Hook useAdmin funciona corretamente
- [ ] Testes de segurança passam 100%
- [ ] Logs de acesso não autorizado funcionam
- [ ] Documentação de segurança atualizada
- [ ] Botão de refresh removido (problema #2)

---

## 📞 PRÓXIMOS PASSOS

1. **IMEDIATO:** Implementar proteção de rotas admin (Problema #1)
2. **CURTO PRAZO:** Remover botão de refresh (Problema #2)
3. **MÉDIO PRAZO:** Auditoria de segurança completa
4. **LONGO PRAZO:** Implementar 2FA para admins

---

**ATENÇÃO:** Este documento contém informações sensíveis sobre vulnerabilidades de segurança. Não compartilhar publicamente até correções serem implementadas.

**Data de criação:** 05/01/2026
**Prioridade:** P0 - MÁXIMA URGÊNCIA
**Status:** ⚠️ VULNERABILIDADE ATIVA - CORRIGIR IMEDIATAMENTE

---

**Responsável:** Equipe de Desenvolvimento CODE 6MM
**Revisor de Segurança:** Necessário após implementação
