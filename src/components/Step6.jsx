import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, CheckCircle } from 'lucide-react'

export default function Step6({ onNext }) {
  const [stage, setStage] = useState('analyzing') // 'analyzing' | 'approved'
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    // Após 2 segundos, muda para approved
    const timer1 = setTimeout(() => {
      setStage('approved')
      // Gera confetes
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random(),
        color: i % 3 === 0 ? '#00FF88' : i % 3 === 1 ? '#00FFD4' : '#10B981',
      }))
      setConfetti(newConfetti)
    }, 2000)

    // Após 5 segundos total (2 + 3), avança para Step 7
    const timer2 = setTimeout(() => {
      onNext()
    }, 5000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onNext])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] gap-8"
    >
      {stage === 'analyzing' && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={80} className="text-neon" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl md:text-3xl font-bold text-center"
          >
            ¡ANALIZANDO PERFIL...
          </motion.h2>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-neon rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </>
      )}

      {stage === 'approved' && (
        <>
          {/* Confetes */}
          {confetti.map((conf) => (
            <motion.div
              key={conf.id}
              className="confetti"
              style={{
                left: `${conf.left}%`,
                backgroundColor: conf.color,
              }}
              initial={{ y: '-10vh', opacity: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: 720 }}
              transition={{ 
                duration: conf.duration, 
                delay: conf.delay,
                ease: 'linear'
              }}
            />
          ))}

          {/* Ícone de aprovado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15 
            }}
          >
            <CheckCircle size={120} className="text-neon" strokeWidth={2} />
          </motion.div>

          {/* Texto */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black text-center text-neon"
            style={{ textShadow: '0 0 30px rgba(0, 255, 136, 0.5)' }}
          >
            ¡PERFIL APROBADO!
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-neon rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}



































