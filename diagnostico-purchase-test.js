/**
 * Script de DIAGNÓSTICO para evento Purchase
 * Execute no console do navegador (F12)
 * Este script verifica cada etapa e mostra detalhes completos
 */

(async function diagnosticoPurchase() {
  const META_PIXEL_ID = '1170692121796734';
  const META_ACCESS_TOKEN = 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';
  const TEST_EVENT_CODE = 'TEST57030';
  
  console.log('🔍 DIAGNÓSTICO - Evento Purchase de Teste');
  console.log('==========================================');
  console.log('');
  console.log('📊 Configuração:');
  console.log('  Pixel ID:', META_PIXEL_ID);
  console.log('  Test Event Code:', TEST_EVENT_CODE);
  console.log('  Access Token:', META_ACCESS_TOKEN.substring(0, 20) + '...');
  console.log('');
  
  // Verifica se está em HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    console.warn('⚠️ ATENÇÃO: Você não está em HTTPS. Alguns recursos podem não funcionar.');
  }
  
  // Função para gerar hash SHA-256
  async function hashSHA256(text) {
    if (!text) return null;
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text.trim().toLowerCase());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('❌ Erro ao gerar hash:', error);
      return null;
    }
  }
  
  // Dados de teste
  const testEmail = 'teste@example.com';
  const testPhone = '5511999999999';
  
  console.log('🔐 Gerando hashes...');
  const hashedEmail = await hashSHA256(testEmail);
  const hashedPhone = await hashSHA256(testPhone);
  console.log('  Email hash:', hashedEmail ? hashedEmail.substring(0, 20) + '...' : 'ERRO');
  console.log('  Phone hash:', hashedPhone ? hashedPhone.substring(0, 20) + '...' : 'ERRO');
  console.log('');
  
  const eventTime = Math.floor(Date.now() / 1000);
  const eventId = `test_purchase_${Date.now()}`;
  const orderId = `TEST_ORDER_${Date.now()}`;
  
  // User data mínimo mas completo
  const userData = {
    client_ip_address: '192.168.1.100',
    client_user_agent: navigator.userAgent || 'Mozilla/5.0',
    fbp: document.cookie.match(/_fbp=([^;]+)/)?.[1] || 'fb.1.test.1234567890',
  };
  
  if (hashedEmail) userData.em = hashedEmail;
  if (hashedPhone) userData.ph = hashedPhone;
  
  const fbc = document.cookie.match(/_fbc=([^;]+)/)?.[1];
  if (fbc) userData.fbc = fbc;
  
  // Payload simplificado mas correto
  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: eventTime,
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: userData,
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
  
  console.log('📦 Payload que será enviado:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('');
  console.log('📡 URL da API:', apiUrl);
  console.log('');
  console.log('⏳ Enviando requisição...');
  console.log('');
  
  try {
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('⏱️ Tempo de resposta:', responseTime + 'ms');
    console.log('📊 Status HTTP:', response.status, response.statusText);
    console.log('');
    
    const result = await response.json();
    
    console.log('📥 Resposta COMPLETA da API:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    if (result.events_received === 1) {
      console.log('✅✅✅ EVENTO RECEBIDO PELA API!');
      console.log('');
      console.log('📋 Detalhes:');
      if (result.messages && result.messages.length > 0) {
        result.messages.forEach((msg, idx) => {
          console.log(`  Mensagem ${idx + 1}:`, msg);
        });
      }
      console.log('');
      console.log('📱 PRÓXIMOS PASSOS:');
      console.log('   1. Aguarde 10-30 segundos (pode demorar para aparecer)');
      console.log('   2. Acesse: https://business.facebook.com/events_manager2');
      console.log('   3. Selecione o Pixel:', META_PIXEL_ID);
      console.log('   4. Clique em "Test Events" (no menu lateral)');
      console.log('   5. Procure pelo código:', TEST_EVENT_CODE);
      console.log('   6. Procure pelo evento: Purchase');
      console.log('');
      console.log('💡 DICA: Se não aparecer, verifique:');
      console.log('   - O código de teste está ativo?');
      console.log('   - Você está logado na conta correta do Facebook?');
      console.log('   - O Pixel está correto?');
    } else if (result.error) {
      console.error('❌❌❌ ERRO NA API DO FACEBOOK');
      console.log('');
      console.log('Detalhes do erro:');
      console.log('  Tipo:', result.error.type);
      console.log('  Código:', result.error.code);
      console.log('  Mensagem:', result.error.message);
      console.log('  Error Subcode:', result.error.error_subcode || 'N/A');
      console.log('  Error User Title:', result.error.error_user_title || 'N/A');
      console.log('  Error User Message:', result.error.error_user_msg || 'N/A');
      console.log('');
      
      if (result.error.code === 190) {
        console.log('🔑 PROBLEMA: Access Token inválido ou expirado');
        console.log('   Solução: Gere um novo Access Token no Meta Business');
      } else if (result.error.code === 100) {
        console.log('🔑 PROBLEMA: Parâmetros inválidos');
        console.log('   Verifique se o Pixel ID está correto');
      } else if (result.error.error_subcode === 2388099) {
        console.log('🔑 PROBLEMA: Test Event Code inválido ou não ativo');
        console.log('   Solução: Verifique se o código TEST57030 está ativo no Events Manager');
      }
    } else {
      console.log('⚠️ Resposta inesperada da API');
      console.log('Events received:', result.events_received);
      console.log('Messages:', result.messages);
    }
  } catch (error) {
    console.error('❌❌❌ ERRO DE REDE OU REQUISIÇÃO');
    console.log('');
    console.log('Tipo de erro:', error.name);
    console.log('Mensagem:', error.message);
    console.log('');
    console.log('Possíveis causas:');
    console.log('  - Problema de conexão com internet');
    console.log('  - CORS bloqueado (tente em outro navegador)');
    console.log('  - Extensão do navegador bloqueando');
    console.log('');
    console.log('Stack trace:', error.stack);
  }
  
  console.log('');
  console.log('==========================================');
  console.log('🔍 Diagnóstico concluído');
})();



























