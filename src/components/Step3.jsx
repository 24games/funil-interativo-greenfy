import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const depoimentos = [
  {
    id: 1,
    image: '/images/depoimentos/d1.webp',
  },
  {
    id: 2,
    image: '/images/depoimentos/d2.webp',
  },
  {
    id: 3,
    image: '/images/depoimentos/d3.webp',
  },
  {
    id: 4,
    image: '/images/depoimentos/d4.webp',
  },
  {
    id: 5,
    image: '/images/depoimentos/d5.webp',
  },
]

export default function Step3({ onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Auto-scroll do carrossel a cada 5 segundos (bem lento e elegante)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % depoimentos.length)
    }, 5000) // 5 segundos - bem lento

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-6 w-full max-w-md mx-auto px-4"
    >
      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-center leading-tight"
      >
        Ya he ayudado a{' '}
        <span className="shimmer-text">miles de personas</span>
        {' '}con este método
      </motion.h2>

      {/* Sub headline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm md:text-base text-gray-300 leading-relaxed px-4"
      >
        Ya he ayudado a más de 5.436 personas que me envían testimonios como estos todos los días
      </motion.p>

      {/* Carrossel de Depoimentos - Fade Crossfade Infinito */}
      <div className="relative flex items-center justify-center" style={{ minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.8, // Transição suave
              ease: [0.4, 0, 0.2, 1]
            }}
            className="flex items-center justify-center"
          >
            {/* Imagem no tamanho original com bordas arredondadas e traçado verde */}
            <div
              className="overflow-hidden"
              style={{
                borderRadius: '16px', // Bordas arredondadas elegantes
                border: '1.5px solid #00FF88', // Verde bem fininho
                boxShadow: '0 0 25px rgba(0, 255, 136, 0.15)',
              }}
            >
              <img
                src={depoimentos[currentIndex].image}
                alt={`Depoimento ${depoimentos[currentIndex].id}`}
                className="block max-w-full h-auto"
                style={{
                  maxHeight: '500px',
                  width: 'auto',
                  borderRadius: '14px', // Um pouco menor que o container
                }}
                loading="eager"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores de slide - discretos */}
      <div className="flex justify-center gap-2">
        {depoimentos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-neon w-8'
                : 'bg-gray-600 hover:bg-gray-500 w-1.5'
            }`}
            aria-label={`Ir para depoimento ${index + 1}`}
          />
        ))}
      </div>

      {/* Botão para avançar */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={onNext}
        className="neon-button mt-4 text-base relative overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)',
          maxWidth: '280px',
          width: '100%',
          margin: '0 auto',
          paddingLeft: '12px',
          paddingRight: '12px'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          initial={{ x: -100 }}
          animate={{ x: 200 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ width: '50%', height: '100%' }}
        />
        <span className="relative z-10">También quiero estos resultados</span>
      </motion.button>
    </motion.div>
  )
}
