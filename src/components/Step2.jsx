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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      {/* Barra de Progresso */}
      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '20%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-bar-fill h-full"
        />
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight px-2">
        ¿Cuánto tiempo te tomaría hacer{' '}
        <span className="money-highlight">$1.500.000 CLP</span>?
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
    </motion.div>
  )
}


