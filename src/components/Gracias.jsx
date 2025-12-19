import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Gracias() {
  const [token, setToken] = useState(null)

  /**
   * Envia evento Purchase para Meta (Pixel + CAPI)
   */
  const sendPurchaseTracking = async (token) => {
    try {
      // Proteção contra duplicidade: verifica se já foi trackeado
      const trackingKey = `purchase_tracked_${token}`;
      if (localStorage.getItem(trackingKey)) {
        console.log('⚠️ Purchase já foi trackeado para este token - pulando');
        return;
      }

      // 1. DISPARO BROWSER-SIDE: fbq('track', 'Purchase')
      if (window.fbq && typeof window.fbq === 'function') {
        try {
          window.fbq('track', 'Purchase', {
            currency: 'CLP',
            value: 5000,
          });
          console.log('✅ Pixel Purchase disparado (browser-side)');
        } catch (error) {
          console.warn('⚠️ Erro ao disparar Pixel Purchase:', error);
        }
      } else {
        console.warn('⚠️ Meta Pixel (fbq) não disponível');
      }

      // 2. DISPARO CAPI: Envia para API server-side
      try {
        // Recupera tracking_id do localStorage
        const trackingId = localStorage.getItem('tracking_id');
        
        // Recupera UTMs e dados do navegador
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };

        const purchaseData = {
          token: token,
          tracking_id: trackingId,
          page_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          language: navigator.language,
          // FBP e FBC (críticos para matching)
          fbp: getCookie('_fbp'),
          fbc: getCookie('_fbc'),
          // UTMs
          utm_source: new URLSearchParams(window.location.search).get('utm_source') || getCookie('utm_source') || localStorage.getItem('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || getCookie('utm_medium') || localStorage.getItem('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || getCookie('utm_campaign') || localStorage.getItem('utm_campaign'),
          utm_term: new URLSearchParams(window.location.search).get('utm_term') || getCookie('utm_term') || localStorage.getItem('utm_term'),
          utm_content: new URLSearchParams(window.location.search).get('utm_content') || getCookie('utm_content') || localStorage.getItem('utm_content'),
          // Valor e moeda
          value: 5000,
          currency: 'CLP',
          timestamp: new Date().toISOString(),
        };

        // Tenta obter IP (opcional, não crítico)
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          purchaseData.ip = ipData.ip;
        } catch (error) {
          console.warn('⚠️ Não foi possível obter IP:', error);
        }

        // Envia para API
        const response = await fetch('/api/tracking-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchaseData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Purchase CAPI enviado com sucesso:', result);

        // Marca como trackeado no localStorage (proteção contra duplicidade)
        localStorage.setItem(trackingKey, 'true');
        console.log('✅ Purchase trackeado e marcado no localStorage');
      } catch (error) {
        console.error('❌ Erro ao enviar Purchase CAPI:', error);
        // Mesmo com erro no CAPI, marca como trackeado para evitar spam
        localStorage.setItem(trackingKey, 'true');
      }
    } catch (error) {
      console.error('❌ Erro geral no tracking de Purchase:', error);
    }
  }

  useEffect(() => {
    // Pega o token da URL
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      setToken(urlToken)
      // Dispara tracking de Purchase
      sendPurchaseTracking(urlToken).catch(error => {
        console.error('Erro ao processar tracking de Purchase:', error)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccessProduct = () => {
    // Número do WhatsApp (Chile): +56 9 2710 9730
    // Formato para wa.me: remove espaços e o +, mantém o 9
    const whatsappNumber = '56927109730'
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





