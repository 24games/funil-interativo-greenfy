/**
 * Script de teste para o webhook do Facebook CAPI
 * Execute: node test-webhook.js
 */

const testWebhook = async () => {
  // Substitua pela URL do seu projeto no Vercel
  const webhookUrl = process.env.WEBHOOK_URL || 'https://seu-projeto.vercel.app/api/webhook-purchase';
  
  const testData = {
    email: 'teste@exemplo.com',
    name: 'João Silva',
    phone: '+56912345678',
    value: 150000,
    currency: 'CLP',
    orderId: `TEST-${Date.now()}`,
    fbp: 'fb.1.1234567890.123456789', // Exemplo
    fbc: 'fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz', // Exemplo
  };

  try {
    console.log('🚀 Enviando webhook de teste...');
    console.log('📦 Dados:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Sucesso!');
      console.log('📊 Resposta:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Erro:', result);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error.message);
  }
};

// Executa o teste
testWebhook();





