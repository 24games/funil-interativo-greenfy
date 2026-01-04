# 🧪 Enviar Evento Purchase de Teste - Código TEST57030

## 📋 Instruções

### **Opção 1: Console do Navegador (RECOMENDADO)**

1. Abra o console do navegador (F12)
2. Cole o código abaixo e pressione Enter:

```javascript
(async function enviarTestePurchase() {
  const META_PIXEL_ID = '1170692121796734';
  const META_ACCESS_TOKEN = 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
  const TEST_EVENT_CODE = 'TEST57030';
  
  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `test_purchase_${Date.now()}`;
  const orderId = `TEST_ORDER_${Date.now()}`;
  
  const eventData = {
    data: [{
      event_name: 'Purchase',
      event_time: eventTime,
      event_id: eventId,
      event_source_url: 'https://go.centerpag.com/PPU38CQ4BNQ',
      action_source: 'website',
      user_data: {
        // Dados obrigatórios (texto claro)
        client_ip_address: '192.168.1.100',
        client_user_agent: navigator.userAgent,
        fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || 'fb.1.test.1234567890',
        fbc: document.cookie.match(/_fbc=([^;]+)/)?.[1] || null,
        // Dados pessoais (hasheados SHA-256)
        // em: hash do email, ph: hash do telefone, fn: hash do primeiro nome, ln: hash do sobrenome
        // db: hash da data de nascimento (YYYY-MM-DD)
        // ct: hash da cidade, st: hash do estado, country: hash do país, zp: hash do CEP
      },
      custom_data: {
        currency: 'BRL',
        value: 39.9,
        content_type: 'product',
        content_ids: [orderId],
        content_name: 'HM I.A.',
        order_id: orderId,
        num_items: 1,
      },
    }],
    test_event_code: TEST_EVENT_CODE,
    access_token: META_ACCESS_TOKEN,
  };
  
  const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;
  
  console.log('🚀 Enviando evento Purchase de teste...');
  console.log('📊 Pixel ID:', META_PIXEL_ID);
  console.log('🧪 Test Event Code:', TEST_EVENT_CODE);
  console.log('📦 Order ID:', orderId);
  console.log('💰 Value: BRL 39.90');
  console.log('📡 URL:', apiUrl);
  console.log('');
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    const result = await response.json();
    
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    if (result.events_received === 1) {
      console.log('✅ Evento Purchase enviado com sucesso!');
      console.log('');
      console.log('📱 Verifique no Meta Events Manager:');
      console.log('   https://business.facebook.com/events_manager2');
      console.log('   → Selecione o Pixel:', META_PIXEL_ID);
      console.log('   → Vá em "Test Events"');
      console.log('   → Procure pelo código:', TEST_EVENT_CODE);
      console.log('   → Procure pelo evento: Purchase');
    } else {
      console.log('⚠️ Evento pode não ter sido recebido corretamente');
      console.log('Events received:', result.events_received);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar evento:', error);
  }
})();
```

### **Opção 2: Via cURL (Terminal)**

```bash
curl -X POST "https://graph.facebook.com/v18.0/1170692121796734/events" ^
  -H "Content-Type: application/json" ^
  -d "{\"data\":[{\"event_name\":\"Purchase\",\"event_time\":1732704000,\"event_id\":\"test_purchase_1732704000\",\"event_source_url\":\"https://go.centerpag.com/PPU38CQ4BNQ\",\"action_source\":\"website\",\"user_data\":{\"client_ip_address\":\"192.168.1.100\",\"client_user_agent\":\"Mozilla/5.0\",\"fbp\":\"fb.1.test.1234567890\"},\"custom_data\":{\"currency\":\"BRL\",\"value\":39.9,\"content_type\":\"product\",\"content_ids\":[\"TEST_ORDER_123\"],\"content_name\":\"HM I.A.\",\"order_id\":\"TEST_ORDER_123\",\"num_items\":1}}],\"test_event_code\":\"TEST57030\",\"access_token\":\"EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD\"}"
```

### **Opção 3: Executar Script PowerShell**

Execute o arquivo `enviar-teste-purchase.ps1` que foi criado.

---

## ✅ Verificar se Funcionou

1. Acesse: https://business.facebook.com/events_manager2
2. Selecione o Pixel: **1170692121796734**
3. Vá em **"Test Events"**
4. Procure pelo código: **TEST57030**
5. Você deve ver o evento **Purchase** aparecer em alguns segundos

---

## 📊 Dados do Evento Enviado

- **Event Name:** Purchase
- **Event Time:** Timestamp atual
- **Event ID:** Único (formato: `test_purchase_{timestamp}`)
- **Order ID:** Único (formato: `TEST_ORDER_{timestamp}`)
- **Test Event Code:** TEST57030
- **Source URL:** https://go.centerpag.com/PPU38CQ4BNQ
- **Action Source:** website
- **Custom Data:**
  - currency: "BRL"
  - value: 39.9
  - content_name: "HM I.A."
  - content_type: "product"
  - num_items: 1

---

**Pronto para testar!** 🚀

