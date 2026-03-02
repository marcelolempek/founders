# ALGORITMO DE FEED - Code6mm

**Data:** 2026-01-01
**Status:** Analise completa para lancamento nacional

---

## RESUMO EXECUTIVO

| Aspecto | Estado Atual | Estado Ideal | Prioridade |
|---------|--------------|--------------|------------|
| Bumped (impulsionados) | Implementado | OK | - |
| Localizacao geografica | Parcial | Precisa melhorar | ALTA |
| Entrega nacional | NAO EXISTE | Criar campo | CRITICA |
| Engajamento | NAO CONSIDERA | Implementar | MEDIA |
| Confianca do vendedor | Parcial | Melhorar | ALTA |
| Freshness (recencia) | Basico | Melhorar | BAIXA |

---

## 1. COMO FUNCIONA HOJE

### 1.1 Funcao RPC: `get_feed_posts`

**Arquivo:** `supabase/migrations/033_intelligent_feed.sql`

**Ordem de prioridade atual:**
```sql
ORDER BY
    p.is_bumped DESC,                                    -- 1. Impulsionados primeiro
    (
        CASE WHEN cidade_igual THEN 100 ELSE 0 END +    -- 2a. Mesma cidade (+100)
        CASE WHEN estado_igual THEN 50 ELSE 0 END +     -- 2b. Mesmo estado (+50)
        CASE WHEN is_verified THEN 25 ELSE 0 END        -- 2c. Verificado (+25)
    ) DESC,
    p.bumped_at DESC NULLS LAST,                        -- 3. Data do bump
    p.created_at DESC                                    -- 4. Data de criacao
```

### 1.2 O que o algoritmo considera HOJE:

| Fator | Peso | Como funciona |
|-------|------|---------------|
| **is_bumped** | Absoluto | Posts impulsionados SEMPRE aparecem primeiro |
| **Mesma cidade** | +100 pts | Se usuario logado tem mesma cidade do post |
| **Mesmo estado** | +50 pts | Se usuario logado tem mesmo estado do post |
| **Vendedor verificado** | +25 pts | Badge de verificacao |
| **bumped_at** | Ordenacao | Bumps mais recentes primeiro |
| **created_at** | Ordenacao | Posts mais recentes primeiro |

### 1.3 O que o algoritmo NAO considera HOJE:

- Entrega para todo o Brasil
- Numero de likes/curtidas
- Numero de visualizacoes
- Numero de comentarios
- Reputacao do vendedor (rating)
- Quantidade de vendas realizadas
- Tempo desde a ultima atualizacao
- Categoria preferida do usuario
- Historico de busca do usuario
- Faixa de preco preferida

---

## 2. PROBLEMAS PARA LANCAMENTO NACIONAL

### Problema 1: Nao existe campo "Entrega Nacional"

**Impacto:** Vendedores que enviam para todo o Brasil nao tem destaque.

**Exemplo:** Um vendedor de SP que envia para todo o Brasil nao aparece para usuarios do RS, mesmo sendo relevante.

### Problema 2: Localizacao muito binaria

**Impacto:** Cidade diferente = zero pontos, mesmo que seja cidade vizinha.

**Exemplo:** Usuario de Guarulhos nao ve posts de Sao Paulo com prioridade.

### Problema 3: Engajamento ignorado

**Impacto:** Posts populares nao tem vantagem sobre posts sem interacao.

**Exemplo:** Um post com 500 likes aparece igual a um post com 0 likes.

### Problema 4: Reputacao do vendedor subutilizada

**Impacto:** Apenas is_verified e considerado, ignorando rating e vendas.

**Exemplo:** Vendedor com 5 estrelas e 100 vendas nao tem vantagem sobre vendedor novo.

---

## 3. COMO DEVERIA SER PARA LANCAMENTO NACIONAL

### 3.1 Novo sistema de pontuacao proposto:

```
SCORE_TOTAL =
    BOOST_IMPULSIONADO +
    SCORE_LOCALIZACAO +
    SCORE_CONFIANCA +
    SCORE_ENGAJAMENTO +
    SCORE_FRESHNESS
```

### 3.2 Detalhamento dos scores:

#### BOOST_IMPULSIONADO (0 ou 1000 pontos)
- Post impulsionado: +1000 pontos
- Garante que impulsionados sempre aparecem no topo

#### SCORE_LOCALIZACAO (0 a 200 pontos)
| Condicao | Pontos |
|----------|--------|
| Mesma cidade | +100 |
| Mesmo estado | +50 |
| **NOVO: Entrega nacional** | +75 |
| Regiao proxima (Sul/Sudeste) | +25 |

#### SCORE_CONFIANCA (0 a 150 pontos)
| Condicao | Pontos |
|----------|--------|
| Vendedor verificado | +30 |
| Rating >= 4.5 | +40 |
| Rating >= 4.0 | +25 |
| Rating >= 3.5 | +10 |
| 10+ vendas | +20 |
| 50+ vendas | +40 |
| 100+ vendas | +60 |

#### SCORE_ENGAJAMENTO (0 a 100 pontos)
| Condicao | Pontos |
|----------|--------|
| Cada 10 likes | +5 (max 30) |
| Cada 100 views | +5 (max 20) |
| Cada 5 comentarios | +5 (max 20) |
| Cada post salvo | +2 (max 30) |

#### SCORE_FRESHNESS (0 a 50 pontos)
| Idade do post | Pontos |
|---------------|--------|
| < 24 horas | +50 |
| < 3 dias | +40 |
| < 7 dias | +30 |
| < 14 dias | +20 |
| < 30 dias | +10 |
| > 30 dias | +0 |

---

## 4. MUDANCAS NECESSARIAS NO BANCO

### 4.1 Adicionar campo na tabela `posts`:

```sql
ALTER TABLE public.posts
ADD COLUMN ships_nationwide BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.posts.ships_nationwide IS
'Indica se o vendedor envia para todo o Brasil';
```

### 4.2 Adicionar campo na tabela `profiles`:

```sql
ALTER TABLE public.profiles
ADD COLUMN default_ships_nationwide BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.default_ships_nationwide IS
'Preferencia padrao de envio nacional do vendedor';
```

### 4.3 Criar indice para performance:

```sql
CREATE INDEX idx_posts_ships_nationwide ON public.posts(ships_nationwide)
WHERE status = 'active';
```

---

## 5. NOVA FUNCAO get_feed_posts PROPOSTA

```sql
CREATE OR REPLACE FUNCTION public.get_feed_posts_v2(
    p_user_id UUID DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    -- ... campos existentes ...
    ships_nationwide BOOLEAN,
    relevance_score NUMERIC
) AS $$
DECLARE
    v_user_city TEXT;
    v_user_state TEXT;
    v_user_region TEXT;
BEGIN
    IF p_user_id IS NOT NULL THEN
        SELECT location_city, location_state INTO v_user_city, v_user_state
        FROM public.profiles WHERE id = p_user_id;

        -- Determinar regiao
        v_user_region := CASE
            WHEN v_user_state IN ('SP', 'RJ', 'MG', 'ES') THEN 'sudeste'
            WHEN v_user_state IN ('RS', 'SC', 'PR') THEN 'sul'
            WHEN v_user_state IN ('BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA') THEN 'nordeste'
            WHEN v_user_state IN ('MT', 'MS', 'GO', 'DF') THEN 'centro-oeste'
            WHEN v_user_state IN ('AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO') THEN 'norte'
            ELSE NULL
        END;
    END IF;

    RETURN QUERY
    SELECT
        p.*,
        pr.username, pr.avatar_url, pr.is_verified, pr.reputation_score, pr.sales_count,
        -- ... campos existentes ...
        p.ships_nationwide,
        (
            -- BOOST IMPULSIONADO
            CASE WHEN p.is_bumped THEN 1000 ELSE 0 END +

            -- SCORE LOCALIZACAO
            CASE WHEN v_user_city IS NOT NULL AND p.location_city = v_user_city THEN 100 ELSE 0 END +
            CASE WHEN v_user_state IS NOT NULL AND p.location_state = v_user_state THEN 50 ELSE 0 END +
            CASE WHEN p.ships_nationwide = TRUE THEN 75 ELSE 0 END +
            CASE WHEN v_user_region IS NOT NULL AND get_region(p.location_state) = v_user_region THEN 25 ELSE 0 END +

            -- SCORE CONFIANCA
            CASE WHEN pr.is_verified THEN 30 ELSE 0 END +
            CASE WHEN pr.reputation_score >= 4.5 THEN 40
                 WHEN pr.reputation_score >= 4.0 THEN 25
                 WHEN pr.reputation_score >= 3.5 THEN 10 ELSE 0 END +
            CASE WHEN pr.sales_count >= 100 THEN 60
                 WHEN pr.sales_count >= 50 THEN 40
                 WHEN pr.sales_count >= 10 THEN 20 ELSE 0 END +

            -- SCORE ENGAJAMENTO
            LEAST(p.likes_count / 10 * 5, 30) +
            LEAST(p.views_count / 100 * 5, 20) +
            LEAST(p.comments_count / 5 * 5, 20) +

            -- SCORE FRESHNESS
            CASE
                WHEN p.created_at > NOW() - INTERVAL '1 day' THEN 50
                WHEN p.created_at > NOW() - INTERVAL '3 days' THEN 40
                WHEN p.created_at > NOW() - INTERVAL '7 days' THEN 30
                WHEN p.created_at > NOW() - INTERVAL '14 days' THEN 20
                WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 10
                ELSE 0
            END
        )::NUMERIC AS relevance_score
    FROM public.posts p
    INNER JOIN public.profiles pr ON p.user_id = pr.id
    WHERE p.status = 'active'
    AND (p_category IS NULL OR p.category = p_category)
    ORDER BY relevance_score DESC, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. CHECKLIST DE IMPLEMENTACAO

### Fase 1: CRITICA (Antes do lancamento)

- [x] **Criar campo `ships_nationwide` na tabela posts**
  - ✅ Migration 034 criada e aplicada
  - Campo permite vendedores indicarem que enviam para todo Brasil
  - Essencial para lancamento nacional

- [x] **Adicionar opcao "Envio para todo Brasil" no formulario de criacao de post**
  - ✅ Checkbox implementado no CreatePost
  - ✅ Integrado com default_ships_nationwide do perfil
  - Pode ser padrao por vendedor

- [x] **Atualizar algoritmo para considerar `ships_nationwide`**
  - ✅ Migration 035 criada com algoritmo completo
  - Posts com envio nacional ganham +75 pontos
  - Aparecem para usuarios de qualquer estado

### Fase 2: ALTA (Primeira semana pos-lancamento)

- [x] **Implementar score de engajamento**
  - ✅ Considera likes, views, comentarios, saves
  - Posts populares sobem no ranking

- [x] **Implementar score de confianca completo**
  - ✅ Considera rating, numero de vendas, verificacao
  - Vendedores experientes tem vantagem

- [x] **Adicionar score de freshness**
  - ✅ Posts novos tem vantagem
  - Decay gradual com o tempo

### Fase 3: MEDIA (Primeiro mes)

- [x] **Implementar agrupamento por regiao**
  - ✅ Sudeste, Sul, Nordeste, Norte, Centro-Oeste
  - ✅ Posts da mesma regiao ganham +25
  - ✅ Funcao get_region() criada

- [ ] **A/B testing do algoritmo**
  - Comparar versao atual com nova
  - Medir CTR, conversao, tempo na pagina

### Fase 4: BAIXA (Futuro)

- [ ] **Personalizacao por historico**
  - Categorias que o usuario mais ve
  - Faixa de preco preferida

- [ ] **Machine learning para relevancia**
  - Modelo treinado com dados reais
  - Otimizacao continua

---

## 7. DIFERENCA FEED vs EXPLORAR

### FEED (Pagina inicial `/`)
- **Objetivo:** Mostrar posts mais relevantes para o usuario
- **Algoritmo:** Score de relevancia completo
- **Personalizacao:** Baseada em localizacao do usuario
- **Ideal para:** Descoberta passiva

### EXPLORAR (`/explore`)
- **Objetivo:** Busca ativa com filtros
- **Algoritmo atual:**
  ```sql
  ORDER BY is_bumped DESC, created_at DESC
  ```
- **Filtros disponiveis:** Categoria, preco min/max, condicao, estado
- **Ideal para:** Busca especifica

### Recomendacao para Explorar:
Manter ordenacao simples (bumped + recentes), mas adicionar filtro "Entrega para todo Brasil" nos filtros.

---

## 8. IMPACTO ESPERADO

| Metrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| CTR no feed | ~2% | ~4-5% | +100-150% |
| Conversao (contato) | ~5% | ~8-10% | +60-100% |
| Tempo na pagina | ~45s | ~90s | +100% |
| Satisfacao vendedor | Media | Alta | +++ |

---

## 9. MIGRACAO SUGERIDA

### Arquivo: `034_ships_nationwide.sql`

```sql
-- ============================================
-- CODE6MM - SHIPS NATIONWIDE
-- ============================================

BEGIN;

-- 1. Adicionar campo na tabela posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS ships_nationwide BOOLEAN DEFAULT FALSE;

-- 2. Adicionar campo padrao no perfil
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS default_ships_nationwide BOOLEAN DEFAULT FALSE;

-- 3. Criar indice para performance
CREATE INDEX IF NOT EXISTS idx_posts_ships_nationwide
ON public.posts(ships_nationwide)
WHERE status = 'active';

-- 4. Funcao auxiliar para determinar regiao
CREATE OR REPLACE FUNCTION public.get_region(p_state TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_state IN ('SP', 'RJ', 'MG', 'ES') THEN 'sudeste'
        WHEN p_state IN ('RS', 'SC', 'PR') THEN 'sul'
        WHEN p_state IN ('BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA') THEN 'nordeste'
        WHEN p_state IN ('MT', 'MS', 'GO', 'DF') THEN 'centro-oeste'
        WHEN p_state IN ('AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO') THEN 'norte'
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMIT;
```

---

## 10. RESUMO FINAL

### O que funciona bem hoje:
- ✅ Impulsionados sempre no topo (1000 pts)
- ✅ Vendedores verificados tem vantagem (+30 pts)
- ✅ Localizacao geografica completa (cidade, estado, regiao)
- ✅ **Envio nacional implementado (+75 pts)**
- ✅ Score de engajamento (likes, views, comments, saves)
- ✅ Score de confianca (rating, vendas, verificacao)
- ✅ Score de freshness (recencia do post)

### STATUS DA IMPLEMENTACAO:
✅ **FASE 1 (CRITICA): COMPLETA**
✅ **FASE 2 (ALTA): COMPLETA**
✅ **FASE 3 (MEDIA): PARCIALMENTE COMPLETA**

### Implementado em 2026-01-01:
1. ✅ Migration 034: Campo `ships_nationwide` em posts e profiles
2. ✅ Migration 035: Algoritmo completo de feed nacional
3. ✅ Frontend: Checkbox "Envio Nacional" no CreatePost
4. ✅ TypeScript: Tipos atualizados (Profile, CreatePostInput)
5. ✅ Funcao get_region() para agrupamento regional

### Pendente:
- [x] **Aplicar Migration 035 no banco** ✅ EXECUTADO
- [ ] A/B testing do algoritmo
- [ ] Personalização por histórico (Fase 4)
- [ ] Machine learning (Fase 4)

### Esforco real:
- Migration do banco: ~30 min ✅
- Atualizar RPC: ~1 hora ✅
- Atualizar frontend (checkbox): ~1 hora ✅
- Atualizar tipos TypeScript: ~30 min ✅
- **Total: ~3 horas** (estimativa original: 5-6 horas)

---

**Ultima atualizacao:** 2026-01-01 20:50 BRT
**Status:** Implementacao completa - Aguardando aplicacao da migration 035
