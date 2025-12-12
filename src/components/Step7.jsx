import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'
import { sendInitiateCheckout } from '../utils/tracking.js'

export default function Step7() {
  // Configuração: botão aparece quando o vídeo chega em 134 segundos (2:14)
  // O Vturb.displayHiddenElements cuida de mostrar o botão e elementos respeitando pausa do vídeo
  const delaySeconds = 134 // Tempo em segundos (2 minutos e 14 segundos)
  const buttonRef = useRef(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const handleCTA = async () => {
    if (!isReady) return
    
    try {
      // Envia evento InitiateCheckout para Meta Conversions API
      await sendInitiateCheckout();
      console.log('✅ InitiateCheckout enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar InitiateCheckout:', error);
      // Continua mesmo se houver erro no tracking
    }
    
    // Redireciona para checkout Centerpag
    window.location.href = 'https://go.centerpag.com/PPU38CQ4BNQ'
  }

  // Função para calcular progresso inteligente (maior parte rápido, depois baby steps)
  const calculateSmartProgress = (videoTime, targetTime) => {
    if (videoTime >= targetTime) return 100
    
    const ratio = videoTime / targetTime
    
    // Até 85%: carrega rápido (85% do tempo = 85% do progresso)
    if (ratio <= 0.85) {
      return (ratio / 0.85) * 85
    }
    
    // De 85% a 100%: baby steps (15% do tempo = 15% do progresso)
    const remainingRatio = (ratio - 0.85) / 0.15
    return 85 + (remainingRatio * 15)
  }

  // Sincroniza o progresso do botão com o tempo do vídeo Vturb
  useEffect(() => {
    let animationFrame = null
    let lastVideoTime = 0

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
      
      if (video) {
        try {
          // Usa o currentTime do vídeo (já sincroniza com pausas automaticamente)
          const currentTime = video.currentTime || 0
          
          // Só atualiza se o tempo mudou (evita updates desnecessários)
          if (Math.abs(currentTime - lastVideoTime) > 0.1) {
            lastVideoTime = currentTime
            
            // Calcula progresso inteligente
            const progress = calculateSmartProgress(currentTime, delaySeconds)
            setLoadingProgress(Math.min(progress, 100))
            
            // Quando chega a 100%, habilita o botão
            if (progress >= 100 && !isReady) {
              // Verifica se o Vturb já removeu a classe .esconder
              if (buttonRef.current && !buttonRef.current.classList.contains('esconder')) {
                setIsReady(true)
              } else {
                // Aguarda um pouco e tenta novamente
                setTimeout(() => {
                  if (buttonRef.current && !buttonRef.current.classList.contains('esconder')) {
                    setIsReady(true)
                  }
                }, 100)
              }
            }
          }
        } catch (e) {
          // Se não conseguir acessar o vídeo, continua tentando
        }
      }
      
      // Continua animando
      animationFrame = requestAnimationFrame(updateProgress)
    }

    // Aguarda um pouco para o vídeo carregar e começa a verificar
    const startDelay = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateProgress)
    }, 1000)

    return () => {
      clearTimeout(startDelay)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [delaySeconds, isReady])

  // Monitora quando o Vturb remove a classe .esconder (quando vídeo chega no tempo)
  // E habilita o botão quando ambas condições são atendidas: progresso 100% + classe removida
  useEffect(() => {
    const checkButtonReady = () => {
      const isVisible = buttonRef.current && !buttonRef.current.classList.contains('esconder')
      const progressComplete = loadingProgress >= 100
      
      // Só habilita quando ambas condições são atendidas
      if (isVisible && progressComplete && !isReady) {
        setIsReady(true)
      }
    }

    // Verifica periodicamente
    const interval = setInterval(checkButtonReady, 100)

    return () => clearInterval(interval)
  }, [loadingProgress, isReady])

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

      {/* Botão único - Começa desabilitado e fica clicável quando chega a 100% */}
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
        <motion.button
          ref={buttonRef}
          onClick={handleCTA}
          disabled={!isReady}
          className={`esconder w-full text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 relative overflow-hidden rounded-xl font-bold ${
            isReady 
              ? 'neon-button animate-heartbeat cursor-pointer' 
              : 'bg-gray-700 border-2 border-gray-600 cursor-not-allowed'
          }`}
          style={{ 
            boxShadow: isReady 
              ? '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4), 0 0 120px rgba(0, 255, 136, 0.2)'
              : '0 0 20px rgba(0, 255, 136, 0.3)',
            paddingLeft: '12px',
            paddingRight: '12px'
          }}
          whileHover={isReady ? { scale: 1.05 } : {}}
          whileTap={isReady ? { scale: 0.95 } : {}}
        >
          {/* Barra de progresso animada (da esquerda para direita) - Só aparece quando não está pronto */}
          {!isReady && (
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon to-[#00FFD4]"
              animate={{
                width: `${loadingProgress}%`
              }}
              transition={{
                duration: 0.1,
                ease: 'linear'
              }}
            />
          )}
          
          {/* Efeito de brilho quando está pronto */}
          {isReady && (
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
          )}
          
          {/* Texto do botão */}
          <span className="relative z-10 flex items-center justify-center gap-2">
            {!isReady ? (
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
        </motion.button>
      </motion.div>

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



