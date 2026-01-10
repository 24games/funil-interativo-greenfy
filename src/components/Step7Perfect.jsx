import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { handlePerfectRedirect } from '../utils/perfectCheckout.js'

export default function Step7Perfect() {
  // ============================================================================
  // CONFIGURAÇÃO DO PROGRESS BAR BUTTON (PERFORMANCE MÁXIMA COM useRef)
  // ============================================================================
  const TARGET_TIME = 128 // Tempo alvo em segundos (2:08)
  const TARGET_VIDEO_ID = '6949e54790b70171e37b272b' // ID do vídeo
  
  // REFS para manipulação direta do DOM (evita re-renders)
  const progressBarRef = useRef(null) // Referência para a barra verde
  const buttonRef = useRef(null) // Referência para o botão
  const isUnlockedRef = useRef(false) // Controle de desbloqueio (sem re-render)
  const textRef = useRef(null) // Referência para o texto do botão
  
  // Estado ÚNICO para controlar o clique (só muda UMA VEZ)
  const [isButtonReady, setIsButtonReady] = useState(false)

  // ============================================================================
  // HANDLER DO BOTÃO CTA - REDIRECIONAMENTO DINÂMICO PARA PERFECT PAY
  // ============================================================================
  const handleCTA = async () => {
    if (!isButtonReady) return // Não faz nada se não estiver pronto
    
    // Usa função de checkout dinâmico que monta URL com tracking_id e UTMs
    await handlePerfectRedirect()
  }

  // ============================================================================
  // ADAPTAÇÃO EXATA DO SCRIPT ORIGINAL PARA STEP 7
  // ============================================================================
  useEffect(() => {
    const SECONDS_TO_DISPLAY = TARGET_TIME // 128 segundos
    
    // Carrega o script do vídeo Vturb
    const videoId = 'vid_6949e54790b70171e37b272b'
    const playerId = '6949e54790b70171e37b272b'
    
    // Verifica se o script já foi carregado
    const existingScript = document.querySelector(`script[id="scr_${playerId}"]`)
    
    if (!existingScript) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.id = `scr_${playerId}`
      script.textContent = `
        var s=document.createElement("script");
        s.src="https://scripts.converteai.net/af053167-2542-4323-9c93-d010e7938eb5/players/${playerId}/player.js";
        s.async=true;
        document.head.appendChild(s);
      `
      document.head.appendChild(script)
    }
    let attempts = 0
    let isConnected = false

    // Função que mostra elementos .esconder E libera o botão
    const showHiddenElements = () => {
      console.log('✅ [Step7Perfect] Mostrando elementos e liberando botão!')
      
      // Mostra elementos com classe .esconder
      const elsHidden = document.querySelectorAll('.esconder')
      elsHidden.forEach((e) => {
        e.style.display = 'block'
      })
      
      // Libera o botão
      isUnlockedRef.current = true
      setIsButtonReady(true)
      
      // Força barra para 100%
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '100%'
      }
    }

    // Função que busca o player pelo ID específico
    const findPlayerById = () => {
      if (!window.smartplayer || !window.smartplayer.instances) {
        return null
      }

      // Busca pelo ID específico (não usa instances[0] genérico!)
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

    // Função que monitora o progresso do vídeo (CÓPIA EXATA DO SCRIPT)
    const startWatchVideoProgress = () => {
      const player = findPlayerById()
      
      if (!player) {
        if (attempts >= 10) {
          console.error('❌ [Step7Perfect] Timeout: Player não encontrado após 10 tentativas')
          return
        }
        attempts++
        return setTimeout(startWatchVideoProgress, 1000)
      }

      // ENCONTROU O PLAYER!
      console.log(`🎯 [Step7Perfect] Player encontrado: ${TARGET_VIDEO_ID}`)
      isConnected = true

      // Listener de timeupdate (LÓGICA EXATA DO SCRIPT ORIGINAL)
      player.on('timeupdate', () => {
        // Se já mostrou, ignora
        if (isUnlockedRef.current) return
        
        // Se for autoplay, ignora (lógica do script original)
        if (player.smartAutoPlay) return
        
        // AQUI ESTÁ A DIFERENÇA: Usa player.video.currentTime (como no script original)
        const currentTime = player.video?.currentTime || 0
        
        // Atualiza a barra de progresso em tempo real
        if (progressBarRef.current) {
          let width = 0
          if (currentTime > 0) {
            if (currentTime <= 20) {
              // Primeiros 20 segundos: preenche de 0% a 80%
              width = (currentTime / 20) * 80
            } else {
              // Depois de 20 segundos: baby steps de 80% até 100%
              const remainingTime = currentTime - 20
              const remainingSeconds = SECONDS_TO_DISPLAY - 20
              const progressFrom80 = (remainingTime / remainingSeconds) * 20
              width = 80 + progressFrom80
            }
            width = Math.min(width, 100)
          }
          progressBarRef.current.style.width = `${width}%`
        }
        
        // LÓGICA EXATA DO SCRIPT: Se currentTime < SECONDS_TO_DISPLAY, retorna
        if (currentTime < SECONDS_TO_DISPLAY) return
        
        // Se chegou aqui, atingiu 128s! Mostra elementos e libera botão
        showHiddenElements()
      })

      console.log('✅ [Step7Perfect] Listeners configurados!')
    }

    // Sempre inicia o monitoramento do vídeo (sem verificação de cookies)
    startWatchVideoProgress()

    // Cleanup
    return () => {
      // Cleanup se necessário
    }
  }, [])

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
        <div 
          className="w-full mx-auto"
          style={{ 
            maxWidth: '280px',
            width: '100%'
          }}
        >
          <div 
            id="vid_6949e54790b70171e37b272b" 
            style={{ 
              position: 'relative',
              width: '100%',
              padding: '177.77777777777777% 0 0',
              borderRadius: 'calc(1.5rem - 0.5px)',
              overflow: 'hidden'
            }}
          >
            <img 
              id="thumb_6949e54790b70171e37b272b" 
              src="https://images.converteai.net/af053167-2542-4323-9c93-d010e7938eb5/players/6949e54790b70171e37b272b/thumbnail.jpg" 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }} 
              alt="thumbnail" 
            />
            <div 
              id="backdrop_6949e54790b70171e37b272b" 
              style={{ 
                WebkitBackdropFilter: 'blur(5px)',
                backdropFilter: 'blur(5px)',
                position: 'absolute',
                top: 0,
                height: '100%',
                width: '100%'
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ================================================================
           PROGRESS BAR BUTTON
           ================================================================
           Botão que funciona como barra de progresso:
           - Visível desde o início, mas não clicável (disabled)
           - Barra verde preenche conforme o vídeo avança
           - Aos 178s: barra completa (100%), botão clicável, texto muda
           ================================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          marginTop: '8px',
          maxWidth: '280px',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        <motion.button
          ref={buttonRef}
          onClick={handleCTA}
          disabled={!isButtonReady}
          // ANIMAÇÃO PULSE quando estiver pronto
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
            // Container do botão - SEM classe .esconder, controlado apenas por React
            display: 'block', // Força visibilidade (sobrescreve scripts externos)
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
            opacity: 1, // Força opacidade total
            visibility: 'visible', // Força visibilidade
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
              backgroundColor: '#374151', // Cinza escuro
              zIndex: 0
            }}
          />
          
          {/* Layer 2: Barra de progresso VERDE (controlada via REF para performance) */}
          <div
            ref={progressBarRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '0%', // COMEÇA EM 0% - Manipulado via ref.current.style.width
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)', // Verde da marca
              // Transição rápida para acompanhar atualizações dinâmicas do vídeo (sincronizado com 128s)
              transition: 'width 0.1s linear',
              zIndex: 1
            }}
          />
          
          {/* Layer 3: Efeito de brilho quando está pronto (opcional) */}
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
          
          {/* Layer 4: TEXTO do botão (controlado via REF para performance) */}
          <span 
            ref={textRef}
            style={{ 
              position: 'relative',
              zIndex: 10,
              color: isButtonReady ? '#050505' : '#ffffff', // Preto quando pronto, branco quando carregando
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'color 0.3s ease'
            }}
          >
            {!isButtonReady ? (
              // ESTADO DE LOADING (0-99%)
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
              // ESTADO PRONTO (100%) - Texto atualizado via JS
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
        <p className="text-yellow-400 font-bold text-sm">⚠️ ⚠️ CUPOS LIMITADOS</p>
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
