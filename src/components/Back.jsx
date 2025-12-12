import { motion } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { sendInitiateCheckout } from '../utils/tracking.js'

export default function Back() {
  const handleCTA = async () => {
    try {
      // Envia evento InitiateCheckout para Meta Conversions API
      await sendInitiateCheckout();
      console.log('✅ InitiateCheckout enviado com sucesso (página /back)');
    } catch (error) {
      console.error('Erro ao enviar InitiateCheckout:', error);
      // Continua mesmo se houver erro no tracking
    }
    
    // Redireciona para checkout Centerpag
    window.location.href = 'https://go.centerpag.com/PPU38CQ4BNQ'
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050505]">
      {/* Background com spotlight dramático */}
      <div className="fixed inset-0 z-0">
        {/* Spotlight verde/roxo */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[150%] blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 40%, transparent 70%)'
          }}
        />
        <div 
          className="absolute top-0 right-0 w-[150%] h-[150%] blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 70%)'
          }}
        />
      </div>

      {/* Partículas de fundo */}
      <div className="particles-bg" />

      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          {/* SESSÃO 1: O ULTIMATO */}
          <motion.section
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center"
          >
            {/* Headline Principal */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, #00FF88, #00FFD4, #A855F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ¡ALTO! NO CIERRES ESTA PÁGINA O PERDERÁS TU CUPO...
            </motion.h1>

            {/* Subheadline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg sm:text-xl text-gray-300 leading-relaxed"
            >
              <span className="text-red-500 font-bold">Esta es tu última oportunidad</span> de activar la I.A. y empezar a generar lucas diarias desde tu celular.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-base sm:text-lg text-gray-400 leading-relaxed"
            >
              Si sales ahora, le daremos tu acceso a la siguiente persona en la fila.
            </motion.p>

            {/* Botão Gigante Pulsante */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: [
                  '0 0 30px rgba(0, 255, 136, 0.6)',
                  '0 0 60px rgba(0, 255, 136, 0.8)',
                  '0 0 30px rgba(0, 255, 136, 0.6)',
                ]
              }}
              transition={{ 
                delay: 0.6,
                scale: { duration: 0.5, type: "spring" },
                boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCTA}
              className="w-full py-6 sm:py-8 px-6 rounded-xl font-bold text-lg sm:text-xl md:text-2xl text-black bg-[#00FF00] relative overflow-hidden"
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 0, 0.8), 0 0 80px rgba(0, 255, 0, 0.4)',
              }}
            >
              {/* Efeito de brilho animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }}
                style={{ width: '50%', height: '100%' }}
              />
              <span className="relative z-10 block">¡CLIC AQUÍ PARA ACCEDER AHORA MISMO!</span>
            </motion.button>

            {/* Print de Ganhos */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-full rounded-xl overflow-hidden relative"
              style={{
                border: '1px solid rgba(0, 255, 136, 0.3)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.3), inset 0 0 30px rgba(0, 255, 136, 0.1)',
                background: 'rgba(0, 255, 136, 0.05)',
                minHeight: '300px'
              }}
            >
              {/* Tenta carregar a imagem, se não existir mostra placeholder */}
              <img
                src="/images/back/print_ganhos.png"
                alt="Histórico de ganhos"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  // Se a imagem não existir, mostra placeholder
                  e.target.style.display = 'none'
                  const placeholder = e.target.nextElementSibling
                  if (placeholder) placeholder.style.display = 'flex'
                }}
              />
              {/* Placeholder (oculto por padrão, aparece se imagem falhar) */}
              <div 
                className="text-center p-8 items-center justify-center"
                style={{ display: 'none', minHeight: '300px' }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon/20 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Imagen: print_ganhos.png
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  (Espacio reservado para histórico de ganhos)
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* SESSÃO 2: A FERIDA (Pain Points) */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
            className="glass-card p-6 sm:p-8 rounded-2xl space-y-6"
          >
            {/* Título da Sessão */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white">
              ¿De verdad vas a seguir viviendo así?
            </h2>

            {/* Lista de Pain Points */}
            <div className="space-y-4">
              {/* Bullet 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-200 text-base sm:text-lg leading-relaxed flex-1">
                  Llegando a fin de mes con la Cuenta Rut en cero y pidiendo prestado.
                </p>
              </motion.div>

              {/* Bullet 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-200 text-base sm:text-lg leading-relaxed flex-1">
                  Aguantando a un jefe que no te valora por un sueldo que no alcanza.
                </p>
              </motion.div>

              {/* Bullet 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-200 text-base sm:text-lg leading-relaxed flex-1">
                  Viendo cómo otros hacen plata con el celular mientras tú sigues mirando.
                </p>
              </motion.div>
            </div>

            {/* Texto Final */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="text-center text-gray-300 text-sm sm:text-base mt-6 pt-6 border-t border-gray-700"
            >
              La I.A. está lista para cambiar esto. Solo falta tu clic.
            </motion.p>
          </motion.section>

          {/* Botão CTA Final (Repetido) */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCTA}
            className="w-full py-5 sm:py-6 px-6 rounded-xl font-bold text-lg sm:text-xl text-black bg-[#00FF00] relative overflow-hidden"
            style={{
              boxShadow: '0 0 30px rgba(0, 255, 0, 0.6)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
              style={{ width: '50%', height: '100%' }}
            />
            <span className="relative z-10 block">¡ACCEDER AHORA MISMO!</span>
          </motion.button>

        </div>
      </div>
    </div>
  )
}

