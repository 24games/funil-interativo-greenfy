# 🔗 Configuração Webhook Perfect Pay - Purchase via CAPI

## 📋 Informações do Webhook

**Public Token:** `c0ffab31cf0cde81d7064efda713cefb`

**URL do Webhook:**
```
https://www.hackermillon.online/api/webhook-perfectpay
```

**Método:** POST

---

## 🎯 Como Funciona

### **1. Recebimento do Webhook**
- Perfect Pay envia webhook quando uma compra é aprovada
- Endpoint recebe e valida os dados

### **2. Match com Dados do Lead**
- Busca no Supabase usando **email** ou **telefone** do cliente
- Encontra o registro do PageView original (ETAPA 1)

### **3. Enriquecimento do Evento**
- Combina dados do webhook com dados do lead:
  - **FBP e FBC** do lead (críticos para matching)
  - **UTMs** do lead (atribuição correta)
  - **IP e User Agent** do lead (se não tiver no webhook)

### **4. Envio para Meta CAPI**
- Envia evento **Purchase** com dados completos
- Inclui Advanced Matching (hashes de email, telefone, nome)
- Preserva UTMs para atribuição correta

---

## 📊 Estrutura do Webhook Perfect Pay

### **Campos Principais Extraídos:**

```javascript
{
  code: "PPCPMTB5H72794",              // Order ID
  sale_amount: 39.9,                   // Valor da venda
  currency_enum_key: "BRL",            // Moeda
  sale_status_enum_key: "approved",    // Status (só processa se "approved")
  date_approved: "2025-12-11 15:56:09", // Data de aprovação
  
  customer: {
    email: "rodrigo2arim@gmail.com",
    full_name: "Rodrigo Arim",
    phone_number: "539993543",
    phone_formated: "(55) 53999-3543",
    ip: "177.8.141.8",
    user_agent: "Mozilla/5.0...",
    country: "BR"
  },
  
  product: {
    code: "PPPBDLGP",
    name: "Find Secret"
  },
  
  metadata: {
    utm_source: "instagram_stories",
    utm_medium: null,
    utm_campaign: null
  }
}
```

---

## 🔍 Match com Dados do Lead

### **Estratégia de Match:**

1. **Por Email (prioridade):**
   ```sql
   SELECT * FROM tracking_sqd_cas_lp1_vsl_hackermillon
   WHERE email = 'email_do_cliente'
   ORDER BY timestamp DESC
   LIMIT 1;
   ```

2. **Por Telefone (fallback):**
   ```sql
   SELECT * FROM tracking_sqd_cas_lp1_vsl_hackermillon
   WHERE phone = 'telefone_normalizado'
   ORDER BY timestamp DESC
   LIMIT 1;
   ```

### **Dados Enriquecidos do Lead:**

- ✅ `fbp` - Facebook Browser ID
- ✅ `fbc` - Facebook Click ID
- ✅ `utm_source`, `utm_medium`, `utm_campaign`, etc.
- ✅ `ip` e `user_agent` (se não tiver no webhook)

---

## 📤 Evento Purchase Enviado

### **Estrutura do Evento:**

```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1733925369,
    "event_id": "PPCPMTB5H72794",
    "event_source_url": "https://www.hackermillon.online",
    "action_source": "website",
    "user_data": {
      "em": "hash_sha256_email",
      "fn": "hash_sha256_first_name",
      "ln": "hash_sha256_last_name",
      "ph": "hash_sha256_phone",
      "fbp": "fb.1.1234567890.1234567890",  // Do lead
      "fbc": "fb.1.1234567890.AbCdEf",      // Do lead
      "client_ip_address": "177.8.141.8",
      "client_user_agent": "Mozilla/5.0..."
    },
    "custom_data": {
      "currency": "BRL",
      "value": 39.9,
      "content_type": "product",
      "content_ids": ["PPPBDLGP"],
      "content_name": "Find Secret",
      "order_id": "PPCPMTB5H72794",
      "num_items": 1,
      "utm_source": "instagram_stories",    // Do lead ou webhook
      "utm_campaign": "...",
      "utm_medium": "..."
    }
  }]
}
```

---

## ⚙️ Configuração no Perfect Pay

### **Passos:**

1. Acesse o painel do Perfect Pay
2. Vá em **Configurações** → **Webhooks**
3. Adicione novo webhook:
   - **URL:** `https://www.hackermillon.online/api/webhook-perfectpay`
   - **Eventos:** Selecione "Venda Aprovada" ou "Purchase Approved"
   - **Método:** POST
   - **Formato:** JSON
4. Salve a configuração

### **Validação (Opcional):**

O webhook pode validar o token público se necessário. Atualmente aceita qualquer requisição POST válida.

---

## 🧪 Testar o Webhook

### **1. Teste Manual (cURL):**

```bash
curl -X POST https://www.hackermillon.online/api/webhook-perfectpay \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PPCPMTB5H72794",
    "sale_amount": 39.9,
    "currency_enum_key": "BRL",
    "sale_status_enum_key": "approved",
    "date_approved": "2025-12-11 15:56:09",
    "customer": {
      "email": "teste@example.com",
      "full_name": "Teste Usuario",
      "phone_number": "5511999999999",
      "ip": "192.168.1.100",
      "user_agent": "Mozilla/5.0"
    },
    "product": {
      "code": "PPPBDLGP",
      "name": "Find Secret"
    },
    "metadata": {
      "utm_source": "test"
    }
  }'
```

### **2. Verificar Resposta:**

```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "data": {
    "order_id": "PPCPMTB5H72794",
    "sale_status": "approved",
    "lead_match": {
      "found": true,
      "has_fbp": true,
      "has_fbc": true,
      "has_utms": true
    },
    "meta": {
      "sent": true,
      "events_received": 1,
      "error": null
    }
  }
}
```

---

## ✅ Checklist de Implementação

- [x] API route criada (`api/webhook-perfectpay.js`)
- [x] Rota configurada no `vercel.json`
- [x] Função de match com Supabase implementada
- [x] Enriquecimento com dados do lead
- [x] Envio para Meta Conversions API
- [x] Tratamento de erros
- [ ] Webhook configurado no Perfect Pay
- [ ] Teste realizado com compra real

---

## 🔒 Segurança

- ✅ Validação de status (só processa "approved")
- ✅ Validação de dados obrigatórios (email ou telefone)
- ✅ Dados sensíveis hasheados antes de enviar para Meta
- ✅ Logs detalhados para debug

---

## 📝 Variáveis de Ambiente

Configure no Vercel (opcional, já tem fallback no código):

```env
PERFECT_PAY_PUBLIC_TOKEN=c0ffab31cf0cde81d7064efda713cefb
META_PIXEL_ID=1170692121796734
META_ACCESS_TOKEN=EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD
SUPABASE_URL=https://jhyekbtcywewzrviqlos.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Fluxo Completo

```
1. Cliente faz compra no Perfect Pay
   ↓
2. Perfect Pay aprova a compra
   ↓
3. Perfect Pay envia webhook para /api/webhook-perfectpay
   ↓
4. Webhook valida status "approved"
   ↓
5. Busca dados do lead no Supabase (email/telefone)
   ↓
6. Enriquece evento com dados do lead (FBP, FBC, UTMs)
   ↓
7. Envia evento Purchase para Meta Conversions API
   ↓
8. Meta faz matching com PageView original
   ↓
9. Atribuição correta da conversão à campanha
```

---

**URL do Webhook para configurar no Perfect Pay:**
```
https://www.hackermillon.online/api/webhook-perfectpay
```

**Pronto para uso!** 🚀



























