// ============================================
// SCRIPT DE TESTE - COPIAR E COLAR NO CONSOLE
// ============================================
// Cole este código completo no Console do navegador (F12)

(async function testTracking() {
  console.log('🧪 TESTE DE TRACKING - INICIANDO...\n');
  
  // Função auxiliar para pegar cookie
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  // 1. Verificar Meta Pixel
  console.log('1️⃣ Verificando Meta Pixel...');
  if (window.fbq) {
    console.log('✅ Meta Pixel OK:', typeof window.fbq);
  } else {
    console.log('⚠️ Meta Pixel não encontrado (pode ser normal se ainda não carregou)');
  }
  
  // 2. Preparar dados de teste
  console.log('\n2️⃣ Preparando dados de teste...');
  const testData = {
    ip: '192.168.1.100',
    user_agent: navigator.userAgent,
    fbp: getCookie('_fbp') || 'fb.1.test.' + Date.now(),
    fbc: getCookie('_fbc') || null,
    page_url: window.location.href,
    referrer: document.referrer || null,
    language: navigator.language,
    utm_source: 'test_console',
    utm_medium: 'manual',
    utm_campaign: 'test_' + Date.now(),
    timestamp: new Date().toISOString()
  };
  console.log('📦 Dados preparados:', testData);
  
  // 3. Enviar para API
  console.log('\n3️⃣ Enviando para API /api/tracking-pageview...');
  try {
    const response = await fetch('/api/tracking-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ SUCESSO!');
      console.log('📊 Event ID:', result.data.event_id);
      console.log('💾 Supabase:', result.data.supabase.saved ? '✅ Salvo' : '❌ Erro: ' + result.data.supabase.error);
      console.log('📱 Meta CAPI:', result.data.meta.sent ? '✅ Enviado (' + result.data.meta.events_received + ' eventos)' : '❌ Erro: ' + result.data.meta.error);
      console.log('\n📋 Resposta completa:', result);
    } else {
      console.log('❌ ERRO na API:', result);
    }
  } catch (error) {
    console.log('❌ ERRO ao enviar:', error.message);
    console.log('💡 Dica: Verifique se o servidor está rodando (npm run dev)');
  }
  
  // 4. Verificar cookies
  console.log('\n4️⃣ Verificando cookies...');
  console.log('_fbp:', getCookie('_fbp') || '❌ Não encontrado');
  console.log('_fbc:', getCookie('_fbc') || '❌ Não encontrado');
  
  console.log('\n✅ TESTE CONCLUÍDO!');
  console.log('💡 Próximos passos:');
  console.log('   1. Verifique os logs acima');
  console.log('   2. Verifique Network tab (F12 → Network → tracking-pageview)');
  console.log('   3. Verifique no Supabase: SELECT * FROM tracking_SQD_CAS_LP1_VSL_HACKERMILLON ORDER BY created_at DESC LIMIT 1;');
})();



























