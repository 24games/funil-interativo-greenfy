# 🔒 Evidências de Idempotência - Webhook Flow

## 📋 Objetivo

Garantir que retries do webhook Flow não enviem Purchase duas vezes para o Meta CAPI.

## ✅ Implementação

### 1. UNIQUE Constraint no Supabase

**Constraint:** `UNIQUE(provider, flow_order_id)`

- `provider = 'flow'` (fixo para pagamentos Flow)
- `flow_order_id = commerceOrder` (ID único do pedido)

**SQL:**
```sql
ALTER TABLE tracking_sqd_cas_lp1_vsl_hackermillon_purchase
ADD CONSTRAINT unique_provider_flow_order_id 
UNIQUE (provider, flow_order_id);
```

### 2. Lógica de Idempotência no Webhook

**Fluxo:**
1. Webhook recebe token do Flow
2. Valida pagamento (status === 2)
3. Tenta INSERT no Supabase com `provider='flow'` e `flow_order_id=commerceOrder`
4. **Se INSERT sucesso:**
   - `isNewPurchase = true`
   - Envia Purchase para Meta CAPI
5. **Se UNIQUE violation (409):**
   - Busca registro existente
   - `isNewPurchase = false`
   - **NÃO envia Purchase para Meta**

## 🧪 Teste de Idempotência

### Cenário: Retry do Webhook

#### 1ª Chamada (INSERT novo):

**Request:**
```bash
curl -X POST https://hackermillon.online/api/webhook-flow \
  -H "Content-Type: application/json" \
  -d '{"token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "data": {
    "flow_order_id": "order_1736028000000_abc123",
    "purchase": {
      "saved": true,
      "id": "uuid-do-registro",
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

**Evidência no Supabase:**
```sql
SELECT 
  id,
  provider,
  flow_order_id,
  created_at
FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
WHERE provider = 'flow' 
  AND flow_order_id = 'order_1736028000000_abc123';
```

**Resultado:** 1 row retornado

---

#### 2ª Chamada (mesmo token - retry):

**Request:** (mesmo token)
```bash
curl -X POST https://hackermillon.online/api/webhook-flow \
  -H "Content-Type: application/json" \
  -d '{"token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "data": {
    "flow_order_id": "order_1736028000000_abc123",
    "purchase": {
      "saved": true,
      "id": "uuid-do-registro", // MESMO ID da 1ª chamada
      "is_new": false, // ← CRÍTICO: indica que já existia
      "idempotency": "existing_record" // ← CRÍTICO
    },
    "meta": {
      "sent": false, // ← CRÍTICO: NÃO enviou Purchase
      "events_received": null,
      "error": "Purchase não enviado - registro já existia (idempotência)"
    }
  }
}
```

**Evidência no Supabase:**
```sql
SELECT 
  id,
  provider,
  flow_order_id,
  created_at
FROM tracking_sqd_cas_lp1_vsl_hackermillon_purchase
WHERE provider = 'flow' 
  AND flow_order_id = 'order_1736028000000_abc123';
```

**Resultado:** Ainda 1 row (não criou duplicata)

**Evidência no Events Manager (Meta):**
- Verificar eventos com `event_id = order_1736028000000_abc123`
- **Resultado esperado:** 1 evento apenas (não 2)

---

## 📊 Logs Esperados

### 1ª Chamada (INSERT novo):
```
💾 Tentando salvar venda no Supabase (com idempotência): { provider: 'flow', flow_order_id: 'order_...' }
✅ Venda salva no Supabase (INSERT novo): { id: 'uuid', flow_order_id: 'order_...' }
✅ Purchase salvo (INSERT novo) - Purchase será enviado para Meta
✅ Evento Purchase enviado com sucesso para Facebook (INSERT novo): { events_received: 1 }
```

### 2ª Chamada (retry):
```
💾 Tentando salvar venda no Supabase (com idempotência): { provider: 'flow', flow_order_id: 'order_...' }
⚠️ Conflito UNIQUE detectado - registro já existe, buscando existente...
✅ Registro existente encontrado (idempotência): { id: 'uuid', flow_order_id: 'order_...' }
⚠️ Purchase já existia (idempotência) - Purchase NÃO será enviado para Meta novamente
⚠️ Purchase NÃO enviado para Meta (idempotência - registro já existia)
```

---

## ✅ Checklist de Validação

- [ ] UNIQUE constraint criada no Supabase
- [ ] 1ª chamada do webhook: INSERT sucesso + Purchase enviado para Meta
- [ ] 2ª chamada do webhook: UNIQUE violation + Purchase NÃO enviado
- [ ] Query no Supabase: apenas 1 row por (provider='flow', flow_order_id)
- [ ] Events Manager: apenas 1 evento Purchase com mesmo event_id

---

## 🔍 Query de Verificação

```sql
-- Verifica se há duplicatas (deve retornar 0 rows)
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

---

## 📝 Notas

- A constraint UNIQUE impede duplicatas no banco
- A lógica de idempotência impede envio duplicado para Meta
- Retries do webhook são seguros (não causam Purchase duplicado)

