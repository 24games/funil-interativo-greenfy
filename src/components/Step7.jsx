import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'
import { sendInitiateCheckout } from '../utils/tracking.js'

// ============================================================================
// STORAGE HANDLER - Persistência via localStorage
// ============================================================================
const StorageHandler = {
  STORAGE_KEY: 'alreadyElsDisplayed126',
  
  // Verifica se já assistiu até 126s
  hasWatched() {
    try {
      const value = localStorage.getItem(this.STORAGE_KEY)
      return value === 'true'
    } catch {
      return false
    }
  },
  
  // Salva que já assistiu
  markAsWatched() {
    try {
      localStorage.setItem(this.STORAGE_KEY, 'true')
      console.log('💾 [Storage] Cookie salvo: alreadyElsDisplayed126 = true')
    } catch (e) {
      console.error('❌ [Storage] Erro ao salvar:', e)
    }
  }
}

export default function Step7() {
  // ============================================================================
  // CONFIGURAÇÃO DO PROGRESS BAR BUTTON (PERFORMANCE MÁXIMA COM useRef)
  // ============================================================================
  const TARGET_TIME = 126 // Tempo alvo em segundos (2:06)
  const TARGET_VIDEO_ID = '693b9342f679d6950ed12c36' // ID do vídeo
  
  // REFS para manipulação direta do DOM (evita re-renders)
  const progressBarRef = useRef(null) // Referência para a barra verde
  const buttonRef = useRef(null) // Referência para o botão
  const isUnlockedRef = useRef(false) // Controle de desbloqueio (sem re-render)
  const textRef = useRef(null) // Referência para o texto do botão
  
  // Estado ÚNICO para controlar o clique (só muda UMA VEZ)
  const [isButtonReady, setIsButtonReady] = useState(false)

  // ============================================================================
  // FUNÇÃO DE DESBLOQUEIO DO BOTÃO
  // ============================================================================
  const unlockButton = () => {
    // Já desbloqueado? Ignora
    if (isUnlockedRef.current) return
    
    console.log('🔓 [Step7] DESBLOQUEANDO BOTÃO!')
    isUnlockedRef.current = true
    
    // Salva no localStorage (cookie)
    StorageHandler.markAsWatched()
    
    // Força barra para 100%
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '100%'
    }
    
    // Atualiza estado do React (muda texto e habilita clique)
    setIsButtonReady(true)
  }

  // ============================================================================
  // HANDLER DO BOTÃO CTA
  // ============================================================================
  const handleCTA = async () => {
    if (!isButtonReady) return // Não faz nada se não estiver pronto
    
    try {
      // Envia evento InitiateCheckout para Meta Conversions API
      await sendInitiateCheckout()
      console.log('✅ InitiateCheckout enviado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao enviar InitiateCheckout:', error)
    }
    
    // Redireciona para checkout
    window.location.href = 'https://go.centerpag.com/PPU38CQ4BNQ'
  }

  // ============================================================================
  // VERIFICAÇÃO DE COOKIE NA MONTAGEM
  // ============================================================================
  useEffect(() => {
    // Verifica se já assistiu (cookie)
    if (StorageHandler.hasWatched()) {
      console.log('🍪 [Step7] Cookie encontrado! Liberando botão instantaneamente...')
      isUnlockedRef.current = true
      setIsButtonReady(true)
      
      // Força barra para 100% após o render
      setTimeout(() => {
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '100%'
        }
      }, 100)
    }
  }, [])

  // ============================================================================
  // INTEGRAÇÃO COM VTURB - SINCRONIA PERFEITA COM O VÍDEO
  // ============================================================================
  useEffect(() => {
    let pollingInterval = null
    let isConnected = false

    console.log(`🔍 [Step7] Iniciando busca pelo vídeo ID: ${TARGET_VIDEO_ID}`)

    // Função de busca pelo player
    const findAndConnectPlayer = () => {
      // Já conectado? Sai
      if (isConnected) return
      
      // Já desbloqueado pelo cookie? Não precisa conectar
      if (isUnlockedRef.current) {
        if (pollingInterval) clearInterval(pollingInterval)
        return
      }

      // Verifica se smartplayer existe
      if (!window.smartplayer || !window.smartplayer.instances) {
        return
      }

      // Busca profunda pelo ID
      const player = window.smartplayer.instances.find(inst => {
        const id1 = String(inst.id || '')
        const id2 = String(inst.options?.id || '')
        const id3 = String(inst.video?.id || '')
        const id4 = String(inst.videoId || '')
        
        return id1.includes(TARGET_VIDEO_ID) ||
               id2.includes(TARGET_VIDEO_ID) ||
               id3.includes(TARGET_VIDEO_ID) ||
               id4.includes(TARGET_VIDEO_ID)
      })

      if (!player) return

      // ENCONTROU!
      console.log(`🎯 [Step7] PLAYER ENCONTRADO: ${TARGET_VIDEO_ID}`)
      isConnected = true

      // Para o polling de busca
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        console.log(`🛑 [Step7] Polling finalizado.`)
      }

      // ================================================================
      // LISTENER DE TIMEUPDATE - SINCRONIA PERFEITA (PAUSA = PARA)
      // ================================================================
      player.on('timeupdate', function(data) {
        // Se já desbloqueado pelo cookie, ignora
        if (isUnlockedRef.current) return
        
        const time = data.currentTime || data.time || 0

        // --- CÁLCULO DA PORCENTAGEM (Regra: 80% + Baby Steps) ---
        // Isso garante que a barra só ande se o 'time' aumentar.
        // Se pausar, 'time' não muda, logo 'width' não muda.
        let width = 0
        
        if (time > 0) {
          // Mapeia 0-126s para o range visual de 80%-100%
          // Math.min trava em 100%
          const visualProgress = 80 + ((time / TARGET_TIME) * 20)
          width = Math.min(visualProgress, 100)
        }

        // --- ATUALIZAÇÃO DIRETA (Zero Lag) ---
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${width}%`
        }
        
        // Log a cada 10 segundos para não poluir
        if (Math.floor(time) % 10 === 0 && time > 0) {
          console.log(`📊 [Step7] Tempo: ${time.toFixed(1)}s | Barra: ${width.toFixed(1)}%`)
        }

        // --- DESBLOQUEIO aos 126s ---
        if (time >= TARGET_TIME) {
          unlockButton()
        }
      })

      // Listener de play - Força 80% imediatamente
      player.on('play', function() {
        if (isUnlockedRef.current) return
        console.log(`▶️ [Step7] Play detectado! Forçando 80%...`)
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '80%'
        }
      })

      console.log(`✅ [Step7] Listeners configurados com sucesso!`)
    }

    // POLLING: Verifica a cada 500ms
    pollingInterval = setInterval(findAndConnectPlayer, 500)
    
    // Tenta imediatamente também
    findAndConnectPlayer()

    // Cleanup quando o componente desmontar
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, []) // Array vazio = roda apenas uma vez na montagem

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
          delaySeconds={TARGET_TIME}
        />
      </motion.div>

      {/* ================================================================
           PROGRESS BAR BUTTON
           ================================================================
           Botão que funciona como barra de progresso:
           - Visível desde o início, mas não clicável (disabled)
           - Barra verde preenche conforme o vídeo avança
           - Aos 126s: barra completa (100%), botão clicável, texto muda
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
              // Transição 0.1s linear - Rápida para acompanhar, para instantâneo ao pausar
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



