import { motion } from 'framer-motion'
import { useState } from 'react'

const options = [
  '1 Mes',
  '2 Meses',
  '3 Meses',
  '4 Meses o más'
]

export default function Step2({ onNext, onAnswer }) {
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    onAnswer(option)
    // Avança automaticamente após 500ms
    setTimeout(() => {
      onNext()
    }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-4"
    >
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight px-2">
        ¿Cuánto tiempo te tomaría hacer{' '}
        <span className="money-highlight">$1.500.000 pesos</span>?
      </h2>

      {/* Opções */}
      <div className="flex flex-col gap-4 mt-4">
        {options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleSelect(option)}
            className={`glass-card p-6 text-left cursor-pointer ${
              selected === option ? 'selected' : ''
            }`}
          >
            <span className="text-lg font-semibold">{option}</span>
          </motion.button>
        ))}
      </div>

      {/* Emoji Pulsante */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-center mt-6"
      >
        <span className="text-6xl">⏰</span>
      </motion.div>
    </motion.div>
  )
}



