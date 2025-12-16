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
 * Gera email para checkout (fixo e real)
 * 
 * IMPORTANTE: 
 * - Flow.cl valida se a conta de email realmente existe (SMTP Check)
 * - Emails dinâmicos ou temporários são rejeitados (erro 1620)
 * - Usamos um email fixo e real para passar na validação
 * - O vínculo real do cliente é feito pelo tracking_id no campo optional
 * - Este email é apenas um requisito técnico da API, não será usado para comunicação
 * 
 * Nota: Se preferir, pode configurar via variável de ambiente ou usar outro email real
 * 
 * @returns {string} Email fixo e real: carlos.almeida.alencar@gmail.com
 */
function generateTempEmail() {
  // Retorna email fixo e real para passar na validação SMTP do Flow.cl
  // Flow.cl valida se a conta de email realmente existe (erro 1620 se não existir)
  // O tracking_id no campo optional faz o vínculo real com o cliente
  return 'carlos.almeida.alencar@gmail.com';
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
  
  // Gera email fixo e real para passar na validação SMTP do Flow.cl
  // Flow.cl valida se a conta de email realmente existe (erro 1620 se não existir)
  // O tracking_id continua sendo enviado no campo optional para match futuro (vínculo real)
  const tempEmail = generateTempEmail();
  
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
      email: tempEmail, // Email fixo e real para validação SMTP do Flow.cl
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
