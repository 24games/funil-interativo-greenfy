import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Aguarda os scripts globais de tracking (fbq e utmify) carregarem
 * @param {number} timeoutMs - Timeout em milissegundos (padrão: 10000 = 10 segundos)
 * @returns {Promise<boolean>} - Resolve quando ambos scripts estão disponíveis, rejeita no timeout
 */
function waitForGlobal(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 500; // Checa a cada 500ms
    
    console.log('⏳ Aguardando scripts de tracking...');
    
    const intervalId = setInterval(() => {
      const fbqReady = window.fbq && typeof window.fbq === 'function';
      const utmifyReady = window.utmify && typeof window.utmify === 'function';
      
      if (fbqReady && utmifyReady) {
        clearInterval(intervalId);
        console.log('✅ Scripts encontrados! (fbq e utmify disponíveis)');
        resolve(true);
        return;
      }
      
      // Verifica timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeoutMs) {
        clearInterval(intervalId);
        const missing = [];
        if (!fbqReady) missing.push('fbq');
        if (!utmifyReady) missing.push('utmify');
        console.warn(`⚠️ Timeout aguardando scripts. Faltando: ${missing.join(', ')}`);
        // Resolve mesmo assim (não rejeita) para não quebrar o fluxo
        // Mas loga quais scripts não foram encontrados
        resolve(false);
      }
    }, checkInterval);
  });
}

export default function Gracias() {
  const [token, setToken] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    // LÓGICA PERFECT PAY: Verifica se existe ppayId
    const ppayId = params.get('ppayId')
    if (ppayId) {
      // Captura o valor da URL e converte para número
      const valueParam = params.get('value')
      const purchaseValue = valueParam ? parseFloat(valueParam) : 5000 // Fallback para 5000 se não houver value
      
      // Proteção contra duplicidade via sessionStorage
      const sessionKey = `purchase_fired_${ppayId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        // Dispara Pixel Purchase imediatamente (garante atribuição na campanha)
        if (window.fbq && typeof window.fbq === 'function') {
          try {
            window.fbq('track', 'Purchase', {
              value: purchaseValue,
              currency: 'CLP', // FORÇA CLP - Corrige moeda para Pesos Chilenos
            }, {
              eventID: ppayId, // ✅ Usa ppayId como event_id para deduplicar com Webhook
            });
            console.log('✅ Pixel Purchase disparado (Perfect Pay) - ppayId:', ppayId, 'value:', purchaseValue);
            // Marca como enviado no sessionStorage (evita duplicidade em F5)
            sessionStorage.setItem(sessionKey, 'true');
          } catch (error) {
            console.warn('⚠️ Erro ao disparar Pixel Purchase (Perfect Pay):', error);
          }
        } else {
          console.warn('⚠️ Meta Pixel (fbq) não disponível');
        }
        // ✅ Perfect Pay: NÃO dispara UTMify (já tem integração via Postback)
        console.log('ℹ️ UTMify não disparado (Perfect Pay tem integração via Postback)');
      } else {
        console.log('⚠️ Pixel Purchase (Perfect Pay) já foi disparado nesta sessão - pulando');
      }
      return; // Retorna para não processar lógica do Flow
    }
    
    // LÓGICA FLOW: Pega o token da URL
    const urlToken = params.get('token')
    
    if (urlToken) {
      setToken(urlToken)
      
      // Proteção contra duplicidade via sessionStorage
      const sessionKey = `purchase_fired_flow_${urlToken}`;
      
      // ✅ TRACKING: Dispara IMEDIATAMENTE, independente da API
      // Valor padrão fixo para garantir marcação da conversão
      const fireTrackingImmediately = async () => {
        // Verifica se já foi disparado nesta sessão
        if (sessionStorage.getItem(sessionKey)) {
          console.log('⚠️ Tracking (Flow) já foi disparado nesta sessão - pulando');
          return;
        }
        
        // Valor padrão fixo (fallback)
        const purchaseValue = 10000; // Valor padrão do produto
        const currency = 'CLP';
        
        // ⏳ AGUARDA SCRIPTS DE TRACKING CARREGAREM (resolve race condition)
        try {
          await waitForGlobal(10000); // Timeout de 10 segundos
          
          // 1. Facebook Pixel Purchase (redundância com webhook)
          if (window.fbq && typeof window.fbq === 'function') {
            try {
              window.fbq('track', 'Purchase', {
                value: purchaseValue,
                currency: currency,
              }, {
                eventID: urlToken, // ✅ Usa token como event_id para deduplicar
              });
              console.log('✅ Pixel Purchase disparado (Flow) - token:', urlToken, 'value:', purchaseValue);
            } catch (error) {
              console.warn('⚠️ Erro ao disparar Pixel Purchase (Flow):', error);
            }
          } else {
            console.warn('⚠️ Meta Pixel (fbq) não disponível após aguardar');
          }
          
          // 2. UTMify (Flow NÃO tem integração nativa)
          if (window.utmify && typeof window.utmify === 'function') {
            try {
              window.utmify('track', 'purchase', {
                value: purchaseValue,
                currency: currency,
              });
              console.log('✅ UTMify Purchase disparado (Flow) - value:', purchaseValue);
            } catch (error) {
              console.warn('⚠️ Erro ao disparar UTMify (Flow):', error);
            }
          } else {
            console.warn('⚠️ UTMify não disponível após aguardar');
          }
          
          console.log('✅ Eventos disparados com sucesso');
          
          // Marca como enviado no sessionStorage (evita duplicidade em F5)
          sessionStorage.setItem(sessionKey, 'true');
        } catch (error) {
          console.error('❌ Erro ao aguardar scripts de tracking:', error);
          // Mesmo com erro, marca como enviado para não ficar tentando infinitamente
          sessionStorage.setItem(sessionKey, 'true');
        }
      };
      
      // ✅ Dispara tracking IMEDIATAMENTE (execução paralela)
      fireTrackingImmediately();
      
      // ✅ API: Consulta status do pagamento em PARALELO (apenas para UI)
      // Não bloqueia o tracking
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/get-flow-status?token=${encodeURIComponent(urlToken)}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Status do pagamento consultado:', {
              status: data.status,
              commerceOrder: data.commerceOrder,
              amount: data.amount,
            });
            // Atualiza UI com status
            setPaymentStatus(data.status);
            setPaymentAmount(data.amount);
          } else {
            console.warn('⚠️ Erro ao consultar status do pagamento');
          }
        } catch (error) {
          console.error('❌ Erro ao consultar status do pagamento:', error);
        }
      };
      
      // Executa API em paralelo (não bloqueia tracking)
      checkPaymentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccessProduct = () => {
    // Número do WhatsApp: 61981541210
    // Formato para wa.me: número completo sem espaços e sem +
    const whatsappNumber = '61981541210'
    const message = 'Quiero conceder acceso a la aplicación!'
    const encodedMessage = encodeURIComponent(message)
    
    // Redireciona para o WhatsApp usando a API oficial
    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          {/* Logo */}
          <img 
            src="/images/HACKER MILLON PNG.png" 
            alt="HackerMillon Logo" 
            style={{ 
              height: '5rem',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            className="md:h-20"
          />

          {/* Ícone de sucesso */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-neon/20 border-4 border-neon flex items-center justify-center"
            style={{
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.5), 0 0 80px rgba(0, 255, 136, 0.3)',
            }}
          >
            <CheckCircle size={48} className="text-neon" />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            HAZ CLIC AHORA AQUÍ ABAJO PARA LIBERAR TU ACCESO
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed"
          >
            ¡Felicitaciones! Solo falta que hagas clic en el botón de abajo para tener acceso INMEDIATO a tu I.A
          </motion.p>

          {/* Botão para acessar o produto */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleAccessProduct}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs py-4 px-6 bg-gradient-to-r from-neon to-[#00FFD4] text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 uppercase text-lg"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
            }}
          >
            Acceder al Producto
            <ArrowRight size={20} />
          </motion.button>

          {/* Informação adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-gray-500"
          >
            {token && (
              <p className="text-xs text-gray-600">
                Token: {token.substring(0, 20)}...
              </p>
            )}
            <p className="mt-2">
              🔒 Tu acceso está seguro y listo para usar
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}





