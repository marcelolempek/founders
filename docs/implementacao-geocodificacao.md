# Implementação de Geocodificação via CEP - Code6mm

## Visão Geral
Implementar busca de localização via CEP usando a API Nominatim (OpenStreetMap) na criação de posts, armazenando latitude e longitude para cálculos de distância no feed e explorar.

---

## Checklist de Implementação

### Fase 1: Banco de Dados (Prioridade: ALTA) - CONCLUÍDA
- [x] 1.1 Criar migration para adicionar campos de geolocalização na tabela `posts`:
  - `latitude` (DECIMAL(10,8), nullable)
  - `longitude` (DECIMAL(11,8), nullable)
  - `postal_code` (VARCHAR(10), nullable) - CEP usado na busca
  - `formatted_address` (TEXT, nullable) - display_name retornado pela API
  - `neighborhood` (VARCHAR(100), nullable) - bairro extraído do address
  - **Arquivo:** `supabase/migrations/045_geocoding_fields.sql`
- [x] 1.2 Criar índice espacial para otimizar queries por distância:
  - `CREATE INDEX idx_posts_coordinates ON posts(latitude, longitude)`
- [x] 1.3 Criar função SQL para cálculo de distância (Haversine):
  - `calculate_distance_km(lat1, lon1, lat2, lon2)` → retorna km
- [x] 1.4 Adicionar campos na tabela `profiles` para localização do usuário:
  - `latitude`, `longitude`, `postal_code` para cálculo de proximidade no feed

---

### Fase 2: Serviço de Geocodificação (Prioridade: ALTA) - CONCLUÍDA
- [x] 2.1 Criar serviço `src/services/geocoding.ts`:
  - Interface `GeocodingResult` com tipos dos dados Nominatim
  - Função `searchByCEP(cep: string)` - busca estruturada por código postal
  - Função `searchByCityState(city, state, neighborhood?)` - fallback
  - Rate limiting no cliente (1 req/segundo conforme TOS do Nominatim)
  - Cache local para CEPs já consultados
  - Tratamento de erros
- [x] 2.2 Criar hook `src/lib/hooks/useGeocoding.ts`:
  - `useGeocoding()` hook com estados (loading, error, result)
  - Funções `searchCEP()` e `searchCityState()`
  - Função utilitária `maskCEP()` para máscara de input

---

### Fase 3: UI - Criação de Posts (Prioridade: ALTA) - CONCLUÍDA
- [x] 3.1 Modificar `CreatePost.tsx` - Campo de CEP:
  - Modal com duas abas: "Buscar por CEP" e "Cidade/Estado"
  - Máscara de CEP (00000-000)
  - Botão de busca ao lado do input
  - Loading state durante busca
- [x] 3.2 Adicionar link "Não sei meu CEP" que abre fallback:
  - Toggle entre abas no modal de localização
  - Campos cidade + estado + bairro (opcional)
  - Usar `searchCityState()` como alternativa
- [x] 3.3 Exibir resultado da geocodificação:
  - Preview do endereço encontrado com cidade/estado/bairro
  - Coordenadas lat/lon exibidas
  - Botão confirmar ou buscar novamente
- [x] 3.4 Armazenar dados no submit:
  - Passar latitude, longitude, postal_code, formatted_address, neighborhood
  - Manter location_city e location_state preenchidos (extraídos do resultado)

---

### Fase 4: Hook de Criação (Prioridade: ALTA) - CONCLUÍDA
- [x] 4.1 Modificar `useCreatePost()` em `usePosts.ts`:
  - Interface `CreatePostInput` atualizada com campos de geolocalização
  - Inserir dados de geolocalização na tabela posts

---

### Fase 5: Feed com Distância (Prioridade: MÉDIA) - CONCLUÍDA
- [x] 5.1 Modificar função RPC `get_feed_posts()`:
  - Aceita parâmetros `p_user_lat` e `p_user_lon`
  - Calcula distância de cada post se coordenadas disponíveis
  - Scoring baseado em distância real (< 25km, < 50km, < 100km, etc)
  - Retorna `distance_km` para exibição
- [x] 5.2 Atualizar tipos em `database.types.ts`:
  - `FeedPost` inclui `distance_km`, `latitude`, `longitude`, `neighborhood`
  - `Post` e `Profile` incluem campos de geolocalização
- [x] 5.3 Modificar `FeedPostCard.tsx`:
  - Aceita prop `distanceKm`
  - Exibe distância formatada: "São Paulo, SP • 15 km"
  - Função `formatDistance()` para exibição amigável
- [x] 5.4 Modificar `Feed.tsx`:
  - Passa `distanceKm={post.distance_km}` para FeedPostCard

---

### Fase 6: Explorar com Filtro por Distância (Prioridade: MÉDIA) - PENDENTE
- [ ] 6.1 Adicionar filtro de raio de distância em `Search.tsx`:
  - Dropdown/slider: 10km, 25km, 50km, 100km, 200km, Qualquer
  - Usar localização do usuário como centro
- [ ] 6.2 Modificar `useSearchPosts()`:
  - Aceitar parâmetro `maxDistanceKm`
  - Filtrar posts por distância usando coordenadas
  - Usar RPC `search_posts_by_distance()` já criada
- [ ] 6.3 Ordenação por proximidade:
  - Nova opção de ordenação: "Mais próximos"

---

### Fase 7: Obter Localização do Usuário (Prioridade: BAIXA) - PENDENTE
- [ ] 7.1 Criar hook `useUserLocation()`:
  - Tentar obter do perfil (se tem lat/lon salvos)
  - Fallback: pedir permissão de geolocation do browser
  - Cache da localização obtida
- [ ] 7.2 Opção no perfil para salvar localização:
  - Campo CEP no perfil
  - Geocodificar e salvar lat/lon no profiles

---

## Estrutura de Dados

### Resposta Nominatim (campos relevantes)
```json
{
  "lat": "-23.5613991",
  "lon": "-46.6565712",
  "display_name": "Avenida Paulista, Bela Vista, São Paulo, SP, 01310-100, Brasil",
  "address": {
    "road": "Avenida Paulista",
    "suburb": "Bela Vista",
    "city": "São Paulo",
    "state": "São Paulo",
    "postcode": "01310-100",
    "country": "Brasil"
  },
  "class": "place",
  "type": "postcode"
}
```

### Interface TypeScript
```typescript
interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address: {
    road?: string;
    neighborhood?: string; // suburb no Nominatim
    city?: string;
    state?: string;
    stateCode?: string; // extraído do state
    postalCode?: string;
    country?: string;
  };
  type: string; // postcode, administrative, etc
  confidence: 'high' | 'medium' | 'low';
}
```

### Campos no Banco (posts)
```sql
ALTER TABLE posts ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE posts ADD COLUMN longitude DECIMAL(11,8);
ALTER TABLE posts ADD COLUMN postal_code VARCHAR(10);
ALTER TABLE posts ADD COLUMN formatted_address TEXT;
ALTER TABLE posts ADD COLUMN neighborhood VARCHAR(100);
```

---

## Priorização de Tarefas

| # | Tarefa | Prioridade | Dependências | Esforço |
|---|--------|------------|--------------|---------|
| 1 | Migration BD (Fase 1) | ALTA | - | Baixo |
| 2 | Serviço geocoding (Fase 2) | ALTA | - | Médio |
| 3 | UI CreatePost CEP (Fase 3) | ALTA | 1, 2 | Médio |
| 4 | Hook useCreatePost (Fase 4) | ALTA | 1 | Baixo |
| 5 | Feed com distância (Fase 5) | MÉDIA | 1, 4 | Médio |
| 6 | Explorar com filtro (Fase 6) | MÉDIA | 1, 5 | Médio |
| 7 | Localização do usuário (Fase 7) | BAIXA | 5, 6 | Baixo |

---

## Considerações Técnicas

### Rate Limiting Nominatim
- Máximo 1 requisição por segundo
- User-Agent obrigatório identificando a aplicação
- Não usar para alto volume (considerar cache agressivo)

### Precisão
- Busca por CEP retorna centro do código postal
- Busca por cidade retorna centro administrativo da cidade
- Bairro melhora a precisão quando fornecido

### UX Recomendada
1. CEP como entrada principal (mais preciso)
2. Fallback cidade/estado/bairro se usuário não sabe CEP
3. Preview do endereço antes de confirmar
4. Exibir distância aproximada no feed (arredondada)

### Cache
- Cachear resultados de CEP por 24h (CEPs não mudam)
- Usar localStorage ou sessionStorage no cliente
- Considerar cache no servidor para CEPs populares

---

## Arquivos Criados/Modificados

### Novos Arquivos
| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/045_geocoding_fields.sql` | Migration com campos, índices e funções SQL |
| `src/services/geocoding.ts` | Serviço de geocodificação com API Nominatim |
| `src/lib/hooks/useGeocoding.ts` | Hook React para geocodificação |

### Arquivos Modificados
| Arquivo | Alterações |
|---------|------------|
| `src/components/screens/post/CreatePost.tsx` | Modal de localização com CEP, geocodificação |
| `src/lib/hooks/usePosts.ts` | Interface e insert com campos de geolocalização |
| `src/lib/database.types.ts` | Tipos Post, Profile, FeedPost com novos campos |
| `src/components/shared/FeedPostCard.tsx` | Exibição de distância no header |
| `src/components/screens/feed/Feed.tsx` | Passa distanceKm para FeedPostCard |

---

## Ordem de Execução Recomendada

1. **Fase 1** - Criar migration do banco de dados
2. **Fase 2** - Implementar serviço de geocodificação
3. **Fase 3 + 4** - UI e hook de criação (podem ser feitos juntos)
4. **Fase 5** - Modificar feed para usar distância
5. **Fase 6** - Adicionar filtros no explorar
6. **Fase 7** - Melhorias de UX para localização do usuário

---

## Próximos Passos

1. **Aplicar a migration** no Supabase:
   ```bash
   supabase db push
   ```

2. **Testar a criação de posts** com o novo campo de CEP

3. **Implementar Fase 6** - Filtro de distância no Explorar (usar RPC `search_posts_by_distance()` já criada)

4. **Implementar Fase 7** - Hook de localização do usuário para cálculo automático de distância
