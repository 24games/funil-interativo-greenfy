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
      width: 100% !important;
      height: 100% !important;
      max-width: 400px !important;
      border-radius: calc(1.5rem - 0.5px) !important;
      overflow: hidden !important;
      position: relative !important;
      background: transparent !important;
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
        const player = playerRef.current

        // Função para executar displayHiddenElements
        const executeDisplay = () => {
          if (!player || !delaySeconds) return
          
          // Verifica se o método existe
          if (typeof player.displayHiddenElements === 'function') {
            try {
              player.displayHiddenElements(delaySeconds, [".esconder"], {
                persist: true
              })
              console.log(`✅ Vturb: displayHiddenElements configurado para ${delaySeconds}s`)
            } catch (error) {
              console.error('❌ Erro ao executar displayHiddenElements:', error)
            }
          } else {
            console.warn('⚠️ displayHiddenElements não está disponível no player')
            // Fallback manual: remove a classe após o delay
            setTimeout(() => {
              const hiddenElements = document.querySelectorAll('.esconder')
              hiddenElements.forEach(el => {
                el.classList.remove('esconder')
              })
            }, delaySeconds * 1000)
          }
        }

        // Tenta adicionar o listener para player:ready
        if (player.addEventListener) {
          player.addEventListener("player:ready", executeDisplay)
        }

        // Fallback: verifica periodicamente se o método está disponível
        let attempts = 0
        const maxAttempts = 40 // 20 segundos máximo (40 * 500ms)
        
        const checkInterval = setInterval(() => {
          attempts++
          
          if (player && typeof player.displayHiddenElements === 'function') {
            clearInterval(checkInterval)
            executeDisplay()
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            console.warn('Vturb displayHiddenElements não disponível após timeout')
          }
        }, 500)

        // Limpa o intervalo quando o componente for desmontado
        return () => {
          clearInterval(checkInterval)
          if (player.removeEventListener) {
            player.removeEventListener("player:ready", executeDisplay)
          }
        }
      } catch (error) {
        console.error('Erro ao configurar Vturb displayHiddenElements:', error)
      }
    }

    // Aguarda o script carregar
    let scriptLoadCheck
    const checkScript = () => {
      if (playerRef.current) {
        clearInterval(scriptLoadCheck)
        // Aguarda um pouco mais para garantir que o player está totalmente inicializado
        setTimeout(setupVturbDisplay, 2000)
      }
    }
    
    scriptLoadCheck = setInterval(checkScript, 300)

    return () => {
      // Limpa o player quando o componente for desmontado
      if (playerRef.current && containerRef.current && containerRef.current.contains(playerRef.current)) {
        containerRef.current.removeChild(playerRef.current)
        playerRef.current = null
      }
      if (scriptLoadCheck) {
        clearInterval(scriptLoadCheck)
      }
    }
  }, [videoId, playerId, delaySeconds])

  return (
    <div 
      ref={containerRef}
      className="w-full vturb-video-wrapper"
      style={{ 
        aspectRatio: '9/16',
        minHeight: '100%'
      }}
    />
  )
}

