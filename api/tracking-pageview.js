/**
 * API Route para Tracking de PageView (ETAPA 1)
 * 
 * Recebe dados do cliente-side, salva no Supabase e envia para Meta CAPI
 * 
 * Endpoint: /api/tracking-pageview
 * Method: POST
 */

import crypto from 'crypto';

// ============================================
// CONFIGURAÇÃO - SUBSTITUIR COM SUAS CREDENCIAIS
// ============================================
const META_PIXEL_ID = process.env.META_PIXEL_ID || '1170692121796734';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAADG88pNjVUBQJRLLaRpUZCdiUtZBXbxLGZB93LxdMnbV3ejomv3qbWuXu5OGBaH3zbhdqMOz722eZA7zyryFAczJtBBWKuVT9ZBYYUDcEoOF3adcK7CIHcL7yft3MZBU636aURzB16MrSnZByGBNvEmza0Kpzeka71Or87CAPFqL6CZCRw3w7QxST5BVFZANwgZDZD';

// String de conexão do Supabase (usar variável de ambiente em produção)
const SUPABASE_CONNECTION_STRING = process.env.SUPABASE_CONNECTION_STRING || 
  'postgresql://postgres.jhyekbtcywewzrviqlos:XhoB5znX17qpM7WG@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

// Nome da tabela (configurável por projeto)
// IMPORTANTE: PostgREST (REST API do Supabase) converte tudo para minúsculas
const TABLE_NAME = 'tracking_sqd_cas_lp1_vsl_hackermillon';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Normaliza e faz hash SHA-256 dos dados do usuário para Advanced Matching
 * Conforme documentação do Facebook: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function hashUserData(data) {
  if (!data) return null;
  
  // Remove espaços em branco e converte para minúsculas
  const normalized = data.trim().toLowerCase();
  
  // Gera hash SHA-256
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
 * Gera um event_id único baseado nos dados do usuário
 * Isso ajuda na deduplicação no Meta CAPI
 */
function generateEventId(data) {
  const timestamp = Date.now();
  const userIdentifier = data.email || data.phone || data.ip || 'anonymous';
  const hash = crypto
    .createHash('md5')
    .update(`${userIdentifier}-${timestamp}-${data.page_url || ''}`)
    .digest('hex')
    .substring(0, 16);
  
  return `pageview_${timestamp}_${hash}`;
}

/**
 * Salva dados no Supabase usando REST API
 * 
 * Mais confiável que conexão PostgreSQL direta em serverless
 */
async function saveToSupabase(data) {
  // Preparar dados para inserção
  const insertData = {
    email: data.email || null,
    phone: normalizePhone(data.phone) || null,
    ip: data.ip || null,
    user_agent: data.user_agent || null,
    fbp: data.fbp || null,
    fbc: data.fbc || null,
    first_name: data.first_name || null,
    last_name: data.last_name || null,
    date_of_birth: data.date_of_birth || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    zip_code: data.zip_code || null,
    utm_source: data.utm_source || null,
    utm_medium: data.utm_medium || null,
    utm_campaign: data.utm_campaign || null,
    utm_term: data.utm_term || null,
    utm_content: data.utm_content || null,
    fbclid: data.fbclid || null,
    gclid: data.gclid || null,
    page_url: data.page_url || null,
    referrer: data.referrer || null,
    language: data.language || null,
    timestamp: data.timestamp || new Date().toISOString(),
    event_type: 'PageView',
    event_id: data.event_id || generateEventId(data),
  };
  
  // Usar REST API do Supabase
  // URL e chave podem vir de variáveis de ambiente ou usar valores padrão
  // Project ref: jhyekbtcywewzrviqlos (extraído da connection string)
  const supabaseUrl = process.env.SUPABASE_URL || 'https://jhyekbtcywewzrviqlos.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeWVrYnRjeXdld3pydmlxbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODI5NzAsImV4cCI6MjA4MDk1ODk3MH0.yTAW7soCiU-skkjAsuG1a-r0oKdzUJlbjyLYeC7w8lM';
  
  // Construir URL corretamente (sem credenciais na URL)
  const apiUrl = `${supabaseUrl}/rest/v1/${TABLE_NAME}`;
  
  console.log('Tentando salvar no Supabase:', {
    url: apiUrl,
    hasKey: !!supabaseKey,
    tableName: TABLE_NAME,
  });
  
  // Inserir via REST API
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(insertData),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase REST API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      url: apiUrl,
    });
    throw new Error(`Supabase API Error: ${response.status} - ${errorText}`);
  }
  
  const result = await response.json();
  
  // REST API retorna array com um objeto
  const inserted = Array.isArray(result) ? result[0] : result;
  
  return {
    ...insertData,
    id: inserted.id,
    created_at: inserted.created_at,
  };
}

/**
 * Envia evento PageView para Facebook Conversions API
 */
async function sendPageViewToMeta(data) {
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

  // VALIDAÇÃO CRÍTICA: Verifica se há pelo menos UM identificador válido
  // O Facebook rejeita eventos sem identificadores (Invalid parameter)
  const hasValidIdentifier = 
    userData.fbp || 
    userData.fbc || 
    userData.em || 
    userData.ph || 
    userData.fn || 
    userData.ln ||
    userData.client_ip_address ||
    userData.client_user_agent;

  if (!hasValidIdentifier) {
    throw new Error('Nenhum identificador válido encontrado (fbp, fbc, email, phone, name, ip ou user_agent). Evento não será enviado para Meta para evitar erro "Invalid parameter".');
  }

  // Prepara o evento PageView
  const eventData = {
    data: [
      {
        event_name: 'PageView',
        event_time: Math.floor((data.timestamp ? new Date(data.timestamp).getTime() : Date.now()) / 1000),
        event_id: data.event_id || generateEventId(data),
        event_source_url: data.page_url || 'https://seu-site.com',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_name: data.page_url || 'Landing Page',
          content_category: 'landing_page',
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
    
    // Log do payload recebido (sem dados sensíveis)
    console.log('PageView tracking recebido:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      hasEmail: !!body.email,
      hasPhone: !!body.phone,
      hasFbp: !!body.fbp,
      hasFbc: !!body.fbc,
      pageUrl: body.page_url,
      eventId: body.event_id,
    });

    // Validação básica - pelo menos IP ou User Agent deve estar presente
    if (!body.ip && !body.user_agent) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'IP ou User Agent é obrigatório',
      });
    }

    // Preparar dados para salvamento
    const trackingData = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
      event_id: body.event_id || generateEventId(body),
    };

    // Salvar no Supabase
    let supabaseData;
    let supabaseError = null;
    
    try {
      supabaseData = await saveToSupabase(trackingData);
      console.log('✅ Dados salvos no Supabase:', {
        id: supabaseData.id,
        event_id: supabaseData.event_id,
        created_at: supabaseData.created_at,
      });
    } catch (error) {
      supabaseError = error.message;
      console.error('❌ Erro ao salvar no Supabase:', {
        message: error.message,
        stack: error.stack,
        connectionString: SUPABASE_CONNECTION_STRING ? 'Configurada' : 'Não configurada',
        tableName: TABLE_NAME,
      });
      // Continua mesmo se houver erro no Supabase (não bloqueia envio para Meta)
    }

    // Enviar evento para Facebook CAPI (apenas se tiver identificadores válidos)
    let metaResponse = null;
    let metaError = null;
    
    try {
      metaResponse = await sendPageViewToMeta(trackingData);
      console.log('Evento enviado com sucesso para Facebook:', {
        timestamp: new Date().toISOString(),
        events_received: metaResponse.events_received,
        event_id: trackingData.event_id,
      });
    } catch (error) {
      metaError = error.message;
      
      // Se o erro for por falta de identificadores, apenas loga (não é crítico)
      if (error.message.includes('Nenhum identificador válido')) {
        console.warn('⚠️ Evento não enviado para Meta (sem identificadores válidos):', {
          event_id: trackingData.event_id,
          hasFbp: !!trackingData.fbp,
          hasFbc: !!trackingData.fbc,
          hasEmail: !!trackingData.email,
          hasPhone: !!trackingData.phone,
          hasIp: !!trackingData.ip,
          hasUserAgent: !!trackingData.user_agent,
        });
      } else {
        console.error('Erro ao enviar para Facebook:', error);
      }
    }

    // Resposta de sucesso (mesmo se houver erros parciais)
    return res.status(200).json({
      success: true,
      message: 'Tracking processado',
      data: {
        event_id: trackingData.event_id,
        supabase: {
          saved: !!supabaseData,
          id: supabaseData?.id || null,
          error: supabaseError,
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
    console.error('Erro ao processar tracking:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    // Resposta de erro
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Erro ao processar tracking',
    });
  }
}

