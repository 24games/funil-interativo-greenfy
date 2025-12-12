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
  // INTEGRAÇÃO COM VTURB SMARTPLAYER API (COM POLLING ROBUSTO)
  // ============================================================================
  useEffect(() => {
    let pollingInterval = null
    let isConnected = false

    console.log('🔍 Iniciando busca pelo VTurb SmartPlayer...')

    // Função que tenta encontrar e conectar ao VTurb
    const tryConnectVturb = () => {
      // Verifica se já está conectado
      if (isConnected) return

      // Verifica se window.smartplayer existe
      if (!window.smartplayer) {
        console.log('⏳ Aguardando window.smartplayer...')
        return
      }

      // Verifica se instances existe e tem pelo menos um player
      if (!window.smartplayer.instances || window.smartplayer.instances.length === 0) {
        console.log('⏳ Aguardando smartplayer.instances...')
        return
      }

      // Pega a primeira instância do player
      const player = window.smartplayer.instances[0]
      
      if (!player) {
        console.log('⏳ Aguardando instância do player...')
        return
      }

      // SUCESSO! Encontrou o player
      console.log('✅ VTurb SmartPlayer ENCONTRADO E CONECTADO!')
      isConnected = true

      // Limpa o polling - não precisa mais verificar
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
        console.log('🛑 Polling finalizado.')
      }

      // Adiciona o listener de timeupdate
      player.on('timeupdate', (data) => {
        const time = data.currentTime || 0
        
        // ================================================================
        // LÓGICA VISUAL (MATEMÁTICA EXATA)
        // ================================================================
        
        if (time === 0) {
          // ESTADO 0: Vídeo parado/não iniciado → 0%
          setProgressPercent(0)
          setHasStarted(false)
        } 
        else if (time > 0 && time < TARGET_TIME) {
          // ESTADO 1 & 2: Vídeo rodando → 80% + baby steps
          // Fórmula: 80 + (currentTime / 126) * 20
          const progress = 80 + ((time / TARGET_TIME) * 20)
          setProgressPercent(Math.min(progress, 100))
          setHasStarted(true)
          
          console.log(`📊 VTurb: ${time.toFixed(1)}s / ${TARGET_TIME}s | Barra: ${progress.toFixed(1)}%`)
        }
        else if (time >= TARGET_TIME) {
          // ESTADO 3: Chegou aos 126s → 100% + botão ativo
          setProgressPercent(100)
          setHasStarted(true)
          
          if (!isButtonReady) {
            console.log('🎉 TEMPO ALVO ATINGIDO (126s)! Habilitando botão...')
            setIsButtonReady(true)
          }
        }
        
        // Atualiza o estado do tempo
        setCurrentTime(time)
      })
    }

    // POLLING: Verifica a cada 500ms até encontrar o player
    pollingInterval = setInterval(tryConnectVturb, 500)
    
    // Também tenta imediatamente (caso já esteja carregado)
    tryConnectVturb()

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
            // Container do botão
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



