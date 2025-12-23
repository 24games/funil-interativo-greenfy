import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { initTracking } from '../utils/tracking.js'
import { handlePerfectRedirect } from '../utils/perfectCheckout.js'
import { CheckCircle } from 'lucide-react'

export default function BackPerfect() {
  // Inicializa tracking quando a pagina /back-perfect carrega
  useEffect(() => {
    initTracking().catch(error => {
      console.error('Erro ao inicializar tracking na pagina /back-perfect:', error)
    })
  }, [])

  // Handler do botão CTA - Redirecionamento para Centerpag
  const handleCTA = () => {
    // Redireciona diretamente para a página de checkout do Centerpag
    window.location.href = 'https://checkout.centerpag.com/pay/PPU38CQ54K3'
  }

  // Componente do botao reutilizavel
  const CTAButton = () => (
    <motion.button
      onClick={handleCTA}
      animate={{
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)',
          '0 0 60px rgba(0, 255, 136, 1), 0 0 100px rgba(0, 255, 136, 0.6)',
          '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        display: 'block',
        position: 'relative',
        width: '100%',
        maxWidth: '320px',
        padding: '20px 24px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        background: 'linear-gradient(90deg, #00FF88, #00FFD4)',
        fontSize: '18px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#050505',
        boxShadow: '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
      }}
    >
      {/* Efeito de brilho */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          zIndex: 1
        }}
      />
      <span style={{ position: 'relative', zIndex: 2 }}>
        APP LIBERADO!
      </span>
    </motion.button>
  )

  const bulletPoints = [
    '97% de assertividad en las senales del app',
    '5.436 personas usando en este momento',
    '2026 solo tendra ingresos extra quien use I.A!',
    'Acceso de por vida sin mensualidades'
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com particulas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full flex flex-col items-center gap-5 text-center"
        >
          {/* Logo */}
          <img 
            src="/images/HACKER MILLON PNG.png" 
            alt="24Games Logo" 
            style={{ 
              height: '4rem',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            className="md:h-16"
          />

          {/* HEADLINE com destaque de preço */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white leading-tight"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-xl md:text-2xl">Tu única oportunidad de</span>
                <br />
                <span className="text-xl md:text-2xl">cambiar tu vida financiera</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center mt-2">
                <span 
                  className="text-4xl md:text-5xl font-extrabold relative"
                  style={{ 
                    color: '#FF4444',
                    textDecoration: 'line-through',
                    textDecorationThickness: '4px',
                    textDecorationColor: '#FF4444',
                    opacity: 0.7
                  }}
                >
                  $10.000
                </span>
                <span 
                  className="text-4xl md:text-5xl font-extrabold"
                  style={{ 
                    color: '#00FF88',
                    textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
                  }}
                >
                  $7.000
                </span>
              </div>
              <div className="text-lg md:text-xl text-neon font-semibold mt-1">
                Esta es tu última chance
              </div>
            </div>
          </motion.h1>

          {/* SUBHEADLINE */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-base md:text-lg leading-relaxed"
          >
            No puedes dejar pasar la oportunidad de usar el app y 
            <span className="text-neon font-semibold"> cambiar completamente tus resultados</span>! 
            Quieres recibir todos los dias notificaciones como esta?
          </motion.p>

          {/* PRIMEIRO BOTAO - Abaixo da headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full flex justify-center"
          >
            <CTAButton />
          </motion.div>

          {/* IMAGEM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <img 
              src="/images/back/ganho.jpg" 
              alt="Ganancias del App" 
              className="w-full h-auto rounded-lg border-2 border-neon/30"
            />
          </motion.div>

          {/* BULLET POINTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
          >
            <div className="space-y-3">
              {bulletPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 text-left"
                >
                  <CheckCircle 
                    size={22} 
                    className="text-neon flex-shrink-0 mt-0.5" 
                  />
                  <span className="text-gray-200 text-sm md:text-base">
                    {point}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SEGUNDO BOTAO - Abaixo dos bullet points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-full flex justify-center"
          >
            <CTAButton />
          </motion.div>

          {/* Urgencia */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center space-y-1"
          >
            <p className="text-yellow-400 font-bold text-sm">CUPOS LIMITADOS</p>
            <p className="text-gray-500 text-xs">Solo quedan 3 cupos disponibles hoy</p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex items-center justify-center gap-4 text-xs text-gray-500"
          >
            <span>Pago Seguro</span>
            <span>100% Confiable</span>
            <span>Acceso Inmediato</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
