/**
 * API Route para Consultar Status do Pagamento Flow.cl
 * 
 * Endpoint: /api/get-flow-status
 * Method: GET
 * 
 * Consulta o status de um pagamento no Flow.cl usando token
 * Usado pela página /gracias para exibir status sem disparar Purchase
 */

import crypto from 'crypto';

// ============================================
// CONFIGURAÇÃO
// ============================================
const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_URL = 'https://www.flow.cl/api';

/**
 * Gera assinatura HMAC SHA256 para requisições Flow.cl
 * 
 * Conforme documentação oficial do Flow.cl:
 * 1. Ordena parâmetros alfabeticamente (exceto 's')
 * 2. Concatena key + value para cada parâmetro
 * 3. Gera HMAC SHA256 sobre a string resultante
 */
function generateFlowSignature(params) {
  if (!FLOW_SECRET_KEY) {
    throw new Error('FLOW_SECRET_KEY não configurada');
  }

  // Ordena as chaves alfabeticamente (exceto 's' que é a assinatura)
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 's')
    .sort();

  // Concatena key + value para cada parâmetro ordenado
  const stringToSign = sortedKeys
    .map(key => {
      const value = String(params[key] || '');
      return key + value; // IMPORTANTE: key + value
    })
    .join('');

  // Gera HMAC SHA256
  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');

  return signature;
}

/**
 * Busca status do pagamento no Flow.cl usando query params
 * 
 * Conforme documentação oficial:
 * GET https://www.flow.cl/api/payment/getStatus?apiKey=XXX&token=YYY&s=ZZZ
 */
async function getFlowPaymentStatus(token) {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias');
  }

  // Prepara parâmetros para query string
  const params = {
    apiKey: FLOW_API_KEY,
    token: token,
  };

  // Gera assinatura HMAC SHA256
  const signature = generateFlowSignature(params);
  params.s = signature;

  // Monta URL com query params
  const queryString = new URLSearchParams(params).toString();
  const url = `${FLOW_API_URL}/payment/getStatus?${queryString}`;

  console.log('🔍 Consultando status do pagamento Flow:', {
    token: token.substring(0, 20) + '...',
    url: url.replace(FLOW_SECRET_KEY, '***SECRET***').replace(FLOW_API_KEY, '***API_KEY***'),
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

    console.log('✅ Status consultado com sucesso:', {
      status: data.status,
      commerceOrder: data.commerceOrder,
      amount: data.amount,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tratar OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceita GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Apenas requisições GET são aceitas',
      received_method: req.method,
    });
  }

  try {
    // Extrai token da query string
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token é obrigatório',
      });
    }

    // Consulta status no Flow.cl
    const flowStatus = await getFlowPaymentStatus(token);

    // Retorna status (sem dados sensíveis: token, payer, raw_data)
    return res.status(200).json({
      success: true,
      data: {
        status: flowStatus.status,
        commerceOrder: flowStatus.commerceOrder,
        amount: flowStatus.amount,
        currency: flowStatus.currency,
        date: flowStatus.date,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao processar consulta de status:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Erro ao consultar status do pagamento',
    });
  }
}

