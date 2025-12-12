import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'
import { sendInitiateCheckout } from '../utils/tracking.js'

export default function Step7() {
  // ============================================================================
  // CONFIGURAÇÃO DO PROGRESS BAR BUTTON
  // ============================================================================
  const TARGET_TIME = 126 // Tempo alvo em segundos (2:06)
  
  // Estados
  const [currentTime, setCurrentTime] = useState(0) // Tempo atual do vídeo
  const [hasStarted, setHasStarted] = useState(false) // Se o vídeo já começou a rodar
  const [progressPercent, setProgressPercent] = useState(0) // COMEÇA EM 0%
  const [isButtonReady, setIsButtonReady] = useState(false) // Controla se o botão está clicável
  const buttonRef = useRef(null)

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
  // INTEGRAÇÃO COM VTURB SMARTPLAYER API (BUSCA ESPECÍFICA PELO ID)
  // ============================================================================
  useEffect(() => {
    // ID ESPECÍFICO DO VÍDEO DO STEP 7 (extraído do embed)
    const TARGET_VIDEO_ID = '693b9342f679d6950ed12c36'
    
    let pollingInterval = null
    let isConnected = false

    console.log(`🔍 Iniciando busca pelo vídeo ID: ${TARGET_VIDEO_ID}`)

    // Função que processa o tempo do vídeo
    const handleTimeUpdate = (time) => {
      // Atualiza o estado do tempo para forçar re-render
      setCurrentTime(time)
      
      if (time > 0 && time < TARGET_TIME) {
        // Trava visual em 80% mínimo assim que der play
        // Os 20% restantes preenchem ao longo dos 126s
        // Fórmula: 80 + ((currentTime / 126) * 20)
        const calc = 80 + ((time / TARGET_TIME) * 20)
        setProgressPercent(Math.min(calc, 100))
        setHasStarted(true)
        
        console.log(`📊 Tempo: ${time.toFixed(2)}s | Barra: ${calc.toFixed(1)}%`)
      } 
      else if (time >= TARGET_TIME) {
        setProgressPercent(100)
        setHasStarted(true)
        
        if (!isButtonReady) {
          console.log('🎉 TEMPO ALVO ATINGIDO (126s)! Habilitando botão...')
          setIsButtonReady(true)
        }
      }
    }

    // Função de busca específica pelo ID do vídeo
    const findTargetPlayer = () => {
      if (isConnected) return // Já conectado, não precisa mais

      // Verifica se smartplayer existe
      if (!window.smartplayer || !window.smartplayer.instances) {
        console.log('⏳ Aguardando smartplayer...')
        return
      }

      console.log(`🔎 Procurando vídeo ${TARGET_VIDEO_ID} em ${window.smartplayer.instances.length} instâncias...`)

      // BUSCA PROFUNDA PELO ID ESPECÍFICO
      const player = window.smartplayer.instances.find(inst => {
        // Verifica em várias propriedades onde o ID pode estar
        const id1 = inst.id || ''
        const id2 = inst.options?.id || ''
        const id3 = inst.video?.id || ''
        const id4 = inst.videoId || ''
        
        return id1 === TARGET_VIDEO_ID ||
               id1 === `vid_${TARGET_VIDEO_ID}` ||
               id1.includes(TARGET_VIDEO_ID) ||
               id2 === TARGET_VIDEO_ID ||
               id2.includes(TARGET_VIDEO_ID) ||
               id3 === TARGET_VIDEO_ID ||
               id3.includes(TARGET_VIDEO_ID) ||
               id4 === TARGET_VIDEO_ID ||
               id4.includes(TARGET_VIDEO_ID)
      })

      if (!player) {
        console.log(`⏳ Vídeo ${TARGET_VIDEO_ID} ainda não encontrado...`)
        return
      }

      // SUCESSO! Encontrou o player correto
      console.log(`🎯 VÍDEO ALVO ENCONTRADO: ${TARGET_VIDEO_ID}`)
      isConnected = true

      // Para o polling
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        console.log('🛑 Polling finalizado.')
      }

      // Adiciona listener de timeupdate
      try {
        player.on('timeupdate', (data) => {
          const time = data.currentTime || data.time || 0
          handleTimeUpdate(time)
        })

        player.on('play', () => {
          console.log('▶️ Play detectado!')
          setHasStarted(true)
          // Força 80% no play
          if (progressPercent < 80) {
            setProgressPercent(80)
          }
        })

        console.log('✅ Listeners adicionados com sucesso!')
      } catch (err) {
        console.error('❌ Erro ao adicionar listeners:', err)
      }
    }

    // POLLING: Verifica a cada 500ms até encontrar o player correto
    pollingInterval = setInterval(findTargetPlayer, 500)
    
    // Também tenta imediatamente
    findTargetPlayer()

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
          
          {/* Layer 2: Barra de progresso VERDE (preenche da esquerda para direita) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)', // Verde da marca
              // Transição de 0.5s para animação suave (0% → 80% desliza bonito)
              transition: 'width 0.5s ease-out',
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
          
          {/* Layer 4: TEXTO do botão (sempre visível por cima) */}
          <span 
            style={{ 
              position: 'relative',
              zIndex: 10,
              color: isButtonReady ? '#050505' : '#ffffff', // Preto quando pronto, branco quando carregando
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
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
              // ESTADO PRONTO (100%)
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



