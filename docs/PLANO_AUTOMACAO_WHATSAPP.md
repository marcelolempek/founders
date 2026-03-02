# Plano Completo: Automacao WhatsApp Code6mm

## Visao Geral

Sistema de postagem automatica de anuncios do marketplace Code6mm (airsoft) em grupos do WhatsApp, com:
- Filtros personalizados por estado/cidade para cada grupo
- Agendamentos flexiveis (multiplos horarios e dias da semana)
- Execucao automatica via Supabase Edge Function + Cron
- Dashboard web para gerenciamento completo
- Logs de todas as postagens

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   pg_cron   │  │    Posts    │  │   whatsapp_groups       │ │
│  │  (5 min)    │  │   (dados)   │  │   whatsapp_schedules    │ │
│  └──────┬──────┘  └─────────────┘  │   whatsapp_post_logs    │ │
│         │                          └─────────────────────────┘ │
│         v                                                       │
│  ┌─────────────────────┐                                       │
│  │   Edge Function     │                                       │
│  │ whatsapp-daily-post │                                       │
│  └──────────┬──────────┘                                       │
└─────────────┼───────────────────────────────────────────────────┘
              │
              │ HTTPS (via Ngrok)
              v
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR LOCAL                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────────┐ │
│  │    Ngrok    │ ───> │    WAHA     │ ───> │   WhatsApp      │ │
│  │  (tunnel)   │      │  (API HTTP) │      │   (mensagens)   │ │
│  └─────────────┘      └─────────────┘      └─────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Dashboard (Node.js)                      ││
│  │  - Gerenciar grupos                                         ││
│  │  - Configurar agendamentos                                  ││
│  │  - Visualizar logs                                          ││
│  │  - Envio manual                                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Banco de Dados (Supabase)

### 1.1 Tabela: `whatsapp_groups`
Armazena os grupos do WhatsApp cadastrados.

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL UNIQUE,        -- ID do grupo (ex: 120363...@g.us)
  name text NOT NULL,                   -- Nome do grupo
  active boolean DEFAULT true,          -- Grupo ativo/inativo
  states text[],                        -- Filtro de estados (null = todos)
  cities text[],                        -- Filtro de cidades (null = todas)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos importantes:**
- `chat_id`: ID unico do grupo no WhatsApp (formato: `120363...@g.us`)
- `states`: Array de siglas de estados. Ex: `['SP', 'RJ']`. Se `null`, recebe anuncios de todos os estados.
- `cities`: Array de nomes de cidades. Ex: `['Sao Paulo', 'Campinas']`. Se `null`, recebe de todas as cidades.

### 1.2 Tabela: `whatsapp_schedules`
Armazena os horarios de postagem de cada grupo.

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.whatsapp_groups(id) ON DELETE CASCADE,
  schedule_time time NOT NULL,          -- Horario (ex: '09:00', '14:30')
  days_of_week int[] DEFAULT '{0,1,2,3,4,5,6}', -- Dias (0=dom, 6=sab)
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

**Campos importantes:**
- `schedule_time`: Horario da postagem no formato HH:MM
- `days_of_week`: Array de dias da semana (0=domingo, 1=segunda, ..., 6=sabado)
- Um grupo pode ter multiplos agendamentos (ex: 09:00 e 18:00)

### 1.3 Tabela: `whatsapp_post_logs`
Historico de todas as postagens realizadas.

```sql
CREATE TABLE IF NOT EXISTS public.whatsapp_post_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.whatsapp_groups(id) ON DELETE SET NULL,
  schedule_id uuid REFERENCES public.whatsapp_schedules(id) ON DELETE SET NULL,
  posts_count int NOT NULL DEFAULT 0,   -- Quantidade de anuncios enviados
  message_preview text,                 -- Preview da mensagem (500 chars)
  status text DEFAULT 'success',        -- 'success', 'failed', 'partial'
  error_message text,                   -- Mensagem de erro (se houver)
  sent_at timestamptz DEFAULT now()
);
```

### 1.4 View: `whatsapp_active_schedules`
View que facilita buscar schedules ativos com dados do grupo.

```sql
CREATE OR REPLACE VIEW public.whatsapp_active_schedules AS
SELECT
  s.id as schedule_id,
  s.schedule_time,
  s.days_of_week,
  g.id as group_id,
  g.chat_id,
  g.name as group_name,
  g.states,
  g.cities
FROM public.whatsapp_schedules s
JOIN public.whatsapp_groups g ON s.group_id = g.id
WHERE s.active = true AND g.active = true;
```

### 1.5 Indices e RLS

```sql
-- Indices para performance
CREATE INDEX idx_whatsapp_groups_active ON public.whatsapp_groups(active);
CREATE INDEX idx_whatsapp_schedules_group ON public.whatsapp_schedules(group_id);
CREATE INDEX idx_whatsapp_schedules_active ON public.whatsapp_schedules(active);
CREATE INDEX idx_whatsapp_logs_group ON public.whatsapp_post_logs(group_id);
CREATE INDEX idx_whatsapp_logs_sent ON public.whatsapp_post_logs(sent_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_post_logs ENABLE ROW LEVEL SECURITY;

-- Politica para service_role (acesso total)
CREATE POLICY "Service role full access" ON public.whatsapp_groups FOR ALL USING (true);
CREATE POLICY "Service role full access" ON public.whatsapp_schedules FOR ALL USING (true);
CREATE POLICY "Service role full access" ON public.whatsapp_post_logs FOR ALL USING (true);
```

---

## 2. Edge Function: `whatsapp-daily-post`

### 2.1 Logica de Execucao

```
1. Receber chamada do Cron (a cada 5 minutos)
2. Obter hora atual no fuso horario do Brasil (America/Sao_Paulo)
3. Obter dia da semana atual (0-6)
4. Buscar schedules que:
   - Estao ativos
   - O grupo esta ativo
   - O horario esta dentro de uma margem de 5 minutos
   - O dia atual esta na lista de dias permitidos
5. Para cada schedule encontrado:
   a. Buscar posts filtrados (type='sale', status='active')
   b. Aplicar filtro de estados/cidades do grupo
   c. Montar mensagem formatada
   d. Enviar via WAHA API
   e. Registrar log (sucesso ou falha)
```

### 2.2 Codigo da Edge Function

```typescript
// supabase/functions/whatsapp-daily-post/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WAHA_URL = Deno.env.get('WAHA_URL') || 'https://seu-waha.ngrok-free.app'
const WAHA_API_KEY = Deno.env.get('WAHA_API_KEY') || ''
const WAHA_SESSION = Deno.env.get('WAHA_SESSION') || 'default'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  try {
    // Hora atual no Brasil
    const now = new Date()
    const brTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const currentHour = brTime.getHours()
    const currentMinute = brTime.getMinutes()
    const currentDay = brTime.getDay() // 0=dom, 6=sab

    console.log(`Executando as ${currentHour}:${currentMinute}, dia ${currentDay}`)

    // Buscar schedules ativos
    const { data: schedules, error: schedError } = await supabase
      .from('whatsapp_active_schedules')
      .select('*')

    if (schedError) throw schedError

    // Filtrar schedules do horario atual (margem de 5 min)
    const matchingSchedules = schedules.filter(s => {
      const [schedHour, schedMin] = s.schedule_time.split(':').map(Number)
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (schedHour * 60 + schedMin))
      const dayMatch = s.days_of_week.includes(currentDay)
      return timeDiff <= 2 && dayMatch // 2 min de margem
    })

    console.log(`${matchingSchedules.length} schedules para processar`)

    const results = []

    for (const schedule of matchingSchedules) {
      try {
        // Buscar posts filtrados
        let query = supabase
          .from('posts')
          .select('*')
          .eq('type', 'sale')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20)

        // Aplicar filtro de estados
        if (schedule.states && schedule.states.length > 0) {
          query = query.in('location_state', schedule.states)
        }

        // Aplicar filtro de cidades
        if (schedule.cities && schedule.cities.length > 0) {
          query = query.in('location_city', schedule.cities)
        }

        const { data: posts, error: postsError } = await query
        if (postsError) throw postsError

        if (!posts || posts.length === 0) {
          console.log(`Nenhum post para ${schedule.group_name}`)
          continue
        }

        // Montar mensagem
        const message = formatMessage(posts)

        // Enviar via WAHA
        const sendRes = await fetch(`${WAHA_URL}/api/sendText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': WAHA_API_KEY
          },
          body: JSON.stringify({
            session: WAHA_SESSION,
            chatId: schedule.chat_id,
            text: message
          })
        })

        const sendData = await sendRes.json()

        // Registrar log
        await supabase.from('whatsapp_post_logs').insert({
          group_id: schedule.group_id,
          schedule_id: schedule.schedule_id,
          posts_count: posts.length,
          message_preview: message.substring(0, 500),
          status: sendRes.ok ? 'success' : 'failed',
          error_message: sendRes.ok ? null : JSON.stringify(sendData)
        })

        results.push({
          group: schedule.group_name,
          posts: posts.length,
          status: sendRes.ok ? 'success' : 'failed'
        })

      } catch (err) {
        console.error(`Erro no grupo ${schedule.group_name}:`, err)

        await supabase.from('whatsapp_post_logs').insert({
          group_id: schedule.group_id,
          schedule_id: schedule.schedule_id,
          posts_count: 0,
          status: 'failed',
          error_message: err.message
        })

        results.push({
          group: schedule.group_name,
          status: 'failed',
          error: err.message
        })
      }
    }

    return new Response(JSON.stringify({
      processed: matchingSchedules.length,
      results
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

function formatMessage(posts) {
  const header = `*CODE6MM - AIRSOFT MARKETPLACE*\n` +
    `_${posts.length} anuncios ativos_\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  const items = posts.map((p, i) => {
    const price = p.price ? `R$ ${p.price}` : 'Consulte'
    const location = [p.location_city, p.location_state].filter(Boolean).join(' - ')
    const link = `https://code6mm.com.br/posts/${p.id}`

    return `*${i + 1}. ${p.title}*\n` +
      `   ${price}\n` +
      `   ${location}\n` +
      `   ${link}\n`
  }).join('\n')

  const footer = `\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Quer seu anuncio aqui? Cadastre-se em:\n` +
    `https://code6mm.com.br\n\n` +
    `_Mensagem automatica_`

  return header + items + footer
}
```

### 2.3 Variaveis de Ambiente da Edge Function

```env
WAHA_URL=https://seu-waha.ngrok-free.app
WAHA_API_KEY=aac05915d9c2422c87200c51e7f9d15d
WAHA_SESSION=default
```

---

## 3. Cron Job (pg_cron)

### 3.1 Configuracao

Executar no SQL Editor do Supabase:

```sql
-- Habilitar extensao pg_cron (se nao estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Criar job que executa a cada 5 minutos
SELECT cron.schedule(
  'whatsapp-auto-post',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://qkkaamyevwwrqdtpscul.supabase.co/functions/v1/whatsapp-daily-post',
    headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb
  )
  $$
);
```

### 3.2 Gerenciar Cron Jobs

```sql
-- Listar jobs ativos
SELECT * FROM cron.job;

-- Pausar job
SELECT cron.unschedule('whatsapp-auto-post');

-- Ver historico de execucoes
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

---

## 4. Dashboard (Node.js + Express)

### 4.1 Estrutura de Arquivos

```
waha-dashboard/
├── Dockerfile
├── package.json
├── server.js              # Servidor Express com todos endpoints
├── migrations/
│   └── 001_whatsapp_tables.sql
└── public/
    ├── index.html         # Dashboard principal (conexao WhatsApp)
    ├── groups.html        # Gerenciar grupos
    ├── schedules.html     # Gerenciar agendamentos
    └── logs.html          # Visualizar logs
```

### 4.2 Endpoints da API

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/status` | Status da conexao WhatsApp |
| GET | `/api/qr` | Imagem do QR Code |
| POST | `/api/restart` | Reiniciar sessao WhatsApp |
| GET | `/api/groups` | Listar grupos do WhatsApp (WAHA) |
| POST | `/api/send` | Enviar mensagem |
| GET | `/api/posts` | Listar posts ativos |
| GET | `/api/preview-message` | Preview da mensagem |
| **CRUD Grupos** | | |
| GET | `/api/db/groups` | Listar grupos cadastrados |
| POST | `/api/db/groups` | Adicionar grupo |
| PUT | `/api/db/groups/:id` | Atualizar grupo |
| DELETE | `/api/db/groups/:id` | Remover grupo |
| **CRUD Agendamentos** | | |
| GET | `/api/db/schedules` | Listar agendamentos |
| POST | `/api/db/schedules` | Adicionar agendamento |
| PUT | `/api/db/schedules/:id` | Atualizar agendamento |
| DELETE | `/api/db/schedules/:id` | Remover agendamento |
| **Logs** | | |
| GET | `/api/db/logs` | Listar logs |
| GET | `/api/db/logs/:id` | Detalhes do log |
| **Acoes** | | |
| GET | `/api/posts/filtered/:groupId` | Posts filtrados para grupo |
| GET | `/api/message/:groupId` | Mensagem formatada para grupo |
| POST | `/api/send-now/:groupId` | Enviar agora para grupo |

---

## 5. Docker Compose

### 5.1 Configuracao Completa

```yaml
version: '3.8'

services:
  waha:
    image: devlikeapro/waha
    container_name: waha
    ports:
      - "3001:3000"
    environment:
      - WAHA_API_KEY=aac05915d9c2422c87200c51e7f9d15d
      - WAHA_PRINT_QR=false
    volumes:
      - waha_data:/app/.wwebjs_auth
    restart: unless-stopped

  dashboard:
    build: ./waha-dashboard
    container_name: waha-dashboard
    ports:
      - "3002:3002"
    environment:
      - WAHA_URL=http://waha:3000
      - WAHA_API_KEY=aac05915d9c2422c87200c51e7f9d15d
      - SUPABASE_URL=https://qkkaamyevwwrqdtpscul.supabase.co
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    depends_on:
      - waha
    restart: unless-stopped

  ngrok:
    image: ngrok/ngrok:latest
    container_name: ngrok
    command: http waha:3000 --domain=SEU_DOMINIO.ngrok-free.app
    environment:
      - NGROK_AUTHTOKEN=seu_token_aqui
    ports:
      - "4040:4040"
    depends_on:
      - waha
    restart: unless-stopped

volumes:
  waha_data:
```

### 5.2 Comandos Uteis

```bash
# Subir todos os servicos
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reiniciar dashboard
docker-compose restart dashboard

# Rebuild apos mudancas
docker-compose up -d --build dashboard

# Ver URL do Ngrok
curl http://localhost:4040/api/tunnels
```

---

## 6. Ngrok

### 6.1 Configuracao

1. Criar conta em https://ngrok.com
2. Obter authtoken em https://dashboard.ngrok.com/auth
3. (Opcional) Reservar dominio fixo em https://dashboard.ngrok.com/domains

### 6.2 Verificar URL

- Dashboard local: http://localhost:4040
- A URL publica sera algo como: `https://abc123.ngrok-free.app`

### 6.3 Configurar na Edge Function

Apos obter a URL do Ngrok, configurar no Supabase:

```bash
# Via CLI do Supabase
supabase secrets set WAHA_URL=https://abc123.ngrok-free.app
```

---

## 7. Ordem de Implementacao

### Fase 1: Infraestrutura [CONCLUIDO]
- [x] Configurar WAHA via Docker
- [x] Criar dashboard Node.js
- [x] Conectar WhatsApp via QR Code
- [x] Testar envio de mensagens

### Fase 2: Banco de Dados [EM ANDAMENTO]
- [x] Criar arquivo SQL de migracao
- [ ] Executar SQL no Supabase
- [x] Adicionar endpoints CRUD no server.js

### Fase 3: Interface de Gerenciamento [EM ANDAMENTO]
- [x] Criar pagina groups.html
- [x] Criar pagina schedules.html (parcial)
- [ ] Criar pagina logs.html
- [ ] Atualizar index.html com navegacao

### Fase 4: Automacao
- [ ] Criar Edge Function
- [ ] Configurar Ngrok
- [ ] Configurar Cron no Supabase
- [ ] Testar fluxo completo

### Fase 5: Testes e Ajustes
- [ ] Testar filtros por estado/cidade
- [ ] Testar multiplos agendamentos
- [ ] Verificar logs de envio
- [ ] Ajustar formato da mensagem

---

## 8. Credenciais e URLs

### Supabase
- URL: `https://qkkaamyevwwrqdtpscul.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### WAHA
- URL Local: `http://localhost:3001`
- API Key: `aac05915d9c2422c87200c51e7f9d15d`
- Session: `default`

### Dashboard
- URL: `http://localhost:3002`

### Ngrok (a configurar)
- URL Publica: `https://SEU_DOMINIO.ngrok-free.app`
- Dashboard: `http://localhost:4040`

---

## 9. Troubleshooting

### QR Code expira rapido
- O QR Code do WhatsApp expira em ~20 segundos
- Gere um novo QR e escaneie imediatamente

### Grupos nao carregam
- WAHA pode demorar para listar grupos com muitos chats
- Use a funcao de adicionar grupo manualmente

### Erro 401 na WAHA
- Verificar se o header `X-Api-Key` esta correto
- Verificar se a API key no docker-compose esta correta

### Edge Function nao conecta ao WAHA
- Verificar se Ngrok esta rodando
- Verificar URL do Ngrok nas variaveis de ambiente
- Testar URL do Ngrok no navegador

### Cron nao executa
- Verificar se pg_cron esta habilitado
- Verificar se o job esta ativo: `SELECT * FROM cron.job`
- Verificar logs: `SELECT * FROM cron.job_run_details`

---

## 10. Proximos Passos

1. **Executar SQL no Supabase**: Copiar conteudo de `migrations/001_whatsapp_tables.sql` e executar no SQL Editor
2. **Finalizar interfaces**: Completar schedules.html e criar logs.html
3. **Configurar Ngrok**: Obter token e configurar no docker-compose
4. **Deploy Edge Function**: Criar e publicar a funcao no Supabase
5. **Configurar Cron**: Criar o job de execucao a cada 5 minutos
6. **Testar**: Realizar testes completos do fluxo
