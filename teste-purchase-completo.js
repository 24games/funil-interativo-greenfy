/**
 * Script de teste completo para evento Purchase com todos os parâmetros
 * Execute no console do navegador (F12)
 */

(async function enviarTestePurchaseCompleto() {
  const META_PIXEL_ID = '1170692121796734';
  const META_ACCESS_TOKEN = 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
  const TEST_EVENT_CODE = 'TEST57030';
  
  // Função para gerar hash SHA-256
  async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Dados de teste
  const testEmail = 'teste@example.com';
  const testPhone = '5511999999999';
  const testFirstName = 'Teste';
  const testLastName = 'Usuario';
  const testDateOfBirth = '1990-01-01';
  const testCity = 'Sao Paulo';
  const testState = 'SP';
  const testCountry = 'BR';
  const testZipCode = '01234567';
  
  // Gera hashes
  console.log('🔐 Gerando hashes dos dados...');
  const hashedEmail = await hashSHA256(testEmail);
  const hashedPhone = await hashSHA256(testPhone);
  const hashedFirstName = await hashSHA256(testFirstName);
  const hashedLastName = await hashSHA256(testLastName);
  const hashedDateOfBirth = await hashSHA256(testDateOfBirth);
  const hashedCity = await hashSHA256(testCity);
  const hashedState = await hashSHA256(testState);
  const hashedCountry = await hashSHA256(testCountry);
  const hashedZipCode = await hashSHA256(testZipCode);
  
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
        em: hashedEmail,           // Email
        ph: hashedPhone,           // Telefone
        fn: hashedFirstName,      // Primeiro nome
        ln: hashedLastName,        // Sobrenome
        db: hashedDateOfBirth,     // Data de nascimento (YYYY-MM-DD)
        // Localização (hasheados SHA-256)
        ct: hashedCity,           // Cidade
        st: hashedState,           // Estado
        country: hashedCountry,    // País
        zp: hashedZipCode,         // CEP
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
  
  console.log('🚀 Enviando evento Purchase de teste com TODOS os parâmetros...');
  console.log('📊 Pixel ID:', META_PIXEL_ID);
  console.log('🧪 Test Event Code:', TEST_EVENT_CODE);
  console.log('📦 Order ID:', orderId);
  console.log('💰 Value: BRL 39.90');
  console.log('');
  console.log('📋 Parâmetros incluídos:');
  console.log('  ✅ Email (em)');
  console.log('  ✅ Telefone (ph)');
  console.log('  ✅ IP (client_ip_address)');
  console.log('  ✅ User Agent (client_user_agent)');
  console.log('  ✅ FBP (fbp)');
  console.log('  ✅ FBC (fbc)');
  console.log('  ✅ Primeiro Nome (fn)');
  console.log('  ✅ Sobrenome (ln)');
  console.log('  ✅ Data de Nascimento (db)');
  console.log('  ✅ Cidade (ct)');
  console.log('  ✅ Estado (st)');
  console.log('  ✅ País (country)');
  console.log('  ✅ CEP (zp)');
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
      console.log('   → Verifique se TODOS os parâmetros foram recebidos');
    } else {
      console.log('⚠️ Evento pode não ter sido recebido corretamente');
      console.log('Events received:', result.events_received);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar evento:', error);
  }
})();

