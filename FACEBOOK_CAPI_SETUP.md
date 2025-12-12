# 🎯 Facebook Conversions API (CAPI) - Setup Completo

Este guia explica como configurar o rastreamento Server-Side do Facebook Ads para eventos de Purchase.

## 📋 O que foi implementado

✅ Endpoint `/api/webhook-purchase` para receber webhooks do checkout  
✅ Hash SHA-256 dos dados do usuário (Advanced Matching)  
✅ Envio de eventos Purchase para Facebook Conversions API  
✅ Suporte para `fbp` e `fbc` (cookies de rastreamento)  
✅ Tratamento de erros e logs detalhados  
✅ Validação de dados obrigatórios  

---

## 🚀 Como Configurar

### 1. Obter Credenciais do Facebook

#### A. Pixel ID
1. Acesse: https://business.facebook.com/events_manager2
2. Selecione seu Pixel
3. Copie o **Pixel ID** (ex: `123456789012345`)

#### B. Access Token (Token de Longa Duração)
1. Acesse: https://developers.facebook.com/tools/explorer
2. Selecione seu App
3. Gere um **User Token** com permissões:
   - `ads_management`
   - `business_management`
4. Converta para **Long-Lived Token**:
   - Acesse: https://developers.facebook.com/tools/debug/accesstoken/
   - Clique em "Extend Access Token"
5. Copie o token gerado

### 2. Configurar Variáveis de Ambiente

#### Opção A: Vercel (Recomendado)
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   ```
   META_PIXEL_ID = seu_pixel_id
   META_ACCESS_TOKEN = seu_access_token
   ```
4. Faça deploy novamente

#### Opção B: Arquivo Local (Desenvolvimento)
1. Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   META_PIXEL_ID=seu_pixel_id_aqui
   META_ACCESS_TOKEN=seu_access_token_aqui
   ```
2. **NUNCA** faça commit deste arquivo (já está no .gitignore)

---

## 📡 Como Usar o Webhook

### Endpoint
```
POST https://seu-dominio.com/api/webhook-purchase
```

### Payload Esperado

```json
{
  "email": "cliente@exemplo.com",
  "name": "João Silva",
  "phone": "+56912345678",
  "value": 150000,
  "currency": "CLP",
  "orderId": "ORD-12345",
  "fbp": "fb.1.1234567890.123456789",
  "fbc": "fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "sourceUrl": "https://seu-site.com/checkout"
}
```

### Campos Obrigatórios
- `email` OU `phone` (pelo menos um)

### Campos Opcionais
- `name` - Nome completo (será dividido em primeiro nome e sobrenome)
- `value` - Valor da compra (padrão: 0)
- `currency` - Moeda (padrão: "CLP")
- `orderId` - ID único da compra
- `fbp` - Facebook Browser ID (cookie `_fbp`)
- `fbc` - Facebook Click ID (cookie `_fbc`)
- `ipAddress` - IP do cliente
- `userAgent` - User Agent do navegador
- `sourceUrl` - URL de origem da compra

### Exemplo de Resposta de Sucesso

```json
{
  "success": true,
  "message": "Evento Purchase enviado com sucesso para Facebook",
  "facebook_response": {
    "events_received": 1,
    "messages": [
      {
        "id": "1234567890"
      }
    ]
  }
}
```

### Exemplo de Resposta de Erro

```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios"
}
```

---

## 🔧 Configurar Webhook no Checkout

Configure seu checkout externo para enviar POST para:

```
https://seu-dominio.com/api/webhook-purchase
```

### Headers Recomendados
```
Content-Type: application/json
```

### Exemplo de Integração (Node.js)

```javascript
const axios = require('axios');

async function sendPurchaseWebhook(purchaseData) {
  try {
    const response = await axios.post(
      'https://seu-dominio.com/api/webhook-purchase',
      {
        email: purchaseData.email,
        name: purchaseData.name,
        phone: purchaseData.phone,
        value: purchaseData.amount,
        currency: 'CLP',
        orderId: purchaseData.orderId,
        fbp: purchaseData.fbp, // Se disponível
        fbc: purchaseData.fbc, // Se disponível
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Webhook enviado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar webhook:', error.response?.data || error.message);
    throw error;
  }
}
```

---

## 🔍 Como Capturar fbp e fbc no Frontend

Adicione este código no seu frontend para capturar os cookies do Facebook:

```javascript
// Função para capturar cookies do Facebook
function getFacebookCookies() {
  const cookies = document.cookie.split(';');
  const fbCookies = {};
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbp') {
      fbCookies.fbp = value;
    }
    if (name === '_fbc') {
      fbCookies.fbc = value;
    }
  });
  
  return fbCookies;
}

// Exemplo: Enviar para seu backend quando necessário
const { fbp, fbc } = getFacebookCookies();
```

---

## 📊 Verificar se Está Funcionando

### 1. Logs do Vercel
- Acesse: https://vercel.com/seu-projeto/logs
- Procure por mensagens de sucesso/erro

### 2. Facebook Events Manager
- Acesse: https://business.facebook.com/events_manager2
- Vá em **Test Events**
- Verifique se os eventos Purchase estão aparecendo

### 3. Teste Manual

```bash
curl -X POST https://seu-dominio.com/api/webhook-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "name": "Teste Usuario",
    "phone": "+56912345678",
    "value": 1000,
    "currency": "CLP",
    "orderId": "TEST-123"
  }'
```

---

## 🛠️ Troubleshooting

### Erro: "META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios"
- Verifique se as variáveis de ambiente estão configuradas
- No Vercel, certifique-se de fazer redeploy após adicionar variáveis

### Erro: "Facebook API Error"
- Verifique se o Access Token está válido
- Confirme se o Pixel ID está correto
- Verifique permissões do token

### Eventos não aparecem no Events Manager
- Aguarde alguns minutos (pode haver delay)
- Verifique os logs do Vercel
- Confirme que os dados estão sendo hasheados corretamente

---

## 🔐 Segurança

✅ Dados do usuário são hasheados (SHA-256) antes de enviar  
✅ Variáveis sensíveis em arquivos .env (não commitados)  
✅ Validação de dados obrigatórios  
✅ Tratamento de erros sem expor informações sensíveis  

---

## 📚 Referências

- [Facebook Conversions API Docs](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Advanced Matching](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

## ✅ Checklist de Implementação

- [ ] Obter Pixel ID do Facebook
- [ ] Gerar Access Token de Longa Duração
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Testar endpoint com curl ou Postman
- [ ] Configurar webhook no checkout externo
- [ ] Verificar eventos no Facebook Events Manager
- [ ] Monitorar logs do Vercel

---

**Pronto!** Seu sistema de rastreamento Server-Side do Facebook está configurado! 🎉







