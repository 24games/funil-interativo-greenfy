/**
 * Endpoint SIMPLIFICADO para teste Purchase
 * Versão mínima e direta
 * 
 * Acesse: https://www.hackermillon.online/api/test-purchase-simple
 */

export default async function handler(req, res) {
  const META_PIXEL_ID = '1170692121796734';
  const META_ACCESS_TOKEN = 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
  const TEST_EVENT_CODE = 'TEST57030';

  // Timestamp atual
  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `purchase_${Date.now()}`;
  const orderId = `order_${Date.now()}`;

  // Payload MÍNIMO mas completo
  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: eventTime,
      event_id: eventId,
      event_source_url: 'https://go.centerpag.com/PPU38CQ4BNQ',
      action_source: 'website',
      user_data: {
        client_ip_address: '192.168.1.100',
        client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        fbp: 'fb.1.1234567890.1234567890',
      },
      custom_data: {
        currency: 'BRL',
        value: 39.9,
        order_id: orderId,
      },
    }],
    test_event_code: TEST_EVENT_CODE,
    access_token: META_ACCESS_TOKEN,
  };

  const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

  try {
    console.log('📤 Enviando evento Purchase de teste...');
    console.log('Event Time:', eventTime, new Date(eventTime * 1000).toISOString());
    console.log('Event ID:', eventId);
    console.log('Test Code:', TEST_EVENT_CODE);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log('📥 Resposta:', JSON.stringify(result, null, 2));

    return res.status(200).json({
      success: result.events_received === 1,
      events_received: result.events_received,
      event_id: eventId,
      event_time: eventTime,
      test_event_code: TEST_EVENT_CODE,
      full_response: result,
      message: result.events_received === 1 
        ? '✅ Evento enviado! Verifique no Test Events Manager em 30-60 segundos.'
        : '⚠️ Evento pode não ter sido recebido. Verifique os erros abaixo.',
      errors: result.error ? [result.error] : result.messages?.filter(m => m.error) || [],
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}



























