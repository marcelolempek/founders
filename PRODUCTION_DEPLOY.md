# Instruções para Deploy em Produção

## Problema: Comments Count não aparece em produção

### Causa Provável:
- Cache do Next.js em produção (Vercel)
- Build antigo sendo servido

### Solução:

#### 1. Aplicar Migration no Supabase de Produção
```bash
# Conectar ao Supabase de produção e rodar a migration 066
```

#### 2. Limpar Cache do Vercel
No painel do Vercel:
1. Ir em **Settings** → **General**
2. Clicar em **Clear Cache**
3. Fazer um novo deploy

#### 3. Forçar Rebuild
```bash
# Fazer um commit vazio para forçar rebuild
git commit --allow-empty -m "chore: force rebuild to clear cache"
git push origin main
```

#### 4. Verificar Variáveis de Ambiente
Garantir que no Vercel as seguintes variáveis estão corretas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_R2_PUBLIC_URL`

#### 5. Revalidar Rotas
Adicionar revalidação nas páginas:
- Feed: `revalidate = 0` (sempre buscar dados frescos)
- Post Detail: `revalidate = 60` (revalidar a cada 1 minuto)

### Debug:
Se o problema persistir, verificar no console do navegador:
1. Network tab → ver a resposta da API `get_feed_posts`
2. Verificar se `comments_count` está vindo na resposta
3. Se não estiver, o problema é no Supabase
4. Se estiver, o problema é no componente React
