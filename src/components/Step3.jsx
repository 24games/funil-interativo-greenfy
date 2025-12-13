import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const depoimentos = [
  {
    id: 1,
    image: '/images/depoimentos/d1.webp',
    name: 'Carlos M.',
    text: 'En mi primer mes gané $2.300.000 pesos. No puedo creer que sea tan fácil.',
  },
  {
    id: 2,
    image: '/images/depoimentos/d2.webp',
    name: 'María L.',
    text: 'Llevo 3 meses usando el método y ya generé más de $6.000.000 pesos.',
  },
  {
    id: 3,
    image: '/images/depoimentos/d3.webp',
    name: 'Juan P.',
    text: 'La mejor inversión que hice. En 2 meses recuperé todo y ahora solo gano.',
  },
  {
    id: 4,
    image: '/images/depoimentos/d4.webp',
    name: 'Ana S.',
    text: 'Pensé que era mentira, pero funciona de verdad. $1.800.000 en el primer mes.',
  },
  {
    id: 5,
    image: '/images/depoimentos/d5.webp',
    name: 'Roberto F.',
    text: 'Mi vida cambió completamente. Ahora trabajo desde casa y gano más que antes.',
  },
]

export default function Step3({ onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Auto-scroll do carrossel a cada 3 segundos
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % depoimentos.length)
    }, 3000)

    // Avança automaticamente após 12 segundos (4 depoimentos)
    const timeout = setTimeout(() => {
      onNext()
    }, 12000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onNext])

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
        Mira lo que dicen{' '}
        <span className="money-highlight">nuestros usuarios</span>
      </motion.h2>

      {/* Carrossel de Depoimentos */}
      <div className="relative overflow-hidden rounded-2xl" style={{ height: '500px' }}>
        <motion.div
          className="flex"
          animate={{
            x: `-${currentIndex * 100}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          style={{
            width: `${depoimentos.length * 100}%`,
          }}
        >
          {depoimentos.map((depoimento, index) => (
            <motion.div
              key={depoimento.id}
              className="flex-shrink-0 w-full px-4"
              style={{ width: `${100 / depoimentos.length}%` }}
            >
              <div className="glass-card p-6 h-full flex flex-col items-center gap-4">
                {/* Imagem do depoimento */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="w-32 h-32 rounded-full overflow-hidden border-2 border-neon/50"
                >
                  <img
                    src={depoimento.image}
                    alt={depoimento.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Nome */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-xl font-bold text-neon"
                >
                  {depoimento.name}
                </motion.h3>

                {/* Texto do depoimento */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center text-gray-200 leading-relaxed flex-grow flex items-center"
                >
                  "{depoimento.text}"
                </motion.p>

                {/* Estrelas */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex gap-1 text-yellow-400"
                >
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">⭐</span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Indicadores de slide */}
      <div className="flex justify-center gap-2">
        {depoimentos.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-neon w-8'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Texto de destaque */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-sm text-gray-400 mt-2"
      >
        Más de 10.000 personas ya están ganando dinero con este método
      </motion.p>
    </motion.div>
  )
}
