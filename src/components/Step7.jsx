import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'
import { sendInitiateCheckout } from '../utils/tracking.js'

export default function Step7() {
  // Configuração: botão aparece quando o vídeo chega em 126 segundos (2:06)
  // O Vturb.displayHiddenElements cuida de mostrar o botão e elementos respeitando pausa do vídeo
  const delaySeconds = 126 // Tempo em segundos (2 minutos e 6 segundos)
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

  // Sincroniza o progresso do botão com o tempo do vídeo Vturb
  useEffect(() => {
    let intervalId = null

    const updateProgress = () => {
      if (isReady) return // Já está pronto, para de atualizar
      
      // Busca o vídeo de forma agressiva
      const videoId = 'vid_693b9342f679d6950ed12c36'
      const videoDiv = document.getElementById(videoId)
      
      if (!videoDiv) return
      
      // Procura o elemento video
      const video = videoDiv.querySelector('video')
      
      if (video && video.currentTime !== undefined) {
        const currentTime = video.currentTime
        
        // Calcula progresso baseado no tempo atual do vídeo
        // Progresso vai de 0 a 100% conforme o vídeo vai de 0 a delaySeconds
        const progress = (currentTime / delaySeconds) * 100
        const newProgress = Math.min(Math.max(progress, 0), 100)
        
        console.log(`⏱️ Tempo vídeo: ${currentTime.toFixed(1)}s / ${delaySeconds}s | Barra: ${newProgress.toFixed(1)}%`)
        
        setLoadingProgress(newProgress)
        
        // Se chegou no tempo target, força 100%
        if (currentTime >= delaySeconds) {
          console.log('✅ Chegou aos 126 segundos!')
          setLoadingProgress(100)
        }
      }
    }

    // Atualiza a cada 200ms (5x por segundo)
    intervalId = setInterval(updateProgress, 200)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [delaySeconds, isReady])

  // Monitora quando deve habilitar o botão
  // Habilita quando: progresso >= 100% (vídeo chegou em 126s)
  useEffect(() => {
    if (isReady) return // Já está pronto
    
    const checkButtonReady = () => {
      // Verifica se o vídeo chegou no tempo necessário
      const videoId = 'vid_693b9342f679d6950ed12c36'
      const videoDiv = document.getElementById(videoId)
      
      if (videoDiv) {
        const video = videoDiv.querySelector('video')
        
        if (video && video.currentTime !== undefined) {
          const currentTime = video.currentTime
          
          // Habilita quando o vídeo chega em 126 segundos (ou quando progresso >= 99%)
          if (currentTime >= delaySeconds || loadingProgress >= 99) {
            console.log('🎉 BOTÃO HABILITADO! Tempo do vídeo:', currentTime.toFixed(1), 'segundos')
            setIsReady(true)
            setLoadingProgress(100) // Garante 100%
          }
        }
      }
    }

    // Verifica a cada 200ms
    const interval = setInterval(checkButtonReady, 200)

    return () => clearInterval(interval)
  }, [loadingProgress, isReady, delaySeconds])

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
          videoId="vid_693b9342f679d6950ed12c36"
          playerId="693b9342f679d6950ed12c36"
          delaySeconds={delaySeconds}
        />
      </motion.div>

      {/* Botão único - Visível desde o início, barra preenche sincronizada com vídeo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-2"
        style={{
          maxWidth: '280px',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <button
          ref={buttonRef}
          onClick={handleCTA}
          disabled={!isReady}
          className="w-full text-sm sm:text-base md:text-lg py-4 sm:py-5 md:py-6 rounded-xl font-bold uppercase"
          style={{
            position: 'relative',
            overflow: 'hidden',
            border: isReady ? 'none' : '2px solid #4B5563',
            cursor: isReady ? 'pointer' : 'not-allowed',
            paddingLeft: '12px',
            paddingRight: '12px',
            background: 'transparent',
            boxShadow: isReady 
              ? '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4), 0 0 120px rgba(0, 255, 136, 0.2)'
              : '0 0 20px rgba(0, 255, 136, 0.3)'
          }}
        >
          {/* Fundo cinza (quando não está pronto) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: isReady ? 'transparent' : '#374151',
              zIndex: 0
            }}
          />
          
          {/* Barra de progresso verde que preenche */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${loadingProgress}%`,
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)',
              transition: 'width 0.2s linear',
              zIndex: 1
            }}
          />
          
          {/* Efeito de brilho quando está pronto */}
          {isReady && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                zIndex: 2
              }}
            />
          )}
          
          {/* Texto do botão */}
          <span 
            style={{ 
              position: 'relative',
              zIndex: 10,
              color: isReady ? '#050505' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 'bold'
            }}
          >
            {!isReady ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ display: 'inline-block' }}
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



