import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import VturbVideo from './VturbVideo'
import EmailModal from './EmailModal'
import { sendInitiateCheckout } from '../utils/tracking.js'
import { createFlowPayment } from '../utils/checkout.js'

export default function Step7() {
  // ============================================================================
  // CONFIGURAÃ‡ÃƒO DO PROGRESS BAR BUTTON (PERFORMANCE MÃXIMA COM useRef)
  // ============================================================================
  const TARGET_TIME = 126 // Tempo alvo em segundos (2:06)
  const TARGET_VIDEO_ID = '6949e54790b70171e37b272b' // ID do vídeo (mesmo do Step7Perfect)
  
  // REFS para manipulaÃ§Ã£o direta do DOM (evita re-renders)
  const progressBarRef = useRef(null) // ReferÃªncia para a barra verde
  const buttonRef = useRef(null) // ReferÃªncia para o botÃ£o
  const isUnlockedRef = useRef(false) // Controle de desbloqueio (sem re-render)
  const textRef = useRef(null) // ReferÃªncia para o texto do botÃ£o
  
  // Estado ÃšNICO para controlar o clique (sÃ³ muda UMA VEZ)
  const [isButtonReady, setIsButtonReady] = useState(false)
  // Estado de loading para checkout
  const [isProcessing, setIsProcessing] = useState(false)
  // Estado do modal de email
  const [showEmailModal, setShowEmailModal] = useState(false)
  // Estado de erro de email (do Flow/API)
  const [emailError, setEmailError] = useState('')

  // ============================================================================
  // FUNÇÕES AUXILIARES DE CHECKOUT
  // ============================================================================
  
  // Função para processar checkout (reutilizável)
  const processCheckout = async (email) => {
    setIsProcessing(true)
    setEmailError('') // Limpa erro anterior
    
    try {
      // Envia evento InitiateCheckout para Meta Conversions API
      await sendInitiateCheckout()
      console.log('✅ InitiateCheckout enviado com sucesso')
      
      // Cria pagamento no Flow.cl e redireciona
      await createFlowPayment({ email, amount: 10000 })
      // Se chegou aqui, o redirecionamento foi feito (window.location.href)
      // Não precisa resetar isProcessing pois a página será redirecionada
    } catch (error) {
      console.error('❌ Erro no checkout:', error)
      
      // Verifica se é erro de email inválido (1620 do Flow)
      if (error.message === 'INVALID_EMAIL' || error.message?.includes('1620')) {
        // NÃO fecha o modal, mostra erro e permite correção
        setEmailError('¡El correo está mal escrito! Por favor, revisa que sea válido.')
        setIsProcessing(false) // Para o loading para o botão voltar a ficar clicável
        // Garante que o modal permanece aberto
        setShowEmailModal(true)
        return
      }
      
      // Para outros erros, mostra alert padrão e fecha o modal
      alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`)
      setIsProcessing(false) // Reseta apenas em caso de erro
      setShowEmailModal(false) // Fecha o modal para outros erros
    }
  }

  // Handler do modal (quando usuário confirma email)
  const handleEmailConfirm = async (email) => {
    // Limpa erro quando usuário tenta novamente
    setEmailError('')
    // Chama processCheckout - o erro será tratado dentro dele
    await processCheckout(email)
  }

  // ============================================================================
  // HANDLER DO BOTÃƒO CTA
  // ============================================================================
  const handleCTA = async () => {
    if (!isButtonReady || isProcessing) return // NÃ£o faz nada se nÃ£o estiver pronto ou jÃ¡ estiver processando
    
    // Verifica se já tem email salvo
    const savedEmail = localStorage.getItem('user_email')
    
    if (!savedEmail) {
      // Cenário B: Não tem email - abre modal
      setShowEmailModal(true)
      return
    }
    
    // Cenário A: Já tem email - fluxo rápido
    await processCheckout(savedEmail)
      console.error('âŒ Erro no checkout:', error)
  }

  // ============================================================================
  // ADAPTAÃ‡ÃƒO EXATA DO SCRIPT ORIGINAL PARA STEP 7
  // ============================================================================
  useEffect(() => {
    const SECONDS_TO_DISPLAY = TARGET_TIME // 126 segundos
    let attempts = 0
    let isConnected = false

    // FunÃ§Ã£o que mostra elementos .esconder E libera o botÃ£o
    const showHiddenElements = () => {
      console.log('âœ… [Step7] Mostrando elementos e liberando botÃ£o!')
      
      // Mostra elementos com classe .esconder
      const elsHidden = document.querySelectorAll('.esconder')
      elsHidden.forEach((e) => {
        e.style.display = 'block'
      })
      
      // Libera o botÃ£o
      isUnlockedRef.current = true
      setIsButtonReady(true)
      
      // ForÃ§a barra para 100%
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '100%'
      }
    }

    // FunÃ§Ã£o que busca o player pelo ID especÃ­fico
    const findPlayerById = () => {
      if (!window.smartplayer || !window.smartplayer.instances) {
        return null
      }

      // Busca pelo ID especÃ­fico (nÃ£o usa instances[0] genÃ©rico!)
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

    // FunÃ§Ã£o que monitora o progresso do vÃ­deo (CÃ“PIA EXATA DO SCRIPT)
    const startWatchVideoProgress = () => {
      const player = findPlayerById()
      
      if (!player) {
        if (attempts >= 10) {
          console.error('âŒ [Step7] Timeout: Player nÃ£o encontrado apÃ³s 10 tentativas')
          return
        }
        attempts++
        return setTimeout(startWatchVideoProgress, 1000)
      }

      // ENCONTROU O PLAYER!
      console.log(`ðŸŽ¯ [Step7] Player encontrado: ${TARGET_VIDEO_ID}`)
      isConnected = true

      // Listener de timeupdate (LÃ“GICA EXATA DO SCRIPT ORIGINAL)
      player.on('timeupdate', () => {
        // Se jÃ¡ mostrou, ignora
        if (isUnlockedRef.current) return
        
        // Se for autoplay, ignora (lÃ³gica do script original)
        if (player.smartAutoPlay) return
        
        // AQUI ESTÃ A DIFERENÃ‡A: Usa player.video.currentTime (como no script original)
        const currentTime = player.video?.currentTime || 0
        
        // Atualiza a barra de progresso em tempo real
        if (progressBarRef.current) {
          let width = 0
          if (currentTime > 0) {
            if (currentTime <= 20) {
              // Primeiros 20 segundos: preenche de 0% a 80%
              width = (currentTime / 20) * 80
            } else {
              // Depois de 20 segundos: baby steps de 80% atÃ© 100%
              const remainingTime = currentTime - 20
              const remainingSeconds = SECONDS_TO_DISPLAY - 20
              const progressFrom80 = (remainingTime / remainingSeconds) * 20
              width = 80 + progressFrom80
            }
            width = Math.min(width, 100)
          }
          progressBarRef.current.style.width = `${width}%`
        }
        
        // LÃ“GICA EXATA DO SCRIPT: Se currentTime < SECONDS_TO_DISPLAY, retorna
        if (currentTime < SECONDS_TO_DISPLAY) return
        
        // Se chegou aqui, atingiu 126s! Mostra elementos e libera botÃ£o
        showHiddenElements()
      })

      console.log('âœ… [Step7] Listeners configurados!')
    }

    // Sempre inicia o monitoramento do vÃ­deo (sem verificaÃ§Ã£o de cookies)
    startWatchVideoProgress()

    // Cleanup
    return () => {
      // Cleanup se necessÃ¡rio
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
      {/* Badge de conclusÃ£o */}
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
          videoId="vid_6949e54790b70171e37b272b"
          playerId="6949e54790b70171e37b272b"
          delaySeconds={TARGET_TIME}
        />
      </motion.div>

      {/* ================================================================
           PROGRESS BAR BUTTON
           ================================================================
           BotÃ£o que funciona como barra de progresso:
           - VisÃ­vel desde o inÃ­cio, mas nÃ£o clicÃ¡vel (disabled)
           - Barra verde preenche conforme o vÃ­deo avanÃ§a
           - Aos 126s: barra completa (100%), botÃ£o clicÃ¡vel, texto muda
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
          disabled={!isButtonReady || isProcessing}
          // ANIMAÃ‡ÃƒO PULSE quando estiver pronto
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
            // Container do botÃ£o - SEM classe .esconder, controlado apenas por React
            display: 'block', // ForÃ§a visibilidade (sobrescreve scripts externos)
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
            opacity: 1, // ForÃ§a opacidade total
            visibility: 'visible', // ForÃ§a visibilidade
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
              width: '0%', // COMEÃ‡A EM 0% - Manipulado via ref.current.style.width
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)', // Verde da marca
              // TransiÃ§Ã£o 0.1s linear - RÃ¡pida para acompanhar, para instantÃ¢neo ao pausar
              transition: 'width 0.1s linear',
              zIndex: 1
            }}
          />
          
          {/* Layer 3: Efeito de brilho quando estÃ¡ pronto (opcional) */}
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
          
          {/* Layer 4: TEXTO do botÃ£o (controlado via REF para performance) */}
          <span 
            ref={textRef}
            style={{ 
              position: 'relative',
              zIndex: 10,
              color: (isButtonReady && !isProcessing) ? '#050505' : '#ffffff', // Preto quando pronto, branco quando carregando/processando
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
            ) : isProcessing ? (
              // ESTADO DE PROCESSANDO CHECKOUT - Feedback dinâmico
              <>
                <motion.span
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ 
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    fontSize: '18px'
                  }}
                >
                  🔄
                </motion.span>
                <motion.span
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Conectando...
                </motion.span>
              </>
            ) : (
              // ESTADO PRONTO (100%) - Texto atualizado via JS
              '¡APP LIBERADO!'
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Lista de benefÃ­cios rÃ¡pidos - Abaixo do botÃ£o */}
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

      {/* UrgÃªncia */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="esconder text-center space-y-1"
      >
        <p className="text-yellow-400 font-bold text-sm">âš ï¸ ⚠️ CUPOS LIMITADOS</p>
        <p className="text-gray-400 text-xs">Solo quedan 7 cupos disponibles hoy</p>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1 }}
        className="esconder flex items-center justify-center gap-4 text-xs text-gray-500"
      >
        <span>ðŸ”’ Pago Seguro</span>
        <span>•</span>
        <span>âœ“ 100% Confiable</span>
        <span>•</span>
        <span>⚡ Acceso Inmediato</span>
      </motion.div>

      {/* Modal de Email */}
      <EmailModal
        isOpen={showEmailModal}
        onConfirm={handleEmailConfirm}
        onClose={() => {}} // Modal não fecha (sem botão X)
        errorMessage={emailError}
        onClearError={() => setEmailError('')}
      />
    </motion.div>
  )
}



