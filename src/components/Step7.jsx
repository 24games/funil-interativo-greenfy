import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'

export default function Step7() {
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
      className="flex flex-col gap-6"
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

      {/* Video Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="w-full video-placeholder"
      >
        <Play size={64} className="text-neon opacity-80" strokeWidth={1.5} />
        <span className="text-gray-400 text-sm font-medium">Video Vturb</span>
      </motion.div>

      {/* CTA Final - Logo abaixo do vídeo */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        onClick={handleCTA}
        className="neon-button w-full text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 px-4 animate-heartbeat"
        style={{ 
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)'
        }}
      >
        ¡GARANTIZAR CUPO AHORA!
      </motion.button>

      {/* Lista de benefícios rápidos - Abaixo do botão */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="glass-card p-6 space-y-3"
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
        className="text-center space-y-1"
      >
        <p className="text-yellow-400 font-bold text-sm">⚠️ CUPOS LIMITADOS</p>
        <p className="text-gray-400 text-xs">Solo quedan 7 cupos disponibles hoy</p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        className="flex items-center justify-center gap-4 text-xs text-gray-500"
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



