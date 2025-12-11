import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'

export default function Step7() {
  // Configuração: botão aparece quando o vídeo chega em 134 segundos (2:14)
  const delaySeconds = 134 // Tempo em segundos (2 minutos e 14 segundos)
  const buttonRef = useRef(null)

  // Fallback: se o Vturb não funcionar, mostra o botão e elementos após o tempo
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      // Mostra o botão
      if (buttonRef.current && buttonRef.current.classList.contains('esconder')) {
        buttonRef.current.classList.remove('esconder')
      }
      // Mostra todos os elementos com classe .esconder (benefícios, urgência, trust badges)
      const hiddenElements = document.querySelectorAll('.esconder')
      hiddenElements.forEach(el => {
        el.classList.remove('esconder')
      })
    }, (delaySeconds + 2) * 1000)

    return () => clearTimeout(fallbackTimer)
  }, [delaySeconds])

  const handleCTA = () => {
    // Aqui você pode adicionar a lógica para redirecionar
    // para WhatsApp, página de checkout, etc.
    console.log('CTA Clicado!')
    // window.location.href = 'SEU_LINK_AQUI'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3"
    >
      {/* Badge de conclusão */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="flex items-center justify-center gap-2 mx-auto bg-neon/10 border border-neon/30 rounded-full px-6 py-2"
      >
        <Sparkles size={20} className="text-neon" />
        <span className="text-neon font-bold text-sm">ACCESO LIBERADO</span>
        <Sparkles size={20} className="text-neon" />
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-center leading-tight"
      >
        Haz esto para acceder a tu IA exclusiva de operación.
      </motion.h2>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-xl text-center text-gray-300"
      >
        ¡Genera tus primeros{' '}
        <span className="money-highlight text-2xl">
          $150.000 CLP
        </span>{' '}
        hoy mismo!
      </motion.p>

      {/* Video Vturb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <VturbVideo 
          videoId="vid-6939f7c0c54455d1fed8aee0"
          playerId="6939f7c0c54455d1fed8aee0"
          delaySeconds={delaySeconds}
        />
      </motion.div>

      {/* CTA Final - Só aparece quando o vídeo chega no tempo necessário (usando método padrão do Vturb) */}
      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.6
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCTA}
        className="esconder neon-button w-full mt-2 text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 px-4 animate-heartbeat relative overflow-hidden"
        style={{ 
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4), 0 0 120px rgba(0, 255, 136, 0.2)'
        }}
      >
        <motion.span
          initial={{ x: -100 }}
          animate={{ x: 200 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: '50%', height: '100%' }}
        />
        <span className="relative z-10">¡GARANTIZAR CUPO AHORA!</span>
      </motion.button>

      {/* Lista de benefícios rápidos - Abaixo do botão */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="esconder glass-card p-6 space-y-3"
      >
        {[
          'Acceso inmediato a la IA',
          'Sin cobros ocultos',
          'Soporte 24/7 en español',
          'Resultados desde el día 1'
        ].map((benefit, index) => (
          <motion.div
            key={benefit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-neon/20 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-neon" />
            </div>
            <span className="text-gray-200 font-medium">{benefit}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Urgência */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="esconder text-center space-y-1"
      >
        <p className="text-yellow-400 font-bold text-sm">⚠️ CUPOS LIMITADOS</p>
        <p className="text-gray-400 text-xs">Solo quedan 7 cupos disponibles hoy</p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        className="esconder flex items-center justify-center gap-4 text-xs text-gray-500"
      >
        <span>🔒 Pago Seguro</span>
        <span>•</span>
        <span>✓ 100% Confiable</span>
        <span>•</span>
        <span>⚡ Acceso Inmediato</span>
      </motion.div>
    </motion.div>
  )
}



