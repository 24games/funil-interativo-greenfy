/**
 * Utilitário para Checkout Flow.cl
 * 
 * Função reutilizável para criar pagamento no Flow e redirecionar
 */

/**
 * Busca tracking_id do localStorage ou cookies
 */
function getTrackingId() {
  // Tenta buscar do localStorage primeiro
  try {
    const trackingId = localStorage.getItem('tracking_id');
    if (trackingId) {
      return trackingId;
    }
  } catch (error) {
    console.warn('Erro ao ler tracking_id do localStorage:', error);
  }

  // Tenta buscar do cookie (se houver)
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'tracking_id') {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.warn('Erro ao ler tracking_id dos cookies:', error);
  }

  return null;
}

/**
 * Gera email temporário para checkout
 * 
 * Como o funil não captura email antes do checkout, geramos um email temporário
 * que será usado apenas para criar o pagamento no Flow.cl
 * 
 * @param {string} trackingId - ID de tracking (opcional)
 * @returns {string} Email temporário no formato guest-{tracking_id}@checkout.temp
 */
function generateTempEmail(trackingId = null) {
  if (trackingId) {
    // Remove caracteres especiais do tracking_id para usar no email
    const cleanTrackingId = trackingId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    return `guest-${cleanTrackingId}@checkout.temp`;
  }
  
  // Se não tiver tracking_id, usa timestamp
  const timestamp = Date.now();
  return `guest-${timestamp}@checkout.temp`;
}

/**
 * Cria pagamento no Flow.cl e redireciona
 * 
 * IMPORTANTE: Como o funil não captura email antes do checkout,
 * sempre geramos um email temporário automaticamente.
 * O tracking_id é enviado no campo optional para fazer o match posterior.
 * 
 * @param {Object} options - Opções de checkout
 * @param {string} options.trackingId - ID de tracking (opcional, tenta buscar automaticamente)
 * @param {number} options.amount - Valor em CLP (opcional, padrão: 5000)
 * @returns {Promise<void>}
 */
export async function createFlowPayment({ 
  trackingId = null, 
  amount = 5000 
} = {}) {
  // Busca tracking_id se não foi fornecido
  const userTrackingId = trackingId || getTrackingId();
  
  // Gera email temporário automaticamente (sempre, sem fricção)
  // O email será guest-{tracking_id}@checkout.temp ou guest-{timestamp}@checkout.temp
  const tempEmail = generateTempEmail(userTrackingId);
  
  console.log('🛒 Iniciando checkout:', {
    tempEmail: tempEmail,
    trackingId: userTrackingId,
    amount: amount,
  });

  // Chama API para criar pagamento
  const response = await fetch('/api/create-flow-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: tempEmail, // Email temporário gerado automaticamente
      tracking_id: userTrackingId, // Enviado no optional para match futuro
      amount: amount,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.data?.redirect_url) {
    throw new Error(data.message || 'Resposta inválida da API');
  }

  // Redireciona para o Flow
  window.location.href = data.data.redirect_url;
}
