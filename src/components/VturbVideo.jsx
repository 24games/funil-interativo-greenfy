import { useEffect, useRef } from 'react'

/**
 * Componente para vídeos Vturb com bordas arredondadas e degradê
 * Usa o método padrão do Vturb com displayHiddenElements
 * @param {string} videoId - ID do vídeo Vturb (ex: "vid_6939f7c83ec7593882510713")
 * @param {string} playerId - ID do player Vturb (ex: "6939f7c83ec7593882510713")
 * @param {number} delaySeconds - Segundos para mostrar elementos com classe .esconder
 */
export default function VturbVideo({ videoId, playerId, delaySeconds }) {
  const containerRef = useRef(null)
  const videoDivRef = useRef(null)

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

    // Usa o método padrão do Vturb para mostrar elementos após delay
    const setupVturbDisplay = () => {
      if (!videoDivRef.current) return

      try {
        // O player Vturb cria um elemento dentro da div com id do vídeo
        // Precisamos encontrar o elemento do player
        const playerElement = videoDivRef.current.querySelector('vturb-smartplayer') || 
                             videoDivRef.current.querySelector(`#${videoId} > *`) ||
                             videoDivRef.current

        // Função para executar displayHiddenElements
        const executeDisplay = () => {
          if (!delaySeconds) return
          
          // Tenta encontrar o player de diferentes formas
          let player = null
          
          // Método 1: Verifica se há um elemento com displayHiddenElements
          const possiblePlayers = [
            videoDivRef.current,
            document.getElementById(videoId),
            videoDivRef.current.querySelector('vturb-smartplayer'),
            videoDivRef.current.querySelector('iframe'),
            window[`player_${playerId}`],
            window[`vid_${playerId}`]
          ]

          for (const possiblePlayer of possiblePlayers) {
            if (possiblePlayer && typeof possiblePlayer.displayHiddenElements === 'function') {
              player = possiblePlayer
              break
            }
          }

          if (player && typeof player.displayHiddenElements === 'function') {
            try {
              player.displayHiddenElements(delaySeconds, [".esconder"], {
                persist: true
              })
              console.log(`✅ Vturb: displayHiddenElements configurado para ${delaySeconds}s`)
            } catch (error) {
              console.error('❌ Erro ao executar displayHiddenElements:', error)
              // Fallback manual
              setTimeout(() => {
                const hiddenElements = document.querySelectorAll('.esconder')
                hiddenElements.forEach(el => {
                  el.classList.remove('esconder')
                })
              }, delaySeconds * 1000)
            }
          } else {
            console.warn('⚠️ displayHiddenElements não está disponível, usando fallback')
            // Fallback manual: remove a classe após o delay
            setTimeout(() => {
              const hiddenElements = document.querySelectorAll('.esconder')
              hiddenElements.forEach(el => {
                el.classList.remove('esconder')
              })
            }, delaySeconds * 1000)
          }
        }

        // Aguarda o player estar pronto
        // Tenta adicionar listener para eventos do Vturb
        if (videoDivRef.current.addEventListener) {
          videoDivRef.current.addEventListener("player:ready", executeDisplay)
        }

        // Fallback: verifica periodicamente se o método está disponível
        let attempts = 0
        const maxAttempts = 60 // 30 segundos máximo (60 * 500ms)
        
        const checkInterval = setInterval(() => {
          attempts++
          
          // Verifica se o método está disponível
          const possiblePlayers = [
            videoDivRef.current,
            document.getElementById(videoId),
            videoDivRef.current.querySelector('vturb-smartplayer'),
            window[`player_${playerId}`],
            window[`vid_${playerId}`]
          ]

          for (const possiblePlayer of possiblePlayers) {
            if (possiblePlayer && typeof possiblePlayer.displayHiddenElements === 'function') {
              clearInterval(checkInterval)
              executeDisplay()
              return
            }
          }

          if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            console.warn('Vturb displayHiddenElements não disponível após timeout, usando fallback')
            // Executa o fallback
            setTimeout(() => {
              const hiddenElements = document.querySelectorAll('.esconder')
              hiddenElements.forEach(el => {
                el.classList.remove('esconder')
              })
            }, delaySeconds * 1000)
          }
        }, 500)

        // Limpa o intervalo quando o componente for desmontado
        return () => {
          clearInterval(checkInterval)
          if (videoDivRef.current && videoDivRef.current.removeEventListener) {
            videoDivRef.current.removeEventListener("player:ready", executeDisplay)
          }
        }
      } catch (error) {
        console.error('Erro ao configurar Vturb displayHiddenElements:', error)
        // Fallback em caso de erro
        setTimeout(() => {
          const hiddenElements = document.querySelectorAll('.esconder')
          hiddenElements.forEach(el => {
            el.classList.remove('esconder')
          })
        }, delaySeconds * 1000)
      }
    }

    // Aguarda o script carregar e o player inicializar
    setTimeout(setupVturbDisplay, 1000)

    return () => {
      // Limpa o vídeo quando o componente for desmontado
      if (videoDivRef.current && containerRef.current && containerRef.current.contains(videoDivRef.current)) {
        containerRef.current.removeChild(videoDivRef.current)
        videoDivRef.current = null
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
