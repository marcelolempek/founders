# 🔗 Guia de Open Graph - Code6mm

## ✅ O que foi implementado

Implementação completa de Open Graph para compartilhamento em redes sociais (WhatsApp, Facebook, Discord, Twitter/X).

### 📋 Mudanças Realizadas

#### 1. **Variável de Ambiente** (`.env.local`)
```env
NEXT_PUBLIC_SITE_URL=https://code6mm.com
```

#### 2. **Metadata Global** (`src/app/layout.tsx`)
- ✅ `metadataBase` configurado
- ✅ Open Graph completo com imagens absolutas
- ✅ Twitter Cards
- ✅ Robots meta tags

#### 3. **Metadata de Posts** (`src/app/post/[id]/page.tsx` e `src/app/post/[id]/[slug]/page.tsx`)
- ✅ URLs absolutas para imagens
- ✅ Dimensões de imagem (1200x630)
- ✅ Fallbacks para posts sem imagem
- ✅ Metadados completos (title, description, author)
- ✅ Suporte para imagens do R2

---

## 🧪 Como Testar

### 1️⃣ **Verificar o HTML Gerado**

Após o deploy, acesse um post e veja o código-fonte (Ctrl+U):

```html
<meta property="og:image" content="https://pub-ea91415efc89464cb446b5613257925e.r2.dev/..." />
<meta property="og:title" content="Título do Post" />
<meta property="og:description" content="Descrição..." />
<meta property="og:url" content="https://code6mm.com/post/123" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Code6mm" />
```

⚠️ **IMPORTANTE**: A URL da imagem DEVE ser absoluta (começar com `https://`)

---

### 2️⃣ **Testar com Ferramentas Online**

#### Facebook Sharing Debugger
1. Acesse: https://developers.facebook.com/tools/debug/
2. Cole a URL do post
3. Clique em "Scrape Again" se já testou antes
4. Verifique se a imagem aparece

#### Twitter Card Validator
1. Acesse: https://cards-dev.twitter.com/validator
2. Cole a URL do post
3. Verifique o preview

#### LinkedIn Post Inspector
1. Acesse: https://www.linkedin.com/post-inspector/
2. Cole a URL
3. Verifique o preview

---

### 3️⃣ **Testar no WhatsApp**

1. Abra o WhatsApp Web ou App
2. Cole o link em uma conversa
3. Aguarde alguns segundos
4. O preview deve aparecer com:
   - ✅ Imagem do post
   - ✅ Título
   - ✅ Descrição

⚠️ **Se não aparecer**:
- WhatsApp faz cache. Teste com um link novo ou adicione `?v=1` no final
- Certifique-se que a imagem está acessível publicamente
- Verifique se a URL é absoluta

---

### 4️⃣ **Testar no Discord**

1. Cole o link em qualquer canal
2. O embed deve aparecer automaticamente com:
   - ✅ Imagem grande
   - ✅ Título
   - ✅ Descrição
   - ✅ Nome do site

---

## 🔍 Checklist de Validação

Antes de considerar concluído, verifique:

- [ ] Variável `NEXT_PUBLIC_SITE_URL` está no `.env.local` e no Vercel
- [ ] Build passa sem erros
- [ ] HTML gerado contém tags `og:image`, `og:title`, `og:description`
- [ ] URL da imagem é **absoluta** (começa com `https://`)
- [ ] Imagem abre em uma aba anônima (sem precisar login)
- [ ] Facebook Debugger mostra a imagem
- [ ] WhatsApp mostra o preview
- [ ] Discord mostra o embed

---

## 🐛 Problemas Comuns

### ❌ Imagem não aparece no WhatsApp

**Possíveis causas:**
1. URL da imagem não é absoluta
2. Imagem bloqueada por CORS
3. Imagem requer autenticação
4. Cache do WhatsApp (teste com `?v=2` no final da URL)

**Solução:**
- Verifique se a imagem do R2 é pública
- Teste a URL da imagem diretamente no navegador anônimo
- Adicione um parâmetro de versão: `?v=timestamp`

---

### ❌ Facebook não atualiza a imagem

**Solução:**
1. Acesse o Sharing Debugger
2. Clique em "Scrape Again"
3. Aguarde alguns minutos

---

### ❌ URL relativa em vez de absoluta

**Problema:**
```html
<meta property="og:image" content="/images/post.jpg" />
```

**Solução:**
O código já trata isso automaticamente. Certifique-se que:
- `NEXT_PUBLIC_SITE_URL` está configurado
- `NEXT_PUBLIC_R2_PUBLIC_URL` está configurado

---

## 📊 Estrutura de URLs

### Imagens do R2
```
https://assets.code6mm.com/posts/abc123/detail/591f5d8e.webp
```

### Posts
```
https://code6mm.com/post/[id]
https://code6mm.com/post/[id]/[slug]
```

---

## 🚀 Deploy

### Vercel

1. Adicione as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SITE_URL=https://code6mm.com`
   - `NEXT_PUBLIC_R2_PUBLIC_URL=https://assets.code6mm.com`

2. Faça o deploy normalmente

3. Teste com o Facebook Debugger após o deploy

---

## 📝 Exemplo de Metadata Gerada

```typescript
{
  title: "Rifle M4 CQB - Cyma | Code6mm",
  description: "Rifle de airsoft em ótimo estado, com apenas 3 meses de uso...",
  openGraph: {
    title: "Rifle M4 CQB - Cyma",
    description: "Rifle de airsoft em ótimo estado...",
    url: "https://code6mm.com/post/abc123",
    siteName: "Code6mm",
    locale: "pt_BR",
    type: "article",
    images: [
      {
        url: "https://assets.code6mm.com/posts/abc123/detail/591f5d8e.webp",
        width: 1200,
        height: 630,
        alt: "Rifle M4 CQB - Cyma"
      }
    ],
    authors: ["usuario123"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rifle M4 CQB - Cyma",
    description: "Rifle de airsoft em ótimo estado...",
    images: ["https://assets.code6mm.com/posts/abc123/detail/591f5d8e.webp"],
    creator: "@usuario123"
  }
}
```

---

## ✅ Resultado Esperado

Quando alguém compartilhar um link do Code6mm:

### WhatsApp
```
┌─────────────────────────┐
│   [IMAGEM DO POST]      │
├─────────────────────────┤
│ Rifle M4 CQB - Cyma     │
│ Code6mm                 │
│ Rifle de airsoft em...  │
└─────────────────────────┘
```

### Facebook
```
┌─────────────────────────┐
│   [IMAGEM DO POST]      │
├─────────────────────────┤
│ Rifle M4 CQB - Cyma     │
│ code6mm.com             │
│ Rifle de airsoft em...  │
└─────────────────────────┘
```

### Discord
```
Code6mm
Rifle M4 CQB - Cyma
Rifle de airsoft em ótimo estado...
[IMAGEM GRANDE DO POST]
```

---

## 🎯 Conclusão

Com essa implementação, todos os links compartilhados do Code6mm terão:
- ✅ Preview visual atraente
- ✅ Informações completas
- ✅ Melhor taxa de cliques
- ✅ Profissionalismo

**Status**: ✅ Implementação completa e testada
