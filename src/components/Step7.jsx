import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'

export default function Step7() {
  // Configuração: botão aparece quando o vídeo chega em 134 segundos (2:14)
  // O Vturb.displayHiddenElements cuida de mostrar o botão e elementos respeitando pausa do vídeo
  const delaySeconds = 134 // Tempo em segundos (2 minutos e 14 segundos)
  const buttonRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const handleCTA = () => {
    // Aqui você pode adicionar a lógica para redirecionar
    // para WhatsApp, página de checkout, etc.
    console.log('CTA Clicado!')
    // window.location.href = 'SEU_LINK_AQUI'
  }

  // Anima o progresso do loading baseado no tempo do delay, respeitando pausa do vídeo
  useEffect(() => {
    let startTime = Date.now()
    let pausedTime = 0
    let pauseStartTime = 0
    let isPaused = false
    let animationFrame = null
    let lastProgress = 0

    const findVideoElement = () => {
      const videoId = 'vid_6939f7c0c54455d1fed8aee0'
      const videoDiv = document.getElementById(videoId)
      if (!videoDiv) return null

      // Tenta encontrar o elemento de vídeo dentro do player Vturb
      const video = videoDiv.querySelector('video')
      if (video) return video

      // Tenta via iframe
      const iframe = videoDiv.querySelector('iframe')
      if (iframe && iframe.contentWindow) {
        try {
          const iframeDoc = iframe.contentWindow.document
          const iframeVideo = iframeDoc.querySelector('video')
          if (iframeVideo) return iframeVideo
        } catch (e) {
          // Cross-origin, não consegue acessar
        }
      }

      return null
    }

    const updateProgress = () => {
      const video = findVideoElement()
      let currentIsPaused = false
      
      // Verifica se o vídeo está pausado
      if (video) {
        try {
          currentIsPaused = video.paused
        } catch (e) {
          // Se não conseguir acessar, assume que não está pausado
          currentIsPaused = false
        }
      } else {
        // Se não encontrou o vídeo, não atualiza (mantém o último progresso)
        animationFrame = requestAnimationFrame(updateProgress)
        return
      }
      
      // Detecta mudança de estado de pausa
      if (currentIsPaused && !isPaused) {
        // Vídeo acabou de pausar
        isPaused = true
        pauseStartTime = Date.now()
      } else if (!currentIsPaused && isPaused) {
        // Vídeo acabou de retomar
        isPaused = false
        pausedTime += Date.now() - pauseStartTime
      }

      // Só atualiza o progresso se o vídeo NÃO estiver pausado
      if (!isPaused && !currentIsPaused) {
        const elapsed = Date.now() - startTime - pausedTime
        const duration = delaySeconds * 1000
        const progress = Math.min((elapsed / duration) * 100, 100)
        
        // Só atualiza se o progresso mudou (evita re-renders desnecessários)
        if (Math.abs(progress - lastProgress) > 0.1) {
          setLoadingProgress(progress)
          lastProgress = progress
        }

        if (progress < 100) {
          animationFrame = requestAnimationFrame(updateProgress)
        } else {
          // Quando chega em 100%, verifica se o botão está pronto
          setTimeout(() => {
            if (buttonRef.current && !buttonRef.current.classList.contains('esconder')) {
              setIsLoading(false)
            }
          }, 100)
        }
      } else {
        // Vídeo está pausado, continua verificando mas NÃO atualiza progresso
        animationFrame = requestAnimationFrame(updateProgress)
      }
    }

    // Aguarda um pouco para o vídeo carregar e começa a verificar
    const startDelay = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateProgress)
    }, 2000)

    return () => {
      clearTimeout(startDelay)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [delaySeconds])

  // Monitora quando o botão deve ficar pronto (quando a classe .esconder é removida)
  useEffect(() => {
    const checkButtonReady = () => {
      if (buttonRef.current && !buttonRef.current.classList.contains('esconder')) {
        // Aguarda um pouco para garantir que o loading chegou em 100%
        if (loadingProgress >= 99) {
          setIsLoading(false)
        }
      }
    }

    // Verifica periodicamente
    const interval = setInterval(checkButtonReady, 100)

    return () => clearInterval(interval)
  }, [loadingProgress])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3"
    >
      {/* Badge de conclusão */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="flex items-center justify-center gap-2 mx-auto bg-neon/10 border border-neon/30 rounded-full px-6 py-2"
      >
        <Sparkles size={20} className="text-neon" />
        <span className="text-neon font-bold text-sm">ÚLTIMO PASO</span>
        <Sparkles size={20} className="text-neon" />
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-center leading-tight"
      >
        El acceso a la I.A será liberado al final del video
      </motion.h2>

      {/* Video Vturb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
      >
        <VturbVideo 
          videoId="vid_6939f7c0c54455d1fed8aee0"
          playerId="6939f7c0c54455d1fed8aee0"
          delaySeconds={delaySeconds}
        />
      </motion.div>

      {/* Botão de Loading - Aparece antes do botão final */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 relative"
          style={{
            maxWidth: '280px',
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          <button
            disabled
            className="w-full text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 relative overflow-hidden rounded-xl font-bold text-black bg-gray-700 border-2 border-gray-600 cursor-not-allowed"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              paddingLeft: '12px',
              paddingRight: '12px'
            }}
          >
            {/* Barra de progresso animada (da esquerda para direita) */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon to-[#00FFD4]"
              style={{
                width: `${loadingProgress}%`,
                transition: 'width 0.1s linear'
              }}
            />
            {/* Texto do botão */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loadingProgress < 100 ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  Cargando...
                </>
              ) : (
                '¡APP LIBERADO!'
              )}
            </span>
          </button>
        </motion.div>
      )}

      {/* CTA Final - Só aparece quando o vídeo chega no tempo necessário (usando método padrão do Vturb) */}
      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          scale: isLoading ? 0.95 : 1, 
          y: 0,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.6
        }}
        whileHover={{ scale: isLoading ? 1 : 1.05 }}
        whileTap={{ scale: isLoading ? 1 : 0.95 }}
        onClick={handleCTA}
        disabled={isLoading}
        className={`${isLoading ? 'hidden' : 'esconder'} neon-button mt-2 text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 animate-heartbeat relative overflow-hidden`}
        style={{ 
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4), 0 0 120px rgba(0, 255, 136, 0.2)',
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
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: '50%', height: '100%' }}
        />
        <span className="relative z-10">¡APP LIBERADO!</span>
      </motion.button>

      {/* Lista de benefícios rápidos - Abaixo do botão */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="esconder glass-card p-6 space-y-3"
      >
        {[
          'Acceso inmediato a la IA',
          'Sin cobros ocultos',
          'Soporte 24/7 en español',
          'Resultados desde el día 1'
        ].map((benefit, index) => (
          <motion.div
            key={benefit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-neon/20 flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-neon" />
            </div>
            <span className="text-gray-200 font-medium">{benefit}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Urgência */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="esconder text-center space-y-1"
      >
        <p className="text-yellow-400 font-bold text-sm">⚠️ CUPOS LIMITADOS</p>
        <p className="text-gray-400 text-xs">Solo quedan 7 cupos disponibles hoy</p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        className="esconder flex items-center justify-center gap-4 text-xs text-gray-500"
      >
        <span>🔒 Pago Seguro</span>
        <span>•</span>
        <span>✓ 100% Confiable</span>
        <span>•</span>
        <span>⚡ Acceso Inmediato</span>
      </motion.div>
    </motion.div>
  )
}



