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
 * Busca email do localStorage, cookies ou URL
 */
function getEmail() {
  // Tenta buscar do localStorage
  try {
    const email = localStorage.getItem('email') || localStorage.getItem('user_email');
    if (email) {
      return email;
    }
  } catch (error) {
    console.warn('Erro ao ler email do localStorage:', error);
  }

  // Tenta buscar dos cookies
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'email' || name === 'user_email') {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.warn('Erro ao ler email dos cookies:', error);
  }

  // Tenta buscar da URL (query params)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      return email;
    }
  } catch (error) {
    console.warn('Erro ao ler email da URL:', error);
  }

  return null;
}

/**
 * Cria pagamento no Flow.cl e redireciona
 * 
 * @param {Object} options - Opções de checkout
 * @param {string} options.email - Email do cliente (opcional, tenta buscar automaticamente)
 * @param {string} options.trackingId - ID de tracking (opcional, tenta buscar automaticamente)
 * @param {number} options.amount - Valor em CLP (opcional, padrão: 5000)
 * @returns {Promise<void>}
 */
export async function createFlowPayment({ 
  email = null, 
  trackingId = null, 
  amount = 5000 
} = {}) {
  // Busca email se não foi fornecido
  const userEmail = email || getEmail();
  
  // Se não tiver email, solicita ao usuário
  if (!userEmail) {
    const inputEmail = prompt('Por favor, informe seu email para continuar:');
    if (!inputEmail || !inputEmail.includes('@')) {
      throw new Error('Email é obrigatório para continuar');
    }
    // Salva no localStorage para próximas vezes
    try {
      localStorage.setItem('email', inputEmail);
    } catch (error) {
      console.warn('Erro ao salvar email no localStorage:', error);
    }
    return createFlowPayment({ email: inputEmail, trackingId, amount });
  }

  // Busca tracking_id se não foi fornecido
  const userTrackingId = trackingId || getTrackingId();

  // Chama API para criar pagamento
  const response = await fetch('/api/create-flow-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: userEmail,
      tracking_id: userTrackingId,
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
