# 🚀 Checklist para Lançamento - Code6mm MVP1

**Data**: 2026-01-01  
**Status**: Em Preparação

---

## 🔴 CRÍTICO - Bloqueia Lançamento

### Segurança e Dados Pessoais
- [x] ~~Proteger número de WhatsApp (exigir login)~~ ✅ **RESOLVIDO**
- [ ] **Aplicar migrations de segurança no Supabase**
  - [ ] Executar `030_contact_views.sql`
  - [ ] Executar `031_get_post_contact_rpc.sql`
  - [ ] Atualizar `026_optimize_feed_performance.sql` (remover author_phone)
  - [ ] Testar endpoint `/api/posts/[id]/contact`
- [ ] **Corrigir erro de duplicação em Rules.tsx**
  - Função exportada duplicada
  - Remover código antigo que ficou no arquivo

### Funcionalidades Essenciais
- [x] ~~Logout do usuário~~ ✅ **RESOLVIDO**
- [x] ~~Edição de posts~~ ✅ **RESOLVIDO**
- [ ] **Testar edição de posts end-to-end**
  - [ ] Editar título
  - [ ] Editar descrição
  - [ ] Editar preço
  - [ ] Verificar salvamento no banco
- [ ] **Testar fluxo de criação de posts**
  - [ ] Criar post de venda
  - [ ] Criar post de texto
  - [ ] Upload de imagens
  - [ ] Validações de campos

---

## 🟠 ALTA - Importante para UX

### Navegação e UX
- [x] ~~Adicionar menu em telas sem navegação~~ ✅ **RESOLVIDO**
- [ ] **Testar navegação em todas as telas**
  - [ ] Followers
  - [ ] Following
  - [ ] MyTickets
  - [ ] Rules
  - [ ] Saved Posts
  - [ ] Notifications
- [ ] **Verificar botões sem login**
  - [ ] Like em posts
  - [ ] Salvar post
  - [ ] Comentar
  - [ ] Ver WhatsApp
  - [ ] Follow/Unfollow
  - [ ] Criar post

### Performance
- [x] ~~Scroll infinito no Explorar~~ ✅ **RESOLVIDO**
- [ ] **Testar scroll infinito**
  - [ ] Feed principal
  - [ ] Explorar/Search
  - [ ] Verificar loading states
  - [ ] Verificar "fim dos resultados"

---

## 🟡 MÉDIA - Melhorias Importantes

### Validações e Feedback
- [ ] **Mensagens de erro amigáveis**
  - [ ] Erro de login
  - [ ] Erro de criação de post
  - [ ] Erro de upload de imagem
  - [ ] Erro de rede
- [ ] **Loading states consistentes**
  - [ ] Botões com loading
  - [ ] Páginas com skeleton
  - [ ] Transições suaves
- [ ] **Confirmações de ações**
  - [ ] Deletar post
  - [ ] Unfollow
  - [ ] Logout

### Conteúdo e Textos
- [ ] **Revisar todos os textos**
  - [ ] Português correto
  - [ ] Mensagens de erro
  - [ ] Placeholders
  - [ ] Tooltips
- [ ] **Imagens placeholder**
  - [ ] Substituir `via.placeholder.com` por assets locais
  - [ ] Avatar padrão
  - [ ] Imagem de post padrão

---

## 🟢 BAIXA - Pode Esperar Pós-Launch

### Otimizações Adicionais
- [ ] **Implementar tracking de WhatsApp**
  - [ ] Tabela `contact_views`
  - [ ] Logs de visualização
  - [ ] Analytics básico
- [ ] **Rate limiting avançado**
  - [ ] CAPTCHA após X tentativas
  - [ ] Bloqueio de IPs suspeitos
  - [ ] Honeypot fields

### Features Futuras
- [ ] **Sistema de drafts real**
  - [ ] Tabela de rascunhos
  - [ ] Auto-save
  - [ ] Listagem de drafts
- [ ] **Algoritmo de feed inteligente**
  - [ ] Priorizar posts locais
  - [ ] Considerar engajamento
  - [ ] Machine learning

---

## 📋 Testes Essenciais

### Testes Funcionais
- [ ] **Autenticação**
  - [ ] Login com email/senha
  - [ ] Registro de novo usuário
  - [ ] Logout
  - [ ] Sessão persistente
- [ ] **Posts**
  - [ ] Criar post de venda
  - [ ] Criar post de texto
  - [ ] Editar post
  - [ ] Deletar post
  - [ ] Marcar como vendido
  - [ ] Visualizar detalhes
- [ ] **Interações**
  - [ ] Like/Unlike
  - [ ] Salvar/Remover dos salvos
  - [ ] Comentar
  - [ ] Follow/Unfollow
  - [ ] Ver WhatsApp (com login)
- [ ] **Busca e Filtros**
  - [ ] Busca por texto
  - [ ] Filtro por categoria
  - [ ] Filtro por preço
  - [ ] Filtro por condição
  - [ ] Filtro por estado

### Testes de Performance
- [ ] **Verificar requests**
  - [ ] Feed: ~18 requests
  - [ ] Explorar: ~12 requests
  - [ ] Auth: 2 requests
  - [ ] Sem vazamento de dados
- [ ] **Tempo de carregamento**
  - [ ] Feed: < 1s
  - [ ] Explorar: < 1s
  - [ ] Post Detail: < 800ms

### Testes de Responsividade
- [ ] **Mobile (375px)**
  - [ ] Feed
  - [ ] Explorar
  - [ ] Post Detail
  - [ ] Criar Post
  - [ ] Perfil
- [ ] **Tablet (768px)**
  - [ ] Todas as telas principais
- [ ] **Desktop (1920px)**
  - [ ] Todas as telas principais

---

## 🔧 Configurações e Deploy

### Supabase
- [ ] **Aplicar migrations**
  - [ ] Verificar ordem de execução
  - [ ] Backup do banco antes
  - [ ] Testar em staging primeiro
- [ ] **RLS (Row Level Security)**
  - [ ] Verificar políticas de posts
  - [ ] Verificar políticas de profiles
  - [ ] Verificar políticas de saved_posts
  - [ ] Verificar políticas de contact_views
- [ ] **Índices de performance**
  - [ ] posts (status, created_at, is_bumped)
  - [ ] saved_posts (user_id, post_id)
  - [ ] contact_views (user_id, post_id, viewed_at)

### Variáveis de Ambiente
- [ ] **Verificar .env**
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] Outras keys necessárias
- [ ] **Configurar .env.production**
  - [ ] URLs de produção
  - [ ] Keys de produção

### Build e Deploy
- [ ] **Build de produção**
  - [ ] `npm run build` sem erros
  - [ ] Verificar warnings
  - [ ] Otimizar bundle size
- [ ] **Deploy**
  - [ ] Vercel/Netlify configurado
  - [ ] Domínio configurado
  - [ ] SSL ativo
  - [ ] Redirects configurados

---

## 📱 Testes de Usuário

### Fluxo Completo de Usuário Novo
- [ ] **Onboarding**
  - [ ] Acessar site sem login
  - [ ] Navegar pelo feed
  - [ ] Tentar curtir → redireciona para login
  - [ ] Criar conta
  - [ ] Completar perfil
  - [ ] Criar primeiro post
  - [ ] Interagir com outros posts

### Fluxo de Compra
- [ ] **Comprador**
  - [ ] Buscar produto
  - [ ] Filtrar por categoria/preço
  - [ ] Ver detalhes do post
  - [ ] Salvar post
  - [ ] Ver WhatsApp do vendedor
  - [ ] Contatar vendedor

### Fluxo de Venda
- [ ] **Vendedor**
  - [ ] Criar anúncio
  - [ ] Upload de fotos
  - [ ] Definir preço e categoria
  - [ ] Receber contatos
  - [ ] Marcar como vendido
  - [ ] Editar anúncio

---

## 🐛 Bugs Conhecidos

### Críticos
- [ ] **Rules.tsx - Função duplicada**
  - Erro de TypeScript
  - Bloqueia build de produção
  
### Médios
- [ ] **Hydration mismatch em layout.tsx**
  - Warning no console
  - Não afeta funcionalidade
  - Investigar causa

### Baixos
- [ ] **Placeholder image 404**
  - `via.placeholder.com` às vezes falha
  - Substituir por asset local

---

## 📊 Métricas de Sucesso

### Performance
- ✅ Feed: 62 → 18 requests (71% redução)
- ✅ Explorar: 62 → 12 requests (81% redução)
- ✅ Auth: 29 → 2 requests (93% redução)
- ✅ Load time: 2-3s → 500-800ms (5x mais rápido)

### Funcionalidades
- ✅ Logout implementado
- ✅ Edição de posts implementada
- ✅ Scroll infinito implementado
- ✅ Navegação completa em todas as telas
- ✅ Proteção de WhatsApp implementada

---

## 🎯 Próximos Passos Imediatos

### Hoje (Crítico)
1. [ ] Corrigir erro de duplicação em Rules.tsx
2. [ ] Aplicar migrations no Supabase
3. [ ] Testar endpoint de WhatsApp protegido
4. [ ] Testar edição de posts

### Amanhã (Alta Prioridade)
1. [ ] Testes end-to-end de todos os fluxos
2. [ ] Verificar botões sem login
3. [ ] Revisar mensagens de erro
4. [ ] Build de produção

### Esta Semana (Preparação)
1. [ ] Testes de responsividade
2. [ ] Testes de performance
3. [ ] Configurar deploy
4. [ ] Testes com usuários beta

---

## ✅ Critérios de Lançamento

### Mínimo Viável
- [ ] Todas as tarefas **CRÍTICAS** concluídas
- [ ] 80% das tarefas **ALTA** concluídas
- [ ] Build de produção sem erros
- [ ] Testes funcionais passando
- [ ] Performance dentro das métricas

### Recomendado
- [ ] 100% das tarefas **CRÍTICAS** concluídas
- [ ] 100% das tarefas **ALTA** concluídas
- [ ] 80% das tarefas **MÉDIA** concluídas
- [ ] Testes de usuário realizados
- [ ] Documentação básica criada

---

**Última atualização**: 2026-01-01 15:27
