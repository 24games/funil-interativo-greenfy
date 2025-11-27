import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const questions = [
  {
    id: 'freeTime',
    text: '¿Cuánto tiempo libre tienes al día?',
    options: ['Menos de 1h', '1h a 2h', 'Más de 3h']
  },
  {
    id: 'aiIncome',
    text: '¿Ya generaste ingresos usando Inteligencia Artificial?',
    options: ['Sí', 'No', 'Lo intenté pero fallé']
  },
  {
    id: 'internetAccess',
    text: '¿Cómo accedes a internet normalmente?',
    options: ['Red Móvil', 'WiFi', 'Ambos']
  }
]

export default function Step5({ onNext, onAnswer }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selected, setSelected] = useState(null)

  const handleSelect = (option) => {
    setSelected(option)
    const currentQ = questions[currentQuestion]
    onAnswer(currentQ.id, option)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelected(null)
      } else {
        // Última pergunta, vai para o Step 6
        onNext()
      }
    }, 500)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 40 + 60

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
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-bar-fill h-full"
        />
      </div>

      {/* Contador de perguntas */}
      <div className="text-center text-sm text-gray-400">
        Pregunta {currentQuestion + 1} de {questions.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6"
        >
          {/* Pergunta */}
          <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight px-2">
            {questions[currentQuestion].text}
          </h2>

          {/* Opções */}
          <div className="flex flex-col gap-4 mt-4">
            {questions[currentQuestion].options.map((option, index) => (
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
      </AnimatePresence>
    </motion.div>
  )
}


