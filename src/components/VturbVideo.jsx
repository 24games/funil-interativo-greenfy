import { useEffect, useRef } from 'react'

/**
 * Componente para vídeos Vturb com bordas arredondadas e degradê
 * Usa o método padrão do Vturb com displayHiddenElements
 * @param {string} videoId - ID do vídeo Vturb
 * @param {string} playerId - ID do player Vturb
 * @param {number} delaySeconds - Segundos para mostrar elementos com classe .esconder
 */
export default function VturbVideo({ videoId, playerId, delaySeconds }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Verifica se o player já existe
    if (playerRef.current) return

    // Cria o elemento vturb-smartplayer
    const player = document.createElement('vturb-smartplayer')
    player.id = videoId
    player.style.cssText = `
      display: block !important;
      margin: 0 auto !important;
      width: calc(100% - 2px) !important;
      height: calc(100% - 2px) !important;
      max-width: 400px !important;
      border-radius: calc(1.5rem - 1px) !important;
      overflow: hidden !important;
      position: relative !important;
      background: #050505 !important;
    `

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

    // Usa o método padrão do Vturb para mostrar elementos após delay
    const setupVturbDisplay = () => {
      if (!playerRef.current) return

      try {
        // Adiciona listener para quando o player estiver pronto
        const handlePlayerReady = () => {
          if (playerRef.current && delaySeconds && typeof playerRef.current.displayHiddenElements === 'function') {
            playerRef.current.displayHiddenElements(delaySeconds, [".esconder"], {
              persist: true
            })
          }
        }

        // Tenta adicionar o listener
        if (playerRef.current.addEventListener) {
          playerRef.current.addEventListener("player:ready", handlePlayerReady)
        }

        // Fallback: verifica periodicamente se o método está disponível
        const checkInterval = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.displayHiddenElements === 'function') {
            clearInterval(checkInterval)
            handlePlayerReady()
          }
        }, 500)

        // Timeout de segurança (para após 10 segundos)
        setTimeout(() => {
          clearInterval(checkInterval)
        }, 10000)

      } catch (error) {
        console.error('Erro ao configurar Vturb displayHiddenElements:', error)
      }
    }

    // Aguarda o script carregar
    const scriptLoadCheck = setInterval(() => {
      if (playerRef.current) {
        clearInterval(scriptLoadCheck)
        setTimeout(setupVturbDisplay, 1500) // Aguarda 1.5s para o player inicializar
      }
    }, 300)

    return () => {
      // Limpa o player quando o componente for desmontado
      if (playerRef.current && containerRef.current) {
        containerRef.current.removeChild(playerRef.current)
        playerRef.current = null
      }
      clearInterval(scriptLoadCheck)
    }
  }, [videoId, playerId, delaySeconds])

  return (
    <div 
      ref={containerRef}
      className="w-full vturb-video-wrapper"
      style={{ 
        aspectRatio: '9/16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  )
}

