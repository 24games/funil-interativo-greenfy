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
// urlReturn: Aponta para o middleware que recebe POST e redireciona para /gracias
// VALIDAÇÃO: Garante que BASE_URL sempre tenha https:// e seja completa
function validateAndNormalizeUrl(url, defaultPath) {
  if (!url || url.trim() === '') {
    return null; // Retorna null se vazia para usar fallback
  }
  
  // Remove espaços
  url = url.trim();
  
  // Se não começar com http:// ou https://, adiciona https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  // Garante que termine com / se tiver path
  if (defaultPath && !url.endsWith('/') && !url.includes(defaultPath)) {
    url = url.endsWith('/') ? url : `${url}/`;
  }
  
  return url;
}

const BASE_URL_RAW = process.env.FLOW_BASE_URL || 'https://hackermillon.online';
const BASE_URL = validateAndNormalizeUrl(BASE_URL_RAW, null) || 'https://hackermillon.online';

// Valida e normaliza URL_RETURN
const URL_RETURN_RAW = process.env.FLOW_URL_RETURN;
const URL_RETURN = URL_RETURN_RAW 
  ? validateAndNormalizeUrl(URL_RETURN_RAW, '/api/flow-return') || `${BASE_URL}/api/flow-return`
  : `${BASE_URL}/api/flow-return`;

// Valida e normaliza URL_CONFIRMATION (CRÍTICA - webhook)
const URL_CONFIRMATION_RAW = process.env.FLOW_URL_CONFIRMATION;
const URL_CONFIRMATION = URL_CONFIRMATION_RAW
  ? validateAndNormalizeUrl(URL_CONFIRMATION_RAW, '/api/webhook-flow') || `${BASE_URL}/api/webhook-flow`
  : `${BASE_URL}/api/webhook-flow`;

// LOG CRÍTICO: Debug das URLs no carregamento do módulo
console.log('🔍 DEBUG URLS (carregamento do módulo):', {
  FLOW_BASE_URL: process.env.FLOW_BASE_URL || '(não definida)',
  FLOW_URL_RETURN: process.env.FLOW_URL_RETURN || '(não definida)',
  FLOW_URL_CONFIRMATION: process.env.FLOW_URL_CONFIRMATION || '(não definida)',
  BASE_URL_FINAL: BASE_URL,
  URL_RETURN_FINAL: URL_RETURN,
  URL_CONFIRMATION_FINAL: URL_CONFIRMATION,
  urlConfirmation_startsWith_https: URL_CONFIRMATION.startsWith('https://'),
  urlReturn_startsWith_https: URL_RETURN.startsWith('https://'),
});

// Valor padrão (pode ser dinâmico via body)
const DEFAULT_AMOUNT = 5000;

// Timeout do link de pagamento (em segundos)
// 3600 segundos = 1 hora - CRÍTICO para retenção do usuário
// Evita que o link expire muito rápido durante o cold start da Vercel
const PAYMENT_TIMEOUT = 3600;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera assinatura HMAC SHA256 para requisições Flow.cl
 * 
 * Algoritmo rigoroso:
 * 1. Ordena chaves alfabeticamente (exceto 's')
 * 2. Concatena key + value para cada parâmetro
 * 3. Gera HMAC SHA256 sobre a string resultante
 * 
 * @param {Object} params - Parâmetros do form (sem o campo 's')
 * @returns {string} Assinatura HMAC SHA256 em hexadecimal
 */
function generateFlowSignature(params) {
  if (!FLOW_SECRET_KEY) {
    throw new Error('FLOW_SECRET_KEY não configurada');
  }

  // Ordena as chaves alfabeticamente (exceto 's' que é a assinatura)
  const sortedKeys = Object.keys(params)
    .filter(key => key !== 's') // Remove a assinatura se existir
    .sort();

  // Concatena key + value para cada parâmetro ordenado
  const stringToSign = sortedKeys
    .map(key => {
      const value = String(params[key] || '');
      return key + value; // IMPORTANTE: key + value, não apenas value
    })
    .join('');

  // LOG CRÍTICO: Mostra a string exata que será assinada
  console.log('STRING TO SIGN:', stringToSign);
  console.log('STRING TO SIGN LENGTH:', stringToSign.length);
  console.log('SORTED KEYS:', sortedKeys);
  console.log('✅ Timeout incluído na assinatura:', sortedKeys.includes('timeout') ? 'SIM' : 'NÃO');

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
  // LOG EXPLICITO NO INÍCIO DA FUNÇÃO (conforme solicitado)
  console.log('🔍 DEBUG URLS (início createFlowPayment):', {
    urlConfirmation: URL_CONFIRMATION,
    urlReturn: URL_RETURN,
    urlConfirmation_length: URL_CONFIRMATION.length,
    urlReturn_length: URL_RETURN.length,
    urlConfirmation_startsWith_https: URL_CONFIRMATION.startsWith('https://'),
    urlReturn_startsWith_https: URL_RETURN.startsWith('https://'),
    urlConfirmation_isValid: URL_CONFIRMATION.includes('http') && URL_CONFIRMATION.includes('/api/webhook-flow'),
    urlReturn_isValid: URL_RETURN.includes('http') && URL_RETURN.includes('/api/flow-return'),
  });

  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias');
  }

  // VALIDAÇÃO CRÍTICA: Garante que URLs não estão vazias ou inválidas
  if (!URL_CONFIRMATION || !URL_CONFIRMATION.startsWith('https://')) {
    console.error('❌ ERRO CRÍTICO: URL_CONFIRMATION inválida:', URL_CONFIRMATION);
    throw new Error(`URL_CONFIRMATION inválida: ${URL_CONFIRMATION}. Deve começar com https://`);
  }
  
  if (!URL_RETURN || !URL_RETURN.startsWith('https://')) {
    console.error('❌ ERRO CRÍTICO: URL_RETURN inválida:', URL_RETURN);
    throw new Error(`URL_RETURN inválida: ${URL_RETURN}. Deve começar com https://`);
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

  // ============================================
  // PREPARAÇÃO RIGOROSA DOS PARÂMETROS
  // ============================================
  
  // 1. Gera optionalValue UMA VEZ e usa a mesma variável
  const optionalValue = JSON.stringify(optional);
  
  // 2. Define todos os parâmetros como STRINGS (valores já convertidos)
  // IMPORTANTE: A ordem aqui não importa, pois a função generateFlowSignature
  // ordena alfabeticamente automaticamente para a assinatura HMAC
  const formParams = {
    apiKey: String(FLOW_API_KEY),
    amount: String(parseInt(amount, 10)), // Converter para string explicitamente
    commerceOrder: String(commerceOrder || generateCommerceOrder()),
    currency: 'CLP', // Moeda fixa
    email: String(email), // Email como string
    optional: optionalValue, // Usa a variável gerada UMA VEZ
    subject: 'Pago de Servicio', // Título fixo
    timeout: String(PAYMENT_TIMEOUT), // Timeout de 1 hora (3600 segundos) - CRÍTICO para retenção
    urlConfirmation: String(URL_CONFIRMATION), // URL completa do webhook
    urlReturn: String(URL_RETURN), // URL completa da página de obrigado
  };

  // 3. Log dos parâmetros antes de assinar (para debug)
  console.log('📋 Parâmetros antes da assinatura:', {
    apiKey: formParams.apiKey.substring(0, 10) + '...',
    amount: formParams.amount,
    commerceOrder: formParams.commerceOrder,
    currency: formParams.currency,
    email: formParams.email,
    optional: formParams.optional,
    subject: formParams.subject,
    timeout: formParams.timeout, // Timeout de 1 hora
    urlConfirmation: formParams.urlConfirmation,
    urlReturn: formParams.urlReturn,
  });

  // 4. Gera assinatura sobre os parâmetros (SEM o campo 's')
  const signature = generateFlowSignature(formParams);

  // 5. Adiciona a assinatura como campo 's' no form
  formParams.s = signature;

  // Converte para form-urlencoded usando URLSearchParams
  const formBody = new URLSearchParams(formParams).toString();

  // Headers - IMPORTANTE: application/x-www-form-urlencoded
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // LOG CRÍTICO: Verifica URLs antes de enviar ao Flow
  console.log('📤 Criando pagamento no Flow.cl:', {
    amount: formParams.amount,
    commerceOrder: formParams.commerceOrder,
    currency: formParams.currency,
    email: formParams.email,
    optional: formParams.optional,
    subject: formParams.subject,
    timeout: formParams.timeout, // Timeout de 1 hora para retenção
    urlConfirmation: formParams.urlConfirmation,
    urlReturn: formParams.urlReturn,
    signature: signature.substring(0, 16) + '...', // Mostra apenas início da assinatura
    allParams: Object.keys(formParams).sort(), // Mostra todas as chaves (ordem alfabética)
  });
  
  // VALIDAÇÃO FINAL ANTES DE ENVIAR AO FLOW
  console.log('🔍 VALIDAÇÃO FINAL DAS URLs (antes de enviar ao Flow):', {
    urlConfirmation_value: formParams.urlConfirmation,
    urlConfirmation_isValid: formParams.urlConfirmation && formParams.urlConfirmation.startsWith('https://') && formParams.urlConfirmation.includes('/api/webhook-flow'),
    urlReturn_value: formParams.urlReturn,
    urlReturn_isValid: formParams.urlReturn && formParams.urlReturn.startsWith('https://') && formParams.urlReturn.includes('/api/flow-return'),
    urlConfirmation_length: formParams.urlConfirmation ? formParams.urlConfirmation.length : 0,
    urlReturn_length: formParams.urlReturn ? formParams.urlReturn.length : 0,
  });
  
  // Se URL_CONFIRMATION estiver inválida, lança erro antes de enviar
  if (!formParams.urlConfirmation || !formParams.urlConfirmation.startsWith('https://')) {
    const errorMsg = `❌ ERRO CRÍTICO: urlConfirmation inválida antes de enviar ao Flow: "${formParams.urlConfirmation}"`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Faz requisição para Flow
  const path = '/payment/create';
  let response;
  try {
    response = await axios.post(
      `${FLOW_API_URL}${path}`,
      formBody, // Envia como string form-urlencoded
      { headers }
    );
  } catch (axiosError) {
    // Trata erros específicos do Flow.cl
    if (axiosError.response) {
      const flowError = axiosError.response.data;
      console.error('❌ Erro do Flow.cl:', {
        status: axiosError.response.status,
        code: flowError?.code,
        message: flowError?.message,
        formParams: {
          ...formParams,
          s: '***assinatura***', // Não loga a assinatura completa
        },
      });
      
      // Erro 101 = Missing Params
      if (flowError?.code === 101) {
        throw new Error(`Flow.cl: Parâmetros obrigatórios faltando. Detalhes: ${flowError.message || 'Verifique os logs'}`);
      }
      
      throw new Error(`Flow.cl Error ${flowError?.code || axiosError.response.status}: ${flowError?.message || axiosError.message}`);
    }
    throw axiosError;
  }

  // Flow.cl pode retornar JSON ou form-urlencoded
  // Axios geralmente faz o parse automaticamente
  const responseData = response.data;
  
  // Se vier como string (form-urlencoded), faz parse
  let parsedData = responseData;
  if (typeof responseData === 'string') {
    const params = new URLSearchParams(responseData);
    parsedData = {
      url: params.get('url'),
      token: params.get('token'),
    };
  }

  if (!parsedData || !parsedData.url || !parsedData.token) {
    console.error('❌ Resposta inválida do Flow.cl:', {
      responseData: responseData,
      parsedData: parsedData,
      status: response.status,
      headers: response.headers,
    });
    throw new Error('Resposta inválida do Flow.cl');
  }

  // Retorna URL completa de redirecionamento
  const redirectUrl = `${parsedData.url}?token=${parsedData.token}`;

  return {
    url: redirectUrl,
    token: parsedData.token,
    commerceOrder: formParams.commerceOrder,
    flowResponse: parsedData,
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








