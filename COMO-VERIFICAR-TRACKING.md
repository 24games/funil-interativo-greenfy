# 🔍 Como Verificar se o Server-Side Tracking Está Funcionando

## 📊 O que está implementado atualmente

### ✅ O que TEMOS:
- **Endpoint `/api/webhook-purchase`** pronto para receber compras da Perfect Pay
- **Envio de eventos Purchase** para Facebook Conversions API
- **Hash SHA-256** dos dados do usuário (Advanced Matching)
- **Suporte para fbp/fbc** (cookies de rastreamento)

### ❌ O que NÃO temos ainda:
- **Tracking de eventos do funil** (view, click, etc.)
- **Coleta de dados durante navegação** no funil
- **Pixel do Facebook** na landing page

---

## 🎯 IMPORTANTE: Como funciona atualmente

O tracking server-side que implementamos **SÓ FUNCIONA quando há uma COMPRA**:

1. Lead navega pelo funil → **Nenhum dado é coletado ainda**
2. Lead completa a compra na Perfect Pay → **Perfect Pay envia webhook**
3. Webhook chega no nosso endpoint → **Dados são enviados para Facebook**

**As informações só são coletadas quando a Perfect Pay envia o webhook após uma compra!**

---

## ✅ Como Verificar se Está Funcionando

### Método 1: Testar o Endpoint Manualmente

Use o script de teste que já existe:

```bash
node test-webhook.js
```

Ou teste diretamente com cURL:

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

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Evento Purchase enviado com sucesso para Facebook",
  "facebook_response": {
    "events_received": 1
  }
}
```

### Método 2: Verificar Logs do Vercel

1. Acesse: https://vercel.com/seu-projeto/logs
2. Procure por:
   - `"Webhook recebido"` - quando o endpoint recebe dados
   - `"Evento enviado com sucesso"` - quando envia para Facebook
   - `"Facebook API Error"` - se houver erros

### Método 3: Verificar Facebook Events Manager

1. Acesse: https://business.facebook.com/events_manager2
2. Vá em **Test Events** (ou aguarde alguns minutos)
3. Verifique se aparecem eventos **Purchase** com:
   - Source: **Server**
   - Event Name: **Purchase**

### Método 4: Verificar Variáveis de Ambiente

No Vercel:
1. Settings → Environment Variables
2. Verifique se `META_PIXEL_ID` e `META_ACCESS_TOKEN` estão configurados
3. Se não estiverem, o tracking não funcionará

---

## 🚨 Problemas Comuns

### ❌ "Webhook não está sendo chamado"
- **Causa**: Perfect Pay não está configurada para enviar webhooks
- **Solução**: Configure o webhook na Perfect Pay (veja `PERFECT_PAY_WEBHOOK_SETUP.md`)

### ❌ "Eventos não aparecem no Facebook"
- **Causa**: Token inválido ou Pixel ID incorreto
- **Solução**: 
  1. Verifique as variáveis de ambiente no Vercel
  2. Verifique os logs do Vercel para erros
  3. Teste o endpoint manualmente

### ❌ "Erro 400: Email ou telefone é obrigatório"
- **Causa**: Perfect Pay não está enviando email/telefone
- **Solução**: Verifique o formato do payload que a Perfect Pay envia

---

## 📈 Próximos Passos (Opcional)

Se quiser rastrear eventos do funil (não apenas compras):

1. **Adicionar Pixel do Facebook** na landing page
2. **Enviar eventos customizados** (ViewContent, AddToCart, etc.)
3. **Coletar fbp/fbc** durante navegação
4. **Enviar eventos server-side** para cada step do funil

**Isso não é necessário para o tracking de compras funcionar!**

---

## ✅ Checklist de Verificação

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Endpoint testado manualmente (retorna sucesso)
- [ ] Logs do Vercel mostram requisições
- [ ] Facebook Events Manager mostra eventos Purchase
- [ ] Perfect Pay configurada para enviar webhooks (quando houver compras reais)

---

**Resumo**: O tracking server-side está pronto, mas só funciona quando há uma compra e a Perfect Pay envia o webhook. Para testar agora, use o script `test-webhook.js` ou teste manualmente via cURL.




























