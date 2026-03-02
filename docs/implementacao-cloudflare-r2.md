# Implementação Cloudflare R2 + Resize Client-Side - Code6mm

## Status Atual

**Fase:** ✅ Phase 5 - Integration concluída (R2 system ready!)

**Última atualização:** 2026-01-03

**Progresso:**
- ✅ Planejamento
- ⏳ Phase 1: Setup R2 (user configurará .env)
- ✅ Phase 2: Migration
- ✅ Phase 3: Edge Function
- ✅ Phase 4: Image Library
- ✅ Phase 5: Integration (storage, usePosts, PostCard) - ALL DISPLAY COMPONENTS UPDATED VIA toPostCardData
- ⏳ Phase 6: Testing (requires .env setup → bucket → edge function deploy)

---

## Visão Geral

Migrar o sistema de upload de imagens do Supabase Storage para **Cloudflare R2** com **resize no browser** usando a biblioteca `pica`. Upload direto do cliente para R2 via URL assinada.

**Estratégia de Ambientes:**
- **Bucket DEV**: `code6mm-images-dev` (desenvolvimento e testes)
- **Bucket PRD**: `code6mm-images-prd` (produção)
- Mesmo Cloudflare R2 account, credenciais compartilhadas
- Bucket definido por variável de ambiente `R2_BUCKET_NAME`

---

## Arquitetura

### Atual (Supabase Storage)
```
Cliente → Supabase SDK → Storage → URL única
```
- Upload de arquivo original
- Sem otimização
- Uma versão por imagem

### Nova (Cloudflare R2 + Resize Client)
```
Cliente (resize com pica) → 3 blobs WebP → Edge Function (URL assinada) → R2
```
- Resize no browser ANTES do upload
- 3 tamanhos fixos por imagem
- WebP otimizado
- Zero processamento no backend

---

## Tamanhos de Imagem (FIXOS - Nunca mudar)

| Variant | Dimensão | Modo | Uso |
|---------|----------|------|-----|
| `thumb` | 300×300 | **cover/crop central** | Grid do Explore, miniaturas |
| `feed` | 900×auto | contain (aspect ratio) | Feed principal |
| `detail` | 1400×auto | contain (aspect ratio) | Tela de detalhe do post |

**Importante:** O `thumb` deve usar crop central para garantir que a imagem preencha o quadrado sem distorção.

---

## Estrutura no R2

```
/posts/{post_id}/
  ├─ thumb/{image_id}.webp
  ├─ feed/{image_id}.webp
  └─ detail/{image_id}.webp
```

**Convenções:**
- `post_id` = UUID do post
- `image_id` = UUID gerado no frontend para cada imagem
- Sempre `.webp`
- Sem "original" (economia de storage)

---

## Modelo de Dados

### Tabela `post_images` (já existe)

```sql
-- ATUAL
CREATE TABLE public.post_images (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id),
    url TEXT NOT NULL,           -- URL completa do Supabase
    is_cover BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ
);
```

### Opção A: Adicionar coluna `image_id` (RECOMENDADO)

```sql
-- Migration: adicionar coluna separada
ALTER TABLE public.post_images
ADD COLUMN image_id UUID;

-- Novos registros usam image_id, url fica NULL
-- Registros antigos mantêm url, image_id fica NULL
```

**Vantagens:**
- Semântica correta (UUID vs URL)
- Sem ambiguidade de tipos
- Mais fácil de manter

### Opção B: Reutilizar coluna `url` (compatibilidade máxima)

```sql
-- Sem mudança no schema
-- url armazena image_id (UUID como string) para novos registros
-- Detecção automática no código
```

```typescript
function isLegacyUrl(value: string): boolean {
  return value.startsWith('http');
}
```

**Vantagens:**
- Zero migration
- Rollback instantâneo

### Decisão: Usar Opção A (coluna `image_id`)

Criar migration para adicionar a coluna. Backward compatible com registros antigos via `url`.

---

## Configuração Cloudflare R2

### 1. Criar Buckets (DEV e PRD)
- Dashboard Cloudflare → R2 → Create Bucket
- **DEV**: `code6mm-images-dev` (Região: Auto)
- **PRD**: `code6mm-images-prd` (Região: Auto)
- Ambos no mesmo Cloudflare account

### 2. Criar API Token
- R2 → Manage API Tokens → Create Token
- Permissões: `Object Read & Write`
- Guardar:
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_ACCOUNT_ID` (da URL do dashboard)

### 3. Configurar Custom Domain (CDN)
- R2 → Bucket → Settings → Public Access
- Conectar custom domain: `cdn.code6mm.com.br`
- Ou usar domínio padrão: `pub-xxx.r2.dev`

---

## Variáveis de Ambiente

### Supabase Edge Functions (Secrets)

**DEV Project:**
```bash
supabase secrets set R2_ACCESS_KEY_ID=xxxx --project-ref dev-xxx
supabase secrets set R2_SECRET_ACCESS_KEY=xxxx --project-ref dev-xxx
supabase secrets set R2_ACCOUNT_ID=xxxx --project-ref dev-xxx
supabase secrets set R2_BUCKET_NAME=code6mm-images-dev --project-ref dev-xxx
```

**PRD Project:**
```bash
supabase secrets set R2_ACCESS_KEY_ID=xxxx --project-ref prd-xxx
supabase secrets set R2_SECRET_ACCESS_KEY=xxxx --project-ref prd-xxx
supabase secrets set R2_ACCOUNT_ID=xxxx --project-ref prd-xxx
supabase secrets set R2_BUCKET_NAME=code6mm-images-prd --project-ref prd-xxx
```

### Next.js - Environment Variables

**DEV (`.env.local`):**
```bash
# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx-dev.r2.dev

# Supabase DEV
NEXT_PUBLIC_SUPABASE_URL=https://dev-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**PRD (`.env.production` ou Vercel env vars):**
```bash
# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.code6mm.com.br
# ou https://pub-xxx-prd.r2.dev

# Supabase PRD
NEXT_PUBLIC_SUPABASE_URL=https://prd-xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/images/imageSizes.ts` | Definição dos 3 tamanhos fixos |
| `src/lib/images/resizeImage.ts` | Função de resize com pica |
| `src/lib/images/generateVariants.ts` | Gera todas as 3 variantes |
| `src/lib/images/uploadToR2.ts` | Upload via URL assinada |
| `src/lib/images/imageUrl.ts` | Montar URL de exibição |
| `supabase/functions/r2-signed-upload/index.ts` | Edge Function para URL assinada |

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/storage.ts` | Implementar `CloudflareR2Provider` |
| `src/lib/hooks/usePosts.ts` | Usar novo fluxo (gerar variants → upload → salvar image_id) |
| `src/components/screens/post/CreatePost.tsx` | Preview e upload com variants |
| `src/components/post/PostGallery.tsx` | Usar helper `getImageUrl()` |
| `src/components/shared/FeedPostCard.tsx` | Usar helper `getImageUrl()` |

---

## Fluxo de Upload (Detalhado)

### 1. Usuário seleciona imagem no CreatePost

### 2. Para cada arquivo selecionado:
```typescript
const imageId = uuid();

// Gerar 3 variantes no browser
const variants = await generateImageVariants(file);
// { thumb: Blob, feed: Blob, detail: Blob }

// Upload cada variante
for (const [variant, blob] of Object.entries(variants)) {
  const path = `posts/${postId}/${variant}/${imageId}.webp`;
  const { uploadUrl } = await getSignedUploadUrl(path);
  await uploadBlobToR2(uploadUrl, blob);
}
```

### 3. Salvar no banco:
```typescript
await supabase.from('post_images').insert({
  post_id: postId,
  url: imageId,  // Apenas o UUID!
  is_cover: index === 0,
  display_order: index,
});
```

### 4. Exibição:
```typescript
// Helper que monta URL completa
function getImageUrl(postId: string, imageId: string, variant: 'thumb' | 'feed' | 'detail') {
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/posts/${postId}/${variant}/${imageId}.webp`;
}
```

---

## Edge Function: r2-signed-upload

### Responsabilidades:
1. Validar JWT do usuário
2. Validar que o path é válido (`posts/...`)
3. **(Opcional/Evolução)** Validar ownership: se `postId` existe, verificar que pertence ao usuário
4. Gerar URL assinada PUT com expiração curta (5 min)
5. Retornar URL para o cliente

### Estratégia de Ownership (evolução):
- **Fase 1:** Aceitar qualquer `postId` válido (UUID) - simples, funciona
- **Fase 2:** Validar que o post existe e pertence ao usuário antes de assinar
- **Alternativa:** Usar path `drafts/{userId}/...` antes de publicar, mover para `posts/` ao criar

### Endpoint:
```
POST /functions/v1/r2-signed-upload
Body: { path: "posts/{postId}/thumb/{imageId}.webp" }
Response: { uploadUrl: "https://...", expiresIn: 300 }
```

### Dependências (npm no diretório functions):
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

## Biblioteca de Resize: pica

### Por que pica?
- Qualidade superior ao Canvas nativo
- Rápido (usa Web Workers)
- Bem mantido
- ~50KB gzipped

### Instalação:
```bash
npm install pica
```

### Fluxo interno:
```
File → loadImage() → Canvas origem → pica.resize() → Canvas destino → toBlob('image/webp')
```

---

## Compatibilidade com Imagens Antigas

### Detecção automática:
```typescript
function resolveImageUrl(postId: string, urlOrId: string, variant: string): string {
  // URL antiga do Supabase (começa com http)
  if (urlOrId.startsWith('http')) {
    return urlOrId;
  }

  // ID novo do R2
  return getImageUrl(postId, urlOrId, variant);
}
```

### Migração gradual:
- Posts novos → R2
- Posts antigos → Supabase (funcionam normalmente)
- Migração em background (opcional, futuro)

---

## Segurança

### Bucket R2:
- **Privado** para escrita
- **Público** apenas via CDN (leitura)

### Edge Function:
- Valida JWT obrigatório
- Valida prefixo do path (`posts/`)
- URL assinada expira em 5 minutos
- Nunca expõe credenciais R2

### Headers de Cache:
```
Cache-Control: public, max-age=31536000, immutable
```
(Imagens são imutáveis - mesmo ID = mesmo conteúdo)

---

## Checklist de Implementação

### Configuração Cloudflare
- [ ] Criar bucket R2 DEV `code6mm-images-dev`
- [ ] Criar bucket R2 PRD `code6mm-images-prd`
- [ ] Criar API Token com permissão Object Read & Write (ambos buckets)
- [ ] Anotar URLs públicas (dev e prd)
- [ ] Anotar `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`

### Edge Function
- [ ] Criar `supabase/functions/r2-signed-upload/index.ts`
- [ ] Instalar deps: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- [ ] Configurar secrets no Supabase
- [ ] Deploy: `supabase functions deploy r2-signed-upload`
- [ ] Testar endpoint isoladamente

### Frontend - Lib de Imagens
- [ ] Instalar `pica` e `uuid`
- [ ] Criar `src/lib/images/imageSizes.ts`
- [ ] Criar `src/lib/images/resizeImage.ts`
- [ ] Criar `src/lib/images/generateVariants.ts`
- [ ] Criar `src/lib/images/uploadToR2.ts`
- [ ] Criar `src/lib/images/imageUrl.ts`

### Frontend - Integração
- [ ] Implementar `CloudflareR2Provider` em `storage.ts`
- [ ] Atualizar `useCreatePost` para novo fluxo
- [ ] Atualizar `CreatePost.tsx` (preview + upload)
- [ ] Criar/atualizar componente de exibição com `getImageUrl()`

### Testes
- [ ] Upload de nova imagem (3 variants criadas)
- [ ] Exibição no feed (variant `feed`)
- [ ] Exibição no grid explore (variant `thumb`)
- [ ] Exibição no detalhe (variant `detail`)
- [ ] Backward compatibility com imagens antigas

---

## Tamanhos Esperados (Economia)

| Variant | Tamanho médio | Comparação |
|---------|---------------|------------|
| thumb | 15-25 KB | - |
| feed | 60-120 KB | - |
| detail | 120-220 KB | - |
| **Total por imagem** | ~200-350 KB | vs ~2-5MB original |

**Economia: ~90% no storage e bandwidth**

---

## Custos Estimados (R2)

| Item | Preço |
|------|-------|
| Storage | $0.015/GB/mês |
| Class A (upload) | $4.50/milhão de requests |
| Class B (download) | $0.36/milhão de requests |
| Egress | **GRÁTIS** |

**Estimativa Code6mm (início):**
- 10K imagens × 3 variants × 150KB = ~4.5GB → ~$0.07/mês
- 100K views/mês → ~$0.04/mês
- **Total: < $1/mês**

---

## Ordem de Execução

1. **Configurar R2** (bucket, token, domain)
2. **Criar Edge Function** e testar isoladamente
3. **Criar lib de imagens** (resize, upload, URL)
4. **Testar fluxo completo** em ambiente de dev
5. **Atualizar CreatePost** para usar novo sistema
6. **Atualizar componentes de exibição**
7. **Deploy em produção**
8. **Migrar imagens antigas** (opcional, background)

---

## Rollback Plan

Se algo der errado:
1. Manter `SupabaseStorageProvider` como fallback
2. Detecção automática de URL antiga vs nova funciona
3. Novos uploads voltam para Supabase
4. Nenhum dado é perdido

---

## Evolução Futura (Sem Refatorar)

Se precisar de:
- **Zoom/crop dinâmico**: Adicionar Cloudflare Images Transform
- **Mais tamanhos**: Apenas adicionar nova variant (thumb, feed, detail, **xlarge**)
- **Imagens gigantes**: Manter original no R2, lazy load

A estrutura suporta evolução sem quebrar nada.
