# 🔄 Integração Flow.cl - Guia de Implementação

## 📋 Visão Geral

Esta integração implementa dois endpoints serverless para processar pagamentos via Flow.cl:

1. **`/api/create-flow-payment`** - Cria transação no Flow e retorna URL de pagamento
2. **`/api/webhook-flow`** - Recebe confirmação do Flow, salva no banco e envia para Meta CAPI

---

## 🔧 Configuração de Variáveis de Ambiente

Configure no Vercel (Settings → Environment Variables):

```env
# Flow.cl
FLOW_API_KEY=sua_api_key_aqui
FLOW_SECRET_KEY=sua_secret_key_aqui

# URLs (opcional - já tem valores padrão)
FLOW_URL_RETURN=https://www.hmagencyia.online/gracias
FLOW_URL_CONFIRMATION=https://www.hmagencyia.online/api/webhook-flow

# Supabase
SUPABASE_URL=https://jhyekbtcywewzrviqlos.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui

# Meta (já configurado)
META_PIXEL_ID=1170692121796734
META_ACCESS_TOKEN=seu_token_aqui
```

---

## 🚀 Como Usar no Front-End React

### **1. Criar Função para Chamar o Endpoint**

No seu componente React (ex: `Step7.jsx` ou onde está o botão de checkout):

```javascript
import { useState } from 'react';

async function createFlowPayment(email, trackingId) {
  try {
    const response = await fetch('/api/create-flow-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,           // Email do cliente
        tracking_id: trackingId, // ID do registro de tracking (UUID)
        amount: 5000,            // Opcional - valor em CLP (padrão: 5000)
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar pagamento');
    }

    const data = await response.json();
    
    // Retorna URL de redirecionamento
    return data.data.redirect_url;
    
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
}
```

### **2. Exemplo Completo de Uso no Componente**

```javascript
import { useState } from 'react';
import { useTracking } from '../utils/tracking'; // Se você tiver hook de tracking

function Step7() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Exemplo: pegar tracking_id do localStorage ou state
  // Você pode adaptar conforme sua lógica
  const trackingId = localStorage.getItem('tracking_id'); // ou do seu state/context
  
  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Coleta email do usuário (do formulário ou state)
      const email = 'cliente@example.com'; // Substitua pela fonte real
      
      // 2. Chama endpoint para criar pagamento
      const redirectUrl = await createFlowPayment(email, trackingId);
      
      // 3. Redireciona para o Flow
      window.location.href = redirectUrl;
      
    } catch (err) {
      setError(err.message);
      console.error('Erro no checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Seu conteúdo do Step 7 */}
      
      <button 
        onClick={handleCheckout}
        disabled={loading}
        className="btn-checkout"
      >
        {loading ? 'Processando...' : 'Comprar Agora'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
```

### **3. Integração com Sistema de Tracking Existente**

Se você já tem o sistema de tracking funcionando, pode pegar o `tracking_id` assim:

```javascript
// Opção A: Se você salva o ID retornado do tracking-pageview
const trackingId = localStorage.getItem('tracking_id');

// Opção B: Se você tem um contexto/state global
const { trackingId } = useTrackingContext();

// Opção C: Se você quer buscar o último registro do usuário
// (mais complexo, requer chamada adicional à API)
```

### **4. Fluxo Completo**

```
1. Usuário preenche formulário no Step 7
   ↓
2. Front-end chama /api/create-flow-payment
   - Envia: { email, tracking_id, amount }
   ↓
3. Backend cria pagamento no Flow.cl
   - Gera commerceOrder único
   - Envia tracking_id no campo "optional"
   - Retorna URL de redirecionamento
   ↓
4. Front-end redireciona usuário para Flow
   - window.location.href = redirectUrl
   ↓
5. Usuário paga no Flow.cl
   ↓
6. Flow.cl chama /api/webhook-flow (webhook)
   - Valida pagamento
   - Busca lead por tracking_id (ou email como fallback)
   - Salva venda no Supabase
   - Envia Purchase para Meta CAPI
   ↓
7. Flow.cl redireciona para /gracias (página de obrigado)
```

---

## 🔍 Endpoints Detalhados

### **POST /api/create-flow-payment**

**Request:**
```json
{
  "email": "cliente@example.com",
  "tracking_id": "uuid-do-registro-tracking",
  "amount": 5000  // Opcional
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Pagamento criado com sucesso",
  "data": {
    "redirect_url": "https://www.flow.cl/payment?token=abc123",
    "token": "abc123",
    "commerce_order": "order_1234567890_xyz"
  }
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Erro ao criar pagamento"
}
```

### **POST /api/webhook-flow**

**Request (do Flow.cl):**
```json
{
  "token": "token_do_pagamento"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processado com sucesso",
  "data": {
    "flow_order_id": "order_1234567890_xyz",
    "status": 2,
    "amount": 5000,
    "lead_match": {
      "found": true,
      "method": "tracking_id",
      "tracking_id": "uuid-do-lead",
      "has_fbp": true,
      "has_fbc": true,
      "has_utms": true
    },
    "purchase": {
      "saved": true,
      "id": "uuid-da-venda"
    },
    "meta": {
      "sent": true,
      "events_received": 1
    }
  }
}
```

---

## 🎯 Lógica de Match (Blindada)

O webhook implementa match em duas camadas:

1. **Prioridade 1: tracking_id do campo `optional`**
   - Lê o JSON do campo `optional` retornado pelo Flow
   - Busca lead na tabela `tracking_sqd_cas_lp1_vsl_hackermillon` pelo UUID
   - **Mais confiável** - link direto com o PageView original

2. **Fallback: email do payer**
   - Se não encontrar por `tracking_id`, busca por email
   - Usa a mesma lógica do webhook Perfect Pay
   - Busca o registro mais recente com aquele email

---

## 📊 Estrutura de Dados

### **Tabela de Vendas** (`tracking_sqd_cas_lp1_vsl_hackermillon_purchase`)

Campos principais:
- `id` (UUID) - ID único da venda
- `flow_order_id` (VARCHAR) - ID do pedido no Flow
- `flow_token` (VARCHAR) - Token do pagamento
- `tracking_id` (UUID, FK) - Link com tabela de tracking
- `amount` (DECIMAL) - Valor da venda
- `currency` (VARCHAR) - Moeda (CLP)
- `status` (INTEGER) - Status do pagamento (2 = Pago)
- `payer_email` (VARCHAR) - Email do comprador
- `payer_name` (VARCHAR) - Nome do comprador
- `raw_data` (JSONB) - Dados completos retornados pelo Flow
- `created_at` (TIMESTAMPTZ) - Data de criação

---

## 🐛 Troubleshooting

### **Erro: "FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias"**
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Certifique-se de que o deploy foi feito após adicionar as variáveis

### **Erro: "SUPABASE_SERVICE_ROLE_KEY não configurada"**
- Adicione a `SUPABASE_SERVICE_ROLE_KEY` nas variáveis de ambiente
- Esta chave é necessária para salvar vendas (bypassa RLS)

### **Match não encontrado**
- Verifique se o `tracking_id` está sendo enviado corretamente no `create-flow-payment`
- Verifique se o registro existe na tabela de tracking
- Verifique logs do webhook para ver qual método de match foi usado

### **Pagamento não aparece no Meta Events Manager**
- Verifique se `META_ACCESS_TOKEN` está válido
- Verifique logs do webhook para ver se houve erro no envio
- Certifique-se de que o lead foi encontrado (FBP/FBC são críticos)

---

## ✅ Checklist de Implementação

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Endpoints deployados e testados
- [ ] Função `createFlowPayment` implementada no front-end
- [ ] Botão de checkout integrado com a função
- [ ] `tracking_id` sendo capturado e enviado corretamente
- [ ] Teste de fluxo completo (criação → pagamento → webhook)
- [ ] Verificação de vendas no Supabase
- [ ] Verificação de eventos no Meta Events Manager

---

**Desenvolvido para:** Integração Flow.cl  
**Data:** Dezembro 2025  
**Versão:** 1.0.0









