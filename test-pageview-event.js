/**
 * Script para enviar evento PageView de teste via Meta Conversions API
 * Código de teste: TEST57030
 */

const META_PIXEL_ID = '1170692121796734';
const META_ACCESS_TOKEN = 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
const TEST_EVENT_CODE = 'TEST57030';

// Dados do evento de teste
const eventData = {
  data: [
    {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `test_pageview_${Date.now()}`,
      event_source_url: 'https://www.hackermillon.online',
      action_source: 'website',
      user_data: {
        client_ip_address: '192.168.1.100',
        client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        fbp: 'fb.1.test.1234567890',
        fbc: 'fb.1.test.AbCdEfGhIj',
      },
      custom_data: {
        content_name: 'Landing Page - Teste',
        content_category: 'landing_page',
      },
    },
  ],
  test_event_code: TEST_EVENT_CODE, // Código de teste do Events Manager
};

// URL da Meta Conversions API
const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

console.log('🚀 Enviando evento PageView de teste...');
console.log('📊 Pixel ID:', META_PIXEL_ID);
console.log('🧪 Test Event Code:', TEST_EVENT_CODE);
console.log('📡 URL:', apiUrl);
console.log('');

// Enviar requisição
fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...eventData,
    access_token: META_ACCESS_TOKEN,
  }),
})
  .then(response => response.json())
  .then(result => {
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.events_received === 1) {
      console.log('');
      console.log('✅ Evento enviado com sucesso!');
      console.log('📱 Verifique no Meta Events Manager:');
      console.log('   https://business.facebook.com/events_manager2');
      console.log('   → Selecione o Pixel:', META_PIXEL_ID);
      console.log('   → Vá em "Test Events"');
      console.log('   → Procure pelo código:', TEST_EVENT_CODE);
    } else {
      console.log('');
      console.log('⚠️ Evento pode não ter sido recebido corretamente');
      console.log('Events received:', result.events_received);
    }
  })
  .catch(error => {
    console.error('❌ Erro ao enviar evento:', error);
  });



























