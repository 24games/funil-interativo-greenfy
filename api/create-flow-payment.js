/**
 * API Route para Criar Pagamento no Flow.cl
 * 
 * Cria uma transação no Flow e retorna a URL de redirecionamento
 * 
 * Endpoint: /api/create-flow-payment
 * Method: POST
 */

import crypto from 'crypto';
import axios from 'axios';

// ============================================
// CONFIGURAÇÃO
// ============================================
const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_URL = 'https://www.flow.cl/api';

// URLs de retorno
const URL_RETURN = process.env.FLOW_URL_RETURN || 'https://www.hmagencyia.online/gracias';
const URL_CONFIRMATION = process.env.FLOW_URL_CONFIRMATION || 'https://www.hmagencyia.online/api/webhook-flow';

// Valor padrão (pode ser dinâmico via body)
const DEFAULT_AMOUNT = 5000;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera assinatura HMAC SHA256 para requisições Flow.cl
 * 
 * Formato: HMAC-SHA256(METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + BODY)
 */
function generateFlowSignature(method, path, timestamp, nonce, body) {
  if (!FLOW_SECRET_KEY) {
    throw new Error('FLOW_SECRET_KEY não configurada');
  }

  // Monta string para assinar
  const stringToSign = `${method}\n${path}\n${timestamp}\n${nonce}\n${body}`;
  
  // Gera HMAC SHA256
  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');

  return signature;
}

/**
 * Gera um commerceOrder único
 */
function generateCommerceOrder() {
  // Usa timestamp + random para garantir unicidade
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `order_${timestamp}_${random}`;
}

/**
 * Cria pagamento no Flow.cl
 */
async function createFlowPayment(paymentData) {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias');
  }

  const {
    email,
    amount = DEFAULT_AMOUNT,
    commerceOrder,
    optional = {},
  } = paymentData;

  // Validação
  if (!email) {
    throw new Error('Email é obrigatório');
  }

  // Prepara payload para Flow
  const flowPayload = {
    apiKey: FLOW_API_KEY,
    commerceOrder: commerceOrder || generateCommerceOrder(),
    subject: 'Compra - App Liberado',
    amount: parseInt(amount, 10),
    currency: 'CLP',
    email: email,
    urlConfirmation: URL_CONFIRMATION,
    urlReturn: URL_RETURN,
    optional: JSON.stringify(optional), // JSON stringified conforme solicitado
  };

  // Prepara requisição
  const method = 'POST';
  const path = '/payment/create';
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = JSON.stringify(flowPayload);

  // Gera assinatura
  const signature = generateFlowSignature(method, path, timestamp, nonce, body);

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Flow-API-Key': FLOW_API_KEY,
    'X-Flow-Timestamp': timestamp,
    'X-Flow-Nonce': nonce,
    'X-Flow-Signature': signature,
  };

  console.log('📤 Criando pagamento no Flow.cl:', {
    commerceOrder: flowPayload.commerceOrder,
    amount: flowPayload.amount,
    email: email,
    optional: flowPayload.optional,
  });

  // Faz requisição para Flow
  const response = await axios.post(
    `${FLOW_API_URL}${path}`,
    flowPayload,
    { headers }
  );

  if (!response.data || !response.data.url || !response.data.token) {
    throw new Error('Resposta inválida do Flow.cl');
  }

  // Retorna URL completa de redirecionamento
  const redirectUrl = `${response.data.url}?token=${response.data.token}`;

  return {
    url: redirectUrl,
    token: response.data.token,
    commerceOrder: flowPayload.commerceOrder,
    flowResponse: response.data,
  };
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
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          error: 'Invalid JSON',
          message: 'Body deve ser um JSON válido',
        });
      }
    }

    // Validação
    const { email, tracking_id, amount } = body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email é obrigatório',
      });
    }

    // Prepara optional com tracking_id
    const optional = {};
    if (tracking_id) {
      optional.tracking_id = tracking_id;
    }

    // Cria pagamento no Flow
    const paymentResult = await createFlowPayment({
      email,
      amount: amount || DEFAULT_AMOUNT,
      optional,
    });

    console.log('✅ Pagamento criado no Flow.cl:', {
      commerceOrder: paymentResult.commerceOrder,
      email: email,
    });

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      data: {
        redirect_url: paymentResult.url,
        token: paymentResult.token,
        commerce_order: paymentResult.commerceOrder,
      },
    });

  } catch (error) {
    // Log de erro
    console.error('❌ Erro ao criar pagamento no Flow.cl:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    // Resposta de erro
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Erro ao criar pagamento',
      details: error.response?.data || null,
    });
  }
}
