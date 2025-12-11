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
const TABLE_NAME = 'tracking_SQD_CAS_LP1_VSL_HACKERMILLON';

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
 * NOTA: Usamos a REST API do Supabase via fetch para melhor compatibilidade com Vercel
 * Alternativa: usar @supabase/supabase-js (mais simples, mas requer instalação)
 */
async function saveToSupabase(data) {
  // Extrair project ref da connection string para construir URL da REST API
  const urlMatch = SUPABASE_CONNECTION_STRING.match(/postgresql:\/\/postgres\.([^.]+)\./);
  
  if (!urlMatch) {
    throw new Error('Formato de connection string inválido - não foi possível extrair project ref');
  }
  
  const projectRef = urlMatch[1];
  
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
  
  // Usar REST API do Supabase (requer SUPABASE_URL e SUPABASE_ANON_KEY)
  // Por enquanto, vamos usar uma abordagem que funciona com MCP Server
  // NOTA: Para produção, configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente
  
  const supabaseUrl = process.env.SUPABASE_URL || `https://${projectRef}.supabase.co`;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseKey) {
    // Se não tiver chave, retorna os dados preparados para uso via MCP Server
    console.warn('SUPABASE_ANON_KEY não configurado. Dados preparados mas não salvos via REST API.');
    return {
      ...insertData,
      id: null,
      created_at: new Date().toISOString(),
      _note: 'Dados preparados - usar MCP Server para salvar',
    };
  }
  
  // Inserir via REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/${TABLE_NAME}`, {
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
      console.log('Dados salvos no Supabase:', {
        id: supabaseData.id,
        event_id: supabaseData.event_id,
        created_at: supabaseData.created_at,
      });
    } catch (error) {
      supabaseError = error.message;
      console.error('Erro ao salvar no Supabase:', error);
      // Continua mesmo se houver erro no Supabase (não bloqueia envio para Meta)
    }

    // Enviar evento para Facebook CAPI
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
      console.error('Erro ao enviar para Facebook:', error);
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

