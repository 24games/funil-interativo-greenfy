import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const testimonialImages = [
  { id: 1, color: 'from-green-900/20 to-emerald-900/20' },
  { id: 2, color: 'from-teal-900/20 to-cyan-900/20' },
  { id: 3, color: 'from-lime-900/20 to-green-900/20' },
]

export default function Step3({ onNext }) {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => (prev + 1) % 300)
    }, 30)
    return () => clearInterval(interval)
  }, [])

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
          initial={{ width: '20%' }}
          animate={{ width: '40%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-bar-fill h-full"
        />
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
        ¡Ya ayudé a miles de personas a cambiar su vida con lo que te voy a mostrar!
      </h2>

      {/* Subheadline */}
      <p className="text-lg text-center text-gray-300">
        Y lo mejor,{' '}
        <span className="font-bold text-neon bg-neon/10 px-2 py-1 rounded">
          no cobré ni un peso por eso
        </span>
        .
      </p>

      {/* Carrossel de Prints */}
      <div className="relative overflow-hidden py-8">
        <motion.div 
          className="flex gap-4"
          style={{ x: -scrollPosition }}
        >
          {[...testimonialImages, ...testimonialImages].map((img, index) => (
            <div
              key={`${img.id}-${index}`}
              className={`flex-shrink-0 w-64 h-96 rounded-2xl bg-gradient-to-br ${img.color} border border-neon/20 flex items-center justify-center`}
            >
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-neon/20 mx-auto mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-5/6 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Botão */}
      <button 
        onClick={onNext}
        className="neon-button w-full"
      >
        CONTINUAR
      </button>
    </motion.div>
  )
}


