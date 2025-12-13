import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { initTracking } from '../utils/tracking.js'

export default function Back() {
  // Inicializa tracking quando a página /back carrega
  // Isso garante que os UTMs sejam capturados mesmo na página de volta
  useEffect(() => {
    initTracking().catch(error => {
      console.error('Erro ao inicializar tracking na página /back:', error)
    })
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full flex flex-col items-center gap-6 text-center"
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

          {/* Imagem de volta */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <img 
              src="/images/back/ganho.jpg" 
              alt="Voltar" 
              className="w-full h-auto rounded-lg"
            />
          </motion.div>

          {/* Mensagem */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              ¿Quieres volver?
            </h1>
            <p className="text-gray-400">
              Tu cupo aún está disponible
            </p>
          </motion.div>

          {/* Botão para voltar */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => {
              // Preserva UTMs ao voltar
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
              
              // Redireciona preservando UTMs
              const queryString = params.toString()
              const redirectUrl = queryString ? `/?${queryString}` : '/'
              window.location.href = redirectUrl
            }}
            className="px-8 py-4 bg-neon text-dark font-bold rounded-lg hover:bg-neon/90 transition-colors shadow-lg hover:shadow-neon/50"
          >
            Volver al Inicio
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
