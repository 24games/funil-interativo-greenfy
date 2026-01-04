import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ProgressBar({ currentStep, showPercentage = false }) {
  const [progress, setProgress] = useState(0)

  // Calcula o progresso baseado no step atual
  useEffect(() => {
    let targetProgress = 0

    // Step 1: 0% (antes do botão)
    // Step 2: 80% (quando aparece a barra)
    // Step 3: 85%
    // Step 4: 90%
    // Step 5: 92%
    // Step 6: 95%
    // Step 7: 100%

    switch (currentStep) {
      case 1:
        targetProgress = 0
        break
      case 2:
        targetProgress = 80
        break
      case 3:
        targetProgress = 85
        break
      case 4:
        targetProgress = 90
        break
      case 5:
        targetProgress = 92
        break
      case 6:
        targetProgress = 95
        break
      case 7:
        targetProgress = 100
        break
      default:
        targetProgress = 0
    }

    // Anima suavemente para o progresso alvo
    const duration = 800 // 0.8 segundos
    const startProgress = progress
    const difference = targetProgress - startProgress
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progressRatio, 3)
      const currentProgress = startProgress + (difference * eased)
      setProgress(currentProgress)

      if (progressRatio < 1) {
        requestAnimationFrame(animate)
      } else {
        setProgress(targetProgress)
      }
    }

    if (Math.abs(targetProgress - progress) > 0.1) {
      requestAnimationFrame(animate)
    } else {
      setProgress(targetProgress)
    }
  }, [currentStep]) // eslint-disable-line react-hooks/exhaustive-deps

  // Só mostra a barra a partir do Step 2 (após clicar no primeiro botão)
  if (currentStep < 2) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md px-4 mb-4"
    >
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
        {/* Barra de progresso com gradiente */}
        <motion.div
          className="h-full bg-gradient-to-r from-neon to-[#00FFD4] rounded-full relative overflow-hidden"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Efeito de brilho animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
      
      {/* Mostra porcentagem apenas no Step 7 */}
      {showPercentage && currentStep === 7 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-400 mt-1"
        >
          {Math.round(progress)}%
        </motion.p>
      )}
    </motion.div>
  )
}

