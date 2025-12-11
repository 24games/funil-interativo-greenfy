import { motion } from 'framer-motion'
import { useRef } from 'react'
import VturbVideo from './VturbVideo'

export default function Step4({ onNext }) {
  // Configuração: botão aparece quando o vídeo chega em 49 segundos (0:49)
  // O Vturb.displayHiddenElements cuida de mostrar o botão respeitando pausa do vídeo
  const delaySeconds = 49
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
      <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
        Mira cómo hice{' '}
        <span className="shimmer-text text-4xl">
          $1.500.000 CLP
        </span>{' '}
        solo utilizando este método
      </h2>

      {/* Video Vturb */}
      <VturbVideo 
        videoId="vid_6939f7aadee6875e65a4963d"
        playerId="6939f7aadee6875e65a4963d"
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
        className="esconder neon-button mt-2 text-sm sm:text-base relative overflow-hidden"
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
        <span className="relative z-10">Hacer test rápido</span>
      </motion.button>

      {/* Subheadline abaixo do botão - Aparece junto com o botão */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="esconder text-sm text-center text-gray-400 mt-2"
      >
        Completa el test de 3 preguntas y accede a la app
      </motion.p>
    </motion.div>
  )
}



