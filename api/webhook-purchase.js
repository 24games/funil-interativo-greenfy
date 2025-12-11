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

  // Função auxiliar para extrair valor de múltiplos campos possíveis
  const getField = (data, ...possibleKeys) => {
    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        return data[key];
      }
    }
    return null;
  };

  // Extrai dados do payload do webhook (com suporte a múltiplos formatos)
  const email = getField(data, 'email', 'customer_email', 'buyer_email', 'client_email', 'user_email');
  const name = getField(data, 'name', 'customer_name', 'buyer_name', 'client_name', 'full_name', 'customer_full_name');
  const phone = getField(data, 'phone', 'customer_phone', 'buyer_phone', 'client_phone', 'telephone', 'mobile');
  const value = getField(data, 'value', 'amount', 'total', 'price', 'order_value', 'transaction_amount');
  const currency = getField(data, 'currency', 'currency_code', 'order_currency') || 'CLP';
  const orderId = getField(data, 'orderId', 'order_id', 'transaction_id', 'payment_id', 'order_number', 'transaction_number');
  const fbp = getField(data, 'fbp', '_fbp');
  const fbc = getField(data, 'fbc', '_fbc');
  const ipAddress = getField(data, 'ipAddress', 'ip_address', 'client_ip', 'ip');
  const userAgent = getField(data, 'userAgent', 'user_agent', 'client_user_agent');
  
  // Dados pessoais adicionais
  const firstName = getField(data, 'first_name', 'firstName', 'firstname');
  const lastName = getField(data, 'last_name', 'lastName', 'lastname');
  const dateOfBirth = getField(data, 'date_of_birth', 'dateOfBirth', 'birthday', 'birth_date');
  
  // Localização
  const city = getField(data, 'city');
  const state = getField(data, 'state', 'region', 'province');
  const country = getField(data, 'country');
  const zipCode = getField(data, 'zip_code', 'zipCode', 'postal_code', 'postalCode', 'cep');

  // Normaliza e faz hash dos dados do usuário (Advanced Matching)
  const userData = {};
  
  // ============================================
  // DADOS OBRIGATÓRIOS PARA IDENTIFICAÇÃO
  // ============================================
  
  // Email (hasheado)
  if (email) {
    userData.em = hashUserData(email);
  }
  
  // Telefone (hasheado)
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone) {
      userData.ph = hashUserData(normalizedPhone);
    }
  }
  
  // IP Address (texto claro - obrigatório)
  if (ipAddress) {
    userData.client_ip_address = ipAddress;
  } else {
    userData.client_ip_address = '0.0.0.0'; // Fallback
    console.warn('⚠️ IP não encontrado - usando fallback');
  }
  
  // User Agent (texto claro - obrigatório)
  if (userAgent) {
    userData.client_user_agent = userAgent;
  } else {
    userData.client_user_agent = 'Unknown'; // Fallback
    console.warn('⚠️ User Agent não encontrado - usando fallback');
  }
  
  // FBP e FBC (texto claro - CRÍTICOS para matching)
  if (fbp) {
    userData.fbp = fbp;
  }
  if (fbc) {
    userData.fbc = fbc;
  }
  
  // ============================================
  // DADOS PESSOAIS (quando disponíveis)
  // ============================================
  
  // Nome completo ou separado
  if (name) {
    const { fn, ln } = splitName(name);
    if (fn) {
      userData.fn = hashUserData(fn);
    }
    if (ln) {
      userData.ln = hashUserData(ln);
    }
  } else {
    // Tenta usar first_name e last_name separados
    if (firstName) {
      userData.fn = hashUserData(firstName);
    }
    if (lastName) {
      userData.ln = hashUserData(lastName);
    }
  }
  
  // Data de nascimento (hasheado - formato YYYY-MM-DD)
  if (dateOfBirth) {
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
  if (city) {
    userData.ct = hashUserData(city);
  }
  
  // Estado/Região (hasheado)
  if (state) {
    userData.st = hashUserData(state);
  }
  
  // País (hasheado - código ISO)
  if (country) {
    userData.country = hashUserData(country);
  }
  
  // CEP/Zip Code (hasheado)
  if (zipCode) {
    userData.zp = hashUserData(zipCode);
  }

  // Prepara o evento Purchase
  const eventData = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000), // Unix timestamp
        event_id: orderId || `purchase_${Date.now()}`, // ID único do evento
        event_source_url: data.sourceUrl || 'https://www.hackermillon.online',
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
      hasEmail: !!(req.body.email || req.body.customer_email || req.body.buyer_email),
      hasName: !!(req.body.name || req.body.customer_name || req.body.buyer_name),
      hasPhone: !!(req.body.phone || req.body.customer_phone || req.body.buyer_phone),
      orderId: req.body.orderId || req.body.order_id || req.body.transaction_id,
      value: req.body.value || req.body.amount || req.body.total,
      payloadKeys: Object.keys(req.body), // Para debug: mostra quais campos foram enviados
    });

    // Função auxiliar para extrair valor de múltiplos campos possíveis
    const getField = (data, ...possibleKeys) => {
      for (const key of possibleKeys) {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          return data[key];
        }
      }
      return null;
    };

    // Validação básica (verifica múltiplos formatos)
    const hasEmail = !!(getField(req.body, 'email', 'customer_email', 'buyer_email', 'client_email', 'user_email'));
    const hasPhone = !!(getField(req.body, 'phone', 'customer_phone', 'buyer_phone', 'client_phone', 'telephone', 'mobile'));
    
    if (!hasEmail && !hasPhone) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email ou telefone é obrigatório. Campos aceitos: email/customer_email/buyer_email ou phone/customer_phone/buyer_phone',
        receivedFields: Object.keys(req.body),
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




