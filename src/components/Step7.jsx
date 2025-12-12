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
  const VIDEO_ID = 'vid_693b9342f679d6950ed12c36' // ID do vídeo Vturb
  
  // Estados
  const [progressPercent, setProgressPercent] = useState(0) // 0 a 100
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
  // LÓGICA DE SINCRONIZAÇÃO COM O VÍDEO
  // ============================================================================
  useEffect(() => {
    let intervalId = null

    // Função que atualiza o progresso baseado no tempo do vídeo
    const updateProgressBar = () => {
      // Busca o elemento do vídeo Vturb
      const videoContainer = document.getElementById(VIDEO_ID)
      if (!videoContainer) return

      const videoElement = videoContainer.querySelector('video')
      if (!videoElement) return

      // Obtém o tempo atual do vídeo
      const currentTime = videoElement.currentTime || 0

      // CALCULA O PROGRESSO: (tempo atual / tempo alvo) * 100
      // Exemplo: 63s / 126s = 0.5 → 50%
      const calculatedProgress = (currentTime / TARGET_TIME) * 100
      
      // Garante que o progresso fique entre 0 e 100
      const clampedProgress = Math.min(Math.max(calculatedProgress, 0), 100)

      // Atualiza o estado do progresso
      setProgressPercent(clampedProgress)

      // Log para debug
      console.log(`📊 Vídeo: ${currentTime.toFixed(1)}s / ${TARGET_TIME}s | Progresso: ${clampedProgress.toFixed(1)}%`)

      // VERIFICA SE CHEGOU NO TEMPO ALVO (126 segundos)
      if (currentTime >= TARGET_TIME && !isButtonReady) {
        console.log('🎉 TEMPO ALVO ATINGIDO! Habilitando botão...')
        setProgressPercent(100) // Força 100%
        setIsButtonReady(true) // Habilita o botão
      }
    }

    // Executa a verificação a cada 250ms (4x por segundo)
    // Isso é suficiente para uma animação fluida e não sobrecarrega o browser
    intervalId = setInterval(updateProgressBar, 250)

    // Cleanup: limpa o intervalo quando o componente desmontar
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isButtonReady]) // Re-executa se isButtonReady mudar

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
        <button
          ref={buttonRef}
          onClick={handleCTA}
          disabled={!isButtonReady}
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
              width: `${progressPercent}%`, // ← AQUI: 0% a 100% conforme o vídeo roda
              background: 'linear-gradient(90deg, #00FF88, #00FFD4)', // Verde da marca
              transition: 'width 0.3s ease-out', // Transição suave
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



