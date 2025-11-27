import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function Step1({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Logo */}
      <div className="w-32 h-16 bg-gradient-to-r from-neon to-green-400 rounded-lg flex items-center justify-center">
        <span className="text-dark font-bold text-xl">24GAMES</span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-bold text-center leading-tight px-4">
        Genera de{' '}
        <span className="money-highlight">
          $1.000.000 a $4.500.000 CLP
        </span>{' '}
        mensuales evaluando patrones.
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
        className="neon-button w-full animate-pulse-glow"
      >
        CONTINUAR
      </button>
    </motion.div>
  )
}


