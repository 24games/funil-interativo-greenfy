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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-6 w-full px-2 sm:px-4"
    >
      {/* Headline */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight break-words">
        ¡Ya ayudé a miles de personas a cambiar su vida con lo que te voy a mostrar!
      </h2>

      {/* Subheadline */}
      <p className="text-base sm:text-lg text-center text-gray-300 break-words">
        Y lo mejor,{' '}
        <span className="font-bold text-neon bg-neon/10 px-2 py-1 rounded inline-block">
          no cobré ni un peso por eso
        </span>
        .
      </p>

      {/* Carrossel de Prints */}
      <div className="relative overflow-hidden py-6 w-full -mx-2 sm:-mx-4 px-2 sm:px-4">
        <motion.div 
          className="flex gap-3 sm:gap-4"
          style={{ x: -scrollPosition }}
        >
          {[...testimonialImages, ...testimonialImages].map((img, index) => (
            <div
              key={`${img.id}-${index}`}
              className={`flex-shrink-0 w-44 h-64 sm:w-52 sm:h-72 md:w-60 md:h-80 lg:w-64 lg:h-96 rounded-xl sm:rounded-2xl bg-gradient-to-br ${img.color} border border-neon/20 flex items-center justify-center`}
            >
              <div className="text-center p-3 sm:p-4 md:p-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-neon/20 mx-auto mb-2 sm:mb-3 md:mb-4" />
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-3/4 mx-auto" />
                  <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-full" />
                  <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-5/6 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Botão */}
      <button 
        onClick={onNext}
        className="neon-button w-full text-sm sm:text-base px-4 py-4 sm:py-5"
      >
        CONTINUAR
      </button>
    </motion.div>
  )
}



