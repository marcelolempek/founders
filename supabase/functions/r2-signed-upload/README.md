# R2 Signed Upload - Edge Function

Gera URLs assinadas para upload direto no Cloudflare R2.

## Uso

```bash
POST /functions/v1/r2-signed-upload
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "path": "posts/{postId}/{variant}/{imageId}.webp"
}
```

## Response

```json
{
  "uploadUrl": "https://...",
  "expiresIn": 300
}
```

## Deploy

```bash
# Instalar dependências
cd supabase/functions/r2-signed-upload
npm install

# Deploy (dev)
supabase functions deploy r2-signed-upload --project-ref dev-xxx

# Deploy (prd)
supabase functions deploy r2-signed-upload --project-ref prd-xxx
```

## Secrets Required

- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME` (code6mm-images-dev ou code6mm-images-prd)
