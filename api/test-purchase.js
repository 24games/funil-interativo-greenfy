/**
 * Endpoint de teste para enviar evento Purchase
 * Mais confiável que console do navegador
 * 
 * Acesse: https://www.hackermillon.online/api/test-purchase
 */

export default async function handler(req, res) {
  // Permite GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const META_PIXEL_ID = process.env.META_PIXEL_ID || '1170692121796734';
  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
  const TEST_EVENT_CODE = 'TEST57030';

  // Importa crypto para hash
  const crypto = await import('crypto');
  
  function hashSHA256(text) {
    if (!text) return null;
    return crypto.default
      .createHash('sha256')
      .update(text.trim().toLowerCase())
      .digest('hex');
  }

  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `test_purchase_${Date.now()}`;
  const orderId = `TEST_ORDER_${Date.now()}`;

  // Dados de teste
  const testEmail = 'teste@example.com';
  const testPhone = '5511999999999';

  const userData = {
    client_ip_address: req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.headers['x-real-ip'] || 
                      '192.168.1.100',
    client_user_agent: req.headers['user-agent'] || 'Mozilla/5.0',
    fbp: 'fb.1.test.1234567890',
    em: hashSHA256(testEmail),
    ph: hashSHA256(testPhone),
  };

  // Estrutura EXATA conforme documentação Meta
  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: eventTime,
      event_id: eventId,
      event_source_url: 'https://go.centerpag.com/PPU38CQ4BNQ',
      action_source: 'website',
      user_data: userData,
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

  // Log detalhado para debug
  console.log('🔍 DEBUG - Payload sendo enviado:', JSON.stringify(payload, null, 2));
  console.log('🔍 DEBUG - Event Time:', eventTime, new Date(eventTime * 1000).toISOString());
  console.log('🔍 DEBUG - Event ID:', eventId);
  console.log('🔍 DEBUG - Test Event Code:', TEST_EVENT_CODE);

  const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    // Log detalhado da resposta
    console.log('🔍 DEBUG - Resposta da API:', JSON.stringify(result, null, 2));
    console.log('🔍 DEBUG - Status HTTP:', response.status);
    console.log('🔍 DEBUG - Events Received:', result.events_received);

    if (result.events_received === 1) {
      return res.status(200).json({
        success: true,
        message: '✅ Evento Purchase enviado com sucesso!',
        data: {
          event_id: eventId,
          order_id: orderId,
          event_time: eventTime,
          test_event_code: TEST_EVENT_CODE,
          events_received: result.events_received,
          messages: result.messages,
        },
        instructions: {
          step1: 'Acesse: https://business.facebook.com/events_manager2',
          step2: `Selecione o Pixel: ${META_PIXEL_ID}`,
          step3: 'Clique em "Test Events" no menu lateral',
          step4: `Procure pelo código: ${TEST_EVENT_CODE}`,
          step5: 'Procure pelo evento: Purchase',
          step6: 'Aguarde 10-30 segundos se não aparecer imediatamente',
        },
      });
    } else if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: 'Erro ao enviar evento',
        troubleshooting: {
          code_190: 'Access Token inválido ou expirado',
          code_100_subcode_2388099: 'Código de teste inválido ou não ativo. Ative TEST57030 no Events Manager',
          code_100_subcode_2804003: 'Timestamp muito antigo (não deve acontecer com este endpoint)',
        },
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Resposta inesperada',
        result: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Erro ao processar requisição',
    });
  }
}

