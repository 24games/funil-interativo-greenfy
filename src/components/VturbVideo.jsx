import { useEffect, useRef } from 'react'

/**
 * Componente para vídeos Vturb com bordas arredondadas e degradê
 * Usa APENAS o método oficial do Vturb com displayHiddenElements (sem fallbacks)
 * @param {string} videoId - ID do vídeo Vturb (ex: "vid_6939f7c83ec7593882510713")
 * @param {string} playerId - ID do player Vturb (ex: "6939f7c83ec7593882510713")
 * @param {number} delaySeconds - Segundos para mostrar elementos com classe .esconder
 */
export default function VturbVideo({ videoId, playerId, delaySeconds }) {
  const containerRef = useRef(null)
  const videoDivRef = useRef(null)
  const displayConfiguredRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Verifica se o vídeo já foi criado
    if (videoDivRef.current) return

    // Cria a estrutura HTML do vídeo Vturb
    const videoDiv = document.createElement('div')
    videoDiv.id = videoId
    videoDiv.style.cssText = `
      position: relative;
      width: 100%;
      padding: 177.77777777777777% 0 0;
      border-radius: calc(1.5rem - 0.5px);
      overflow: hidden;
    `

    // Cria a imagem thumbnail
    const thumbnail = document.createElement('img')
    thumbnail.id = `thumb_${playerId}`
    thumbnail.src = `https://images.converteai.net/af053167-2542-4323-9c93-d010e7938eb5/players/${playerId}/thumbnail.jpg`
    thumbnail.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    `
    thumbnail.alt = 'thumbnail'

    // Cria o backdrop
    const backdrop = document.createElement('div')
    backdrop.id = `backdrop_${playerId}`
    backdrop.style.cssText = `
      -webkit-backdrop-filter: blur(5px);
      backdrop-filter: blur(5px);
      position: absolute;
      top: 0;
      height: 100%;
      width: 100%;
    `

    videoDiv.appendChild(thumbnail)
    videoDiv.appendChild(backdrop)
    containerRef.current.appendChild(videoDiv)
    videoDivRef.current = videoDiv

    // Verifica se o script já foi carregado
    const existingScript = document.querySelector(`script[id="scr_${playerId}"]`)
    
    if (!existingScript) {
      // Carrega o script do player Vturb
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.id = `scr_${playerId}`
      script.textContent = `
        var s=document.createElement("script");
        s.src="https://scripts.converteai.net/af053167-2542-4323-9c93-d010e7938eb5/players/${playerId}/player.js";
        s.async=true;
        document.head.appendChild(s);
      `
      document.head.appendChild(script)
    }

    // Configura displayHiddenElements APENAS quando o player estiver pronto
    // SEM fallbacks - apenas o método oficial do Vturb que respeita pausa
    const setupVturbDisplay = () => {
      if (!videoDivRef.current || displayConfiguredRef.current) return

      try {
        // Função para encontrar e configurar o player
        const findAndConfigurePlayer = () => {
          // O Vturb geralmente expõe o método no elemento do vídeo ou em um objeto global
          // Tenta diferentes formas de encontrar o player
          const possiblePlayers = [
            document.getElementById(videoId),
            videoDivRef.current,
            videoDivRef.current.querySelector('vturb-smartplayer'),
            videoDivRef.current.querySelector('iframe')?.contentWindow?.player,
            window[`player_${playerId}`],
            window[`vid_${playerId}`],
            // Verifica se há um objeto global do Vturb
            window.Vturb?.players?.[playerId],
            window.Vturb?.players?.[videoId]
          ]

          for (const player of possiblePlayers) {
            if (player && typeof player.displayHiddenElements === 'function') {
              try {
                // Chama o método oficial do Vturb - este respeita pausa do vídeo
                player.displayHiddenElements(delaySeconds, [".esconder"], {
                  persist: true
                })
                console.log(`✅ Vturb: displayHiddenElements configurado para ${delaySeconds}s (respeita pausa)`)
                displayConfiguredRef.current = true
                return true
              } catch (error) {
                console.error('❌ Erro ao executar displayHiddenElements:', error)
              }
            }
          }
          return false
        }

        // Tenta configurar imediatamente
        if (findAndConfigurePlayer()) {
          return
        }

        // Se não encontrou, aguarda o player estar pronto
        // Listener para evento player:ready
        const handlePlayerReady = () => {
          if (!displayConfiguredRef.current) {
            findAndConfigurePlayer()
          }
        }

        // Adiciona listener no elemento do vídeo
        if (videoDivRef.current.addEventListener) {
          videoDivRef.current.addEventListener("player:ready", handlePlayerReady)
        }

        // Também tenta no elemento com ID do vídeo
        const videoElement = document.getElementById(videoId)
        if (videoElement && videoElement.addEventListener) {
          videoElement.addEventListener("player:ready", handlePlayerReady)
        }

        // Verifica periodicamente se o método está disponível (máximo 30 segundos)
        let attempts = 0
        const maxAttempts = 60 // 30 segundos (60 * 500ms)
        
        const checkInterval = setInterval(() => {
          attempts++
          
          if (findAndConfigurePlayer()) {
            clearInterval(checkInterval)
            // Remove listeners
            if (videoDivRef.current && videoDivRef.current.removeEventListener) {
              videoDivRef.current.removeEventListener("player:ready", handlePlayerReady)
            }
            if (videoElement && videoElement.removeEventListener) {
              videoElement.removeEventListener("player:ready", handlePlayerReady)
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            console.warn('⚠️ Vturb displayHiddenElements não disponível após 30s. Verifique se o script do Vturb foi carregado corretamente.')
            // Remove listeners
            if (videoDivRef.current && videoDivRef.current.removeEventListener) {
              videoDivRef.current.removeEventListener("player:ready", handlePlayerReady)
            }
            if (videoElement && videoElement.removeEventListener) {
              videoElement.removeEventListener("player:ready", handlePlayerReady)
            }
          }
        }, 500)

        // Limpa o intervalo quando o componente for desmontado
        return () => {
          clearInterval(checkInterval)
          if (videoDivRef.current && videoDivRef.current.removeEventListener) {
            videoDivRef.current.removeEventListener("player:ready", handlePlayerReady)
          }
          if (videoElement && videoElement.removeEventListener) {
            videoElement.removeEventListener("player:ready", handlePlayerReady)
          }
        }
      } catch (error) {
        console.error('Erro ao configurar Vturb displayHiddenElements:', error)
      }
    }

    // Aguarda o script carregar e o player inicializar
    // Tenta após 1 segundo e depois verifica periodicamente
    setTimeout(setupVturbDisplay, 1000)

    return () => {
      // Limpa o vídeo quando o componente for desmontado
      if (videoDivRef.current && containerRef.current && containerRef.current.contains(videoDivRef.current)) {
        containerRef.current.removeChild(videoDivRef.current)
        videoDivRef.current = null
        displayConfiguredRef.current = false
      }
    }
  }, [videoId, playerId, delaySeconds])

  return (
    <div 
      ref={containerRef}
      className="w-full vturb-video-wrapper"
      style={{ 
        maxWidth: '280px',
        width: '100%'
      }}
    />
  )
}
