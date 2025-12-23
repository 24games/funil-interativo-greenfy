# 📊 Documentação - Sistema de Tracking ETAPA 1 (PageView)

## 🎯 Visão Geral

Sistema completo de tracking server-side para captura de PageView, otimizado para match futuro com eventos de conversão (ETAPA 2).

**Status:** ✅ Implementado e pronto para uso

---

## 📋 Componentes Implementados

### 1. **Schema do Banco de Dados (Supabase)**
- ✅ Tabela: `tracking_SQD_CAS_LP1_VSL_HACKERMILLON`
- ✅ Índices otimizados para match futuro
- ✅ Estrutura preparada para ETAPA 2

### 2. **API Route (Vercel)**
- ✅ Endpoint: `/api/tracking-pageview`
- ✅ Integração com Supabase
- ✅ Integração com Meta Conversions API (CAPI)
- ✅ Validação e sanitização de dados

### 3. **Script Cliente-Side**
- ✅ Captura automática de dados
- ✅ Meta Pixel integrado
- ✅ Envio para API server-side

---

## 🔧 Configuração

### **Variáveis de Ambiente (Vercel)**

Configure as seguintes variáveis no painel do Vercel:

```env
# Meta Pixel
META_PIXEL_ID=1170692121796734
META_ACCESS_TOKEN=EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD

# Supabase Connection String
SUPABASE_CONNECTION_STRING=postgresql://postgres.jhyekbtcywewzrviqlos:XhoB5znX17qpM7WG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### **Configuração no Código**

#### 1. **API Route** (`api/tracking-pageview.js`)

Linhas 10-13: Configure as credenciais Meta e Supabase:

```javascript
const META_PIXEL_ID = process.env.META_PIXEL_ID || 'SEU_PIXEL_ID';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'SEU_ACCESS_TOKEN';
const SUPABASE_CONNECTION_STRING = process.env.SUPABASE_CONNECTION_STRING || 'SUA_CONNECTION_STRING';
const TABLE_NAME = 'tracking_SQD_CAS_LP1_VSL_HACKERMILLON';
```

#### 2. **Script Cliente-Side** (`src/utils/tracking.js`)

Linhas 12-15: Configure o Pixel ID e endpoint:

```javascript
const META_PIXEL_ID = '1170692121796734';
const API_ENDPOINT = process.env.VITE_API_ENDPOINT || '/api/tracking-pageview';
```

---

## 🚀 Como Usar

### **Integração Automática**

O tracking já está integrado no `src/main.jsx` e será inicializado automaticamente quando a aplicação carregar.

### **Captura de Dados Adicionais**

Se você coletar email, telefone ou outros dados durante o funil, use a função `updateTracking()`:

```javascript
import { updateTracking } from './utils/tracking';

// Exemplo: quando o usuário preenche um formulário
const handleFormSubmit = async (formData) => {
  await updateTracking({
    email: formData.email,
    phone: formData.phone,
    first_name: formData.firstName,
    last_name: formData.lastName,
    city: formData.city,
    state: formData.state,
    country: formData.country,
    date_of_birth: formData.birthDate, // Formato: YYYY-MM-DD
  });
};
```

---

## 📊 Dados Capturados Automaticamente

### **Obrigatórios (sempre capturados)**
- ✅ `ip` - Endereço IP do usuário
- ✅ `user_agent` - User Agent do navegador
- ✅ `fbp` - Cookie _fbp do Facebook (se disponível)
- ✅ `fbc` - Cookie _fbc do Facebook (se disponível)
- ✅ `page_url` - URL completa da página
- ✅ `referrer` - URL de referência
- ✅ `language` - Idioma do navegador
- ✅ `timestamp` - Data/hora do evento

### **UTMs e Tracking (capturados da URL)**
- ✅ `utm_source`
- ✅ `utm_medium`
- ✅ `utm_campaign`
- ✅ `utm_term`
- ✅ `utm_content`
- ✅ `fbclid` - Facebook Click ID
- ✅ `gclid` - Google Click ID

### **Dados Pessoais (quando disponíveis via updateTracking)**
- 📧 `email`
- 📱 `phone`
- 👤 `first_name`
- 👤 `last_name`
- 🎂 `date_of_birth` (formato: YYYY-MM-DD)
- 🏙️ `city`
- 🗺️ `state`
- 🌍 `country` (código ISO: BR, CL, etc.)
- 📮 `zip_code`

---

## 🔍 Estrutura do Banco de Dados

### **Tabela: `tracking_SQD_CAS_LP1_VSL_HACKERMILLON`**

#### **Campos Principais**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único do registro |
| `email` | VARCHAR(255) | Email (chave para match ETAPA 2) |
| `phone` | VARCHAR(50) | Telefone (chave para match ETAPA 2) |
| `ip` | VARCHAR(45) | Endereço IP |
| `user_agent` | TEXT | User Agent |
| `fbp` | VARCHAR(255) | Facebook Browser ID (CRÍTICO) |
| `fbc` | VARCHAR(255) | Facebook Click ID (CRÍTICO) |
| `event_id` | VARCHAR(255) | ID único do evento (deduplicação) |
| `timestamp` | TIMESTAMPTZ | Data/hora do evento |
| `sent_to_meta` | BOOLEAN | Status de envio para Meta CAPI |
| `meta_response` | JSONB | Resposta da Meta API |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Data de atualização |

#### **Índices para Match Futuro**

1. **`idx_tracking_email`** - Match por email (principal)
2. **`idx_tracking_phone`** - Match por telefone (secundário)
3. **`idx_tracking_fb_cookies`** - Match por FBP + FBC (Facebook)
4. **`idx_tracking_ip_ua_time`** - Match por IP + User Agent + Timestamp
5. **`idx_tracking_event_id`** - Deduplicação de eventos
6. **`idx_tracking_timestamp`** - Análises temporais
7. **`idx_tracking_utms`** - Análise de campanhas

---

## 🔄 Fluxo Completo

```
1. Usuário acessa a landing page
   ↓
2. Script cliente-side (tracking.js) captura dados automaticamente
   ↓
3. Meta Pixel é inicializado (código padrão)
   ↓
4. Dados são enviados para /api/tracking-pageview (POST)
   ↓
5. API server-side:
   a. Valida e sanitiza dados
   b. Salva no Supabase (tabela tracking_SQD_CAS_LP1_VSL_HACKERMILLON)
   c. Envia evento PageView para Meta Conversions API (CAPI)
   d. Retorna confirmação
   ↓
6. Dados ficam disponíveis no Supabase para match futuro (ETAPA 2)
```

---

## 🎯 Match Futuro (ETAPA 2)

A estrutura foi otimizada para permitir match eficiente entre PageView (ETAPA 1) e eventos de conversão (ETAPA 2).

### **Chaves de Match Disponíveis:**

1. **Email** (principal) - Mais confiável
2. **Telefone** (secundário) - Backup quando email não disponível
3. **FBP + FBC** (Facebook) - Para matching com Meta CAPI
4. **IP + User Agent + Timestamp** (janela de tempo) - Quando dados pessoais não disponíveis

### **Exemplo de Query para Match (ETAPA 2):**

```sql
-- Match por email
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE email = 'usuario@example.com'
ORDER BY timestamp DESC
LIMIT 1;

-- Match por telefone
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE phone = '+5511999999999'
ORDER BY timestamp DESC
LIMIT 1;

-- Match por FBP + FBC (Facebook)
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
WHERE fbp = 'fb.1.1234567890.1234567890'
  AND fbc = 'fb.1.1234567890.AbCdEfGhIj'
ORDER BY timestamp DESC
LIMIT 1;
```

---

## 🧪 Testando

### **1. Testar Captura de Dados**

Abra o console do navegador e verifique os logs:
- ✅ "Meta Pixel inicializado: 1170692121796734"
- ✅ "Tracking enviado com sucesso: {...}"
- ✅ "Tracking inicializado com sucesso"

### **2. Testar API Endpoint**

```bash
curl -X POST https://seu-dominio.vercel.app/api/tracking-pageview \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "page_url": "https://seu-dominio.com",
    "fbp": "fb.1.1234567890.1234567890"
  }'
```

### **3. Verificar no Supabase**

Acesse o painel do Supabase e verifique a tabela `tracking_SQD_CAS_LP1_VSL_HACKERMILLON`:

```sql
SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON
ORDER BY created_at DESC
LIMIT 10;
```

### **4. Verificar Meta Events Manager**

Acesse o [Meta Events Manager](https://business.facebook.com/events_manager2) e verifique se os eventos PageView estão sendo recebidos.

---

## 🔒 Segurança

### **Dados Sensíveis**

- ✅ IPs são capturados mas podem ser anonimizados se necessário
- ✅ Emails e telefones são hasheados antes de enviar para Meta CAPI
- ✅ Connection string do Supabase deve estar em variáveis de ambiente

### **Recomendações**

1. **Nunca** commite credenciais no código
2. Use variáveis de ambiente para todas as credenciais
3. Configure CORS adequadamente no Vercel
4. Considere rate limiting para prevenir abuso

---

## 📝 Adaptar para Nova Landing Page

### **1. Criar Nova Tabela**

Execute uma migration no Supabase com nome da tabela específico:

```sql
CREATE TABLE tracking_PROJETO_LP_NOME (
  -- Mesma estrutura da tabela original
  ...
);
```

### **2. Atualizar API Route**

Altere a constante `TABLE_NAME` em `api/tracking-pageview.js`:

```javascript
const TABLE_NAME = 'tracking_PROJETO_LP_NOME';
```

### **3. Configurar Variáveis de Ambiente**

Configure novas variáveis no Vercel se necessário (novo Pixel ID, etc.)

---

## 🐛 Troubleshooting

### **Erro: "META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios"**

**Solução:** Configure as variáveis de ambiente no Vercel.

### **Erro: "Formato de connection string inválido"**

**Solução:** Verifique se a `SUPABASE_CONNECTION_STRING` está correta e usa o formato Session mode.

### **Erro: "Facebook API Error"**

**Solução:** 
- Verifique se o Pixel ID está correto
- Verifique se o Access Token está válido
- Verifique se o Access Token tem permissões para Conversions API

### **Tracking não está sendo enviado**

**Solução:**
1. Abra o console do navegador e verifique erros
2. Verifique se o endpoint `/api/tracking-pageview` está acessível
3. Verifique a Network tab do DevTools para ver requisições

### **Dados não aparecem no Supabase**

**Solução:**
1. Verifique logs do Vercel
2. Verifique se a tabela existe
3. Verifique se a connection string está correta
4. Verifique permissões RLS (Row Level Security) no Supabase

---

## 📚 Recursos

- [Meta Conversions API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

## ✅ Checklist de Implementação

- [x] Schema do banco de dados criado
- [x] API route implementada
- [x] Script cliente-side criado
- [x] Meta Pixel integrado
- [x] Meta CAPI integrado
- [x] Integração com Supabase
- [x] Índices otimizados para match
- [x] Documentação completa
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Testes realizados
- [ ] Monitoramento configurado

---

## 🎉 Próximos Passos (ETAPA 2)

Quando implementar a ETAPA 2, você poderá:

1. **Criar webhooks** para eventos de conversão (Purchase/FTD/Lead)
2. **Fazer match** com dados da ETAPA 1 usando as chaves de match
3. **Enviar eventos de conversão** para Meta CAPI com dados completos
4. **Atribuir corretamente** conversões às campanhas originais

---

**Desenvolvido para:** SQD_CAS_LP1_VSL_HACKERMILLON  
**Data:** Novembro 2025  
**Versão:** 1.0.0



























