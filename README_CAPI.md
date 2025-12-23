# 🎯 Facebook Conversions API - Implementação Completa

## ✅ O que foi criado:

1. **`api/webhook-purchase.js`** - Serverless Function do Vercel
   - Recebe webhooks do checkout
   - Faz hash SHA-256 dos dados (Advanced Matching)
   - Envia eventos Purchase para Facebook CAPI
   - Suporte completo para fbp/fbc

2. **`vercel.json`** - Configuração do Vercel
   - Define timeout e rotas da API

3. **`FACEBOOK_CAPI_SETUP.md`** - Documentação completa
   - Guia passo a passo
   - Exemplos de uso
   - Troubleshooting

## 🚀 Quick Start:

1. **Configure variáveis de ambiente no Vercel:**
   ```
   META_PIXEL_ID=seu_pixel_id
   META_ACCESS_TOKEN=seu_access_token
   ```

2. **Faça deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure seu checkout para enviar POST para:**
   ```
   https://seu-dominio.com/api/webhook-purchase
   ```

## 📡 Exemplo de Payload:

```json
{
  "email": "cliente@exemplo.com",
  "name": "João Silva",
  "phone": "+56912345678",
  "value": 150000,
  "currency": "CLP",
  "orderId": "ORD-12345"
}
```

## 📚 Documentação Completa:

Veja `FACEBOOK_CAPI_SETUP.md` para instruções detalhadas.
































