import { motion } from 'framer-motion'
import { useRef } from 'react'
import VturbVideo from './VturbVideo'

export default function Step1({ onNext }) {
  // Configuração: botão aparece quando o vídeo chega em 21 segundos (0:21)
  // O Vturb.displayHiddenElements cuida de mostrar o botão respeitando pausa do vídeo
  const delaySeconds = 21
  const buttonRef = useRef(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center gap-3"
    >
      {/* Headline */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight px-2 sm:px-4 break-words -mt-4">
        Genera de{' '}
        <span className="money-highlight">
          $1.000.000 a $4.500.000 CLP
        </span>{' '}
        mensuales solo copiando la I.A.
      </h1>

      {/* Video Vturb */}
      <VturbVideo 
        videoId="vid_6939f7c83ec7593882510713"
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
        className="esconder neon-button animate-pulse-glow text-sm sm:text-base relative overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)',
          maxWidth: '280px',
          width: '100%',
          paddingLeft: '12px',
          paddingRight: '12px'
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



