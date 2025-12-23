# ⚡ Setup Rápido - Tracking ETAPA 1

## 🚀 Configuração em 5 Minutos

### **1. Variáveis de Ambiente no Vercel**

Acesse: [Vercel Dashboard](https://vercel.com/dashboard) → Seu Projeto → Settings → Environment Variables

Adicione:

```env
META_PIXEL_ID=1170692121796734
META_ACCESS_TOKEN=EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD
SUPABASE_CONNECTION_STRING=postgresql://postgres.jhyekbtcywewzrviqlos:XhoB5znX17qpM7WG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Opcional (para usar REST API do Supabase):**
```env
SUPABASE_URL=https://jhyekbtcywewzrviqlos.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### **2. Deploy no Vercel**

```bash
git add .
git commit -m "feat: adiciona tracking ETAPA 1"
git push
```

O Vercel fará o deploy automaticamente.

### **3. Verificar Funcionamento**

1. Acesse sua landing page
2. Abra o Console do navegador (F12)
3. Procure por: `"Tracking inicializado com sucesso"`
4. Verifique no Supabase se os dados foram salvos

---

## ✅ Checklist

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado
- [ ] Tracking funcionando (verificar console)
- [ ] Dados aparecendo no Supabase
- [ ] Eventos aparecendo no Meta Events Manager

---

## 🔧 Usando MCP Server (Alternativa)

Se preferir usar o MCP Server do Supabase diretamente (via Cursor), você pode executar queries SQL diretamente:

```sql
-- Exemplo: Inserir dados manualmente
INSERT INTO tracking_SQD_CAS_LP1_VSL_HACKERMILLON (
  email, phone, ip, user_agent, fbp, fbc,
  page_url, timestamp, event_type, event_id
) VALUES (
  'teste@example.com',
  '+5511999999999',
  '192.168.1.1',
  'Mozilla/5.0...',
  'fb.1.1234567890.1234567890',
  NULL,
  'https://seu-site.com',
  NOW(),
  'PageView',
  'test_event_123'
);
```

---

## 📞 Suporte

Em caso de problemas, consulte:
- `TRACKING_ETAPA1_DOCUMENTACAO.md` - Documentação completa
- Logs do Vercel
- Console do navegador
- Meta Events Manager



























