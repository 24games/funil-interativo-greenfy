/**
 * API Route para Tracking de InitiateCheckout
 * 
 * Recebe dados quando o usuário clica no botão de checkout
 * e envia para Meta Conversions API
 * 
 * Endpoint: /api/tracking-initiate-checkout
 * Method: POST
 */

import crypto from 'crypto';

// ============================================
// CONFIGURAÇÃO
// ============================================
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1170692121796734';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

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
 * Gera um event_id único
 */
function generateEventId(data) {
  const timestamp = Date.now();
  const userIdentifier = data.email || data.phone || data.ip || 'anonymous';
  const hash = crypto
    .createHash('md5')
    .update(`${userIdentifier}-${timestamp}-initiate-checkout`)
    .digest('hex')
    .substring(0, 16);
  
  return `initiatecheckout_${timestamp}_${hash}`;
}

/**
 * Envia evento InitiateCheckout para Facebook Conversions API
 */
async function sendInitiateCheckoutToMeta(data) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    throw new Error('META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios');
  }

  // Normaliza e faz hash dos dados do usuário (Advanced Matching)
  const userData = {};
  
  if (data.email) {
    userData.em = hashUserData(data.email);
  }
  
  if (data.first_name) {
    userData.fn = hashUserData(data.first_name);
  }
  
  if (data.last_name) {
    userData.ln = hashUserData(data.last_name);
  }
  
  if (data.phone) {
    const normalizedPhone = normalizePhone(data.phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }

  // Adiciona fbp e fbc se disponíveis (CRÍTICOS para matching)
  if (data.fbp) {
    userData.fbp = data.fbp;
  }
  
  if (data.fbc) {
    userData.fbc = data.fbc;
  }

  // Adiciona IP e User Agent (melhora matching)
  if (data.ip) {
    userData.client_ip_address = data.ip;
  }
  
  if (data.user_agent) {
    userData.client_user_agent = data.user_agent;
  }

  // Prepara o evento InitiateCheckout
  const eventData = {
    data: [
      {
        event_name: 'InitiateCheckout',
        event_time: Math.floor((data.timestamp ? new Date(data.timestamp).getTime() : Date.now()) / 1000),
        event_id: data.event_id || generateEventId(data),
        event_source_url: data.page_url || 'https://www.hackermillon.online/?step=7',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_name: 'Checkout - App Liberado',
          content_category: 'checkout',
          currency: data.currency || 'CLP',
          value: parseFloat(data.value) || 0,
        },
      },
    ],
  };

  // Adiciona UTMs se disponíveis
  if (data.utm_source || data.utm_campaign || data.utm_medium) {
    eventData.data[0].custom_data = {
      ...eventData.data[0].custom_data,
      ...(data.utm_source && { utm_source: data.utm_source }),
      ...(data.utm_campaign && { utm_campaign: data.utm_campaign }),
      ...(data.utm_medium && { utm_medium: data.utm_medium }),
      ...(data.utm_term && { utm_term: data.utm_term }),
      ...(data.utm_content && { utm_content: data.utm_content }),
    };
  }

  // URL da Meta Conversions API
  const apiUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;

  // Faz a requisição para Facebook
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
      received_method: req.method
    });
  }

  try {
    // Parse do body se necessário
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          error: 'Invalid JSON',
          message: 'Body deve ser um JSON válido'
        });
      }
    }
    
    // Log do payload recebido
    console.log('InitiateCheckout tracking recebido:', {
      timestamp: new Date().toISOString(),
      hasEmail: !!body.email,
      hasPhone: !!body.phone,
      hasFbp: !!body.fbp,
      hasFbc: !!body.fbc,
      pageUrl: body.page_url,
      eventId: body.event_id,
    });

    // Preparar dados para envio
    const trackingData = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
      event_id: body.event_id || generateEventId(body),
    };

    // Enviar evento para Facebook CAPI
    let metaResponse = null;
    let metaError = null;
    
    try {
      metaResponse = await sendInitiateCheckoutToMeta(trackingData);
      console.log('Evento InitiateCheckout enviado com sucesso para Facebook:', {
        timestamp: new Date().toISOString(),
        events_received: metaResponse.events_received,
        event_id: trackingData.event_id,
      });
    } catch (error) {
      metaError = error.message;
      console.error('Erro ao enviar para Facebook:', error);
    }

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'InitiateCheckout processado',
      data: {
        event_id: trackingData.event_id,
        meta: {
          sent: !!metaResponse,
          events_received: metaResponse?.events_received || null,
          error: metaError,
        },
      },
    });

  } catch (error) {
    // Log de erro
    console.error('Erro ao processar InitiateCheckout:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    // Resposta de erro
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Erro ao processar InitiateCheckout',
    });
  }
}



























