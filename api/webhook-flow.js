/**
 * Webhook Flow.cl - Processa compras confirmadas
 * 
 * Endpoint: /api/webhook-flow
 * Method: POST
 * 
 * Recebe confirmação do Flow, valida, salva no banco e envia para Meta CAPI
 */

import crypto from 'crypto';
import axios from 'axios';

// ============================================
// CONFIGURAÇÃO
// ============================================
const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_URL = 'https://www.flow.cl/api';

// Meta
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1170692121796734';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';

// Supabase
// NOTA: Variáveis movidas para dentro do handler para evitar crashes no cold start
// const SUPABASE_URL será definida dentro do handler
// const SUPABASE_SERVICE_ROLE_KEY será validada dentro do handler
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWVrYnRjeXdld3pydmlxbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODI5NzAsImV4cCI6MjA4MDk1ODk3MH0.yTAW7soCiU-skkjAsuG1a-r0oKdzUJlbjyLYeC7w8lM';

// Tabelas
const TRACKING_TABLE = 'tracking_sqd_cas_lp1_vsl_hackermillon';
const PURCHASE_TABLE = 'tracking_sqd_cas_lp1_vsl_hackermillon_purchase';

// Status Flow: 2 = Pago
const FLOW_STATUS_PAID = 2;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera assinatura HMAC SHA256 para requisições Flow.cl
 * 
 * Formato: method\npath\ntimestamp\nnonce\nbody
 */
function generateFlowSignature(method, path, timestamp, nonce, body) {
  if (!FLOW_SECRET_KEY) {
    throw new Error('FLOW_SECRET_KEY não configurada');
  }

  const stringToSign = `${method}\n${path}\n${timestamp}\n${nonce}\n${body}`;
  
  // LOG para debug da assinatura
  console.log('🔐 Gerando assinatura Flow:', {
    method,
    path,
    timestamp,
    nonce: nonce.substring(0, 8) + '...',
    bodyLength: body ? body.length : 0,
    stringToSignLength: stringToSign.length,
    stringToSignPreview: stringToSign.substring(0, 100) + '...',
  });
  
  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(stringToSign)
    .digest('hex');

  console.log('✅ Assinatura gerada:', {
    signatureLength: signature.length,
    signaturePreview: signature.substring(0, 16) + '...',
  });

  return signature;
}

/**
 * Busca status do pagamento no Flow.cl
 * 
 * IMPORTANTE: O endpoint payment/getStatus requer assinatura HMAC
 * A assinatura é gerada com: method\npath\ntimestamp\nnonce\nbody
 */
async function getFlowPaymentStatus(token) {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error('FLOW_API_KEY e FLOW_SECRET_KEY são obrigatórias');
  }

  const method = 'GET';
  const path = `/payment/getStatus`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  const body = JSON.stringify({ token });

  // Gera assinatura HMAC SHA256
  const signature = generateFlowSignature(method, path, timestamp, nonce, body);

  const headers = {
    'Content-Type': 'application/json',
    'X-Flow-API-Key': FLOW_API_KEY,
    'X-Flow-Timestamp': timestamp,
    'X-Flow-Nonce': nonce,
    'X-Flow-Signature': signature,
  };

  try {
    const response = await axios.get(
      `${FLOW_API_URL}${path}?token=${encodeURIComponent(token)}`,
      { headers }
    );

    console.log('✅ getFlowPaymentStatus sucesso:', {
      status: response.status,
      hasData: !!response.data,
      paymentStatus: response.data?.status,
    });

    return response.data;
  } catch (error) {
    // LOG DETALHADO DO ERRO (conforme solicitado)
    console.error('❌ Erro ao buscar status do pagamento no Flow.cl:', {
      token: token ? token.substring(0, 20) + '...' : 'não fornecido',
      errorMessage: error.message,
      errorCode: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data, // LOG EXATO DO ERRO
      responseHeaders: error.response?.headers,
      requestConfig: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          'X-Flow-API-Key': error.config?.headers?.['X-Flow-API-Key'] ? 'presente' : 'ausente',
          'X-Flow-Timestamp': error.config?.headers?.['X-Flow-Timestamp'],
          'X-Flow-Nonce': error.config?.headers?.['X-Flow-Nonce'] ? 'presente' : 'ausente',
          'X-Flow-Signature': error.config?.headers?.['X-Flow-Signature'] ? 'presente' : 'ausente',
        },
      },
    });
    
    throw error;
  }
}

/**
 * Normaliza e faz hash SHA-256 dos dados do usuário para Advanced Matching
 */
function hashUserData(data) {
  if (!data) return null;
  const normalized = data.trim().toLowerCase();
  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

/**
 * Normaliza telefone (remove caracteres não numéricos)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
}

/**
 * Normaliza nome completo em primeiro nome e sobrenome
 */
function splitName(fullName) {
  if (!fullName) return { fn: null, ln: null };
  const parts = fullName.trim().split(/\s+/);
  const fn = parts[0] || null;
  const ln = parts.slice(1).join(' ') || null;
  return { fn, ln };
}

/**
 * Busca dados do lead no Supabase usando tracking_id (UUID)
 * 
 * IMPORTANTE: supabaseUrl deve ser passado como parâmetro
 */
async function findLeadByTrackingId(trackingId, supabaseUrl) {
  if (!trackingId) return null;

  try {
    const supabaseKey = SUPABASE_ANON_KEY;

    // Busca por ID (UUID)
    const query = `${supabaseUrl}/rest/v1/${TRACKING_TABLE}?id=eq.${encodeURIComponent(trackingId)}&limit=1`;

    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        console.log('✅ Match encontrado por tracking_id:', trackingId);
        return data[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar lead por tracking_id:', error);
    return null;
  }
}

/**
 * Busca dados do lead no Supabase usando email ou telefone (fallback)
 * 
 * IMPORTANTE: supabaseUrl deve ser passado como parâmetro
 */
async function findLeadData(email, phone, supabaseUrl) {
  if (!email && !phone) {
    return null;
  }

  try {
    const supabaseKey = SUPABASE_ANON_KEY;

    // Tenta match por email primeiro
    if (email) {
      const emailQuery = `${supabaseUrl}/rest/v1/${TRACKING_TABLE}?email=eq.${encodeURIComponent(email)}&order=timestamp.desc&limit=1`;

      const emailResponse = await fetch(emailQuery, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        if (emailData && emailData.length > 0) {
          console.log('✅ Match encontrado por email:', email);
          return emailData[0];
        }
      }
    }

    // Se não encontrou por email, tenta por telefone
    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      if (normalizedPhone) {
        const phoneQuery = `${supabaseUrl}/rest/v1/${TRACKING_TABLE}?phone=eq.${encodeURIComponent(normalizedPhone)}&order=timestamp.desc&limit=1`;

        const phoneResponse = await fetch(phoneQuery, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });

        if (phoneResponse.ok) {
          const phoneData = await phoneResponse.json();
          if (phoneData && phoneData.length > 0) {
            console.log('✅ Match encontrado por telefone:', normalizedPhone);
            return phoneData[0];
          }
        }
      }
    }

    console.log('⚠️ Nenhum match encontrado no Supabase');
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do lead no Supabase:', error);
    return null;
  }
}

/**
 * Salva venda na tabela de purchases usando SERVICE_ROLE_KEY
 * 
 * IMPORTANTE: SUPABASE_SERVICE_ROLE_KEY deve ser passada como parâmetro
 * para evitar problemas de inicialização no cold start
 */
async function savePurchaseToSupabase(purchaseData, serviceRoleKey, supabaseUrl) {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL não configurada');
  }

  const apiUrl = `${supabaseUrl}/rest/v1/${PURCHASE_TABLE}`;

  console.log('💾 Salvando venda no Supabase:', {
    flow_order_id: purchaseData.flow_order_id,
    tracking_id: purchaseData.tracking_id,
    amount: purchaseData.amount,
  });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(purchaseData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro ao salvar venda no Supabase:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Supabase API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const inserted = Array.isArray(result) ? result[0] : result;

  console.log('✅ Venda salva no Supabase:', {
    id: inserted.id,
    flow_order_id: inserted.flow_order_id,
  });

  return inserted;
}

/**
 * Envia evento Purchase para Facebook Conversions API
 * (Reutiliza lógica do webhook-perfectpay.js)
 */
async function sendPurchaseToMeta(purchaseData, leadData) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    throw new Error('META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios');
  }

  const userData = {};

  // Email (hasheado)
  const email = purchaseData.email || purchaseData.payer?.email;
  if (email) {
    userData.em = hashUserData(email);
  }

  // Telefone (hasheado)
  const phone = purchaseData.phone || purchaseData.payer?.phone;
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }

  // IP e User Agent (obrigatórios)
  if (purchaseData.ip) {
    userData.client_ip_address = purchaseData.ip;
  }
  if (purchaseData.user_agent) {
    userData.client_user_agent = purchaseData.user_agent;
  }

  // FBP e FBC (CRÍTICOS)
  if (purchaseData.fbp) {
    userData.fbp = purchaseData.fbp;
  }
  if (purchaseData.fbc) {
    userData.fbc = purchaseData.fbc;
  }

  // Nome completo (hasheado)
  const fullName = purchaseData.payer?.name || purchaseData.name;
  if (fullName) {
    const { fn, ln } = splitName(fullName);
    if (fn) {
      userData.fn = hashUserData(fn);
    }
    if (ln) {
      userData.ln = hashUserData(ln);
    }
  }

  // ENRIQUECIMENTO COM DADOS DO LEAD
  if (leadData) {
    // FBP e FBC do lead (prioridade se não tiver do webhook)
    if (!userData.fbp && leadData.fbp) {
      userData.fbp = leadData.fbp;
    }
    if (!userData.fbc && leadData.fbc) {
      userData.fbc = leadData.fbc;
    }

    // IP e User Agent do lead (fallback)
    if (!userData.client_ip_address && leadData.ip) {
      userData.client_ip_address = leadData.ip;
    }
    if (!userData.client_user_agent && leadData.user_agent) {
      userData.client_user_agent = leadData.user_agent;
    }

    // Dados pessoais do lead
    if (!userData.em && leadData.email) {
      userData.em = hashUserData(leadData.email);
    }
    if (!userData.ph && leadData.phone) {
      const normalizedPhone = normalizePhone(leadData.phone);
      if (normalizedPhone) {
        userData.ph = hashUserData(normalizedPhone);
      }
    }
    if (!userData.fn && leadData.first_name) {
      userData.fn = hashUserData(leadData.first_name);
    }
    if (!userData.ln && leadData.last_name) {
      userData.ln = hashUserData(leadData.last_name);
    }
  }

  // Validação final - IP e User Agent obrigatórios
  if (!userData.client_ip_address) {
    userData.client_ip_address = '0.0.0.0';
    console.warn('⚠️ IP não encontrado - usando fallback');
  }
  if (!userData.client_user_agent) {
    userData.client_user_agent = 'Unknown';
    console.warn('⚠️ User Agent não encontrado - usando fallback');
  }

  // Prepara evento Purchase
  const orderId = purchaseData.flow_order_id || purchaseData.commerceOrder || `flow_${Date.now()}`;
  const value = parseFloat(purchaseData.amount) || 0;
  const currency = purchaseData.currency || 'CLP';

  // Timestamp do evento
  let eventTime = Math.floor(Date.now() / 1000);
  if (purchaseData.date) {
    const eventDate = new Date(purchaseData.date);
    if (!isNaN(eventDate.getTime())) {
      eventTime = Math.floor(eventDate.getTime() / 1000);
    }
  }

  const eventData = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: orderId,
        event_source_url: purchaseData.url || 'https://www.hmagencyia.online',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: currency,
          value: value,
          content_type: 'product',
          content_ids: [orderId],
          content_name: purchaseData.subject || 'Product',
          order_id: orderId,
          num_items: 1,
        },
      },
    ],
  };

  // Enriquece com UTMs do lead (se encontrado)
  if (leadData) {
    if (leadData.utm_source || leadData.utm_campaign || leadData.utm_medium) {
      eventData.data[0].custom_data = {
        ...eventData.data[0].custom_data,
        ...(leadData.utm_source && { utm_source: leadData.utm_source }),
        ...(leadData.utm_campaign && { utm_campaign: leadData.utm_campaign }),
        ...(leadData.utm_medium && { utm_medium: leadData.utm_medium }),
        ...(leadData.utm_term && { utm_term: leadData.utm_term }),
        ...(leadData.utm_content && { utm_content: leadData.utm_content }),
      };
    }
  }

  // URL da Meta Conversions API
  const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

  // Faz requisição para Facebook
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...eventData,
      access_token: META_ACCESS_TOKEN,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Facebook API Error: ${result.error?.message || JSON.stringify(result)}`
    );
  }

  return result;
}

/**
 * Handler da Serverless Function (Vercel)
 * 
 * PROTEÇÃO CONTRA CRASH: Todo o código está dentro de try/catch
 */
export default async function handler(req, res) {
  // ============================================
  // TRY/CATCH GIGANTE - NADA PODE FICAR DE FORA
  // ============================================
  try {
    // ============================================
    // LOG CRÍTICO: PRIMEIRA LINHA (WEBHOOK RECEIVED)
    // ============================================
    console.log('🚨 WEBHOOK RECEIVED:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      contentType: req.headers?.['content-type'],
      bodyRaw: typeof req.body === 'string' ? req.body?.substring(0, 200) : JSON.stringify(req.body || {}).substring(0, 200),
      bodyType: typeof req.body,
      bodyIsString: typeof req.body === 'string',
      bodyLength: typeof req.body === 'string' ? req.body.length : 'N/A',
    });

    // ============================================
    // CONFIGURAÇÃO DE CORS (ANTES DE QUALQUER COISA)
    // ============================================
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } catch (corsError) {
      console.error('⚠️ Erro ao configurar CORS (não crítico):', corsError.message);
    }

    // ============================================
    // VERIFICAÇÃO DE MÉTODO GET (TESTE NO NAVEGADOR)
    // ============================================
    if (req.method === 'GET') {
      console.log('✅ GET request recebido - retornando mensagem de teste');
      return res.status(200).json({
        success: true,
        message: 'Webhook is working! Send POST to test.',
        endpoint: '/api/webhook-flow',
        method: 'POST',
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // TRATAR OPTIONS (PREFLIGHT)
    // ============================================
    if (req.method === 'OPTIONS') {
      console.log('📋 OPTIONS request recebido (preflight)');
      return res.status(200).end();
    }

    // ============================================
    // VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
    // ============================================
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não configurada!');
      console.error('Variáveis de ambiente disponíveis:', {
        hasFlowApiKey: !!process.env.FLOW_API_KEY,
        hasFlowSecretKey: !!process.env.FLOW_SECRET_KEY,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseServiceRoleKey: false, // Já sabemos que não tem
        hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      });
      // Não crashe, apenas logue e continue (pode salvar depois se tiver)
      console.warn('⚠️ Continuando sem SUPABASE_SERVICE_ROLE_KEY - salvamento no Supabase será pulado');
    }

    // ============================================
    // LOGS AGRESSIVOS NO INÍCIO
    // ============================================
    console.log('🚨 WEBHOOK-FLOW CHAMADO - LOG INICIAL:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers?.['content-type'],
        'user-agent': req.headers?.['user-agent'],
        'x-forwarded-for': req.headers?.['x-forwarded-for'],
        'host': req.headers?.['host'],
      },
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
    });

    // ============================================
    // VALIDAÇÃO DE MÉTODO POST
    // ============================================
    if (req.method !== 'POST') {
      console.error('❌ Método não permitido:', req.method);
      return res.status(405).json({
        error: 'Method not allowed',
        message: 'Apenas requisições POST são aceitas',
        received_method: req.method,
      });
    }

    console.log('✅ Método POST confirmado - iniciando processamento...');

    // ============================================
    // PARSE DO BODY - SUPORTA form-urlencoded E JSON
    // ============================================
    let body = req.body;
    const contentType = req.headers['content-type'] || '';
    
    console.log('📦 Body recebido (antes do parse):', {
      type: typeof body,
      contentType: contentType,
      isString: typeof body === 'string',
      length: typeof body === 'string' ? body.length : 'N/A',
      preview: typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200),
    });
    
    // Se o body é string, pode ser JSON ou form-urlencoded
    if (typeof body === 'string') {
      // Verifica se é form-urlencoded
      if (contentType.includes('application/x-www-form-urlencoded') || (body.includes('=') && !body.trim().startsWith('{') && !body.trim().startsWith('['))) {
        try {
          // Parse como form-urlencoded
          const params = new URLSearchParams(body);
          body = {};
          for (const [key, value] of params.entries()) {
            body[key] = value;
          }
          console.log('✅ Body parseado como form-urlencoded:', {
            keys: Object.keys(body),
            token: body.token ? body.token.substring(0, 20) + '...' : 'não encontrado',
            allKeys: Object.keys(body),
          });
        } catch (e) {
          console.error('❌ Erro ao fazer parse do form-urlencoded:', e.message);
          // Tenta como JSON como fallback
          try {
            body = JSON.parse(body);
            console.log('✅ Body parseado como JSON (fallback)');
          } catch (e2) {
            console.error('❌ Erro ao fazer parse do JSON (fallback):', e2.message);
            return res.status(400).json({
              error: 'Invalid Body Format',
              message: 'Body não pôde ser parseado como form-urlencoded ou JSON',
              details: e.message,
              bodyPreview: body.substring(0, 200),
            });
          }
        }
      } else {
        // Tenta como JSON
        try {
          body = JSON.parse(body);
          console.log('✅ Body parseado como JSON');
        } catch (e) {
          console.error('❌ Erro ao fazer parse do JSON:', e.message);
          return res.status(400).json({
            error: 'Invalid JSON',
            message: 'Body deve ser um JSON válido',
            details: e.message,
            bodyPreview: body.substring(0, 200),
          });
        }
      }
    } else if (body && typeof body === 'object') {
      // Vercel pode já ter parseado o body automaticamente
      console.log('✅ Body já é objeto (Vercel pode ter parseado automaticamente):', {
        keys: Object.keys(body),
        token: body.token ? body.token.substring(0, 20) + '...' : 'não encontrado',
      });
    } else {
      console.error('❌ Body inválido ou vazio:', {
        bodyType: typeof body,
        bodyValue: body,
      });
      return res.status(400).json({
        error: 'Invalid Body',
        message: 'Body é obrigatório',
        bodyType: typeof body,
      });
    }

    // Log do payload recebido (AGRESSIVO)
    console.log('📥 Webhook Flow.cl recebido - PAYLOAD COMPLETO:', {
      timestamp: new Date().toISOString(),
      token: body.token,
      hasToken: !!body.token,
      tokenLength: body.token ? body.token.length : 0,
      tokenValue: body.token ? body.token.substring(0, 30) + '...' : 'NÃO ENCONTRADO',
      bodyKeys: Object.keys(body),
      bodyFull: JSON.stringify(body).substring(0, 500), // Primeiros 500 chars
      allBodyValues: Object.entries(body).map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 50) : v]),
    });

    // Validação: token é obrigatório
    const token = body.token || body.TOKEN || body['token']; // Tenta múltiplas variações
    if (!token) {
      console.error('❌ Token não encontrado no body:', {
        bodyKeys: Object.keys(body),
        bodyValues: Object.values(body).map(v => typeof v === 'string' ? v.substring(0, 50) : String(v)),
      });
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token é obrigatório',
        receivedKeys: Object.keys(body),
      });
    }
    
    console.log('✅ Token extraído com sucesso:', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 30) + '...',
    });

    // Valida pagamento no Flow (busca status)
    console.log('🔍 Validando pagamento no Flow.cl com token:', token ? token.substring(0, 20) + '...' : 'NÃO FORNECIDO');
    let flowStatus;
    try {
      flowStatus = await getFlowPaymentStatus(token);
    } catch (error) {
      // LOG DETALHADO DO ERRO (conforme solicitado)
      console.error('❌ ERRO CRÍTICO ao validar pagamento no Flow.cl:', {
        token: token ? token.substring(0, 20) + '...' : 'NÃO FORNECIDO',
        errorMessage: error.message,
        errorStack: error.stack,
        responseData: error.response?.data, // LOG EXATO DO ERRO
        responseStatus: error.response?.status,
        responseHeaders: error.response?.headers,
      });
      
      // Retorna erro mas não quebra o webhook completamente
      return res.status(500).json({
        success: false,
        error: 'Erro ao validar pagamento no Flow.cl',
        message: error.message || 'Erro desconhecido',
        details: error.response?.data || null,
        token_provided: !!token,
      });
    }

    console.log('📊 Status do pagamento Flow:', {
      status: flowStatus.status,
      commerceOrder: flowStatus.commerceOrder,
      amount: flowStatus.amount,
      payer: flowStatus.payer?.email,
    });

    // Verifica se está pago (status === 2)
    if (flowStatus.status !== FLOW_STATUS_PAID) {
      return res.status(200).json({
        success: true,
        message: 'Webhook recebido mas pagamento não está pago',
        status: flowStatus.status,
        note: 'Apenas pagamentos com status 2 (Pago) são processados',
      });
    }

    // ============================================
    // LÓGICA DE MATCH (BLINDADA)
    // ============================================

    let leadData = null;
    let trackingId = null;

    // 1. Tenta ler tracking_id do campo optional
    try {
      if (flowStatus.optional) {
        let optionalData;
        if (typeof flowStatus.optional === 'string') {
          optionalData = JSON.parse(flowStatus.optional);
        } else {
          optionalData = flowStatus.optional;
        }

        if (optionalData.tracking_id) {
          trackingId = optionalData.tracking_id;
          console.log('✅ tracking_id encontrado no optional:', trackingId);

          // Busca lead por tracking_id (UUID)
          const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jhyekbtcywewzrviqlos.supabase.co';
          leadData = await findLeadByTrackingId(trackingId, SUPABASE_URL);
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao ler optional:', error.message);
    }

    // 2. Fallback: busca por email do payer
    if (!leadData && flowStatus.payer?.email) {
      console.log('🔍 Fallback: buscando lead por email...');
      const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jhyekbtcywewzrviqlos.supabase.co';
      leadData = await findLeadData(
        flowStatus.payer.email,
        flowStatus.payer.phone,
        SUPABASE_URL
      );
    }

    if (leadData) {
      console.log('✅ Dados do lead encontrados:', {
        hasFbp: !!leadData.fbp,
        hasFbc: !!leadData.fbc,
        hasUtms: !!(leadData.utm_source || leadData.utm_campaign),
        trackingId: leadData.id,
      });
    } else {
      console.log('⚠️ Dados do lead não encontrados - enviando apenas dados do webhook');
    }

    // ============================================
    // SALVA VENDA NO SUPABASE
    // ============================================

    const purchaseData = {
      flow_order_id: flowStatus.commerceOrder || flowStatus.token,
      flow_token: token,
      tracking_id: trackingId || leadData?.id || null,
      amount: parseFloat(flowStatus.amount) || 0,
      currency: flowStatus.currency || 'CLP',
      status: flowStatus.status,
      payer_email: flowStatus.payer?.email || null,
      payer_name: flowStatus.payer?.name || null,
      payer_phone: flowStatus.payer?.phone || null,
      raw_data: flowStatus, // Dados completos do Flow
      created_at: new Date().toISOString(),
    };

    let savedPurchase = null;
    let saveError = null;

    // Só tenta salvar se tiver a chave configurada
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jhyekbtcywewzrviqlos.supabase.co';
        savedPurchase = await savePurchaseToSupabase(purchaseData, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL);
      } catch (error) {
        saveError = error.message;
        console.error('❌ Erro ao salvar venda no Supabase:', {
          errorMessage: error.message,
          errorStack: error.stack,
        });
        // Continua mesmo se houver erro (não bloqueia envio para Meta)
      }
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não configurada - pulando salvamento no Supabase');
      saveError = 'SUPABASE_SERVICE_ROLE_KEY não configurada';
    }

    // ============================================
    // ENVIA PARA META CAPI
    // ============================================

    // Prepara dados para Meta (enriquecido com lead)
    const metaPurchaseData = {
      flow_order_id: purchaseData.flow_order_id,
      commerceOrder: flowStatus.commerceOrder,
      amount: purchaseData.amount,
      currency: purchaseData.currency,
      email: purchaseData.payer_email,
      phone: purchaseData.payer_phone,
      name: purchaseData.payer_name,
      payer: flowStatus.payer,
      date: flowStatus.date || new Date().toISOString(),
      url: flowStatus.urlReturn || 'https://www.hmagencyia.online',
      // IP e User Agent virão do lead se disponível
      ip: leadData?.ip || null,
      user_agent: leadData?.user_agent || null,
      fbp: leadData?.fbp || null,
      fbc: leadData?.fbc || null,
    };

    let metaResponse = null;
    let metaError = null;

    try {
      metaResponse = await sendPurchaseToMeta(metaPurchaseData, leadData);
      console.log('✅ Evento Purchase enviado com sucesso para Facebook:', {
        timestamp: new Date().toISOString(),
        events_received: metaResponse.events_received,
        order_id: purchaseData.flow_order_id,
      });
    } catch (error) {
      metaError = error.message;
      console.error('❌ Erro ao enviar para Facebook:', error);
    }

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      data: {
        flow_order_id: purchaseData.flow_order_id,
        status: flowStatus.status,
        amount: purchaseData.amount,
        lead_match: leadData
          ? {
              found: true,
              method: trackingId ? 'tracking_id' : 'email',
              tracking_id: leadData.id,
              has_fbp: !!leadData.fbp,
              has_fbc: !!leadData.fbc,
              has_utms: !!(leadData.utm_source || leadData.utm_campaign),
            }
          : {
              found: false,
            },
        purchase: {
          saved: !!savedPurchase,
          id: savedPurchase?.id || null,
          error: saveError,
        },
        meta: {
          sent: !!metaResponse,
          events_received: metaResponse?.events_received || null,
          error: metaError,
        },
      },
    });

  } catch (error) {
    // ============================================
    // CATCH FINAL - CAPTURA QUALQUER ERRO
    // ============================================
    console.error('❌ ERRO CRÍTICO ao processar webhook Flow.cl:', {
      timestamp: new Date().toISOString(),
      errorMessage: error?.message || 'Erro desconhecido',
      errorName: error?.name || 'Unknown',
      errorStack: error?.stack || 'No stack trace',
      // LOG EXATO DO ERRO
      responseData: error?.response?.data,
      responseStatus: error?.response?.status,
      responseHeaders: error?.response?.headers,
      requestUrl: error?.config?.url,
      requestMethod: error?.config?.method,
      requestHeaders: error?.config?.headers ? Object.keys(error.config.headers) : [],
      // Informações adicionais
      method: req?.method,
      url: req?.url,
      hasBody: !!req?.body,
      bodyType: typeof req?.body,
    });

    // Resposta de erro (sempre retorna algo, nunca crashe)
    try {
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error?.message || 'Erro ao processar webhook',
        details: error?.response?.data || null,
        timestamp: new Date().toISOString(),
      });
    } catch (responseError) {
      // Se até mesmo o res.status falhar, logue e retorne
      console.error('❌ ERRO AO ENVIAR RESPOSTA DE ERRO:', responseError);
      // Tenta enviar resposta básica
      try {
        res.status(500).end('Internal Server Error');
      } catch (finalError) {
        console.error('❌ ERRO CRÍTICO: Não foi possível enviar resposta:', finalError);
      }
    }
  }
}








