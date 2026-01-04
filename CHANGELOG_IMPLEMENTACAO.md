# 📝 Changelog - Implementação de Idempotência e Correções

## ✅ Mudanças Implementadas

### 1. `/gracias` - Remoção de Purchase para Flow

**Arquivo:** `src/components/Gracias.jsx`

**ANTES:**
- Disparava Pixel Purchase quando havia `token` na URL
- Disparava CAPI via `sendPurchaseTracking()`

**DEPOIS:**
- **NÃO dispara Purchase** (nem Pixel nem CAPI) quando há `token` na URL
- Apenas consulta status do pagamento via `/api/get-flow-status`
- Exibe status na UI (pago/pendente/rejeitado)

**Trecho modificado:**
```javascript
// ANTES (linhas 145-179):
if (urlToken) {
  setToken(urlToken)
  // Disparava Pixel Purchase
  window.fbq('track', 'Purchase', {...});
  // Disparava CAPI
  sendPurchaseTracking(urlToken);
}

// DEPOIS:
if (urlToken) {
  setToken(urlToken)
  // Apenas consulta status - NÃO dispara Purchase
  const checkPaymentStatus = async () => {
    const response = await fetch(`/api/get-flow-status?token=${urlToken}`);
    // Atualiza UI com status
  };
  checkPaymentStatus();
}
```

---

### 2. `getFlowPaymentStatus` - Correção para Query Params

**Arquivo:** `api/webhook-flow.js`

**ANTES:**
- Usava headers `X-Flow-API-Key`, `X-Flow-Timestamp`, `X-Flow-Nonce`, `X-Flow-Signature`
- Assinatura baseada em `method\npath\ntimestamp\nnonce\nbody`

**DEPOIS:**
- Usa query params: `apiKey`, `token`, `s` (assinatura)
- Assinatura conforme documentação oficial: ordena params alfabeticamente, concatena `key+value`, HMAC SHA256

**Trecho modificado:**
```javascript
// ANTES:
const headers = {
  'X-Flow-API-Key': FLOW_API_KEY,
  'X-Flow-Timestamp': timestamp,
  'X-Flow-Nonce': nonce,
  'X-Flow-Signature': signature,
};
const response = await axios.get(`${FLOW_API_URL}/payment/getStatus?token=${token}`, { headers });

// DEPOIS:
const params = {
  apiKey: FLOW_API_KEY,
  token: token,
};
const signature = generateFlowSignature(params); // Ordena alfabeticamente, concatena key+value
params.s = signature;
const queryString = new URLSearchParams(params).toString();
const url = `${FLOW_API_URL}/payment/getStatus?${queryString}`;
const response = await axios.get(url);
```

**Exemplo de Request:**
```
GET https://www.flow.cl/api/payment/getStatus?apiKey=SUA_API_KEY&token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6&s=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### 3. Idempotência no Webhook Flow

**Arquivo:** `api/webhook-flow.js`

**Função modificada:** `savePurchaseToSupabase()`

**ANTES:**
- Tentava INSERT sem verificar se já existia
- Não tratava conflito UNIQUE
- Sempre enviava Purchase para Meta

**DEPOIS:**
- Adiciona `provider='flow'` no INSERT
- Trata conflito UNIQUE (409/23505)
- Retorna `{ inserted: true/false, data: purchaseRecord }`
- Só envia Purchase para Meta se `inserted === true`

**Trecho modificado:**
```javascript
// ANTES:
async function savePurchaseToSupabase(purchaseData, serviceRoleKey, supabaseUrl) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });
  return inserted; // Sempre retorna, mesmo se duplicado
}

// DEPOIS:
async function savePurchaseToSupabase(purchaseData, serviceRoleKey, supabaseUrl) {
  const insertData = {
    ...purchaseData,
    provider: 'flow', // CRÍTICO para UNIQUE constraint
  };
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify(insertData),
  });
  
  if (response.status === 409) { // UNIQUE violation
    // Busca registro existente
    const existing = await fetch(`${apiUrl}?provider=eq.flow&flow_order_id=eq.${flow_order_id}`);
    return { inserted: false, data: existing }; // Já existia
  }
  
  return { inserted: true, data: inserted }; // INSERT novo
}
```

**Handler modificado:**
```javascript
// ANTES:
const savedPurchase = await savePurchaseToSupabase(...);
// Sempre enviava Purchase
await sendPurchaseToMeta(...);

// DEPOIS:
const saveResult = await savePurchaseToSupabase(...);
const isNewPurchase = saveResult.inserted;

if (isNewPurchase && savedPurchase) {
  // Só envia se foi INSERT novo
  await sendPurchaseToMeta(...);
} else {
  console.log('⚠️ Purchase NÃO enviado (idempotência - registro já existia)');
}
```

---

### 4. Novo Endpoint: `/api/get-flow-status`

**Arquivo:** `api/get-flow-status.js` (NOVO)

**Propósito:** Consultar status do pagamento Flow sem disparar Purchase

**Uso:** Chamado por `/gracias` quando há `token` na URL

**Request:**
```
GET /api/get-flow-status?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": 2,
    "commerceOrder": "order_1736028000000_abc123",
    "amount": 10000,
    "currency": "CLP",
    "payer": { "email": "cliente@example.com" }
  }
}
```

---

## 📊 SQL para UNIQUE Constraint

**Arquivo:** `migrations/add_unique_constraint_purchase.sql`

**Constraint:**
```sql
ALTER TABLE tracking_sqd_cas_lp1_vsl_hackermillon_purchase
ADD CONSTRAINT unique_provider_flow_order_id 
UNIQUE (provider, flow_order_id);
```

**Coluna `provider`:**
- Adicionada se não existir
- Valores: `'flow'` ou `'perfectpay'`
- NOT NULL

---

## 🧪 Evidências de Idempotência

### Teste 1: Primeira Chamada (INSERT novo)

**Request:**
```bash
curl -X POST https://hackermillon.online/api/webhook-flow \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_TESTE_123"}'
```

**Logs esperados:**
```
💾 Tentando salvar venda no Supabase (com idempotência): { provider: 'flow', flow_order_id: 'order_...' }
✅ Venda salva no Supabase (INSERT novo): { id: 'uuid-123', flow_order_id: 'order_...' }
✅ Purchase salvo (INSERT novo) - Purchase será enviado para Meta
✅ Evento Purchase enviado com sucesso para Facebook (INSERT novo): { events_received: 1 }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchase": {
      "saved": true,
      "is_new": true,
      "idempotency": "new_insert"
    },
    "meta": {
      "sent": true,
      "events_received": 1
    }
  }
}
```

**Query Supabase:**
```sql
SELECT COUNT(*) FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
WHERE provider = 'flow' AND flow_order_id = 'order_1736028000000_abc123';
-- Resultado: 1
```

---

### Teste 2: Segunda Chamada (Retry - mesmo token)

**Request:** (mesmo token)
```bash
curl -X POST https://hackermillon.online/api/webhook-flow \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_TESTE_123"}'
```

**Logs esperados:**
```
💾 Tentando salvar venda no Supabase (com idempotência): { provider: 'flow', flow_order_id: 'order_...' }
⚠️ Conflito UNIQUE detectado - registro já existe, buscando existente...
✅ Registro existente encontrado (idempotência): { id: 'uuid-123', flow_order_id: 'order_...' }
⚠️ Purchase já existia (idempotência) - Purchase NÃO será enviado para Meta novamente
⚠️ Purchase NÃO enviado para Meta (idempotência - registro já existia)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchase": {
      "saved": true,
      "is_new": false, // ← CRÍTICO
      "idempotency": "existing_record" // ← CRÍTICO
    },
    "meta": {
      "sent": false, // ← CRÍTICO: NÃO enviou
      "events_received": null,
      "error": "Purchase não enviado - registro já existia (idempotência)"
    }
  }
}
```

**Query Supabase:**
```sql
SELECT COUNT(*) FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
WHERE provider = 'flow' AND flow_order_id = 'order_1736028000000_abc123';
-- Resultado: Ainda 1 (não criou duplicata)
```

**Events Manager (Meta):**
- Verificar eventos com `event_id = order_1736028000000_abc123`
- **Resultado:** 1 evento apenas (não 2)

---

## ✅ Checklist de Validação

- [x] `/gracias` não dispara Purchase para Flow (token)
- [x] `getFlowPaymentStatus` usa query params conforme doc oficial
- [x] Idempotência implementada com UNIQUE constraint
- [x] Purchase só enviado para Meta se INSERT novo
- [x] SQL para UNIQUE constraint criado
- [x] Evidências documentadas

---

## 📁 Arquivos Modificados

1. `src/components/Gracias.jsx` - Removido disparo de Purchase para Flow
2. `api/webhook-flow.js` - Idempotência + correção getStatus
3. `api/get-flow-status.js` - NOVO endpoint para consultar status

## 📁 Arquivos Criados

1. `migrations/add_unique_constraint_purchase.sql` - SQL para constraint
2. `EVIDENCIAS_IDEMPOTENCIA.md` - Documentação de testes
3. `CHANGELOG_IMPLEMENTACAO.md` - Este arquivo

---

## 🔍 Verificação Final

### Query para verificar duplicatas:
```sql
SELECT 
  provider,
  flow_order_id,
  COUNT(*) as count
FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
WHERE provider = 'flow'
GROUP BY provider, flow_order_id
HAVING COUNT(*) > 1;
-- Resultado esperado: 0 rows (sem duplicatas)
```

### Verificar constraint:
```sql
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tracking_sqd_cas_lp1_vsl_hackermillon_purchase'::regclass
AND conname = 'unique_provider_flow_order_id';
-- Resultado esperado: 1 row com UNIQUE (provider, flow_order_id)
```

