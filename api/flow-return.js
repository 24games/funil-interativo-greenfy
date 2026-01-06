/**
 * Middleware de Retorno do Flow.cl
 * 
 * Recebe POST do Flow.cl após pagamento e redireciona conforme status
 * 
 * Endpoint: /api/flow-return
 * Method: POST
 * 
 * Fluxo:
 * 1. Flow.cl envia POST com token no body
 * 2. Este endpoint recebe o POST
 * 3. Verifica status do pagamento no Flow.cl
 * 4. Se status === 2 (pago): redireciona para /gracias?token={token}
 * 5. Se status !== 2 (falhou/cancelado): redireciona para /try
 */

import crypto from 'crypto';

// ============================================
// CONFIGURAÇÃO
// ============================================
const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_URL = 'https://www.flow.cl/api';
const FLOW_STATUS_PAID = 2;

/**
 * Gera assinatura HMAC SHA256 para requisições Flow.cl
 */
function generateFlowSignature(params) {
  if (!FLOW_SECRET_KEY) {
    throw new Error('FLOW_SECRET_KEY não configurada');
  }

  const sortedKeys = Object.keys(params)
    .filter(key => key !== 's')
    .sort();

  const stringToSign = sortedKeys
    .map(key => {
      const value = String(params[key] || '');
      return key + value;
    })
    .join('');

  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');

  return signature;
}

/**
 * Busca status do pagamento no Flow.cl usando query params
 */
async function getFlowPaymentStatus(token) {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias');
  }

  const params = {
    apiKey: FLOW_API_KEY,
    token: token,
  };

  const signature = generateFlowSignature(params);
  params.s = signature;

  const queryString = new URLSearchParams(params).toString();
  const url = `${FLOW_API_URL}/payment/getStatus?${queryString}`;

  console.log('🔍 Consultando status do pagamento Flow (flow-return):', {
    token: token.substring(0, 20) + '...',
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao consultar status Flow:', {
        status: response.status,
        error: errorText,
      });
      throw new Error(`Flow API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log('✅ Status consultado com sucesso (flow-return):', {
      status: data.status,
      commerceOrder: data.commerceOrder,
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar status do pagamento no Flow.cl:', {
      token: token ? token.substring(0, 20) + '...' : 'não fornecido',
      errorMessage: error.message,
    });
    throw error;
  }
}

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
      
      // Sem token, não é possível verificar status - redireciona para /try (mais seguro)
      const redirectUrl = '/try';
      console.log('🔄 Token não encontrado - redirecionando para /try');
      
      return res.redirect(303, redirectUrl);
    }

    console.log('✅ Token recebido do Flow.cl:', {
      token: token.substring(0, 20) + '...',
      tokenLength: token.length,
    });

    // Verifica status do pagamento antes de redirecionar
    let flowStatus;
    try {
      flowStatus = await getFlowPaymentStatus(token);
    } catch (error) {
      console.error('❌ Erro ao verificar status do pagamento:', {
        error: error.message,
        token: token.substring(0, 20) + '...',
      });
      // Em caso de erro ao verificar, redireciona para /try (mais seguro)
      console.log('🔄 Erro ao verificar status - redirecionando para /try');
      return res.redirect(303, '/try');
    }

    // Verifica se está pago (status === 2)
    if (flowStatus.status === FLOW_STATUS_PAID) {
      // Pagamento confirmado - redireciona para /gracias
      const redirectUrl = `/gracias?token=${encodeURIComponent(token)}`;
      console.log('✅ Pagamento confirmado - redirecionando para /gracias');
      return res.redirect(303, redirectUrl);
    } else {
      // Pagamento não confirmado (cancelado, recusado, pendente, etc.) - redireciona para /try
      console.log('⚠️ Pagamento não confirmado (status:', flowStatus.status, ') - redirecionando para /try');
      return res.redirect(303, '/try');
    }

  } catch (error) {
    // Log de erro
    console.error('❌ Erro ao processar retorno do Flow.cl:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      body: req.body,
    });

    // Em caso de erro, redireciona para /try (mais seguro - evita dar acesso de graça)
    console.log('🔄 Erro no processamento - redirecionando para /try');
    return res.redirect(303, '/try');
  }
}
















