import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'

// Lista de imagens de depoimentos
const testimonialImageFiles = [
  '1.jpeg',
  '2-certo.jpg',
  '3.jpeg',
  '4.jpg',
  '5.jpeg',
  '6.jpg',
]

// Placeholders caso não haja imagens reais
const placeholderImages = [
  { id: 1, color: 'from-green-900/20 to-emerald-900/20' },
  { id: 2, color: 'from-teal-900/20 to-cyan-900/20' },
  { id: 3, color: 'from-lime-900/20 to-green-900/20' },
]

// Usa imagens reais se disponíveis, senão usa placeholders
const testimonialImages = testimonialImageFiles.length > 0 
  ? testimonialImageFiles.map((file, index) => ({
      id: index + 1,
      image: `/images/depoimentos/${file}`,
      isReal: true
    }))
  : placeholderImages.map(img => ({ ...img, isReal: false }))

export default function Step3({ onNext }) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const carouselRef = useRef(null)

  // Calcula a largura de uma imagem + gap baseado no tamanho da tela
  const getImageWidth = () => {
    if (typeof window === 'undefined') return 188 // w-44 (176px) + gap-3 (12px)
    const width = window.innerWidth
    if (width >= 1024) return 272 // lg:w-64 (256px) + gap-4 (16px)
    if (width >= 768) return 256 // md:w-60 (240px) + gap-4 (16px)
    if (width >= 640) return 220 // sm:w-52 (208px) + gap-3 (12px)
    return 188 // w-44 (176px) + gap-3 (12px) mobile
  }

  // Largura total para mostrar todas as 6 imagens
  const imageWidth = getImageWidth()
  const totalWidth = imageWidth * testimonialImages.length

  useEffect(() => {
    let animationFrame
    let lastTime = 0
    const speed = 0.3 // pixels por frame

    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      
      if (deltaTime >= 16) { // ~60fps
        setScrollPosition(prev => {
          const newPosition = prev + speed
          // Quando chegar ao final da primeira cópia (6 imagens), reseta para 0
          // Como temos 3 cópias idênticas, o reset é totalmente imperceptível
          if (newPosition >= totalWidth) {
            // Reset instantâneo sem transição - imperceptível porque a segunda cópia é idêntica
            if (carouselRef.current) {
              carouselRef.current.style.transition = 'none'
            }
            return 0
          } else {
            // Restaura transição suave durante a animação normal
            if (carouselRef.current && prev === 0) {
              setTimeout(() => {
                if (carouselRef.current) {
                  carouselRef.current.style.transition = ''
                }
              }, 0)
            }
            return newPosition
          }
        })
        lastTime = currentTime
      }
      
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [totalWidth])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-6 w-full px-2 sm:px-4"
    >
      {/* Headline */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center leading-tight break-words">
        ¡Ya ayudé a miles de personas a cambiar su vida con lo que te voy a mostrar!
      </h2>

      {/* Subheadline */}
      <p className="text-base sm:text-lg text-center text-gray-300 break-words">
        Y lo mejor,{' '}
        <span className="font-bold text-neon bg-neon/10 px-2 py-1 rounded inline-block">
          no cobré ni un peso por eso
        </span>
        .
      </p>

      {/* Carrossel de Prints */}
      <div className="relative overflow-hidden py-6 w-full -mx-2 sm:-mx-4 px-2 sm:px-4">
        <motion.div 
          ref={carouselRef}
          className="flex gap-3 sm:gap-4"
          style={{ 
            x: -scrollPosition,
            willChange: 'transform'
          }}
        >
          {/* Duplica as imagens para criar loop infinito */}
          {[...testimonialImages, ...testimonialImages, ...testimonialImages].map((img, index) => (
            <div
              key={`${img.id}-${index}`}
              className="flex-shrink-0 w-44 h-64 sm:w-52 sm:h-72 md:w-60 md:h-80 lg:w-64 lg:h-96 testimonial-image-wrapper"
            >
              {img.isReal ? (
                // Imagem real
                <img
                  src={img.image}
                  alt={`Depoimento ${img.id}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                // Placeholder
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${img.color}`}>
                  <div className="text-center p-3 sm:p-4 md:p-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-neon/20 mx-auto mb-2 sm:mb-3 md:mb-4" />
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-3/4 mx-auto" />
                      <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-full" />
                      <div className="h-2 sm:h-2.5 md:h-3 bg-white/10 rounded w-5/6 mx-auto" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Botão */}
      <button 
        onClick={onNext}
        className="neon-button w-full text-sm sm:text-base py-4 sm:py-5"
        style={{
          paddingLeft: '12px',
          paddingRight: '12px'
        }}
      >
        ¡QUIERO GANAR PLATA COMO ELLOS!
      </button>
    </motion.div>
  )
}



