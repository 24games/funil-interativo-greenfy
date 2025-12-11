/**
 * Webhook Perfect Pay - Processa compras aprovadas
 * 
 * Endpoint: /api/webhook-perfectpay
 * Method: POST
 * 
 * Public Token: c0ffab31cf0cde81d7064efda713cefb
 */

import crypto from 'crypto';

// ============================================
// CONFIGURAÇÃO
// ============================================
const PERFECT_PAY_PUBLIC_TOKEN = process.env.PERFECT_PAY_PUBLIC_TOKEN || 'c0ffab31cf0cde81d7064efda713cefb';
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1170692121796734';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jhyekbtcywewzrviqlos.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWVrYnRjeXdld3pydmlxbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODI5NzAsImV4cCI6MjA4MDk1ODk3MH0.yTAW7soCiU-skkjAsuG1a-r0oKdzUJlbjyLYeC7w8lM';
const TRACKING_TABLE = 'tracking_sqd_cas_lp1_vsl_hackermillon';

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
  // Remove tudo exceto números
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
 * Busca dados do lead no Supabase usando email ou telefone
 */
async function findLeadData(email, phone) {
  if (!email && !phone) {
    return null;
  }

  try {
    const supabaseUrl = SUPABASE_URL;
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
 * Envia evento Purchase para Facebook Conversions API
 */
async function sendPurchaseToMeta(purchaseData, leadData) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    throw new Error('META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios');
  }

  // Normaliza e faz hash dos dados do usuário (Advanced Matching)
  const userData = {};
  
  // Dados do webhook (prioridade)
  const email = purchaseData.customer?.email || purchaseData.email;
  const phone = purchaseData.customer?.phone_number || purchaseData.customer?.phone_formated || purchaseData.phone;
  const fullName = purchaseData.customer?.full_name || purchaseData.name;
  
  if (email) {
    userData.em = hashUserData(email);
  }
  
  if (fullName) {
    const { fn, ln } = splitName(fullName);
    if (fn) userData.fn = hashUserData(fn);
    if (ln) userData.ln = hashUserData(ln);
  }
  
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }

  // Enriquece com dados do lead (se encontrado)
  if (leadData) {
    // FBP e FBC do lead (CRÍTICOS para matching)
    if (leadData.fbp && !userData.fbp) {
      userData.fbp = leadData.fbp;
    }
    if (leadData.fbc && !userData.fbc) {
      userData.fbc = leadData.fbc;
    }
    
    // IP e User Agent do lead (se não tiver do webhook)
    if (!userData.client_ip_address && leadData.ip) {
      userData.client_ip_address = leadData.ip;
    }
    if (!userData.client_user_agent && leadData.user_agent) {
      userData.client_user_agent = leadData.user_agent;
    }
  }

  // IP e User Agent do webhook (prioridade)
  if (purchaseData.customer?.ip) {
    userData.client_ip_address = purchaseData.customer.ip;
  }
  if (purchaseData.customer?.user_agent) {
    userData.client_user_agent = purchaseData.customer.user_agent;
  }

  // Prepara o evento Purchase
  const orderId = purchaseData.code || purchaseData.order_id || `order_${Date.now()}`;
  const value = parseFloat(purchaseData.sale_amount) || 0;
  const currency = purchaseData.currency_enum_key || purchaseData.currency || 'BRL';
  
  // Timestamp do evento (usa data_approved se disponível)
  let eventTime = Math.floor(Date.now() / 1000);
  if (purchaseData.date_approved) {
    const approvedDate = new Date(purchaseData.date_approved);
    if (!isNaN(approvedDate.getTime())) {
      eventTime = Math.floor(approvedDate.getTime() / 1000);
    }
  }

  const eventData = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: orderId,
        event_source_url: purchaseData.url_tracking || 'https://www.hackermillon.online',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: currency,
          value: value,
          content_type: 'product',
          content_ids: [purchaseData.product?.code || orderId],
          content_name: purchaseData.product?.name || 'Product',
          order_id: orderId,
          num_items: purchaseData.quantity || 1,
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

  // UTMs do webhook (metadata) - prioridade sobre lead
  if (purchaseData.metadata) {
    if (purchaseData.metadata.utm_source || purchaseData.metadata.utm_campaign) {
      eventData.data[0].custom_data = {
        ...eventData.data[0].custom_data,
        ...(purchaseData.metadata.utm_source && { utm_source: purchaseData.metadata.utm_source }),
        ...(purchaseData.metadata.utm_campaign && { utm_campaign: purchaseData.metadata.utm_campaign }),
        ...(purchaseData.metadata.utm_medium && { utm_medium: purchaseData.metadata.utm_medium }),
        ...(purchaseData.metadata.utm_term && { utm_term: purchaseData.metadata.utm_term }),
        ...(purchaseData.metadata.utm_content && { utm_content: purchaseData.metadata.utm_content }),
      };
    }
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
    console.log('📥 Webhook PerfectPay recebido:', {
      timestamp: new Date().toISOString(),
      code: body.code,
      sale_status: body.sale_status_enum_key,
      email: body.customer?.email,
      phone: body.customer?.phone_number,
      amount: body.sale_amount,
    });

    // Validação: verifica se a venda foi aprovada
    if (body.sale_status_enum_key !== 'approved') {
      return res.status(200).json({
        success: true,
        message: 'Webhook recebido mas venda não aprovada',
        sale_status: body.sale_status_enum_key,
        note: 'Apenas vendas aprovadas são processadas',
      });
    }

    // Validação: verifica se tem email ou telefone
    const email = body.customer?.email;
    const phone = body.customer?.phone_number || body.customer?.phone_formated;
    
    if (!email && !phone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email ou telefone do cliente é obrigatório',
      });
    }

    // Busca dados do lead no Supabase para enriquecer
    console.log('🔍 Buscando dados do lead no Supabase...');
    const leadData = await findLeadData(email, phone);
    
    if (leadData) {
      console.log('✅ Dados do lead encontrados:', {
        hasFbp: !!leadData.fbp,
        hasFbc: !!leadData.fbc,
        hasUtms: !!(leadData.utm_source || leadData.utm_campaign),
      });
    } else {
      console.log('⚠️ Dados do lead não encontrados - enviando apenas dados do webhook');
    }

    // Envia evento Purchase para Facebook CAPI
    let metaResponse = null;
    let metaError = null;
    
    try {
      metaResponse = await sendPurchaseToMeta(body, leadData);
      console.log('✅ Evento Purchase enviado com sucesso para Facebook:', {
        timestamp: new Date().toISOString(),
        events_received: metaResponse.events_received,
        order_id: body.code,
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
        order_id: body.code,
        sale_status: body.sale_status_enum_key,
        lead_match: leadData ? {
          found: true,
          has_fbp: !!leadData.fbp,
          has_fbc: !!leadData.fbc,
          has_utms: !!(leadData.utm_source || leadData.utm_campaign),
        } : {
          found: false,
        },
        meta: {
          sent: !!metaResponse,
          events_received: metaResponse?.events_received || null,
          error: metaError,
        },
      },
    });

  } catch (error) {
    // Log de erro
    console.error('❌ Erro ao processar webhook PerfectPay:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    // Resposta de erro
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Erro ao processar webhook',
    });
  }
}

