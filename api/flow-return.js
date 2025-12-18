/**
 * Middleware de Retorno do Flow.cl
 * 
 * Recebe POST do Flow.cl após pagamento e redireciona para a página /gracias
 * 
 * Endpoint: /api/flow-return
 * Method: POST
 * 
 * Fluxo:
 * 1. Flow.cl envia POST com token no body
 * 2. Este endpoint recebe o POST
 * 3. Redireciona (303) para /gracias?token={token}
 */

/**
 * Handler da Serverless Function (Vercel)
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tratar OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Apenas requisições POST são aceitas',
      received_method: req.method,
    });
  }

  try {
    // Parse do body
    let body = req.body;
    
    // Flow.cl pode enviar como form-urlencoded ou JSON
    if (typeof body === 'string') {
      try {
        // Tenta parsear como JSON primeiro
        body = JSON.parse(body);
      } catch (e) {
        // Se não for JSON, tenta como form-urlencoded
        const params = new URLSearchParams(body);
        body = {};
        for (const [key, value] of params.entries()) {
          body[key] = value;
        }
      }
    }

    // Extrai o token do body
    const token = body.token || body.Token || body.TOKEN;

    if (!token) {
      console.error('❌ Token não encontrado no body:', {
        body: body,
        bodyType: typeof body,
      });
      
      // Mesmo sem token, redireciona para /gracias (sem token)
      const redirectUrl = '/gracias';
      console.log('🔄 Redirecionando para:', redirectUrl);
      
      return res.redirect(303, redirectUrl);
    }

    console.log('✅ Token recebido do Flow.cl:', {
      token: token.substring(0, 20) + '...',
      tokenLength: token.length,
    });

    // Monta URL de redirecionamento (relativa ao mesmo domínio)
    const redirectUrl = `/gracias?token=${encodeURIComponent(token)}`;
    
    console.log('🔄 Redirecionando para:', redirectUrl);

    // Redireciona com Status 303 (See Other) - método GET
    return res.redirect(303, redirectUrl);

  } catch (error) {
    // Log de erro
    console.error('❌ Erro ao processar retorno do Flow.cl:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // Mesmo em caso de erro, redireciona para /gracias (sem token)
    // Melhor mostrar a página de sucesso mesmo com erro no processamento
    return res.redirect(303, '/gracias');
  }
}






