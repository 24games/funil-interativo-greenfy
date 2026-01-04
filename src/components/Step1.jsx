import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import VturbVideo from './VturbVideo'

export default function Step1({ onNext }) {
  // ============================================================================
  // CONFIGURACAO DO PROGRESS BAR BUTTON (PERFORMANCE MAXIMA COM useRef)
  // ============================================================================
  const TARGET_TIME = 21 // Tempo alvo em segundos (0:21) - VSL 1
  const TARGET_VIDEO_ID = '694aa2b190b70171e37bcfaa' // ID do video VSL 1
  
  // REFS para manipulacao direta do DOM (evita re-renders)
  const progressBarRef = useRef(null) // Referencia para a barra verde
  const buttonRef = useRef(null) // Referencia para o botao
  const isUnlockedRef = useRef(false) // Controle de desbloqueio (sem re-render)
  const textRef = useRef(null) // Referencia para o texto do botao
  
  // Estado UNICO para controlar o clique (so muda UMA VEZ)
  const [isButtonReady, setIsButtonReady] = useState(false)

  // Key unica que muda a cada remontagem para forcar recriacao completa do video
  const [videoKey, setVideoKey] = useState(0)
  
  // Quando o componente e montado, incrementa a key para forcar recriacao
  useEffect(() => {
    setVideoKey(prev => prev + 1)
  }, [])

  // ============================================================================
  // HANDLER DO BOTAO CTA
  // ============================================================================
  const handleCTA = () => {
    if (!isButtonReady) return // Nao faz nada se nao estiver pronto
    onNext() // Avanca para o proximo step
  }

  // ============================================================================
  // ADAPTACAO EXATA DO SCRIPT ORIGINAL PARA STEP 1 (VSL 1)
  // ============================================================================
  useEffect(() => {
    const SECONDS_TO_DISPLAY = TARGET_TIME // 21 segundos
    let attempts = 0
    let isConnected = false

    // Funcao que mostra elementos .esconder E libera o botao
    const showHiddenElements = () => {
      console.log('[Step1] Mostrando elementos e liberando botao!')
      
      // Mostra elementos com classe .esconder
      const elsHidden = document.querySelectorAll('.esconder')
      elsHidden.forEach((e) => {
        e.style.display = 'block'
      })
      
      // Libera o botao
      isUnlockedRef.current = true
      setIsButtonReady(true)
      
      // Forca barra para 100%
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '100%'
      }
    }

    // Funcao que busca o player pelo ID especifico
    const findPlayerById = () => {
      if (!window.smartplayer || !window.smartplayer.instances) {
        return null
      }

      // Busca pelo ID especifico (nao usa instances[0] generico!)
      return window.smartplayer.instances.find(inst => {
        const id1 = String(inst.id || '')
        const id2 = String(inst.options?.id || '')
        const id3 = String(inst.video?.id || '')
        const id4 = String(inst.videoId || '')
        
        return id1.includes(TARGET_VIDEO_ID) ||
               id2.includes(TARGET_VIDEO_ID) ||
               id3.includes(TARGET_VIDEO_ID) ||
               id4.includes(TARGET_VIDEO_ID)
      })
    }

    // Funcao que monitora o progresso do video (COPIA EXATA DO SCRIPT)
    const startWatchVideoProgress = () => {
      const player = findPlayerById()
      
      if (!player) {
        if (attempts >= 10) {
          console.error('[Step1] Timeout: Player nao encontrado apos 10 tentativas')
          return
        }
        attempts++
        return setTimeout(startWatchVideoProgress, 1000)
      }

      // ENCONTROU O PLAYER!
      console.log('[Step1] Player encontrado: ' + TARGET_VIDEO_ID)
      isConnected = true

      // Listener de timeupdate (LOGICA EXATA DO SCRIPT ORIGINAL)
      player.on('timeupdate', () => {
        // Se ja mostrou, ignora
        if (isUnlockedRef.current) return
        
        // Se for autoplay, ignora (logica do script original)
        if (player.smartAutoPlay) return
        
        // AQUI ESTA A DIFERENCA: Usa player.video.currentTime (como no script original)
        const currentTime = player.video?.currentTime || 0
        
        // Atualiza a barra de progresso em tempo real
        if (progressBarRef.current) {
          let width = 0
          if (currentTime > 0) {
            if (currentTime <= 20) {
              // Primeiros 20 segundos: preenche de 0% a 80%
              width = (currentTime / 20) * 80
            } else {
              // Depois de 20 segundos: baby steps de 80% ate 100%
              const remainingTime = currentTime - 20
              const remainingSeconds = SECONDS_TO_DISPLAY - 20
              const progressFrom80 = (remainingTime / remainingSeconds) * 20
              width = 80 + progressFrom80
            }
            width = Math.min(width, 100)
          }
          progressBarRef.current.style.width = `${width}%`
        }
        
        // LOGICA EXATA DO SCRIPT: Se currentTime < SECONDS_TO_DISPLAY, retorna
        if (currentTime < SECONDS_TO_DISPLAY) return
        
        // Se chegou aqui, atingiu 21s! Mostra elementos e libera botao
        showHiddenElements()
      })

      console.log('[Step1] Listeners configurados!')
    }

    // Sempre inicia o monitoramento do video (sem verificacao de cookies)
    startWatchVideoProgress()

    // Cleanup
    return () => {
      // Cleanup se necessario
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col items-center gap-2"
      style={{ marginTop: '0' }}
    >
      {/* Video Vturb - Key unica forca remontagem completa */}
      <VturbVideo 
        key={`step1-video-${videoKey}`}
        videoId="vid_694aa2b190b70171e37bcfaa"
        playerId="694aa2b190b70171e37bcfaa"
        delaySeconds={TARGET_TIME}
      />

      {/* PROGRESS BAR BUTTON */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: '8px',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <motion.button
          ref={buttonRef}
          onClick={handleCTA}
          disabled={!isButtonReady}
          animate={isButtonReady ? {
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)',
              '0 0 60px rgba(0, 255, 136, 1), 0 0 100px rgba(0, 255, 136, 0.6)',
              '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
            ]
          } : {}}
          transition={isButtonReady ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}}
          style={{
            display: 'block',
            position: 'relative',
            width: '100%',
            padding: '20px 12px',
            borderRadius: '12px',
            border: isButtonReady ? 'none' : '2px solid #4B5563',
            cursor: isButtonReady ? 'pointer' : 'not-allowed',
            overflow: 'hidden',
            background: 'transparent',
            fontSize: '16px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            opacity: 1,
            visibility: 'visible',
            boxShadow: isButtonReady 
              ? '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
              : '0 0 20px rgba(0, 255, 136, 0.3)'
          }}
        >
          {/* Layer 1: Fundo cinza (base) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#374151',
              zIndex: 0
            }}
          />
          
          {/* Layer 2: Barra de progresso VERDE */}
          <div
            ref={progressBarRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '0%',
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)',
              transition: 'width 0.1s linear',
              zIndex: 1
            }}
          />
          
          {/* Layer 3: Efeito de brilho quando esta pronto */}
          {isButtonReady && (
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
          
          {/* Layer 4: TEXTO do botao */}
          <span 
            ref={textRef}
            style={{ 
              position: 'relative',
              zIndex: 10,
              color: isButtonReady ? '#050505' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'color 0.3s ease'
            }}
          >
            {!isButtonReady ? (
              <>
                <span
                  style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                Cargando...
              </>
            ) : (
              'CONTINUAR'
            )}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

