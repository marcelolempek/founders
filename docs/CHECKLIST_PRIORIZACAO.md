# CHECKLIST DE CORREÇÕES E AJUSTES - CODE 6MM AIRSOFT FEED

**Data de Análise:** 05/01/2026
**Total de Itens:** 21
**Status:** Aguardando Implementação

---

## LEGENDA DE PRIORIDADES

- **P0 - CRÍTICO/BLOQUEANTE**: Problemas que impedem funcionalidades principais, questões legais ou bloqueiam usuários
- **P1 - ALTA**: Bugs importantes que afetam experiência do usuário ou funcionalidades faltantes
- **P2 - MÉDIA**: Melhorias de UX, inconsistências e ajustes importantes
- **P3 - BAIXA**: Refinamentos menores e ajustes de UI

---

## 🔴 PRIORIDADE P0 - CRÍTICO/BLOQUEANTE (4 itens)

### #7 - Rate Limit Muito Restritivo (BLOQUEANTE)
**Status:** ❌ Bloqueando criação de conteúdo
**Prioridade:** P0 - CRÍTICO

**PROBLEMA:**
- Usuários só conseguem criar 5 posts e ficam bloqueados
- Impede uso normal da plataforma

**LOCALIZAÇÃO:**
- `src/app/api/posts/` - API de criação de posts
- `supabase/migrations/` - Policies de RLS no banco
- Possível rate limiting no Supabase ou Edge Functions

**O QUE AJUSTAR:**
1. Verificar policies RLS na tabela `post`
2. Revisar configurações de rate limit no Supabase
3. Ajustar limite para valor razoável (ex: 50 posts/dia ou remover limite temporariamente)
4. Adicionar mensagem clara quando atingir limite

**COMPLEXIDADE:** Média
**IMPACTO:** Alto - Bloqueia uso da plataforma

---

### #16 - Falta Aceite de Termos no Cadastro (COMPLIANCE)
**Status:** ❌ Problema legal
**Prioridade:** P0 - CRÍTICO

**PROBLEMA:**
- Usuários podem se cadastrar sem aceitar termos de uso e política de privacidade
- Problema de compliance legal (LGPD/GDPR)

**LOCALIZAÇÃO:**
- `src/app/auth/signup/page.tsx` - Página de cadastro
- Banco de dados - Precisa adicionar campo `terms_accepted_at` na tabela `profile`

**O QUE AJUSTAR:**
1. Adicionar checkbox obrigatório de aceite de termos na tela de signup
2. Adicionar checkbox de política de privacidade
3. Criar migração para adicionar campos:
   - `terms_accepted_at: timestamp`
   - `privacy_accepted_at: timestamp`
4. Validar no backend que termos foram aceitos
5. Bloquear criação de conta se não aceitar

**COMPLEXIDADE:** Média
**IMPACTO:** Alto - Requisito legal

---

### #17 - Remover Menções a Pagamento nos Termos (COMPLIANCE)
**Status:** ❌ Informação incorreta
**Prioridade:** P0 - CRÍTICO

**PROBLEMA:**
- Termos, política de privacidade e "Como Funciona" mencionam pagamentos
- Plataforma ainda não está cobrando nada
- Pode gerar confusão legal e com usuários

**LOCALIZAÇÃO:**
- Arquivos de termos e políticas (provavelmente em `public/` ou `src/app/`)
- Páginas de suporte/ajuda
- Textos sobre pagamento no código

**O QUE AJUSTAR:**
1. Localizar todos os documentos legais
2. Remover/comentar seções sobre:
   - Cobranças e taxas
   - Métodos de pagamento
   - Política de reembolso
   - Responsabilidades financeiras
3. Adicionar nota: "Plataforma gratuita - sem cobranças no momento"
4. Manter estrutura para futuro quando implementar pagamentos

**COMPLEXIDADE:** Baixa
**IMPACTO:** Alto - Evita problemas legais e confusão

---

### #21 - Endpoint de Contato (WhatsApp) Retorna "Not Found"
**Status:** ❌ BLOQUEANTE - API quebrada
**Prioridade:** P0 - CRÍTICO

**PROBLEMA:**
- Endpoint `/api/posts/[id]/contact` retorna erro 404 `{"error":"Not found"}`
- Usuários não conseguem obter o WhatsApp do vendedor
- Funcionalidade CRÍTICA do marketplace está quebrada
- Impede contato entre comprador e vendedor

**ERRO ATUAL:**
```bash
POST /api/posts/cbdeb66c-83e7-4f5f-a811-add8b63a8b53/contact
Response: {"error":"Not found"}
```

**LOCALIZAÇÃO:**
- `src/app/api/posts/[id]/contact/route.ts` - Endpoint de API (verificar se existe)
- Componente que chama este endpoint (botão "Entrar em Contato" ou similar)
- Lógica de exibição de WhatsApp nos posts

**O QUE AJUSTAR:**

1. **Verificar se endpoint existe:**
   - Caminho esperado: `src/app/api/posts/[id]/contact/route.ts`
   - Se não existir, criar o arquivo

2. **Implementar endpoint corretamente:**
   ```typescript
   // src/app/api/posts/[id]/contact/route.ts
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
   import { cookies } from 'next/headers'
   import { NextResponse } from 'next/server'

   export async function POST(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     try {
       const supabase = createRouteHandlerClient({ cookies })

       // Verificar autenticação
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }

       // Buscar post e dados do vendedor
       const { data: post, error } = await supabase
         .from('post')
         .select('user_id, profile:user_id(phone, whatsapp_verified)')
         .eq('id', params.id)
         .single()

       if (error || !post) {
         return NextResponse.json({ error: 'Post not found' }, { status: 404 })
       }

       // Verificar se vendedor tem WhatsApp
       if (!post.profile?.phone) {
         return NextResponse.json({
           error: 'Seller has no contact information'
         }, { status: 404 })
       }

       // Registrar visualização de contato (analytics)
       await supabase.from('contact_views').insert({
         post_id: params.id,
         viewer_id: user.id,
         contact_type: 'whatsapp'
       })

       return NextResponse.json({
         phone: post.profile.phone,
         whatsapp_verified: post.profile.whatsapp_verified
       })

     } catch (error) {
       console.error('Contact endpoint error:', error)
       return NextResponse.json({
         error: 'Internal server error'
       }, { status: 500 })
     }
   }
   ```

3. **Validações necessárias:**
   - ✅ Verificar se usuário está autenticado
   - ✅ Verificar se post existe
   - ✅ Verificar se vendedor tem telefone cadastrado
   - ✅ Não permitir que vendedor veja próprio contato
   - ✅ Registrar analytics de visualização

4. **RLS (Row Level Security):**
   - Verificar policies na tabela `profile` para permitir leitura de `phone`
   - Apenas usuários autenticados podem ver telefone
   - Criar tabela `contact_views` para analytics se não existir

5. **Testar:**
   - Usuário autenticado clica em "Entrar em Contato"
   - Endpoint retorna WhatsApp do vendedor
   - Redireciona para WhatsApp Web/App
   - Verificar que funciona em mobile e desktop

**COMPLEXIDADE:** Média
**IMPACTO:** CRÍTICO - Sem isso a plataforma não funciona como marketplace

---

## 🟠 PRIORIDADE P1 - ALTA (9 itens)

### #2 - Imagem Não Aparece em Posts Text com Imagem Anexada
**Status:** ❌ Bug funcional
**Prioridade:** P1

**PROBLEMA:**
- Em `/post/saved-posts` quando há post tipo `text` com imagem, a imagem não é renderizada
- Só posts tipo `sale` mostram imagens

**LOCALIZAÇÃO:**
- `src/components/shared/PostCard.tsx` ou `src/components/shared/FeedPostCard.tsx`
- Lógica de renderização condicional baseada em `type`

**O QUE AJUSTAR:**
1. Verificar condição que renderiza imagens: `{post.type === 'sale' && ...}`
2. Mudar para: `{post.images && post.images.length > 0 && ...}`
3. Garantir que posts text também podem ter imagens
4. Testar em saved posts e feed principal

**COMPLEXIDADE:** Baixa
**IMPACTO:** Médio - Afeta UX de posts salvos

---

### #5 - Impossível Desbloquear Usuários Bloqueados
**Status:** ❌ Funcionalidade faltante
**Prioridade:** P1

**PROBLEMA:**
- Não existe tela para visualizar usuários bloqueados
- Impossível desbloquear alguém depois de bloquear

**LOCALIZAÇÃO:**
- Precisa criar: `src/app/profile/blocked-users/page.tsx`
- Ou adicionar em: `src/app/profile/[username]/page.tsx` (aba nova)
- Banco: tabela `block` ou similar (verificar se existe)

**O QUE AJUSTAR:**
1. Verificar se existe tabela de bloqueios no banco
2. Criar página/modal de usuários bloqueados
3. Listar usuários bloqueados
4. Adicionar botão "Desbloquear" em cada item
5. Adicionar link no menu de configurações do perfil

**COMPLEXIDADE:** Média
**IMPACTO:** Alto - Funcionalidade essencial

---

### #8 - Modal de Report em Inglês e com Erro de Banco
**Status:** ❌ Bug + i18n
**Prioridade:** P1

**PROBLEMA:**
- Modal de denúncia está todo em inglês
- Ao enviar, ocorre erro de banco de dados
- Funcionalidade crítica não funciona

**LOCALIZAÇÃO:**
- `src/components/ui/ReportModal.tsx`
- `src/app/api/reports/` - API de criação de reports
- Tabela `report` no Supabase

**O QUE AJUSTAR:**
1. **Tradução:**
   - Traduzir todos os textos do modal para português
   - Traduzir opções de motivos de denúncia
2. **Erro de Banco:**
   - Verificar logs do erro no console
   - Revisar schema da tabela `report`
   - Corrigir mapeamento de campos
   - Validar policies RLS
3. Testar fluxo completo de denúncia

**COMPLEXIDADE:** Média
**IMPACTO:** Alto - Funcionalidade de moderação quebrada

---

### #11 - Falta Campo "Condição" ao Criar Post
**Status:** ❌ Inconsistência
**Prioridade:** P1

**PROBLEMA:**
- Filtros permitem filtrar por "condição" do produto
- Ao criar post, não há opção para definir condição
- Enum existe no banco: `new, like-new, good, fair, poor`

**LOCALIZAÇÃO:**
- `src/components/shared/CreatePostModal.tsx`
- Campo `condition` na tabela `post`

**O QUE AJUSTAR:**
1. Adicionar select de condição no modal de criar post
2. Opções:
   - "Novo" (new)
   - "Seminovo - Como Novo" (like-new)
   - "Seminovo - Bom Estado" (good)
   - "Usado - Estado Regular" (fair)
   - "Usado - Precisa Reparos" (poor)
3. Tornar campo obrigatório para posts tipo `sale`
4. Salvar no banco ao criar post

**COMPLEXIDADE:** Baixa
**IMPACTO:** Médio - Melhora qualidade dos anúncios

---

### #12 - Post Não Exibe Condição do Produto
**Status:** ❌ Informação faltante
**Prioridade:** P1

**PROBLEMA:**
- Campo condição existe no banco mas não é exibido no post
- Usuários não veem estado do produto anunciado

**LOCALIZAÇÃO:**
- `src/components/shared/PostCard.tsx`
- `src/components/shared/FeedPostCard.tsx`
- `src/app/post/post-detail/page.tsx` (detalhe do post)

**O QUE AJUSTAR:**
1. Adicionar badge/tag de condição nos cards de post
2. Posicionar próximo ao preço ou título
3. Usar cores/ícones para diferenciar:
   - Novo: Verde / tag "NOVO"
   - Seminovo: Azul / tag "SEMINOVO"
   - Usado: Amarelo / tag "USADO"
4. Exibir texto completo no detalhe do post

**COMPLEXIDADE:** Baixa
**IMPACTO:** Médio - Informação importante para compradores

---

### #13 - Impossível Excluir Posts (Item e Text)
**Status:** ❌ Funcionalidade crítica faltante
**Prioridade:** P1

**PROBLEMA:**
- Não existe opção para usuário excluir seus próprios posts
- Posts ficam eternamente na plataforma
- Contraria boas práticas de UX

**LOCALIZAÇÃO:**
- `src/components/shared/PostCard.tsx` - Menu de opções do post
- `src/app/api/posts/[id]/delete` - Criar endpoint de delete
- Tabela `post` - Soft delete recomendado

**O QUE AJUSTAR:**
1. Adicionar botão "Excluir" no menu do post (três pontinhos)
2. Mostrar apenas para posts do próprio usuário
3. Adicionar modal de confirmação: "Tem certeza que deseja excluir?"
4. Criar endpoint DELETE `/api/posts/[id]`
5. Implementar soft delete (mudar status para 'deleted' ao invés de remover)
6. Remover post da UI após exclusão
7. Adicionar toast de sucesso

**COMPLEXIDADE:** Média
**IMPACIDADE:** Alto - Funcionalidade essencial

---

### #4 - Validar se Sistema de Avaliação Funciona Corretamente
**Status:** ⚠️ Precisa validação
**Prioridade:** P1

**PROBLEMA:**
- Incerteza se avaliações estão funcionando corretamente
- Pode ter bugs não descobertos

**LOCALIZAÇÃO:**
- Sistema de reviews (verificar se existe tabela `review` ou `rating`)
- Componente de avaliação no perfil
- `src/app/profile/[username]/` - Aba de avaliações

**O QUE AJUSTAR:**
1. Testar fluxo completo:
   - Deixar avaliação em perfil de outro usuário
   - Verificar se salva no banco
   - Verificar se aparece no perfil avaliado
   - Verificar cálculo de média (reputation_score)
2. Testar edge cases:
   - Avaliar mesmo usuário 2x
   - Editar avaliação
   - Remover avaliação
3. Validar policies RLS
4. Documentar fluxo correto

**COMPLEXIDADE:** Baixa (testes)
**IMPACTO:** Médio - Funcionalidade importante

---

### #19 - Falta Botão de Seguir no Topo do Post
**Status:** ❌ Funcionalidade faltante
**Prioridade:** P1

**PROBLEMA:**
- Não existe botão "Seguir" no topo do post ao lado dos 3 pontinhos
- No Instagram, ao visualizar post de alguém que não segue, aparece botão de seguir no header
- Dificulta seguir criador do conteúdo rapidamente

**LOCALIZAÇÃO:**
- `src/components/shared/PostCard.tsx` - Card de post no feed
- `src/components/shared/PostDetailModal.tsx` - Modal de detalhe do post
- `src/app/post/post-detail/page.tsx` - Página de detalhe
- Header/cabeçalho do post onde fica o avatar e nome do usuário

**O QUE AJUSTAR:**
1. **No header do post, ao lado do menu (3 pontinhos):**
   - Adicionar botão "Seguir" se o usuário logado NÃO segue o autor do post
   - Adicionar botão "Seguindo" se já segue (com opção de deixar de seguir)

2. **Comportamento:**
   ```tsx
   // Exemplo de layout
   [Avatar] [Nome do Usuário] .............. [Seguir] [⋮]
   ```

3. **Condições:**
   - NÃO mostrar se for o próprio post do usuário logado
   - Mostrar "Seguir" (verde) se não segue
   - Mostrar "Seguindo" (cinza/outline) se já segue
   - Ao clicar em "Seguindo", mostrar opção de deixar de seguir

4. **Estilo (seguir padrão Instagram):**
   - Botão pequeno, discreto
   - Cor verde (#13e761) quando é "Seguir"
   - Outline quando é "Seguindo"
   - Adicionar ao lado do menu de 3 pontinhos

5. **Implementar em:**
   - Cards do feed (FeedPostCard)
   - Modal de detalhe (PostDetailModal)
   - Página de detalhe (post-detail)

**COMPLEXIDADE:** Média
**IMPACTO:** Alto - Melhora engajamento e facilita crescimento de usuários

---

### #20 - Posts Text Aparecem na Página Explorar
**Status:** ❌ Bug de regra de negócio
**Prioridade:** P1

**PROBLEMA:**
- Página `/explore` está listando posts do tipo "text" (posts sem preço)
- Explorar deveria mostrar apenas posts do tipo "sale" (itens à venda com preço)
- Confunde usuários que esperam ver apenas produtos disponíveis para compra

**LOCALIZAÇÃO:**
- `src/app/explore/page.tsx` - Página de exploração
- Hook de fetch de posts (provavelmente `src/lib/hooks/useExplore.ts` ou similar)
- Query/RPC do Supabase que busca posts para a página explorar

**O QUE AJUSTAR:**
1. **Adicionar filtro na query de posts:**
   ```typescript
   // Filtrar apenas posts tipo 'sale'
   .eq('type', 'sale')

   // E garantir que tenha preço
   .not('price', 'is', null)
   ```

2. **Validação adicional:**
   - Posts com `price = null` ou `price = 0` não devem aparecer
   - Posts com `status = 'sold'` podem aparecer (ou filtrar, dependendo da regra)
   - Posts com `status = 'archived'` ou `'banned'` NÃO devem aparecer

3. **Regra de negócio completa para Explorar:**
   ```sql
   WHERE type = 'sale'
     AND price IS NOT NULL
     AND price > 0
     AND status IN ('active', 'sold')  -- definir se mostra vendidos
   ```

4. **Testar:**
   - Criar post tipo "text" e verificar que não aparece em /explore
   - Criar post tipo "sale" com preço e verificar que aparece
   - Verificar que filtros continuam funcionando

**COMPLEXIDADE:** Baixa
**IMPACTO:** Alto - Corrige propósito da página de exploração

---

## 🟡 PRIORIDADE P2 - MÉDIA (6 itens)

### #1 - Trocar Ícone de Like nos Comentários
**Status:** ⚠️ Melhoria de UI
**Prioridade:** P2

**PROBLEMA:**
- Comentários usam ícone de coração ❤️ para like
- Posts usam ícone de positivo (thumbs up) verde
- Inconsistência visual

**LOCALIZAÇÃO:**
- `src/components/ui/Comments.tsx` - Componente de comentários
- Ícone de like (linha ~150-200 aproximadamente)

**O QUE AJUSTAR:**
1. Localizar o ícone atual: provavelmente `favorite` ou `heart`
2. Trocar para: `thumb_up` (Material Symbols)
3. Aplicar cor verde quando ativo: `text-[#13e761]`
4. Manter comportamento de toggle

**COMPLEXIDADE:** Muito Baixa
**IMPACTO:** Baixo - Consistência visual

---

### #3 - Remover Mural do Perfil (Redundante com Avaliações)
**Status:** ⚠️ Limpeza de features
**Prioridade:** P2

**PROBLEMA:**
- Existe "mural" no perfil público
- Também existe sistema de avaliações
- Funcionalidades redundantes

**LOCALIZAÇÃO:**
- `src/app/profile/[username]/page.tsx` - Perfil público
- Componente de mural (verificar qual componente renderiza isso)

**O QUE AJUSTAR:**
1. Avaliar se mural tem algum uso diferente de avaliações
2. Se for redundante: remover aba/seção de mural
3. Manter apenas avaliações
4. Verificar se há dados de mural no banco
5. Se sim, migrar dados importantes ou manter no banco (soft delete)

**COMPLEXIDADE:** Média
**IMPACTO:** Baixo - Simplificação de UI

---

### #6 - Navegação Incorreta ao Voltar de Seguidores (Mobile)
**Status:** ❌ Bug de navegação
**Prioridade:** P2

**PROBLEMA:**
- No mobile, ao abrir lista de seguidores/seguindo do próprio perfil
- Ao clicar em "Voltar", vai para o feed ao invés de voltar para o perfil
- UX ruim

**LOCALIZAÇÃO:**
- `src/context/NavigationContext.tsx` - Contexto de navegação
- `src/components/user/FollowList.tsx` ou similar
- Componente de lista de seguidores

**O QUE AJUSTAR:**
1. Verificar implementação do botão voltar
2. Implementar histórico correto de navegação
3. Opções:
   - Usar `router.back()` ao invés de `router.push('/feed')`
   - Passar origem como parâmetro e voltar para ela
   - Armazenar rota anterior no context
4. Testar navegação:
   - Feed → Perfil → Seguidores → Voltar (deve ir para Perfil)
   - Perfil → Seguidores → Voltar (deve ir para Perfil)

**COMPLEXIDADE:** Média
**IMPACTO:** Médio - UX mobile

---

### #9 - Ocultar Opção de Impulsionar Posts
**Status:** ⚠️ Feature toggle
**Prioridade:** P2

**PROBLEMA:**
- Funcionalidade de boost/impulsionamento ainda não está pronta
- Opção está visível para usuários
- Pode gerar confusão

**LOCALIZAÇÃO:**
- `src/components/shared/PostCard.tsx` - Botão/opção de boost
- Menu de opções do post
- Possivelmente em detalhes do post

**O QUE AJUSTAR:**
1. Localizar onde aparece opção de "Impulsionar" ou "Boost"
2. Adicionar condição para ocultar:
   ```tsx
   {process.env.NEXT_PUBLIC_BOOST_ENABLED === 'true' && (
     <BoostButton />
   )}
   ```
3. Ou simplesmente comentar o componente temporariamente
4. Documentar que será habilitado no futuro

**COMPLEXIDADE:** Muito Baixa
**IMPACTO:** Baixo - Evita confusão

---

### #14 - Definir Quando Notificações Devem Ser Geradas
**Status:** ⚠️ Validação de regras
**Prioridade:** P2

**PROBLEMA:**
- Falta clareza sobre quando notificações são criadas
- Pode estar gerando notificações demais ou de menos
- Precisa documentar e validar

**LOCALIZAÇÃO:**
- Sistema de notificações
- Triggers no banco ou Edge Functions
- `src/app/api/notifications/` ou similar

**O QUE AJUSTAR:**
1. **Documentar gatilhos de notificação esperados:**
   - ✅ Novo seguidor
   - ✅ Like no post
   - ✅ Comentário no post
   - ✅ Resposta ao comentário
   - ✅ Menção (@usuario)
   - ✅ Post vendido
   - ✅ Mensagem de comprador (quando implementar)
   - ❌ NÃO notificar: próprias ações, ações de bloqueados

2. **Validar implementação atual**
3. **Ajustar o que estiver faltando ou sobrando**
4. **Adicionar preferências de notificação no futuro**

**COMPLEXIDADE:** Média
**IMPACTO:** Médio - Engajamento de usuários

---

### #15 - Tag "1 Vendas Verificadas" sem Sistema de Verificação
**Status:** ⚠️ Inconsistência
**Prioridade:** P2

**PROBLEMA:**
- Perfil mostra "1 Vendas Verificadas"
- Não existe forma de verificar uma venda hoje
- Dado não faz sentido

**LOCALIZAÇÃO:**
- Componente de perfil que exibe estatísticas
- `src/app/profile/[username]/` ou componente de stats
- Campo `sales_count` na tabela `profile`

**O QUE AJUSTAR:**
**Opção 1 - Remover (Recomendado):**
- Ocultar tag de "Vendas Verificadas"
- Comentar código para reabilitar no futuro
- Manter campo no banco

**Opção 2 - Implementar:**
- Criar sistema de confirmação de venda
- Comprador confirma recebimento
- Incrementar contador após confirmação
- Mais complexo

**COMPLEXIDADE:** Baixa (opção 1) / Alta (opção 2)
**IMPACTO:** Baixo - Informação secundária

---

## 🟢 PRIORIDADE P3 - BAIXA (2 itens)

### #10 - Redundância em "Plano e Verificação" na Aba Status
**Status:** ⚠️ Limpeza de UI
**Prioridade:** P3

**PROBLEMA:**
- Aba "Status" no perfil tem seção "Plano e Verificação"
- Existe botão que não faz nada
- Redundante com botão "Solicitar Selo"

**LOCALIZAÇÃO:**
- `src/app/profile/profile/page.tsx` (seu próprio perfil)
- Aba de status/configurações
- Componente de plano

**O QUE AJUSTAR:**
1. Identificar o botão que não funciona
2. Remover botão não funcional
3. Deixar apenas "Solicitar Selo"
4. Ou consolidar numa única seção clara

**COMPLEXIDADE:** Muito Baixa
**IMPACTO:** Muito Baixo - Polimento de UI

---

### #18 - Logo Cortado no Header Mobile
**Status:** ❌ Bug visual
**Prioridade:** P3

**PROBLEMA:**
- Logotipo não aparece completo no header em dispositivos móveis
- Logo está cortado ou com tamanho incorreto

**LOCALIZAÇÃO:**
- `src/components/layout/Header.tsx`
- `src/components/shared/Logo.tsx` ou `LogoIcon.tsx`
- CSS do header mobile

**O QUE AJUSTAR:**
1. Inspecionar elemento no mobile (DevTools mobile view)
2. Verificar dimensões do logo e container
3. Ajustar:
   - Tamanho da imagem: `height` e `width`
   - Container do header: remover `overflow: hidden`
   - Padding/margin do logo
   - Media query para mobile
4. Testar em diferentes tamanhos:
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - Android médio (360px)

**COMPLEXIDADE:** Muito Baixa
**IMPACTO:** Baixo - Visual apenas

---

## 📊 RESUMO ESTATÍSTICO

| Prioridade | Quantidade | Percentual |
|------------|-----------|------------|
| P0 - Crítico | 4 | 19.0% |
| P1 - Alta | 9 | 42.9% |
| P2 - Média | 6 | 28.6% |
| P3 - Baixa | 2 | 9.5% |
| **TOTAL** | **21** | **100%** |

### Distribuição por Tipo de Problema

| Tipo | Quantidade |
|------|-----------|
| Bugs Funcionais | 10 |
| Funcionalidades Faltantes | 6 |
| Melhorias de UX/UI | 3 |
| Compliance/Legal | 2 |

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### SPRINT 1 - Críticos e Compliance (Prioridade P0)
**Duração sugerida:** Imediato

1. ✅ **#21** - URGENTE: Corrigir endpoint de contato (WhatsApp) que retorna 404
2. ✅ **#7** - Corrigir rate limit de posts
3. ✅ **#16** - Adicionar aceite de termos no cadastro
4. ✅ **#17** - Limpar menções a pagamento nos documentos legais

**Objetivo:** Resolver problemas legais e desbloqueadores críticos

---

### SPRINT 2 - Funcionalidades Essenciais (Prioridade P1)
**Duração sugerida:** Após Sprint 1

1. ✅ **#20** - Filtrar posts text na página Explorar (mostrar só itens à venda)
2. ✅ **#13** - Implementar exclusão de posts
3. ✅ **#19** - Adicionar botão "Seguir" no topo do post
4. ✅ **#5** - Criar tela de usuários bloqueados
5. ✅ **#8** - Corrigir modal de denúncia (tradução + erro)
6. ✅ **#11** - Adicionar campo condição ao criar post
7. ✅ **#12** - Exibir condição do produto nos posts
8. ✅ **#2** - Corrigir exibição de imagens em posts text
9. ✅ **#4** - Validar sistema de avaliações

**Objetivo:** Completar funcionalidades essenciais para uso completo da plataforma

---

### SPRINT 3 - Melhorias e Refinamentos (Prioridade P2)
**Duração sugerida:** Após Sprint 2

1. ✅ **#6** - Corrigir navegação de seguidores no mobile
2. ✅ **#14** - Definir e validar gatilhos de notificações
3. ✅ **#3** - Avaliar e remover mural redundante
4. ✅ **#15** - Remover tag de vendas verificadas
5. ✅ **#9** - Ocultar opção de impulsionar posts
6. ✅ **#1** - Padronizar ícone de like nos comentários

**Objetivo:** Melhorar experiência do usuário e consistência

---

### SPRINT 4 - Polimentos Finais (Prioridade P3)
**Duração sugerida:** Quando houver tempo

1. ✅ **#10** - Limpar redundância em "Plano e Verificação"
2. ✅ **#18** - Corrigir logo no header mobile

**Objetivo:** Refinamentos visuais e de interface

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Teste após cada correção**: Cada item deve ser testado em ambiente de desenvolvimento antes de ir para produção

2. **Backup antes de mudanças estruturais**: Especialmente para itens que mexem no banco de dados

3. **Priorize P0 absolutamente**: Questões legais (#16, #17) não podem esperar

4. **Documente decisões**: Especialmente para #14 (notificações) e #4 (avaliações)

5. **Considere feature flags**: Para #9 (boost) e #15 (vendas verificadas) - facilita reativar no futuro

6. **Mobile-first**: Muitos problemas (#6, #18) são mobile - sempre testar responsivo

---

## ✅ PRÓXIMOS PASSOS

1. **Revisar e aprovar** este checklist
2. **Começar pelo Sprint 1** (P0 - Críticos)
3. **Criar issues/tasks** para cada item em ferramenta de gestão
4. **Atribuir responsáveis** para cada correção
5. **Estimar tempo** mais precisamente para cada item
6. **Definir data de release** após cada sprint

---

**Documento gerado em:** 05/01/2026
**Versão:** 1.3
**Última atualização:** 05/01/2026
**Responsável pela análise:** Claude Code (AI Assistant)

---

## 📋 CHANGELOG

- **v1.3** - Adicionado #21: Endpoint de contato WhatsApp retornando 404 (P0 - CRÍTICO)
- **v1.2** - Adicionado #20: Posts text aparecem na página Explorar (P1)
- **v1.1** - Adicionado #19: Falta botão de seguir no topo do post (P1)
- **v1.0** - Versão inicial com 18 itens
