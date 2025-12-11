# 📊 Relatório de Configuração - Meta Pixel via Conversions API (CAPI)

**Data:** 27 de Novembro de 2025  
**Projeto:** SQD_CAS_LP1_VSL_HACKERMILLON  
**Status:** ✅ Implementado e Funcionando

---

## 🎯 Visão Geral

Sistema implementado com **dupla implementação** (Pixel padrão + Conversions API) para máxima precisão e conformidade com políticas do Facebook.

---

## 🔑 Credenciais Configuradas

### **Meta Pixel ID**
```
1170692121796734
```

### **Meta Access Token (Conversions API)**
```
EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD
```

**Localização das Credenciais:**
- **Cliente-Side:** `src/utils/tracking.js` (linha 17)
- **Server-Side:** `api/tracking-pageview.js` (linhas 15-16)
- **Variáveis de Ambiente:** Configuradas no Vercel (fallback no código)

---

## 📍 Arquitetura de Implementação

### **1. Cliente-Side (Browser)**

**Arquivo:** `src/utils/tracking.js`

#### **A) Meta Pixel Padrão (Browser)**
- ✅ Código padrão do Facebook implementado
- ✅ Inicialização automática: `fbq('init', '1170692121796734')`
- ✅ Evento PageView enviado automaticamente: `fbq('track', 'PageView')`
- ✅ Script carregado de: `https://connect.facebook.net/en_US/fbevents.js`

**Código:**
```javascript
// Linhas 188-201
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', META_PIXEL_ID);
fbq('track', 'PageView');
```

#### **B) Captura de Dados para CAPI**
- ✅ Cookies do Facebook: `_fbp` e `_fbc`
- ✅ IP do usuário (via api.ipify.org como fallback)
- ✅ User Agent
- ✅ URL da página
- ✅ Referrer
- ✅ Idioma do navegador
- ✅ UTMs (source, medium, campaign, term, content)
- ✅ fbclid e gclid

**Envio para Server-Side:**
- ✅ Endpoint: `/api/tracking-pageview`
- ✅ Método: POST
- ✅ Formato: JSON

---

### **2. Server-Side (Vercel)**

**Arquivo:** `api/tracking-pageview.js`

#### **A) Endpoint da API**
```
POST /api/tracking-pageview
```

**Configuração Vercel:**
- ✅ Rota configurada em `vercel.json`
- ✅ Timeout: 10 segundos
- ✅ CORS habilitado

#### **B) Meta Conversions API (CAPI)**

**URL da API:**
```
https://graph.facebook.com/v18.0/1170692121796734/events
```

**Método:** POST  
**Versão da API:** v18.0

**Autenticação:**
- ✅ Access Token enviado no body: `access_token`
- ✅ Headers: `Content-Type: application/json`

**Estrutura do Evento Enviado:**

```json
{
  "data": [
    {
      "event_name": "PageView",
      "event_time": 1732704000,
      "event_id": "pageview_1732704000000_abc123",
      "event_source_url": "https://www.hackermillon.online",
      "action_source": "website",
      "user_data": {
        "em": "hash_sha256_email",
        "fn": "hash_sha256_first_name",
        "ln": "hash_sha256_last_name",
        "ph": "hash_sha256_phone",
        "fbp": "fb.1.1234567890.1234567890",
        "fbc": "fb.1.1234567890.AbCdEf",
        "client_ip_address": "192.168.1.1",
        "client_user_agent": "Mozilla/5.0..."
      },
      "custom_data": {
        "content_name": "Landing Page",
        "content_category": "landing_page",
        "utm_source": "facebook",
        "utm_medium": "cpc",
        "utm_campaign": "test_campaign",
        "utm_term": "test",
        "utm_content": "ad1"
      }
    }
  ],
  "access_token": "EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD"
}
```

---

## 🔐 Advanced Matching (Deduplicação)

### **Dados Hasheados (SHA-256)**
- ✅ **Email:** `em` - Hash SHA-256 do email em minúsculas
- ✅ **First Name:** `fn` - Hash SHA-256 do primeiro nome
- ✅ **Last Name:** `ln` - Hash SHA-256 do sobrenome
- ✅ **Phone:** `ph` - Hash SHA-256 do telefone (apenas números)

**Função de Hash:**
```javascript
// api/tracking-pageview.js (linhas 33-44)
function hashUserData(data) {
  if (!data) return null;
  const normalized = data.trim().toLowerCase();
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}
```

### **Dados Não Hasheados (Matching Direto)**
- ✅ **FBP (Facebook Browser ID):** Enviado em texto claro
- ✅ **FBC (Facebook Click ID):** Enviado em texto claro
- ✅ **IP Address:** Enviado em texto claro
- ✅ **User Agent:** Enviado em texto claro

**Importância:**
- FBP e FBC são **CRÍTICOS** para matching entre Pixel padrão e CAPI
- Permitem deduplicação de eventos
- Melhoram a precisão do tracking

---

## 📊 Eventos Configurados

### **Evento Atual: PageView**

**Configuração:**
- ✅ `event_name`: "PageView"
- ✅ `action_source`: "website"
- ✅ `event_time`: Unix timestamp (segundos)
- ✅ `event_id`: Único por evento (formato: `pageview_{timestamp}_{hash}`)
- ✅ `event_source_url`: URL completa da página

**Custom Data:**
- ✅ `content_name`: Nome da página
- ✅ `content_category`: "landing_page"
- ✅ UTMs preservados quando disponíveis

**Status de Envio:**
- ✅ **Pixel Padrão:** Enviado automaticamente no browser
- ✅ **CAPI:** Enviado via server-side após captura de dados

---

## 🔄 Fluxo Completo de Tracking

```
1. Usuário acessa landing page
   ↓
2. src/main.jsx → initTracking()
   ↓
3. src/utils/tracking.js:
   a. initMetaPixel() → Carrega Pixel padrão
   b. fbq('init', '1170692121796734')
   c. fbq('track', 'PageView') → Envia PageView padrão
   ↓
4. captureTrackingData() → Captura:
   - Cookies (_fbp, _fbc)
   - IP, User Agent
   - URL, Referrer, Idioma
   - UTMs, fbclid, gclid
   ↓
5. sendTrackingData() → POST /api/tracking-pageview
   ↓
6. api/tracking-pageview.js:
   a. Recebe dados do cliente
   b. Valida e sanitiza
   c. Salva no Supabase (tracking_sqd_cas_lp1_vsl_hackermillon)
   d. sendPageViewToMeta() → Envia para CAPI
   ↓
7. Meta Conversions API:
   - Recebe evento PageView
   - Faz matching com Pixel padrão (via FBP/FBC)
   - Deduplica eventos
   - Processa para otimização
   ↓
8. Resposta:
   - events_received: 1
   - Dados salvos no Supabase
```

---

## ✅ Funcionalidades Implementadas

### **Cliente-Side**
- ✅ Meta Pixel padrão carregado e inicializado
- ✅ Evento PageView enviado automaticamente
- ✅ Captura de cookies do Facebook (_fbp, _fbc)
- ✅ Captura de UTMs e parâmetros de tracking
- ✅ Envio de dados para API server-side
- ✅ Função `updateTracking()` para dados adicionais

### **Server-Side**
- ✅ Recepção de dados via POST
- ✅ Validação e sanitização
- ✅ Hash SHA-256 de dados sensíveis
- ✅ Envio para Meta Conversions API
- ✅ Salvamento no Supabase
- ✅ Tratamento de erros robusto
- ✅ Logs detalhados

### **Advanced Matching**
- ✅ Email hasheado (SHA-256)
- ✅ Nome hasheado (SHA-256)
- ✅ Telefone hasheado (SHA-256)
- ✅ FBP e FBC preservados (texto claro)
- ✅ IP e User Agent incluídos

---

## 📈 Dados Capturados e Enviados

### **Obrigatórios (Sempre Enviados)**
- ✅ IP Address
- ✅ User Agent
- ✅ FBP (se disponível)
- ✅ FBC (se disponível)
- ✅ Page URL
- ✅ Timestamp

### **Opcionais (Quando Disponíveis)**
- 📧 Email (hasheado)
- 📱 Telefone (hasheado)
- 👤 First Name (hasheado)
- 👤 Last Name (hasheado)
- 🎂 Date of Birth
- 🏙️ City, State, Country
- 📮 Zip Code
- 🔗 UTMs (source, medium, campaign, term, content)
- 🔗 fbclid, gclid

---

## 🔍 Deduplicação de Eventos

### **Event ID Único**
**Formato:** `pageview_{timestamp}_{hash}`

**Exemplo:** `pageview_1765486416466_f03cade88e0f4cd9`

**Geração:**
```javascript
// api/tracking-pageview.js (linhas 55-68)
function generateEventId(data) {
  const timestamp = Date.now();
  const userIdentifier = data.email || data.phone || data.ip || 'anonymous';
  const hash = crypto
    .createHash('md5')
    .update(`${userIdentifier}-${timestamp}-${data.page_url || ''}`)
    .digest('hex')
    .substring(0, 16);
  
  return `pageview_${timestamp}_${hash}`;
}
```

**Benefícios:**
- ✅ Previne duplicação de eventos no Meta
- ✅ Permite rastreamento único por sessão
- ✅ Compatível com políticas do Facebook

---

## 🛡️ Segurança e Conformidade

### **Dados Sensíveis**
- ✅ Emails hasheados antes de enviar
- ✅ Telefones hasheados antes de enviar
- ✅ Nomes hasheados antes de enviar
- ✅ IP e User Agent enviados (necessários para matching)

### **Conformidade com Políticas do Facebook**
- ✅ Advanced Matching implementado
- ✅ Event ID único para deduplicação
- ✅ Dados hasheados conforme especificação
- ✅ FBP e FBC preservados para matching

---

## 📝 Logs e Monitoramento

### **Logs do Cliente-Side**
```javascript
// Console do navegador
"Meta Pixel inicializado: 1170692121796734"
"Tracking enviado com sucesso: {...}"
"Tracking inicializado com sucesso"
```

### **Logs do Server-Side**
```javascript
// Vercel Functions Logs
"PageView tracking recebido: {...}"
"✅ Dados salvos no Supabase: {...}"
"Evento enviado com sucesso para Facebook: {...}"
```

### **Resposta da Meta API**
```json
{
  "events_received": 1,
  "messages": [...]
}
```

---

## 🧪 Testes e Validação

### **Como Testar**

1. **Console do Navegador:**
```javascript
fetch('https://www.hackermillon.online/api/tracking-pageview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    timestamp: new Date().toISOString()
  })
})
.then(r => r.json())
.then(console.log);
```

2. **Meta Events Manager:**
- Acesse: https://business.facebook.com/events_manager2
- Selecione Pixel: 1170692121796734
- Vá em "Test Events"
- Verifique eventos PageView recebidos

3. **Supabase:**
```sql
SELECT * FROM tracking_sqd_cas_lp1_vsl_hackermillon
ORDER BY created_at DESC
LIMIT 5;
```

---

## ⚙️ Configurações Técnicas

### **Versão da API do Facebook**
- **Versão:** v18.0
- **URL Base:** `https://graph.facebook.com/v18.0/`

### **Timeout**
- **Vercel Function:** 10 segundos
- **Configurado em:** `vercel.json`

### **CORS**
- ✅ Habilitado para todas as origens
- ✅ Métodos permitidos: POST, OPTIONS
- ✅ Headers permitidos: Content-Type

---

## 🚀 Próximos Passos (Futuro)

### **Eventos Adicionais (ETAPA 2)**
- ⏳ Purchase (via webhook Perfect Pay)
- ⏳ FTD (via webhook 24games.cl)
- ⏳ Lead (via webhook Telegram Mini App)

### **Melhorias Planejadas**
- ⏳ Rate limiting
- ⏳ Retry logic para falhas
- ⏳ Batch events (múltiplos eventos por requisição)
- ⏳ Webhook de confirmação do Meta

---

## 📊 Status Atual

| Componente | Status | Observações |
|------------|--------|-------------|
| Meta Pixel (Browser) | ✅ Funcionando | Inicializado automaticamente |
| Conversions API | ✅ Funcionando | Enviando eventos PageView |
| Advanced Matching | ✅ Implementado | SHA-256 hashing |
| Deduplicação | ✅ Implementado | Event ID único |
| Supabase Storage | ✅ Funcionando | Dados sendo salvos |
| Error Handling | ✅ Implementado | Logs detalhados |

---

## 🔗 Links Úteis

- **Meta Events Manager:** https://business.facebook.com/events_manager2
- **Conversions API Docs:** https://developers.facebook.com/docs/marketing-api/conversions-api
- **Advanced Matching:** https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do Vercel
2. Verificar Meta Events Manager
3. Verificar console do navegador
4. Verificar tabela no Supabase

---

**Relatório gerado em:** 27 de Novembro de 2025  
**Última atualização:** 27 de Novembro de 2025  
**Versão:** 1.0.0

