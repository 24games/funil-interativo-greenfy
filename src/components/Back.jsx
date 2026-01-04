import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { initTracking, sendInitiateCheckout } from '../utils/tracking.js'
import { createFlowPayment } from '../utils/checkout.js'
import EmailModal from './EmailModal'
import { CheckCircle } from 'lucide-react'

export default function Back() {
  const [isButtonReady, setIsButtonReady] = useState(true) // Botao ja comeca pronto
  const [isProcessing, setIsProcessing] = useState(false) // Estado de loading para checkout
  const [showEmailModal, setShowEmailModal] = useState(false) // Estado do modal de email
  const [emailError, setEmailError] = useState('') // Estado de erro de email (do Flow/API)
  const buttonRef = useRef(null)

  // Inicializa tracking quando a pagina /back carrega
  useEffect(() => {
    initTracking().catch(error => {
      console.error('Erro ao inicializar tracking na pagina /back:', error)
    })
  }, [])

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

  // Handler do botao CTA (mesmo do Step 7)
  const handleCTA = async () => {
    if (isProcessing) return // Não processa se já estiver processando
    
    // Verifica se já tem email salvo
    const savedEmail = localStorage.getItem('user_email')
    
    if (!savedEmail) {
      // Cenário B: Não tem email - abre modal
      setShowEmailModal(true)
      return
    }
    
    // Cenário A: Já tem email - fluxo rápido
    await processCheckout(savedEmail)
  }

  // Componente do botao reutilizavel
  const CTAButton = () => (
    <motion.button
      ref={buttonRef}
      onClick={handleCTA}
      disabled={isProcessing}
      animate={{
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)',
          '0 0 60px rgba(0, 255, 136, 1), 0 0 100px rgba(0, 255, 136, 0.6)',
          '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        display: 'block',
        position: 'relative',
        width: '100%',
        maxWidth: '320px',
        padding: '20px 24px',
        borderRadius: '12px',
        border: 'none',
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        opacity: isProcessing ? 0.7 : 1,
        overflow: 'hidden',
        background: 'linear-gradient(90deg, #00FF88, #00FFD4)',
        fontSize: '18px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#050505',
        boxShadow: '0 0 40px rgba(0, 255, 136, 0.8), 0 0 80px rgba(0, 255, 136, 0.4)'
      }}
    >
      {/* Efeito de brilho */}
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
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          zIndex: 1
        }}
      />
      <span style={{ position: 'relative', zIndex: 2 }}>
        {isProcessing ? (
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
                fontSize: '18px',
                marginRight: '8px'
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
          'APP LIBERADO!'
        )}
      </span>
    </motion.button>
  )

  const bulletPoints = [
    '97% de assertividad en las senales del app',
    '5.436 personas usando en este momento',
    '2026 solo tendra ingresos extra quien use I.A!',
    'Acceso de por vida sin mensualidades'
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com particulas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full flex flex-col items-center gap-5 text-center"
        >
          {/* Logo */}
          <img 
            src="/images/HACKER MILLON PNG.png" 
            alt="24Games Logo" 
            style={{ 
              height: '4rem',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            className="md:h-16"
          />

          {/* HEADLINE com urgencia */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white leading-tight"
          >
            Esta es tu{' '}
            <span style={{ color: '#FF4444', textDecoration: 'underline' }}>ULTIMA OPORTUNIDAD</span>
            {' '}de cambiar tu vida financiera
          </motion.h1>

          {/* SUBHEADLINE */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-base md:text-lg leading-relaxed"
          >
            No puedes dejar pasar la oportunidad de usar el app y 
            <span className="text-neon font-semibold"> cambiar completamente tus resultados</span>! 
            Quieres recibir todos los dias notificaciones como esta?
          </motion.p>

          {/* PRIMEIRO BOTAO - Abaixo da headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full flex justify-center"
          >
            <CTAButton />
          </motion.div>

          {/* IMAGEM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <img 
              src="/images/back/ganho.jpg" 
              alt="Ganancias del App" 
              className="w-full h-auto rounded-lg border-2 border-neon/30"
            />
          </motion.div>

          {/* BULLET POINTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10"
          >
            <div className="space-y-3">
              {bulletPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 text-left"
                >
                  <CheckCircle 
                    size={22} 
                    className="text-neon flex-shrink-0 mt-0.5" 
                  />
                  <span className="text-gray-200 text-sm md:text-base">
                    {point}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* SEGUNDO BOTAO - Abaixo dos bullet points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-full flex justify-center"
          >
            <CTAButton />
          </motion.div>

          {/* Urgencia */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-center space-y-1"
          >
            <p className="text-yellow-400 font-bold text-sm">CUPOS LIMITADOS</p>
            <p className="text-gray-500 text-xs">Solo quedan 3 cupos disponibles hoy</p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex items-center justify-center gap-4 text-xs text-gray-500"
          >
            <span>Pago Seguro</span>
            <span>100% Confiable</span>
            <span>Acceso Inmediato</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de Email */}
      <EmailModal
        isOpen={showEmailModal}
        onConfirm={handleEmailConfirm}
        onClose={() => {}} // Modal não fecha (sem botão X)
        errorMessage={emailError}
        onClearError={() => setEmailError('')}
      />
    </div>
  )
}