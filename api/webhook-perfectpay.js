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
const PURCHASE_TABLE = 'tracking_sqd_cas_lp1_vsl_hackermillon_purchase';

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
 * Valida se uma string é um UUID válido
 */
function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  // Regex para UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Busca dados do lead no Supabase usando tracking_id (UUID) - PRIORIDADE MÁXIMA
 */
async function findLeadByTrackingId(trackingId) {
  if (!trackingId || !isValidUUID(trackingId)) {
    return null;
  }

  try {
    const supabaseUrl = SUPABASE_URL;
    const supabaseKey = SUPABASE_ANON_KEY;
    
    // Busca por ID (UUID) - match direto
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
        console.log('✅ Match encontrado por tracking_id (sale_tracking_source):', trackingId);
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
 * Busca dados do lead no Supabase usando email ou telefone (FALLBACK)
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

  console.log('💾 Salvando venda Perfect Pay no Supabase:', {
    flow_order_id: purchaseData.flow_order_id,
    tracking_id: purchaseData.tracking_id,
    amount: purchaseData.amount,
    payer_email: purchaseData.payer_email,
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
    console.error('❌ Erro ao salvar venda Perfect Pay no Supabase:', {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Supabase API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const inserted = Array.isArray(result) ? result[0] : result;

  console.log('✅ Venda Perfect Pay salva no Supabase:', {
    id: inserted.id,
    flow_order_id: inserted.flow_order_id,
  });

  return inserted;
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
  
  // ============================================
  // DADOS OBRIGATÓRIOS PARA IDENTIFICAÇÃO
  // ============================================
  
  // Email (hasheado)
  const email = purchaseData.customer?.email || purchaseData.email;
  if (email) {
    userData.em = hashUserData(email);
  }
  
  // Telefone (hasheado)
  const phone = purchaseData.customer?.phone_number || purchaseData.customer?.phone_formated || purchaseData.phone;
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }
  
  // IP Address (texto claro - obrigatório)
  if (purchaseData.customer?.ip) {
    userData.client_ip_address = purchaseData.customer.ip;
  }
  
  // User Agent (texto claro - obrigatório)
  if (purchaseData.customer?.user_agent) {
    userData.client_user_agent = purchaseData.customer.user_agent;
  }
  
  // FBP e FBC (texto claro - CRÍTICOS para matching)
  // Primeiro tenta do webhook, depois do lead
  if (purchaseData.fbp) {
    userData.fbp = purchaseData.fbp;
  }
  if (purchaseData.fbc) {
    userData.fbc = purchaseData.fbc;
  }
  
  // ============================================
  // DADOS PESSOAIS (quando disponíveis)
  // ============================================
  
  // Nome completo (hasheado)
  const fullName = purchaseData.customer?.full_name || purchaseData.name;
  if (fullName) {
    const { fn, ln } = splitName(fullName);
    if (fn) {
      userData.fn = hashUserData(fn);
    }
    if (ln) {
      userData.ln = hashUserData(ln);
    }
  }
  
  // Data de nascimento (hasheado - formato YYYY-MM-DD)
  const dateOfBirth = purchaseData.customer?.date_birth || purchaseData.customer?.birthday || purchaseData.date_of_birth;
  if (dateOfBirth) {
    // Normaliza para formato YYYY-MM-DD se necessário
    let dobFormatted = dateOfBirth;
    if (typeof dateOfBirth === 'string' && dateOfBirth.includes('/')) {
      // Converte de DD/MM/YYYY para YYYY-MM-DD
      const parts = dateOfBirth.split('/');
      if (parts.length === 3) {
        dobFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    userData.db = hashUserData(dobFormatted);
  }
  
  // ============================================
  // LOCALIZAÇÃO (quando disponível)
  // ============================================
  
  // Cidade (hasheado)
  const city = purchaseData.customer?.city || purchaseData.city;
  if (city) {
    userData.ct = hashUserData(city);
  }
  
  // Estado/Região (hasheado)
  const state = purchaseData.customer?.state || purchaseData.state;
  if (state) {
    userData.st = hashUserData(state);
  }
  
  // País (hasheado - código ISO)
  const country = purchaseData.customer?.country || purchaseData.country;
  if (country) {
    userData.country = hashUserData(country);
  }
  
  // CEP/Zip Code (hasheado)
  const zipCode = purchaseData.customer?.zip_code || purchaseData.zip_code;
  if (zipCode) {
    userData.zp = hashUserData(zipCode);
  }
  
  // ============================================
  // ENRIQUECIMENTO COM DADOS DO LEAD
  // ============================================
  
  if (leadData) {
    // FBP e FBC do lead (CRÍTICOS - prioridade se não tiver do webhook)
    if (!userData.fbp && leadData.fbp) {
      userData.fbp = leadData.fbp;
    }
    if (!userData.fbc && leadData.fbc) {
      userData.fbc = leadData.fbc;
    }
    
    // IP e User Agent do lead (fallback se não tiver do webhook)
    if (!userData.client_ip_address && leadData.ip) {
      userData.client_ip_address = leadData.ip;
    }
    if (!userData.client_user_agent && leadData.user_agent) {
      userData.client_user_agent = leadData.user_agent;
    }
    
    // Dados pessoais do lead (se não tiver do webhook)
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
    
    // Localização do lead (se não tiver do webhook)
    if (!userData.ct && leadData.city) {
      userData.ct = hashUserData(leadData.city);
    }
    if (!userData.st && leadData.state) {
      userData.st = hashUserData(leadData.state);
    }
    if (!userData.country && leadData.country) {
      userData.country = hashUserData(leadData.country);
    }
    if (!userData.zp && leadData.zip_code) {
      userData.zp = hashUserData(leadData.zip_code);
    }
    
    // Data de nascimento do lead (se não tiver do webhook)
    if (!userData.db && leadData.date_of_birth) {
      userData.db = hashUserData(leadData.date_of_birth);
    }
  }
  
  // ============================================
  // VALIDAÇÃO FINAL - GARANTIR PARÂMETROS MÍNIMOS
  // ============================================
  
  // IP e User Agent são OBRIGATÓRIOS - usar fallback se necessário
  if (!userData.client_ip_address) {
    // Tenta extrair do header da requisição (se disponível)
    userData.client_ip_address = '0.0.0.0'; // Fallback mínimo
    console.warn('⚠️ IP não encontrado - usando fallback');
  }
  
  if (!userData.client_user_agent) {
    userData.client_user_agent = 'Unknown'; // Fallback mínimo
    console.warn('⚠️ User Agent não encontrado - usando fallback');
  }

  // Prepara o evento Purchase
  const orderId = purchaseData.code || purchaseData.order_id || `order_${Date.now()}`;
  const value = parseFloat(purchaseData.sale_amount) || 0;
  // FORÇA CLP - Corrige se Perfect Pay enviar BRL incorretamente
  const currency = 'CLP';
  
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
      sale_tracking_source: body.sale_tracking_source || body.sck || body.tracking_source || 'não fornecido',
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

    // ============================================
    // BUSCA DO LEAD - PRIORIDADE: sale_tracking_source > email/telefone
    // ============================================
    
    // 1. PRIORIDADE MÁXIMA: Verifica se o webhook traz sale_tracking_source (sck)
    const saleTrackingSource = body.sale_tracking_source || body.sck || body.tracking_source;
    let leadData = null;
    let matchMethod = null;
    
    if (saleTrackingSource && isValidUUID(saleTrackingSource)) {
      console.log('🔍 Buscando lead por sale_tracking_source (tracking_id):', saleTrackingSource);
      leadData = await findLeadByTrackingId(saleTrackingSource);
      
      if (leadData) {
        matchMethod = 'sale_tracking_source';
        console.log('✅ Lead encontrado via sale_tracking_source - Match 100% garantido!');
      } else {
        console.log('⚠️ sale_tracking_source fornecido mas lead não encontrado - tentando fallback');
      }
    }
    
    // 2. FALLBACK: Se não encontrou por tracking_id, tenta por email/telefone
    if (!leadData) {
      const email = body.customer?.email;
      const phone = body.customer?.phone_number || body.customer?.phone_formated;
      
      if (!email && !phone) {
        console.warn('⚠️ Nenhum método de match disponível (sem sale_tracking_source, email ou telefone)');
      } else {
        console.log('🔍 Buscando lead por email/telefone (fallback)...');
        leadData = await findLeadData(email, phone);
        if (leadData) {
          matchMethod = email ? 'email' : 'phone';
        }
      }
    }
    
    if (leadData) {
      console.log('✅ Dados do lead encontrados:', {
        matchMethod: matchMethod || 'desconhecido',
        hasFbp: !!leadData.fbp,
        hasFbc: !!leadData.fbc,
        hasUtms: !!(leadData.utm_source || leadData.utm_campaign),
      });
    } else {
      console.log('⚠️ Dados do lead não encontrados - enviando apenas dados do webhook');
    }

    // ============================================
    // SALVA VENDA NO SUPABASE
    // ============================================
    
    let savedPurchase = null;
    let saveError = null;
    
    // Busca SUPABASE_SERVICE_ROLE_KEY dentro do handler (evita cold start crash)
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Mapeia dados do webhook Perfect Pay para o formato da tabela
        const purchaseData = {
          provider: 'perfectpay', // CRÍTICO: usado na UNIQUE constraint para idempotência
          amount: parseFloat(body.sale_amount) || 0,
          currency: 'CLP', // FORÇA CLP - Corrige se Perfect Pay enviar BRL incorretamente
          payer_email: body.customer?.email || body.email || null,
          status_id: 2, // 2 = Aprovado (mesmo padrão do Flow)
          flow_order_id: body.code || body.sale_code || body.order_id || `perfect_${Date.now()}`,
          tracking_id: leadData?.id || null, // ID do lead encontrado (ou null)
          raw_data: JSON.stringify(body), // JSON completo do webhook
        };

        savedPurchase = await savePurchaseToSupabase(
          purchaseData,
          SUPABASE_SERVICE_ROLE_KEY,
          SUPABASE_URL
        );
        
        console.log('✅ Venda Perfect Pay salva no Supabase: ID', savedPurchase?.id);
      } catch (error) {
        saveError = error.message;
        console.error('❌ Erro ao salvar venda Perfect Pay no Supabase:', {
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
    // ENVIA EVENTO PURCHASE PARA FACEBOOK CAPI
    // ============================================
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
          match_method: matchMethod || 'desconhecido',
          sale_tracking_source_used: !!saleTrackingSource && isValidUUID(saleTrackingSource),
          has_fbp: !!leadData.fbp,
          has_fbc: !!leadData.fbc,
          has_utms: !!(leadData.utm_source || leadData.utm_campaign),
        } : {
          found: false,
          sale_tracking_source_provided: !!saleTrackingSource,
          sale_tracking_source_valid: saleTrackingSource ? isValidUUID(saleTrackingSource) : false,
        },
        supabase: {
          saved: !!savedPurchase,
          purchase_id: savedPurchase?.id || null,
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

