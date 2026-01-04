import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

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
              eventID: ppayId, // Usa ppayId como event_id para deduplicar com Webhook
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
      } else {
        console.log('⚠️ Pixel Purchase (Perfect Pay) já foi disparado nesta sessão - pulando');
      }
      return; // Retorna para não processar lógica do Flow
    }
    
    // LÓGICA FLOW: Pega o token da URL
    // IMPORTANTE: Para Flow, NÃO dispara Purchase (nem Pixel nem CAPI)
    // O webhook-flow é a única fonte de verdade para Purchase
    const urlToken = params.get('token')
    
    if (urlToken) {
      setToken(urlToken)
      
      // Apenas consulta status do pagamento e exibe na UI
      // NÃO dispara Purchase (nem Pixel nem CAPI) - webhook-flow é a única fonte de verdade
      const checkPaymentStatus = async () => {
        try {
          const response = await fetch(`/api/get-flow-status?token=${encodeURIComponent(urlToken)}`);
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Status do pagamento consultado (Purchase não disparado - webhook é fonte de verdade):', {
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
      
      checkPaymentStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccessProduct = () => {
    // Número do WhatsApp: 11958065533 (formato completo: 5511958065533)
    // Formato para wa.me: número completo sem espaços e sem +
    const whatsappNumber = '5511958065533'
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
            ¡Pago Exitoso!
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed"
          >
            Tu acceso ha sido liberado.
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





