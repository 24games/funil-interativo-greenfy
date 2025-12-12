# 🎯 Configuração de Webhook Perfect Pay - Server-Side Tracking

Guia completo para configurar o rastreamento server-side do Facebook na Perfect Pay.

---

## 📋 Pré-requisitos

✅ Endpoint `/api/webhook-purchase` já implementado  
✅ Pixel ID e Access Token configurados no Vercel  
✅ Domínio da landing page configurado no Vercel  

---

## 🔧 Passo 1: Obter URL do Webhook

Sua URL do webhook é:
```
https://seu-dominio.com/api/webhook-purchase
```

**Substitua `seu-dominio.com` pelo domínio real da sua landing page no Vercel.**

Exemplo:
```
https://funil-24games.vercel.app/api/webhook-purchase
```

---

## 📝 Passo 2: Configurar Webhook na Perfect Pay

### Opção A: Webhook Customizado (Recomendado)

1. **Acesse sua conta Perfect Pay**
   - Faça login em: https://app.perfectpay.com.br

2. **Navegue até Configurações do Produto**
   - Vá em **Produtos** → **Meus Produtos**
   - Selecione o produto desejado
   - Clique em **Detalhes**

3. **Configure Notificações/Webhooks**
   - Procure por **"Notificações"**, **"Webhooks"** ou **"Integrações"**
   - Se houver opção de **"URL de Notificação"** ou **"Webhook URL"**, adicione:
     ```
     https://seu-dominio.com/api/webhook-purchase
     ```

4. **Configure os Eventos**
   - Selecione o evento: **"Compra Aprovada"** ou **"Purchase"**
   - Salve as configurações

### Opção B: Integração via API (Se disponível)

Se a Perfect Pay permitir configuração via API ou painel avançado:

1. Acesse as configurações avançadas do produto
2. Configure a URL de callback/webhook
3. Selecione os eventos que devem disparar o webhook

---

## 📦 Passo 3: Formato do Payload Esperado

O endpoint aceita os seguintes campos:

### Campos Obrigatórios (pelo menos um):
- `email` - Email do cliente
- `phone` - Telefone do cliente

### Campos Opcionais:
- `name` - Nome completo do cliente
- `value` - Valor da compra (número)
- `currency` - Moeda (padrão: "CLP")
- `orderId` - ID único da compra
- `fbp` - Facebook Browser ID (cookie `_fbp`)
- `fbc` - Facebook Click ID (cookie `_fbc`)
- `ipAddress` - IP do cliente
- `userAgent` - User Agent do navegador
- `sourceUrl` - URL de origem da compra

### Exemplo de Payload:

```json
{
  "email": "cliente@exemplo.com",
  "name": "Juan Pérez",
  "phone": "+56912345678",
  "value": 150000,
  "currency": "CLP",
  "orderId": "PP-12345-ABCDE",
  "fbp": "fb.1.1234567890.123456789",
  "fbc": "fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz"
}
```

---

## 🔄 Passo 4: Adaptar Payload da Perfect Pay (Se necessário)

Se a Perfect Pay enviar o payload em um formato diferente, você pode:

### Opção 1: Usar o Mapeamento Automático

O endpoint já tenta mapear campos comuns:
- `email` ou `customer_email` ou `buyer_email`
- `name` ou `customer_name` ou `buyer_name`
- `phone` ou `customer_phone` ou `buyer_phone`
- `value` ou `amount` ou `total` ou `price`
- `orderId` ou `order_id` ou `transaction_id` ou `payment_id`

### Opção 2: Solicitar Adaptação do Endpoint

Se a Perfect Pay usar campos completamente diferentes, me envie um exemplo do payload que ela envia e eu adapto o endpoint.

---

## ✅ Passo 5: Testar o Webhook

### Teste Manual com cURL:

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

### Resposta de Sucesso:

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

---

## 🔍 Passo 6: Verificar se Está Funcionando

### 1. Logs do Vercel
- Acesse: https://vercel.com/seu-projeto/logs
- Procure por: `"Webhook recebido"` e `"Evento enviado com sucesso"`

### 2. Facebook Events Manager
- Acesse: https://business.facebook.com/events_manager2
- Vá em **Test Events** ou aguarde alguns minutos
- Verifique se os eventos **Purchase** estão aparecendo

### 3. Teste Real
- Faça uma compra de teste na Perfect Pay
- Verifique se o webhook foi chamado nos logs
- Confirme se o evento apareceu no Facebook

---

## 🛠️ Troubleshooting

### Erro: "Email ou telefone é obrigatório"
- **Causa**: A Perfect Pay não está enviando `email` ou `phone`
- **Solução**: Verifique o formato do payload que a Perfect Pay envia e me envie para adaptar

### Erro: "META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios"
- **Causa**: Variáveis de ambiente não configuradas no Vercel
- **Solução**: Configure no Vercel: Settings → Environment Variables

### Webhook não está sendo chamado
- **Causa**: URL incorreta ou evento não configurado na Perfect Pay
- **Solução**: 
  1. Verifique a URL do webhook
  2. Confirme que o evento "Compra Aprovada" está selecionado
  3. Teste manualmente com cURL

### Eventos não aparecem no Facebook
- **Causa**: Token inválido ou Pixel ID incorreto
- **Solução**:
  1. Verifique se o Access Token está válido
  2. Confirme se o Pixel ID está correto
  3. Verifique os logs do Vercel para erros da API do Facebook

---

## 📞 Suporte

Se precisar de ajuda:
1. Me envie um exemplo do payload que a Perfect Pay envia
2. Compartilhe os logs do Vercel (sem dados sensíveis)
3. Informe qual erro específico está ocorrendo

---

## 📚 Referências

- [Perfect Pay - Documentação](https://help.perfectpay.com.br)
- [Facebook Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

---

**Pronto!** Após configurar, cada compra aprovada na Perfect Pay enviará automaticamente o evento Purchase para o Facebook! 🎉





