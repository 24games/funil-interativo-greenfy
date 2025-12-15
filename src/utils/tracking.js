/**
 * Script de Tracking Cliente-Side (ETAPA 1 - PageView)
 * 
 * Captura todos os dados do usuÃ¡rio e envia para API server-side
 * 
 * USO:
 * 1. Importe este arquivo no seu componente principal (App.jsx ou main.jsx)
 * 2. Chame initTracking() quando a pÃ¡gina carregar
 * 3. Configure META_PIXEL_ID e API_ENDPOINT abaixo
 */

// ============================================
// CONFIGURAÃ‡ÃƒO - SUBSTITUIR COM SUAS CREDENCIAIS
// ============================================

// ID do Pixel do Facebook (substituir)
const META_PIXEL_ID = '1170692121796734';

// Endpoint da API (ajustar conforme ambiente)
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api/tracking-pageview';

// ============================================
// FUNÃ‡Ã•ES DE CAPTURA DE DADOS
// ============================================

/**
 * ObtÃ©m cookie do navegador
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * ObtÃ©m parÃ¢metros da URL (UTMs, fbclid, gclid, etc)
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    fbclid: params.get('fbclid'),
    gclid: params.get('gclid'),
  };
}

/**
 * ObtÃ©m UTMs dos cookies (UTMify salva aqui)
 */
function getUtmsFromCookies() {
  return {
    utm_source: getCookie('utm_source'),
    utm_medium: getCookie('utm_medium'),
    utm_campaign: getCookie('utm_campaign'),
    utm_term: getCookie('utm_term'),
    utm_content: getCookie('utm_content'),
    fbclid: getCookie('fbclid'),
    gclid: getCookie('gclid'),
  };
}

/**
 * ObtÃ©m UTMs do localStorage (fallback caso UTMify use)
 */
function getUtmsFromLocalStorage() {
  try {
    return {
      utm_source: localStorage.getItem('utm_source'),
      utm_medium: localStorage.getItem('utm_medium'),
      utm_campaign: localStorage.getItem('utm_campaign'),
      utm_term: localStorage.getItem('utm_term'),
      utm_content: localStorage.getItem('utm_content'),
      fbclid: localStorage.getItem('fbclid'),
      gclid: localStorage.getItem('gclid'),
    };
  } catch (error) {
    console.warn('Erro ao ler localStorage:', error);
    return {};
  }
}

/**
 * ObtÃ©m UTMs do objeto window.utmify (se disponÃ­vel)
 */
function getUtmsFromUtmify() {
  try {
    if (window.utmify && typeof window.utmify === 'object') {
      return {
        utm_source: window.utmify.utm_source || window.utmify.source,
        utm_medium: window.utmify.utm_medium || window.utmify.medium,
        utm_campaign: window.utmify.utm_campaign || window.utmify.campaign,
        utm_term: window.utmify.utm_term || window.utmify.term,
        utm_content: window.utmify.utm_content || window.utmify.content,
        fbclid: window.utmify.fbclid,
        gclid: window.utmify.gclid,
      };
    }
  } catch (error) {
    console.warn('Erro ao ler window.utmify:', error);
  }
  return {};
}

/**
 * ObtÃ©m todos os parÃ¢metros de tracking (UTMs, fbclid, gclid)
 * Prioridade: URL > Cookies > localStorage > window.utmify
 * Garante que os UTMs sejam capturados mesmo quando a URL muda
 */
function getAllTrackingParams() {
  // 1. Primeiro tenta da URL (mais confiÃ¡vel se presente)
  const urlParams = getUrlParams();
  
  // 2. Busca dos cookies (UTMify geralmente salva aqui)
  const cookieParams = getUtmsFromCookies();
  
  // 3. Busca do localStorage (fallback)
  const storageParams = getUtmsFromLocalStorage();
  
  // 4. Busca do window.utmify (se disponÃ­vel)
  const utmifyParams = getUtmsFromUtmify();
  
  // Combina com prioridade: URL > Cookies > localStorage > utmify
  return {
    utm_source: urlParams.utm_source || cookieParams.utm_source || storageParams.utm_source || utmifyParams.utm_source || null,
    utm_medium: urlParams.utm_medium || cookieParams.utm_medium || storageParams.utm_medium || utmifyParams.utm_medium || null,
    utm_campaign: urlParams.utm_campaign || cookieParams.utm_campaign || storageParams.utm_campaign || utmifyParams.utm_campaign || null,
    utm_term: urlParams.utm_term || cookieParams.utm_term || storageParams.utm_term || utmifyParams.utm_term || null,
    utm_content: urlParams.utm_content || cookieParams.utm_content || storageParams.utm_content || utmifyParams.utm_content || null,
    fbclid: urlParams.fbclid || cookieParams.fbclid || storageParams.fbclid || utmifyParams.fbclid || null,
    gclid: urlParams.gclid || cookieParams.gclid || storageParams.gclid || utmifyParams.gclid || null,
  };
}

/**
 * ObtÃ©m dados do usuÃ¡rio do navegador
 */
function getUserData() {
  return {
    // Cookies do Facebook (CRÃTICOS para matching)
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
    
    // Dados da pÃ¡gina
    page_url: window.location.href,
    referrer: document.referrer || null,
    language: navigator.language || navigator.userLanguage,
    
    // ParÃ¢metros de tracking (UTMs, fbclid, gclid)
    // Usa getAllTrackingParams() que busca de mÃºltiplas fontes
    ...getAllTrackingParams(),
  };
}

/**
 * ObtÃ©m IP do usuÃ¡rio (via serviÃ§o externo)
 * NOTA: Em produÃ§Ã£o, o IP serÃ¡ capturado no server-side
 */
async function getUserIP() {
  try {
    // Tentar obter IP via serviÃ§o externo (fallback)
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('NÃ£o foi possÃ­vel obter IP:', error);
    return null;
  }
}

/**
 * Captura todos os dados de tracking
 */
async function captureTrackingData() {
  const userData = getUserData();
  const ip = await getUserIP();
  
  return {
    // Dados obrigatÃ³rios
    ip: ip,
    user_agent: navigator.userAgent,
    fbp: userData.fbp,
    fbc: userData.fbc,
    
    // Dados da pÃ¡gina
    page_url: userData.page_url,
    referrer: userData.referrer,
    language: userData.language,
    
    // UTMs e tracking
    utm_source: userData.utm_source,
    utm_medium: userData.utm_medium,
    utm_campaign: userData.utm_campaign,
    utm_term: userData.utm_term,
    utm_content: userData.utm_content,
    fbclid: userData.fbclid,
    gclid: userData.gclid,
    
    // Timestamp
    timestamp: new Date().toISOString(),
    
    // Dados pessoais (serÃ£o preenchidos quando disponÃ­veis)
    // email, phone, first_name, last_name, date_of_birth, city, state, country, zip_code
    // Estes campos podem ser enviados posteriormente via updateTracking()
  };
}

/**
 * Envia dados de tracking para API server-side
 */
async function sendTrackingData(data) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Tracking enviado com sucesso:', result);
    
    // Salva tracking_id no localStorage se disponível
    if (result.data?.supabase?.id) {
      try {
        localStorage.setItem('tracking_id', result.data.supabase.id);
        console.log('✅ tracking_id salvo no localStorage:', result.data.supabase.id);
      } catch (error) {
        console.warn('⚠️ Erro ao salvar tracking_id no localStorage:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao enviar tracking:', error);
    throw error;
  }
}

/**
 * Atualiza dados de tracking com informaÃ§Ãµes adicionais
 * Ãštil quando vocÃª coleta email, telefone, etc. durante o funil
 */
async function updateTrackingData(additionalData) {
  // Gera um event_id baseado nos dados adicionais para relacionar com o PageView original
  const eventId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const data = {
    ...additionalData,
    event_id: eventId,
    timestamp: new Date().toISOString(),
    is_update: true, // Flag para identificar como atualizaÃ§Ã£o
  };
  
  return sendTrackingData(data);
}

// ============================================
// META PIXEL (CÃ“DIGO PADRÃƒO)
// ============================================

/**
 * Inicializa o Meta Pixel (cÃ³digo padrÃ£o do Facebook)
 * 
 * NOTA: O pixel jÃ¡ Ã© carregado na <head> do index.html.
 * Esta funÃ§Ã£o apenas garante que estÃ¡ funcionando e pode enviar eventos adicionais.
 */
function initMetaPixel() {
  if (!META_PIXEL_ID) {
    console.warn('META_PIXEL_ID nÃ£o configurado. Meta Pixel nÃ£o serÃ¡ inicializado.');
    return;
  }

  // Verifica se o pixel jÃ¡ foi inicializado (carregado na head)
  if (window.fbq && window.fbq.loaded) {
    console.log('âœ… Meta Pixel jÃ¡ carregado na head. Usando instÃ¢ncia existente.');
    return;
  }

  // Se nÃ£o foi carregado na head, carrega via JavaScript (fallback)
  console.warn('âš ï¸ Meta Pixel nÃ£o encontrado na head. Carregando via JavaScript...');
  
  // CÃ³digo padrÃ£o do Meta Pixel
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  // Inicializa o pixel (se ainda nÃ£o foi inicializado)
  if (!window.fbq.loaded) {
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
    console.log('âœ… Meta Pixel inicializado via JavaScript:', META_PIXEL_ID);
  }
}

// ============================================
// FUNÃ‡ÃƒO PRINCIPAL DE INICIALIZAÃ‡ÃƒO
// ============================================

/**
 * Inicializa o sistema de tracking completo
 * 
 * Esta funÃ§Ã£o deve ser chamada quando a pÃ¡gina carregar
 * Exemplo: useEffect(() => { initTracking(); }, []);
 */
export async function initTracking() {
  try {
    // 1. Inicializa Meta Pixel (cÃ³digo padrÃ£o)
    initMetaPixel();
    
    // 2. Captura dados de tracking
    const trackingData = await captureTrackingData();
    
    // 3. Envia para API server-side (que salva no Supabase e envia para Meta CAPI)
    await sendTrackingData(trackingData);
    
    console.log('Tracking inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar tracking:', error);
    // NÃ£o bloqueia a aplicaÃ§Ã£o se houver erro no tracking
  }
}

/**
 * FunÃ§Ã£o para atualizar tracking com dados adicionais
 * Use quando coletar email, telefone, etc.
 * 
 * Exemplo:
 * updateTracking({
 *   email: 'usuario@example.com',
 *   phone: '+5511999999999',
 *   first_name: 'JoÃ£o',
 *   last_name: 'Silva'
 * });
 */
export async function updateTracking(additionalData) {
  try {
    await updateTrackingData(additionalData);
    console.log('Tracking atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar tracking:', error);
  }
}

/**
 * FunÃ§Ã£o auxiliar para obter dados de tracking atuais
 * Ãštil para debug
 */
export function getTrackingData() {
  return getUserData();
}

/**
 * Envia evento InitiateCheckout para API server-side
 * Use quando o usuÃ¡rio clicar no botÃ£o de checkout
 */
export async function sendInitiateCheckout() {
  try {
    // Captura dados atuais
    const userData = getUserData();
    const ip = await getUserIP();
    
    const checkoutData = {
      ip: ip,
      user_agent: navigator.userAgent,
      fbp: userData.fbp,
      fbc: userData.fbc,
      page_url: window.location.href,
      referrer: document.referrer || null,
      language: navigator.language,
      utm_source: userData.utm_source,
      utm_medium: userData.utm_medium,
      utm_campaign: userData.utm_campaign,
      utm_term: userData.utm_term,
      utm_content: userData.utm_content,
      timestamp: new Date().toISOString(),
      // Dados adicionais podem ser passados via updateTracking antes
    };
    
    const response = await fetch('/api/tracking-initiate-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('InitiateCheckout enviado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao enviar InitiateCheckout:', error);
    throw error;
  }
}

// Exportar funÃ§Ãµes Ãºteis
export default {
  initTracking,
  updateTracking,
  getTrackingData,
  sendInitiateCheckout,
};

