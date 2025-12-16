import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight } from 'lucide-react'

export default function EmailModal({ isOpen, onConfirm, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)

  // Sequência de textos de loading (Espanhol Chileno)
  const loadingTexts = [
    'Validando disponibilidad...',
    'Conectando con servidor seguro...',
    'Generando enlace de pago...',
    '¡Todo listo! Redirigiendo...'
  ]

  // Efeito para mudar texto a cada 1.5 segundos durante o processamento
  useEffect(() => {
    if (!isProcessing) {
      setLoadingTextIndex(0)
      return
    }

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => {
        const next = prev + 1
        // Se chegou no último texto, mantém nele
        return next >= loadingTexts.length ? loadingTexts.length - 1 : next
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [isProcessing, loadingTexts.length])

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handler do botão continuar
  const handleConfirm = async () => {
    // Limpa erro anterior
    setError('')

    // Validação
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico')
      return
    }

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido')
      return
    }

    setIsProcessing(true)

    try {
      // Salva email no localStorage
      localStorage.setItem('user_email', email)

      // Chama callback com o email
      await onConfirm(email)
      
      // Se chegou aqui, o redirecionamento foi feito
      // Não precisa resetar isProcessing
    } catch (error) {
      setError(error.message || 'Error al procesar. Intenta nuevamente.')
      setIsProcessing(false)
    }
  }

  // Handler do Enter no input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleConfirm()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          // Não fecha ao clicar fora
          e.stopPropagation()
        }}
      >
        {/* Overlay escuro com blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Container do modal com estilo Hacker/Dark */}
          <div className="glass-card p-8 border-2 border-neon/30 shadow-2xl"
            style={{
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.2), 0 0 80px rgba(0, 255, 136, 0.1)',
            }}
          >
            {/* Ícone de email */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-neon/10 border-2 border-neon/30 flex items-center justify-center"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                }}
              >
                <Mail size={32} className="text-neon" />
              </div>
            </div>

            {/* Título */}
            <AnimatePresence mode="wait">
              {!isProcessing ? (
                <motion.div
                  key="title"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-white">
                    ¡Estás a un paso!
                  </h2>

                  {/* Texto descritivo */}
                  <p className="text-gray-300 text-center mb-6 text-base leading-relaxed">
                    Ingresa tu correo electrónico para liberar tu acceso inmediato al sistema.
                  </p>
                </motion.div>
              ) : (
                <motion.h2
                  key="loading-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl md:text-3xl font-bold text-center mb-6 text-white"
                >
                  Preparando tu acceso...
                </motion.h2>
              )}
            </AnimatePresence>

            {/* Input de email - Escondido quando processando */}
            <AnimatePresence>
              {!isProcessing && (
                <motion.div
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 overflow-hidden"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('') // Limpa erro ao digitar
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="tu@correo.com"
                    disabled={isProcessing}
                    className="w-full px-4 py-4 bg-black/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon focus:ring-2 focus:ring-neon/20 transition-all duration-300"
                    style={{
                      boxShadow: error ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                    }}
                  />
                  
                  {/* Mensagem de erro */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-red-400 text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão continuar - Escondido quando processando */}
            <AnimatePresence>
              {!isProcessing && (
                <motion.button
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleConfirm}
                  disabled={!email.trim()}
                  whileHover={email.trim() ? { scale: 1.02 } : {}}
                  whileTap={email.trim() ? { scale: 0.98 } : {}}
                  className="w-full py-4 px-6 bg-gradient-to-r from-neon to-[#00FFD4] text-black font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase text-lg"
                  style={{
                    boxShadow: !email.trim() 
                      ? 'none' 
                      : '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
                  }}
                >
                  CONTINUAR AL PAGO
                  <ArrowRight size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Loading Sequence - Aparece quando processando */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Spinner/Barra de Progresso Verde Neon Pulsante */}
                  <div className="flex flex-col items-center justify-center">
                    {/* Spinner Pulsante */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative w-20 h-20 mb-6"
                    >
                      {/* Círculo externo pulsante */}
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full border-4 border-neon/30"
                        style={{
                          boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
                        }}
                      />
                      {/* Spinner interno */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 border-4 border-neon/50 border-t-neon rounded-full"
                          style={{
                            animation: 'spin 1s linear infinite',
                            boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)',
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Barra de Progresso Pulsante */}
                    <motion.div
                      className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-4"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      <motion.div
                        animate={{
                          width: ['0%', '100%', '0%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="h-full bg-gradient-to-r from-neon to-[#00FFD4] rounded-full"
                        style={{
                          boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
                        }}
                      />
                    </motion.div>

                    {/* Texto Dinâmico */}
                    <motion.p
                      key={loadingTextIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="text-neon font-semibold text-lg text-center"
                      style={{
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                      }}
                    >
                      {loadingTexts[loadingTextIndex]}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Texto de segurança */}
            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Tus datos están protegidos
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


