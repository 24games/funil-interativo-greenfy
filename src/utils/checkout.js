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
 * Cria pagamento no Flow.cl e redireciona
 * 
 * IMPORTANTE: Email é obrigatório e deve ser fornecido pelo usuário.
 * O tracking_id é enviado no campo optional para fazer o match posterior.
 * 
 * @param {Object} options - Opções de checkout
 * @param {string} options.email - Email do cliente (OBRIGATÓRIO)
 * @param {string} options.trackingId - ID de tracking (opcional, tenta buscar automaticamente)
 * @param {number} options.amount - Valor em CLP (opcional, padrão: 5000)
 * @returns {Promise<void>}
 */
export async function createFlowPayment({ 
  email,
  trackingId = null, 
  amount = 5000 
} = {}) {
  // Validação: email é obrigatório
  if (!email || !email.trim()) {
    throw new Error('Email é obrigatório para continuar');
  }

  // Validação básica de formato
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }

  // Busca tracking_id se não foi fornecido
  const userTrackingId = trackingId || getTrackingId();
  
  console.log('🛒 Iniciando checkout:', {
    email: email,
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
      email: email, // Email fornecido pelo usuário
      tracking_id: userTrackingId, // Enviado no optional para match futuro
      amount: amount,
    }),
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch (e) {
      error = { message: 'Erro desconhecido' };
    }
    
    // Verifica se é erro 1620 (email inválido) do Flow
    const errorMessage = error.message || '';
    const errorDetails = error.details || '';
    const errorCode = error.code || error.error?.code || '';
    const errorString = JSON.stringify(error).toLowerCase();
    
    // Detecta erro 1620 ou qualquer menção a email inválido ou "not valid"
    if (
      errorCode === 1620 ||
      errorString.includes('1620') || 
      errorString.includes('not valid') ||
      (errorString.includes('email') && (errorString.includes('inválido') || errorString.includes('invalido') || errorString.includes('invalid')))
    ) {
      console.log('🔍 Erro 1620 detectado - Email inválido');
      throw new Error('INVALID_EMAIL');
    }
    
    throw new Error(error.message || error.error?.message || `Erro HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.data?.redirect_url) {
    throw new Error(data.message || 'Resposta inválida da API');
  }

  // Redireciona para o Flow
  window.location.href = data.data.redirect_url;
}
