# Checklist - Deploy para Produção

## Supabase

- [ ] 1. Criar conta nova no Supabase com o email `code6mm2026@gmail.com`
- [ ] 2. Adicionar nova conta Supabase na organização onde está o banco hoje (email: `henriquewidmar2@gmail.com`)
- [ ] 3. Transferir banco para nova organização no `code6mm2026@gmail.com`

## Banco de Dados

- [ ] 4. Instalar pgAdmin na máquina local e conectar com o banco de dados
- [ ] 5. Criar novo projeto no Supabase para PRD e fazer backup via pgAdmin para criar o novo projeto Supabase PRD

## GitHub

- [ ] 6. Criar conta no GitHub onde:
  - [ ] Branch `main` será PRD (produção)
  - [ ] Branch `dev` será DEV (desenvolvimento)
- [ ] 7. Subir versão do localhost para branch `dev`
- [ ] 8. Subir versão para branch `main`

## Vercel

- [ ] 9. Criar conta na Vercel
- [ ] 10. Criar dois projetos:
  - [ ] Projeto DEV (conectado à branch `dev`)
  - [ ] Projeto PRD/Main (conectado à branch `main`)
- [ ] 11. Conectar projetos com o GitHub

## Domínio e DNS

- [ ] 12. Comprar domínio `www.code6mm.com` na Hostinger
- [ ] 13. Adicionar domínio e configurar DNS no Cloudflare
- [ ] 14. Adicionar CNAME de `.dev` para ambiente de dev usar o mesmo domínio: `www.dev.code6mm.com`
- [ ] 15. Configurar domínios no Vercel:
  - [ ] `code6mm.com` → Projeto PRD
  - [ ] `dev.code6mm.com` → Projeto DEV

## Autenticação

- [ ] 16. Implementar login do Google com Supabase
- [ ] 17. Implementar frontend de login

## Configurações Finais

- [ ] 18. Configurar novas chaves secrets no Supabase para Edge Functions:
  - [ ] R2 Cloudflare
  - [ ] Outras chaves necessárias
- [ ] 19. ...

---

> **Nota:** Marque cada item conforme for concluindo as tarefas.
