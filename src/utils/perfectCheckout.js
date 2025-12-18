/**
 * Utilitário para checkout Perfect Pay com tracking dinâmico
 * 
 * Monta URL dinâmica com tracking_id e UTMs para rastreamento server-side
 */

/**
 * Obtém tracking_id do localStorage ou cookies
 */
function getTrackingId() {
  try {
    // Tenta do localStorage primeiro
    const trackingId = localStorage.getItem('tracking_id');
    if (trackingId) {
      return trackingId;
    }
  } catch (error) {
    console.warn('Erro ao ler tracking_id do localStorage:', error);
  }

  // Fallback: tenta dos cookies
  try {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    return getCookie('tracking_id');
  } catch (error) {
    console.warn('Erro ao ler tracking_id dos cookies:', error);
  }

  return null;
}

/**
 * Obtém UTMs de múltiplas fontes (URL, cookies, localStorage, window.utmify)
 * Prioridade: URL > Cookies > localStorage > window.utmify
 */
function getAllTrackingParams() {
  const params = {};

  // 1. Busca da URL atual
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    utmParams.forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        params[param] = value;
      }
    });
  } catch (error) {
    console.warn('Erro ao ler UTMs da URL:', error);
  }

  // 2. Busca dos cookies (UTMify geralmente salva aqui)
  try {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    utmParams.forEach(param => {
      if (!params[param]) {
        const cookieValue = getCookie(param);
        if (cookieValue) {
          params[param] = cookieValue;
        }
      }
    });
  } catch (error) {
    console.warn('Erro ao ler UTMs dos cookies:', error);
  }

  // 3. Busca do localStorage
  try {
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    utmParams.forEach(param => {
      if (!params[param]) {
        const storageValue = localStorage.getItem(param);
        if (storageValue) {
          params[param] = storageValue;
        }
      }
    });
  } catch (error) {
    console.warn('Erro ao ler UTMs do localStorage:', error);
  }

  // 4. Busca do window.utmify (se disponível)
  try {
    if (window.utmify && typeof window.utmify === 'object') {
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      utmParams.forEach(param => {
        if (!params[param]) {
          const utmifyValue = window.utmify[param] || window.utmify[param.replace('utm_', '')];
          if (utmifyValue) {
            params[param] = utmifyValue;
          }
        }
      });
    }
  } catch (error) {
    console.warn('Erro ao ler window.utmify:', error);
  }

  return params;
}

/**
 * Redireciona para Perfect Pay com tracking dinâmico
 * 
 * Monta URL com:
 * - sck = tracking_id (crucial para webhook fazer match)
 * - UTMs (utm_source, utm_medium, etc.)
 * 
 * @param {Object} options - Opções de redirecionamento
 * @param {string} options.trackingId - ID de tracking (opcional, tenta buscar automaticamente)
 */
export async function handlePerfectRedirect(options = {}) {
  try {
    // URL base do Perfect Pay
    const PERFECT_PAY_BASE_URL = 'https://go.centerpag.com/PPU38CQ4S8A';

    // 1. Recupera tracking_id
    const trackingId = options.trackingId || getTrackingId();
    
    // 2. Recupera UTMs
    const utmParams = getAllTrackingParams();

    // 3. Monta URL com parâmetros
    const urlParams = new URLSearchParams();

    // Adiciona tracking_id como sck (crucial para webhook)
    if (trackingId) {
      urlParams.set('sck', trackingId);
      console.log('✅ tracking_id adicionado à URL Perfect Pay:', trackingId);
    } else {
      console.warn('⚠️ tracking_id não encontrado - URL será enviada sem sck');
    }

    // Adiciona UTMs
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      }
    });

    // 4. Monta URL final
    const queryString = urlParams.toString();
    const finalUrl = queryString ? `${PERFECT_PAY_BASE_URL}?${queryString}` : PERFECT_PAY_BASE_URL;

    console.log('🔗 Redirecionando para Perfect Pay:', {
      baseUrl: PERFECT_PAY_BASE_URL,
      hasTrackingId: !!trackingId,
      utmParams: Object.keys(utmParams).filter(k => utmParams[k]),
      finalUrl: finalUrl.substring(0, 100) + '...',
    });

    // 5. Envia evento InitiateCheckout (tracking)
    try {
      const { sendInitiateCheckout } = await import('./tracking.js');
      await sendInitiateCheckout();
      console.log('✅ InitiateCheckout enviado com sucesso');
    } catch (error) {
      console.warn('⚠️ Erro ao enviar InitiateCheckout (não crítico):', error.message);
      // Continua mesmo se o tracking falhar
    }

    // 6. Redireciona
    window.location.href = finalUrl;
  } catch (error) {
    console.error('❌ Erro ao processar redirecionamento Perfect Pay:', error);
    // Em caso de erro, redireciona para URL base (sem parâmetros)
    window.location.href = 'https://go.centerpag.com/PPU38CQ4S8A';
  }
}
