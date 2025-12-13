import { motion } from 'framer-motion'

export default function Step3({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-6 w-full max-w-md mx-auto px-4"
    >
      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-center leading-tight"
      >
        Mira lo que dicen{' '}
        <span className="money-highlight">nuestros usuarios</span>
      </motion.h2>

      {/* Depoimentos simples em lista */}
      <div className="space-y-4">
        {[
          {
            name: 'Carlos M.',
            text: 'En mi primer mes gané $2.300.000 pesos. No puedo creer que sea tan fácil.',
            emoji: '⭐'
          },
          {
            name: 'María L.',
            text: 'Llevo 3 meses usando el método y ya generé más de $6.000.000 pesos.',
            emoji: '⭐'
          },
          {
            name: 'Juan P.',
            text: 'La mejor inversión que hice. En 2 meses recuperé todo y ahora solo gano.',
            emoji: '⭐'
          }
        ].map((depoimento, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.2 }}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{depoimento.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-neon mb-1">{depoimento.name}</h3>
                <p className="text-sm text-gray-300">{depoimento.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Texto de destaque */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-gray-400 mt-4"
      >
        Más de 10.000 personas ya están ganando dinero con este método
      </motion.p>

      {/* Botão para avançar */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={onNext}
        className="neon-button mt-4 text-base relative overflow-hidden"
        style={{
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 255, 136, 0.3)',
          maxWidth: '280px',
          width: '100%',
          margin: '0 auto',
          paddingLeft: '12px',
          paddingRight: '12px'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          initial={{ x: -100 }}
          animate={{ x: 200 }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ width: '50%', height: '100%' }}
        />
        <span className="relative z-10">Continuar</span>
      </motion.button>
    </motion.div>
  )
}
