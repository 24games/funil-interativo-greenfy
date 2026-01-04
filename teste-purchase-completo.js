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
  
  // Remove valores null do user_data
  const userData = {
    client_ip_address: '192.168.1.100',
    client_user_agent: navigator.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || 'fb.1.test.1234567890',
  };
  
  // Adiciona FBC se disponível
  const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1];
  if (fbc) {
    userData.fbc = fbc;
  }
  
  // Adiciona dados hasheados (apenas se não forem null)
  if (hashedEmail) userData.em = hashedEmail;
  if (hashedPhone) userData.ph = hashedPhone;
  if (hashedFirstName) userData.fn = hashedFirstName;
  if (hashedLastName) userData.ln = hashedLastName;
  if (hashedDateOfBirth) userData.db = hashedDateOfBirth;
  if (hashedCity) userData.ct = hashedCity;
  if (hashedState) userData.st = hashedState;
  if (hashedCountry) userData.country = hashedCountry;
  if (hashedZipCode) userData.zp = hashedZipCode;
  
  // Estrutura do evento conforme documentação Meta
  const eventData = {
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
      console.log('✅✅✅ SUCESSO! Evento Purchase enviado e recebido!');
      console.log('');
      console.log('📱 Próximos passos:');
      console.log('   1. Acesse: https://business.facebook.com/events_manager2');
      console.log('   2. Selecione o Pixel:', META_PIXEL_ID);
      console.log('   3. Vá em "Test Events"');
      console.log('   4. Procure pelo código:', TEST_EVENT_CODE);
      console.log('   5. Procure pelo evento: Purchase');
      console.log('   6. Verifique se TODOS os parâmetros foram recebidos');
      console.log('');
      console.log('⏱️ O evento pode levar alguns segundos para aparecer no Events Manager');
    } else if (result.error) {
      console.error('❌ ERRO na API:', result.error);
      console.log('');
      console.log('Detalhes do erro:');
      console.log('  Tipo:', result.error.type);
      console.log('  Código:', result.error.code);
      console.log('  Mensagem:', result.error.message);
      if (result.error.error_subcode) {
        console.log('  Subcódigo:', result.error.error_subcode);
      }
    } else {
      console.log('⚠️ Resposta inesperada:');
      console.log('Events received:', result.events_received);
      console.log('Messages:', result.messages);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar evento:', error);
  }
})();

