import { useEffect, useRef } from 'react'

/**
 * Componente para vídeos Vturb com bordas arredondadas e degradê
 * Usa o método oficial do Vturb com displayHiddenElements, com fallback inteligente que respeita pausa
 * @param {string} videoId - ID do vídeo Vturb (ex: "vid_6939f7c83ec7593882510713")
 * @param {string} playerId - ID do player Vturb (ex: "6939f7c83ec7593882510713")
 * @param {number} delaySeconds - Segundos para mostrar elementos com classe .esconder
 * @param {string} maxWidth - Largura máxima do vídeo (ex: "360px", "280px")
 */
export default function VturbVideo({ videoId, playerId, delaySeconds, maxWidth = '280px' }) {
  const containerRef = useRef(null)
  const videoDivRef = useRef(null)
  const displayConfiguredRef = useRef(false)
  const fallbackTimerRef = useRef(null)
  const videoElementRef = useRef(null)
  const currentTimeRef = useRef(0)
  const isPausedRef = useRef(true)
  const lastUpdateTimeRef = useRef(Date.now())

  useEffect(() => {
    if (!containerRef.current) return

    console.log(`🎬 Inicializando vídeo ${videoId}...`)

    // Limpa COMPLETAMENTE qualquer vídeo existente antes de criar um novo
    if (videoDivRef.current && containerRef.current.contains(videoDivRef.current)) {
      containerRef.current.removeChild(videoDivRef.current)
      videoDivRef.current = null
    }
    
    // Remove do DOM global também
    const existingVideoDiv = document.getElementById(videoId)
    if (existingVideoDiv && existingVideoDiv.parentNode) {
      existingVideoDiv.parentNode.removeChild(existingVideoDiv)
    }
    
    // Remove smartplayer se existir
    const existingSmartPlayer = document.querySelector(`vturb-smartplayer[id="${videoId}"], vturb-smartplayer[id="vid-${playerId}"]`)
    if (existingSmartPlayer && existingSmartPlayer.parentNode) {
      existingSmartPlayer.parentNode.removeChild(existingSmartPlayer)
    }
    
    // Remove scripts antigos do player
    const oldScript = document.querySelector(`script[id="scr_${playerId}"]`)
    if (oldScript && oldScript.parentNode) {
      oldScript.parentNode.removeChild(oldScript)
    }
    
    const oldDynamicScripts = document.querySelectorAll(`script[src*="${playerId}"]`)
    oldDynamicScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    })

    // Limpa timers anteriores
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    
    // Reseta estado
    displayConfiguredRef.current = false
    videoElementRef.current = null
    currentTimeRef.current = 0
    isPausedRef.current = true
    lastUpdateTimeRef.current = Date.now()
    
    // Aguarda um pouco para garantir que tudo foi limpo antes de criar novo
    const initDelay = setTimeout(() => {
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

    // Fallback inteligente que monitora o tempo de reprodução e respeita pausas
    const startFallbackTimer = () => {
      if (fallbackTimerRef.current) return // Já está rodando

      console.log(`🔄 Iniciando fallback timer para ${delaySeconds}s`)

      const checkVideoTime = () => {
        // Tenta encontrar o elemento de vídeo
        const video = videoDivRef.current?.querySelector('video') || 
                     videoDivRef.current?.querySelector('iframe')?.contentWindow?.document?.querySelector('video') ||
                     document.querySelector(`#${videoId} video`)

        if (video) {
          videoElementRef.current = video
          
          // Verifica se está pausado
          const isPaused = video.paused
          isPausedRef.current = isPaused

          if (!isPaused) {
            // Vídeo está tocando, atualiza o tempo
            const currentTime = video.currentTime || 0
            currentTimeRef.current = currentTime
            lastUpdateTimeRef.current = Date.now()

            // Verifica se chegou no tempo necessário
            if (currentTime >= delaySeconds) {
              console.log(`✅ Fallback: Vídeo chegou em ${currentTime.toFixed(1)}s, mostrando botão`)
              const hiddenElements = document.querySelectorAll('.esconder')
              hiddenElements.forEach(el => {
                el.classList.remove('esconder')
              })
              if (fallbackTimerRef.current) {
                clearInterval(fallbackTimerRef.current)
                fallbackTimerRef.current = null
              }
              return
            }
          }
        } else {
          // Se não encontrou o vídeo ainda, tenta usar tempo decorrido (menos preciso)
          if (!isPausedRef.current) {
            const now = Date.now()
            const elapsed = (now - lastUpdateTimeRef.current) / 1000
            currentTimeRef.current += elapsed
            lastUpdateTimeRef.current = now

            if (currentTimeRef.current >= delaySeconds) {
              console.log(`✅ Fallback: Tempo decorrido chegou em ${currentTimeRef.current.toFixed(1)}s, mostrando botão`)
              const hiddenElements = document.querySelectorAll('.esconder')
              hiddenElements.forEach(el => {
                el.classList.remove('esconder')
              })
              if (fallbackTimerRef.current) {
                clearInterval(fallbackTimerRef.current)
                fallbackTimerRef.current = null
              }
              return
            }
          }
        }
      }

      // Verifica a cada 100ms
      fallbackTimerRef.current = setInterval(checkVideoTime, 100)
    }

    // Configura displayHiddenElements quando o player estiver pronto
    const setupVturbDisplay = () => {
      if (!videoDivRef.current || displayConfiguredRef.current) return

      try {
        // Função para encontrar e configurar o player
        const findAndConfigurePlayer = () => {
          console.log(`🔍 Procurando player para ${videoId}...`)
          
          // O Vturb geralmente expõe o método no elemento do vídeo ou em um objeto global
          const possiblePlayers = [
            document.getElementById(videoId),
            videoDivRef.current,
            videoDivRef.current.querySelector('vturb-smartplayer'),
            videoDivRef.current.querySelector('iframe')?.contentWindow?.player,
            window[`player_${playerId}`],
            window[`vid_${playerId}`],
            window.Vturb?.players?.[playerId],
            window.Vturb?.players?.[videoId]
          ]

          for (let i = 0; i < possiblePlayers.length; i++) {
            const player = possiblePlayers[i]
            if (player) {
              console.log(`🔍 Verificando player ${i}:`, player, typeof player.displayHiddenElements)
              if (typeof player.displayHiddenElements === 'function') {
                try {
                  console.log(`✅ Encontrado displayHiddenElements! Configurando para ${delaySeconds}s`)
                  // Chama o método oficial do Vturb - este respeita pausa do vídeo
                  player.displayHiddenElements(delaySeconds, [".esconder"], {
                    persist: true
                  })
                  console.log(`✅ Vturb: displayHiddenElements configurado com sucesso!`)
                  displayConfiguredRef.current = true
                  return true
                } catch (error) {
                  console.error('❌ Erro ao executar displayHiddenElements:', error)
                }
              }
            }
          }
          
          console.warn('⚠️ displayHiddenElements não encontrado em nenhum player')
          return false
        }

        // Tenta configurar imediatamente
        if (findAndConfigurePlayer()) {
          return
        }

        // Se não encontrou, aguarda o player estar pronto
        const handlePlayerReady = () => {
          console.log('📢 Evento player:ready recebido')
          if (!displayConfiguredRef.current) {
            if (!findAndConfigurePlayer()) {
              // Se ainda não encontrou, inicia o fallback
              console.log('⚠️ displayHiddenElements não encontrado, usando fallback')
              startFallbackTimer()
            }
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

        // Verifica periodicamente se o método está disponível (máximo 10 segundos)
        let attempts = 0
        const maxAttempts = 20 // 10 segundos (20 * 500ms)
        
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
            console.warn('⚠️ displayHiddenElements não encontrado após 10s, usando fallback inteligente')
            // Remove listeners
            if (videoDivRef.current && videoDivRef.current.removeEventListener) {
              videoDivRef.current.removeEventListener("player:ready", handlePlayerReady)
            }
            if (videoElement && videoElement.removeEventListener) {
              videoElement.removeEventListener("player:ready", handlePlayerReady)
            }
            // Inicia o fallback inteligente
            startFallbackTimer()
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
        // Inicia o fallback em caso de erro
        startFallbackTimer()
      }
    }

      // Aguarda o script carregar e o player inicializar
      setTimeout(setupVturbDisplay, 2000)
    }, 100) // Pequeno delay para garantir limpeza completa

    return () => {
      clearTimeout(initDelay)
      console.log(`🧹 Limpando vídeo ${videoId}...`)
      
      // Limpa timers
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
      
      // Remove o elemento do vídeo do DOM
      if (videoDivRef.current && containerRef.current && containerRef.current.contains(videoDivRef.current)) {
        containerRef.current.removeChild(videoDivRef.current)
        videoDivRef.current = null
      }
      
      // Remove o elemento do DOM global também (caso tenha sido criado)
      const existingVideoDiv = document.getElementById(videoId)
      if (existingVideoDiv && existingVideoDiv.parentNode) {
        existingVideoDiv.parentNode.removeChild(existingVideoDiv)
      }
      
      // Remove o elemento vturb-smartplayer se existir
      const smartPlayer = document.querySelector(`vturb-smartplayer[id="${videoId}"], vturb-smartplayer[id="vid-${playerId}"]`)
      if (smartPlayer && smartPlayer.parentNode) {
        smartPlayer.parentNode.removeChild(smartPlayer)
      }
      
      // Remove o script do player Vturb
      const scriptTag = document.querySelector(`script[id="scr_${playerId}"]`)
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag)
      }
      
      // Remove scripts dinâmicos criados pelo Vturb (geralmente têm src contendo o playerId)
      const dynamicScripts = document.querySelectorAll(`script[src*="${playerId}"]`)
      dynamicScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      })
      
      // Limpa instâncias globais do player (se existirem)
      if (window[`player_${playerId}`]) {
        delete window[`player_${playerId}`]
      }
      if (window[`vid_${playerId}`]) {
        delete window[`vid_${playerId}`]
      }
      if (window.Vturb?.players?.[playerId]) {
        delete window.Vturb.players[playerId]
      }
      if (window.Vturb?.players?.[videoId]) {
        delete window.Vturb.players[videoId]
      }
      
      // Reseta todas as referências
      displayConfiguredRef.current = false
      videoElementRef.current = null
      currentTimeRef.current = 0
      isPausedRef.current = true
      lastUpdateTimeRef.current = Date.now()
      
      console.log(`✅ Limpeza completa do vídeo ${videoId}`)
    }
  }, [videoId, playerId, delaySeconds])

  // Identifica VSL 1 pelo videoId
  const isVSL1 = videoId === 'vid_6939f7c83ec7593882510713' || videoId === 'vid_694aa2b190b70171e37bcfaa'
  const finalMaxWidth = isVSL1 ? '100%' : maxWidth

  return (
    <div 
      ref={containerRef}
      className={`w-full vturb-video-wrapper ${isVSL1 ? 'vsl1-original' : ''}`}
      style={{ 
        maxWidth: finalMaxWidth,
        width: '100%'
      }}
    />
  )
}
