import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Gracias() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Pega o token da URL
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      setToken(urlToken)
    }
  }, [])

  const handleAccessProduct = () => {
    // Redireciona para o WhatsApp
    window.location.href = 'https://w.app/apphm'
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

          {/* Ícone de sucesso */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-neon/20 border-4 border-neon flex items-center justify-center"
            style={{
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.5), 0 0 80px rgba(0, 255, 136, 0.3)',
            }}
          >
            <CheckCircle size={48} className="text-neon" />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            ¡Pago Exitoso!
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed"
          >
            Tu acceso ha sido liberado.
          </motion.p>

          {/* Botão para acessar o produto */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleAccessProduct}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-xs py-4 px-6 bg-gradient-to-r from-neon to-[#00FFD4] text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 uppercase text-lg"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
            }}
          >
            Acceder al Producto
            <ArrowRight size={20} />
          </motion.button>

          {/* Informação adicional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-gray-500"
          >
            {token && (
              <p className="text-xs text-gray-600">
                Token: {token.substring(0, 20)}...
              </p>
            )}
            <p className="mt-2">
              🔒 Tu acceso está seguro y listo para usar
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}


