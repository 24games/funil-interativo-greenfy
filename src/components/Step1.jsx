import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import VturbVideo from './VturbVideo'

export default function Step1({ onNext }) {
  // Configuração: botão aparece quando o vídeo chega em 20 segundos (0:20)
  const delaySeconds = 20
  const buttonRef = useRef(null)

  // Fallback: se o Vturb não funcionar, mostra o botão após o tempo
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (buttonRef.current && buttonRef.current.classList.contains('esconder')) {
        buttonRef.current.classList.remove('esconder')
      }
    }, (delaySeconds + 2) * 1000) // +2 segundos de margem

    return () => clearTimeout(fallbackTimer)
  }, [delaySeconds])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center gap-4"
    >
      {/* Headline */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight px-2 sm:px-4 break-words -mt-2">
        Genera de{' '}
        <span className="money-highlight">
          $1.000.000 a $4.500.000 CLP
        </span>{' '}
        mensuales copiando y pegando las señales de mi I.A.
      </h1>

      {/* Video Vturb */}
      <VturbVideo 
        videoId="vid-6939f7c83ec7593882510713"
        playerId="6939f7c83ec7593882510713"
        delaySeconds={delaySeconds}
      />

      {/* Botão - Só aparece quando o vídeo chega no tempo necessário (usando método padrão do Vturb) */}
      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.6
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="esconder neon-button w-full animate-pulse-glow text-sm sm:text-base relative overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)'
        }}
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
        <span className="relative z-10">CONTINUAR</span>
      </motion.button>
    </motion.div>
  )
}



