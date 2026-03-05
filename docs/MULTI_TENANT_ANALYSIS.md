# Análise Técnica: Implementação de Multi-Tenancy (Grupos/Tenants)

Esta análise detalha as mudanças necessárias para transformar a rede social em um sistema multi-tenant, onde cada "Grupo" (Igreja, Condomínio, etc.) opere de forma isolada, com feeds, usuários e interações totalmente separados.

## 1. A Arquitetura Simplificada (Isolamento via RLS)

Em vez de refatorar todos os hooks do frontend, usaremos o **Row Level Security (RLS)** do Supabase para filtrar os dados automaticamente com base na sessão do usuário.

1.  **Metadados do Usuário**: O `active_tenant_id` é armazenado no `user_metadata`.
2.  **JWT Dinâmico**: O token de sessão contém o ID do grupo ativo.
3.  **RLS Automático**: O banco de dados só retorna registros onde `tenant_id` coincide com o ID no JWT.

---

## 2. Regras de Negócio e Segurança

1.  **Criação de Tenants**: Restrita a usuários com o `role` de `admin`.
2.  **Proteção de Grupos**: Tenants podem ser "Abertos" (entrada livre) ou "Privados" (exigem senha).
    - Tabela `tenants` terá campos `is_private` (boolean) e `password_hash` (text).
3.  **Múltiplos Vínculos**: O usuário pode pertencer a N tenants simultaneamente. O `active_tenant_id` no JWT define o contexto atual.
4.  **Gestão de Participação**: O usuário terá uma tela de "Meus Grupos" para gerenciar suas entradas e saídas (sair de um grupo).
5.  **Descoberta (Marketplace)**: Uma aba de "Explorar Universos" para pesquisar tenants públicos e encontrar novas comunidades.

---

## 3. Onboarding de Impacto (Primeiro Acesso)

Para o primeiro acesso de um novo usuário, criaremos uma experiência imersiva:

### O "Portal de Boas-Vindas"
1.  **Imersão Visual**: Uma transição de "Constelação" (tema Founders) que abre o dashboard.
2.  **Seleção de Partida**: O usuário é apresentado a uma grade moderna e animada de grupos populares ou sugeridos.
3.  **Efeito de Entrada**: Ao escolher o primeiro grupo (ou inserir a senha), um efeito visual de "Dobra Espacial" (Framer Motion) o transporta para o feed, com uma mensagem de boas-vindas do sistema.
4.  **Guia Estelar**: Um tour minimalista explicando que o Header é o "leme" para trocar de "Universo" (Tenant).

---

## 4. UX/UI da Troca de Contexto

### Seletor de Tenant (Header)
*   **Dropdown Inteligente**: Exibe o grupo atual com sua "logo/mini-banner".
*   **Ação de Troca**: Ao mudar, um overlay sutil de "Transição de Contexto" aparece enquanto o token é renovado e o feed atualizado.
*   **Botão de Descoberta**: No próprio dropdown, um botão "(+) Explorar Novos Grupos".

---

---

## 5. Planejamento Técnico e Stack

Para implementar essa transição sem afetar as funcionalidades atuais:

### Stack de Interface
*   **Framer Motion**: Essencial para o Onboarding imersivo (efeitos de escala, opacidade e "dobra espacial").
*   **Lucide React**: Para ícones modernos no seletor de grupos e marketplace.
*   **Radix UI (ou similar)**: Para o dropdown do Header, garantindo acessibilidade e performance.

### Segurança e Retrocompatibilidade
*   **Fallback Seguro**: Se o `.env` não estiver configurado, o sistema assume "Founders" como padrão (UI).
*   **Migração Transparente**: No banco de dados, o `tenant_id` será adicionado como opcional inicialmente em tabelas existentes para evitar quebras em inserções legadas.
*   **Preservação de Hooks**: Como o isolamento é no RLS, os hooks atuais de dados continuarão funcionando perfeitamente, mas "enxergarão" apenas o contexto ativo.

---

## 6. Fluxo de Navegação (UX)

1.  **Login**: Usuário entra na plataforma.
2.  **Verificação**: O sistema checa o último tenant ativo.
    - **Caso A (Já tem grupo)**: Vai direto para o Feed do grupo.
    - **Caso B (Novo/Sem grupo)**: Portal de Onboarding com animações de boas-vindas.
3.  **Transição**: O Header permite trocar de "Founders" (Tenant) a qualquer momento.

---

## 7. Próximos Passos Sugeridos

1.  **Migração v2**: Criar `tenants` (com `password_hash`), `tenant_memberships` e colunas `tenant_id` em cascata.
2.  **Lógica de Senha**: Implementar a verificação de senha no backend (RPC).
3.  **TenantContext**: Criar o provedor para gerenciar a lista de grupos e a função `switch`.
4.  **UI de Onboarding**: Desenvolver as animações e a tela de "Explorar".
