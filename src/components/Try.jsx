import { motion } from 'framer-motion'
import { RefreshCw, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { createFlowPayment } from '../utils/checkout.js'
import EmailModal from './EmailModal'

export default function Try() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailError, setEmailError] = useState('')

  const handleRetryPayment = async () => {
    // Verifica se já tem email salvo
    const savedEmail = localStorage.getItem('user_email')
    
    if (!savedEmail) {
      // Não tem email - abre modal
      setShowEmailModal(true)
      return
    }
    
    // Já tem email - fluxo rápido
    await processCheckout(savedEmail)
  }

  const processCheckout = async (email) => {
    setIsProcessing(true)
    setEmailError('')
    
    try {
      // Cria pagamento no Flow.cl e redireciona (amount: 10000 CLP)
      await createFlowPayment({ email, amount: 10000 })
      // Se chegou aqui, o redirecionamento foi feito (window.location.href)
    } catch (error) {
      console.error('❌ Erro no checkout:', error)
      
      // Verifica se é erro de email inválido (1620 do Flow)
      if (error.message === 'INVALID_EMAIL' || error.message?.includes('1620')) {
        setEmailError('¡El correo está mal escrito! Por favor, revisa que sea válido.')
        setIsProcessing(false)
        setShowEmailModal(true)
        return
      }
      
      // Para outros erros, mostra alert padrão
      alert(`Error al procesar el pago: ${error.message || 'Error desconocido'}`)
      setIsProcessing(false)
    }
  }

  const handleEmailConfirm = async (email) => {
    setEmailError('')
    await processCheckout(email)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="max-w-md w-full flex flex-col items-center gap-6 text-center"
        >
          {/* Logo */}
          <img 
            src="/images/HACKER MILLON PNG.png" 
            alt="HackerMillon Logo" 
            style={{ 
              height: '5rem',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
            className="md:h-20"
          />

          {/* Ícone de retry/erro */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-yellow-500/20 border-4 border-yellow-500 flex items-center justify-center"
            style={{
              boxShadow: '0 0 40px rgba(234, 179, 8, 0.5), 0 0 80px rgba(234, 179, 8, 0.3)',
            }}
          >
            <RefreshCw size={48} className="text-yellow-500" />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Pago No Completado
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed"
          >
            Tente realizar o pagamento novamente clicando abaixo
          </motion.p>

          {/* Botão para tentar novamente */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleRetryPayment}
            disabled={isProcessing}
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            className="w-full max-w-xs py-4 px-6 bg-gradient-to-r from-neon to-[#00FFD4] text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 uppercase text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: isProcessing 
                ? '0 0 20px rgba(0, 255, 136, 0.3)'
                : '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
            }}
          >
            {isProcessing ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🔄
                </motion.span>
                Procesando...
              </>
            ) : (
              <>
                Intentar Nuevamente
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>

          {/* Informação adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-gray-500"
          >
            <p className="mt-2">
              💳 Puedes intentar con otro método de pago
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de Email */}
      <EmailModal
        isOpen={showEmailModal}
        onConfirm={handleEmailConfirm}
        onClose={() => {}}
        errorMessage={emailError}
        onClearError={() => setEmailError('')}
      />
    </div>
  )
}

