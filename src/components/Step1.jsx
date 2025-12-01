import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function Step1({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center gap-8"
    >
      {/* Headline */}
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight px-2 sm:px-4 break-words">
        Genera de{' '}
        <span className="money-highlight">
          $1.000.000 a $4.500.000 CLP
        </span>{' '}
        mensuales copiando y pegando las señales de mi I.A.
      </h1>

      {/* Video Placeholder */}
      <div className="w-full video-placeholder">
        <Play size={64} className="text-neon opacity-80" strokeWidth={1.5} />
        <span className="text-gray-400 text-sm font-medium">Video Vturb</span>
      </div>

      {/* Micro texto */}
      <p className="text-gray-500 text-xs text-center -mt-4">
        Toca en continuar
      </p>

      {/* Botão */}
      <button 
        onClick={onNext}
        className="neon-button w-full animate-pulse-glow text-sm sm:text-base"
      >
        CONTINUAR
      </button>
    </motion.div>
  )
}



