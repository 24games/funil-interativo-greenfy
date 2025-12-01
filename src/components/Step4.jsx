import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function Step4({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Barra de Progresso */}
      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '40%' }}
          animate={{ width: '60%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-bar-fill h-full"
        />
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
        Mira cómo hice{' '}
        <span className="shimmer-text text-4xl">
          $1.600.000 CLP
        </span>{' '}
        en apenas 30 segundos
      </h2>

      {/* Subheadline */}
      <p className="text-lg text-center text-gray-300 -mt-2">
        Solo utilizando este método.
      </p>

      {/* Video Placeholder */}
      <div className="w-full video-placeholder">
        <Play size={64} className="text-neon opacity-80" strokeWidth={1.5} />
        <span className="text-gray-400 text-sm font-medium">Video Vturb</span>
      </div>

      {/* Botão */}
      <button 
        onClick={onNext}
        className="neon-button w-full mt-4"
      >
        QUIERO APRENDER ESTE MÉTODO
      </button>
    </motion.div>
  )
}



