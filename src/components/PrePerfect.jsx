import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function PrePerfect() {
  // Preserva UTMs ao redirecionar
  const getPreservedParams = () => {
    const params = new URLSearchParams()
    
    // Busca UTMs da URL atual
    const currentUrl = new URLSearchParams(window.location.search)
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']
    
    utmParams.forEach(param => {
      const value = currentUrl.get(param)
      if (value) {
        params.set(param, value)
      }
    })
    
    // Se não encontrou na URL, busca dos cookies (UTMify)
    if (!params.has('utm_source')) {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
        return null
      }
      
      utmParams.forEach(param => {
        if (!params.has(param)) {
          const cookieValue = getCookie(param)
          if (cookieValue) {
            params.set(param, cookieValue)
          }
        }
      })
    }
    
    // Se ainda não encontrou, busca do localStorage
    if (!params.has('utm_source')) {
      try {
        utmParams.forEach(param => {
          if (!params.has(param)) {
            const storageValue = localStorage.getItem(param)
            if (storageValue) {
              params.set(param, storageValue)
            }
          }
        })
      } catch (error) {
        console.warn('Erro ao ler localStorage:', error)
      }
    }
    
    const queryString = params.toString()
    return queryString ? `/perfect?${queryString}` : '/perfect'
  }

  const handleClick = () => {
    const url = getPreservedParams()
    window.location.href = url
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="max-w-md w-full flex flex-col items-center gap-4 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
          >
            <img 
              src="/images/HACKER MILLON PNG.png" 
              alt="HackerMillon Logo" 
              style={{ 
                height: '4rem',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
              className="md:h-16"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-bold text-white leading-tight px-4"
          >
            Desbloquea el acceso al{' '}
            <span 
              className="inline-block text-xl md:text-2xl bg-gradient-to-r from-[#00FF88] via-[#00FFD4] to-[#00FF88] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]"
              style={{
                backgroundPosition: '0% center',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              método
            </span>
            {' '}
            <span className="text-3xl md:text-5xl font-bold">para generar entre</span>
            <br />
            <span 
              className="inline-block text-4xl md:text-6xl bg-gradient-to-r from-[#00FF88] via-[#00FFD4] to-[#00FF88] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]"
              style={{
                backgroundPosition: '0% center',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              $50.000
            </span>
            {' '}
            <span 
              className="inline-block text-4xl md:text-6xl bg-gradient-to-r from-[#00FF88] via-[#00FFD4] to-[#00FF88] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]"
              style={{
                backgroundPosition: '0% center',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              y
            </span>
            <br />
            <span 
              className="inline-block text-4xl md:text-6xl bg-gradient-to-r from-[#00FF88] via-[#00FFD4] to-[#00FF88] bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite]"
              style={{
                backgroundPosition: '0% center',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              $150.000 pesos
            </span>
            <br />
            <span className="text-3xl md:text-5xl text-white font-bold">diarios con tu celular</span>
          </motion.h1>

          {/* Botão com efeito Shine */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full max-w-xs py-4 px-6 bg-gradient-to-r from-[#00FF88] to-[#00FFD4] text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 uppercase text-lg overflow-hidden animate-pulse"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            {/* Efeito Shine (brilho laminado diagonal) */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
                transform: 'skewX(-20deg)',
                width: '60%',
                height: '100%',
              }}
              animate={{
                x: ['-150%', '150%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: 'linear',
              }}
            />
            <span className="relative z-10">ACTIVAR EL MÉTODO AHORA</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Estilos CSS adicionais para animações */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  )
}

