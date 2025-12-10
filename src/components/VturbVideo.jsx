import { useEffect, useRef } from 'react'

/**
 * Componente para vídeos Vturb com bordas arredondadas e degradê
 * @param {string} videoId - ID do vídeo Vturb
 * @param {string} playerId - ID do player Vturb
 * @param {function} onProgress - Callback chamado quando o vídeo avança (recebe { currentTime, duration, progress })
 * @param {function} onReady - Callback chamado quando o player está pronto
 */
export default function VturbVideo({ videoId, playerId, onProgress, onReady }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const videoElementRef = useRef(null)
  const progressIntervalRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Verifica se o player já existe
    if (playerRef.current) return

    // Cria o elemento vturb-smartplayer
    const player = document.createElement('vturb-smartplayer')
    player.id = videoId
    player.style.display = 'block'
    player.style.margin = '0 auto'
    player.style.width = '100%'
    player.style.maxWidth = '400px'
    player.style.borderRadius = '1.5rem'
    player.style.overflow = 'hidden'

    containerRef.current.appendChild(player)
    playerRef.current = player

    // Verifica se o script já foi carregado
    const existingScript = document.querySelector(`script[src*="${playerId}"]`)
    
    if (!existingScript) {
      // Carrega o script do player Vturb
      const script = document.createElement('script')
      script.src = `https://scripts.converteai.net/af053167-2542-4323-9c93-d010e7938eb5/players/${playerId}/v4/player.js`
      script.async = true
      document.head.appendChild(script)
    }

    // Aguarda o player carregar e então procura o elemento de vídeo interno
    const checkVideoElement = () => {
      if (!playerRef.current) return

      // O Vturb cria um elemento de vídeo dentro do smartplayer
      // Pode ser um <video> ou um elemento dentro do shadow DOM
      const videoElement = playerRef.current.querySelector('video') || 
                          playerRef.current.shadowRoot?.querySelector('video') ||
                          playerRef.current

      if (videoElement && videoElement.tagName === 'VIDEO') {
        videoElementRef.current = videoElement
        
        // Adiciona listeners de eventos do vídeo
        const handleTimeUpdate = () => {
          if (videoElementRef.current && onProgress) {
            const currentTime = videoElementRef.current.currentTime || 0
            const duration = videoElementRef.current.duration || 0
            const progress = duration > 0 ? (currentTime / duration) * 100 : 0
            
            onProgress({
              currentTime,
              duration,
              progress
            })
          }
        }

        const handleLoadedMetadata = () => {
          if (onReady) {
            onReady(videoElementRef.current)
          }
        }

        videoElement.addEventListener('timeupdate', handleTimeUpdate)
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
        videoElement.addEventListener('progress', handleTimeUpdate)

        // Também verifica periodicamente (fallback)
        progressIntervalRef.current = setInterval(() => {
          if (videoElementRef.current && onProgress) {
            const currentTime = videoElementRef.current.currentTime || 0
            const duration = videoElementRef.current.duration || 0
            const progress = duration > 0 ? (currentTime / duration) * 100 : 0
            
            onProgress({
              currentTime,
              duration,
              progress
            })
          }
        }, 500) // Verifica a cada 500ms

        return () => {
          videoElement.removeEventListener('timeupdate', handleTimeUpdate)
          videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
          videoElement.removeEventListener('progress', handleTimeUpdate)
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
        }
      } else {
        // Tenta novamente após um delay
        setTimeout(checkVideoElement, 500)
      }
    }

    // Aguarda o script carregar antes de procurar o vídeo
    const scriptLoadCheck = setInterval(() => {
      if (playerRef.current && playerRef.current.querySelector) {
        clearInterval(scriptLoadCheck)
        setTimeout(checkVideoElement, 1000) // Aguarda 1s para o player inicializar
      }
    }, 200)

    return () => {
      // Limpa o player quando o componente for desmontado
      if (playerRef.current && containerRef.current) {
        containerRef.current.removeChild(playerRef.current)
        playerRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      clearInterval(scriptLoadCheck)
    }
  }, [videoId, playerId, onProgress, onReady])

  return (
    <div 
      ref={containerRef}
      className="w-full vturb-video-wrapper"
      style={{ aspectRatio: '9/16' }}
    />
  )
}

