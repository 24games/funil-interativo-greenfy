import crypto from 'crypto';

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
 * Normaliza telefone (remove caracteres não numéricos)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
}

/**
 * Envia evento Purchase para Facebook Conversions API
 */
async function sendPurchaseEventToFacebook(data) {
  const META_PIXEL_ID = process.env.META_PIXEL_ID;
  const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    throw new Error('META_PIXEL_ID e META_ACCESS_TOKEN são obrigatórios');
  }

  // Extrai dados do payload do webhook
  const {
    email,
    name,
    phone,
    value, // Valor da compra
    currency = 'CLP', // Moeda padrão (Chile)
    orderId, // ID único da compra
    fbp, // Facebook Browser ID (cookie)
    fbc, // Facebook Click ID (cookie)
    ipAddress, // IP do cliente
    userAgent, // User Agent do cliente
  } = data;

  // Normaliza e faz hash dos dados do usuário (Advanced Matching)
  const userData = {};
  
  if (email) {
    userData.em = hashUserData(email);
  }
  
  if (name) {
    const { fn, ln } = splitName(name);
    if (fn) userData.fn = hashUserData(fn);
    if (ln) userData.ln = hashUserData(ln);
  }
  
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }

  // Prepara o evento Purchase
  const eventData = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000), // Unix timestamp
        event_id: orderId || `purchase_${Date.now()}`, // ID único do evento
        event_source_url: data.sourceUrl || 'https://seu-site.com',
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: currency,
          value: parseFloat(value) || 0,
          content_type: 'product',
          content_ids: [orderId || 'unknown'],
          order_id: orderId || `order_${Date.now()}`,
        },
      },
    ],
  };

  // Adiciona fbp e fbc se disponíveis
  if (fbp) {
    eventData.data[0].user_data.fbp = fbp;
  }
  
  if (fbc) {
    eventData.data[0].user_data.fbc = fbc;
  }

  // Adiciona IP e User Agent se disponíveis (melhora matching)
  if (ipAddress) {
    eventData.data[0].user_data.client_ip_address = ipAddress;
  }
  
  if (userAgent) {
    eventData.data[0].user_data.client_user_agent = userAgent;
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
  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Apenas requisições POST são aceitas'
    });
  }

  try {
    // Log do payload recebido (sem dados sensíveis)
    console.log('Webhook recebido:', {
      timestamp: new Date().toISOString(),
      hasEmail: !!req.body.email,
      hasName: !!req.body.name,
      hasPhone: !!req.body.phone,
      orderId: req.body.orderId,
      value: req.body.value,
    });

    // Validação básica
    if (!req.body.email && !req.body.phone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email ou telefone é obrigatório',
      });
    }

    // Extrai fbp e fbc dos cookies ou do body
    const fbp = req.body.fbp || req.cookies?._fbp || null;
    const fbc = req.body.fbc || req.cookies?._fbc || null;

    // Extrai IP e User Agent
    const ipAddress = 
      req.body.ipAddress || 
      req.headers['x-forwarded-for']?.split(',')[0] || 
      req.headers['x-real-ip'] || 
      req.socket?.remoteAddress || 
      null;
    
    const userAgent = req.body.userAgent || req.headers['user-agent'] || null;

    // Prepara dados para envio
    const purchaseData = {
      ...req.body,
      fbp,
      fbc,
      ipAddress,
      userAgent,
    };

    // Envia evento para Facebook
    const facebookResponse = await sendPurchaseEventToFacebook(purchaseData);

    // Log de sucesso
    console.log('Evento enviado com sucesso para Facebook:', {
      timestamp: new Date().toISOString(),
      events_received: facebookResponse.events_received,
      messages: facebookResponse.messages,
    });

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Evento Purchase enviado com sucesso para Facebook',
      facebook_response: {
        events_received: facebookResponse.events_received,
        messages: facebookResponse.messages,
      },
    });

  } catch (error) {
    // Log de erro
    console.error('Erro ao processar webhook:', {
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




