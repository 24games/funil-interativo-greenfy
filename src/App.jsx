import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'
import Step4 from './components/Step4'
import Step5 from './components/Step5'
import Step6 from './components/Step6'
import Step7 from './components/Step7'
import ProgressBar from './components/ProgressBar'
import Back from './components/Back'
import BackPerfect from './components/BackPerfect'
import HomePerfect from './components/HomePerfect'
import PrePerfect from './components/PrePerfect'
import Gracias from './components/Gracias'
import GraciasPerfect from './components/GraciasPerfect'
import Try from './components/Try'

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname
    }
    return '/'
  })

  useEffect(() => {
    // Atualiza quando a rota muda
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname)
    }

    // Escuta mudanças de rota
    window.addEventListener('popstate', handleRouteChange)
    
    // Verifica a rota inicial
    handleRouteChange()

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // Se a rota for /back, renderiza a página Back
  if (currentPath === '/back' || currentPath === '/back/') {
    return <Back />
  }

  // Se a rota for /back-perfect, renderiza a página BackPerfect
  if (currentPath === '/back-perfect' || currentPath === '/back-perfect/') {
    return <BackPerfect />
  }

  // Se a rota for /pre-perfect, renderiza a página PrePerfect
  if (currentPath === '/pre-perfect' || currentPath === '/pre-perfect/') {
    return <PrePerfect />
  }

  // Se a rota for /perfect, renderiza o funil Perfect Pay
  if (currentPath === '/perfect' || currentPath === '/perfect/') {
    return <HomePerfect />
  }

  // Se a rota for /gracias, renderiza a página de obrigado
  if (currentPath === '/gracias' || currentPath === '/gracias/') {
    return <Gracias />
  }

  // Se a rota for /gracias-perfect, renderiza a página de obrigado Perfect
  if (currentPath === '/gracias-perfect' || currentPath === '/gracias-perfect/') {
    return <GraciasPerfect />
  }

  // Se a rota for /try, renderiza a página de tentar novamente
  if (currentPath === '/try' || currentPath === '/try/') {
    return <Try />
  }
  // Inicializa o step a partir da URL (se presente)
  const getInitialStep = () => {
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      const step = parseInt(stepParam, 10)
      if (step >= 1 && step <= 7) {
        return step
      }
    }
    return 1
  }

  const [currentStep, setCurrentStep] = useState(getInitialStep())
  const [answers, setAnswers] = useState({
    timeToMake: null,
    freeTime: null,
    aiUsage: null,
    internetAccess: null,
  })

  // Sincroniza o step com a URL quando a página carrega
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stepParam = params.get('step')
    if (stepParam) {
      const step = parseInt(stepParam, 10)
      if (step >= 1 && step <= 7 && step !== currentStep) {
        setCurrentStep(step)
      }
    }
  }, [])

  /**
   * Preserva os UTMs e outros parâmetros de tracking na URL
   * Busca de múltiplas fontes: URL atual, cookies, localStorage
   */
  const getPreservedParams = () => {
    const params = new URLSearchParams()
    
    // Adiciona o step
    params.set('step', currentStep + 1)
    
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
    
    return params.toString()
  }

  // Adiciona entrada no histórico quando muda de step (apenas quando avança)
  const nextStep = () => {
    let newStep = currentStep + 1
    
    // Se estiver no Step 2, pula direto para o Step 4 (pula Step 3)
    if (currentStep === 2) {
      newStep = 4
    }
    
    setCurrentStep(newStep)
    
    // Preserva UTMs na URL ao navegar
    const preservedParams = getPreservedParams()
    const newUrl = preservedParams ? `?${preservedParams}` : `?step=${newStep}`
    
    // Adiciona uma entrada no histórico do navegador
    window.history.pushState({ step: newStep }, '', newUrl)
  }

  /**
   * Preserva UTMs ao voltar para um step anterior
   */
  const getPreservedParamsForStep = (step) => {
    const params = new URLSearchParams()
    
    if (step > 1) {
      params.set('step', step)
    }
    
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
    
    const queryString = params.toString()
    return queryString ? `?${queryString}` : (step === 1 ? '/' : `?step=${step}`)
  }

  // Gerencia o botão voltar do navegador
  useEffect(() => {
    const handlePopState = (event) => {
      // Se está no Step 7 e tenta voltar, redireciona para /back (preservando UTMs)
      if (currentStep === 7) {
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
        
        // Monta URL do /back preservando UTMs
        const queryString = params.toString()
        const backUrl = queryString ? `/back?${queryString}` : '/back'
        window.location.href = backUrl
        return
      }

      // Se não está no Step 7, volta para o step anterior
      if (currentStep > 1) {
        setCurrentStep(prev => {
          const previousStep = prev - 1
          // Preserva UTMs na URL ao voltar
          const newUrl = getPreservedParamsForStep(previousStep)
          // Atualiza a URL sem adicionar nova entrada no histórico
          window.history.replaceState({ step: previousStep }, '', newUrl)
          return previousStep
        })
      } else {
        // Se está no Step 1 e tenta voltar, previne sair da página
        // Preserva UTMs se existirem
        const newUrl = getPreservedParamsForStep(1)
        // Adiciona uma entrada no histórico para manter na página
        window.history.pushState({ step: 1 }, '', newUrl)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [currentStep])


  const saveAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-0 pb-8">
        {/* Logo no Topo - Menor e colada no topo (oculta no Step 1) */}
        {currentStep !== 1 && (
        <div className="w-full max-w-md mb-1 flex justify-center">
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
        </div>
        )}

        {/* Barra de Progresso - Aparece após Step 1 */}
        <ProgressBar currentStep={currentStep} showPercentage={currentStep === 7} />
        
        {/* Conteúdo */}
        <div className={`w-full ${currentStep === 1 ? 'max-w-full' : currentStep === 3 ? 'max-w-full sm:max-w-md' : 'max-w-md'} flex items-center justify-center`}>
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 && (
              <Step1 key={`step1-${currentStep}`} onNext={nextStep} />
            )}
            {currentStep === 2 && (
              <Step2 
                key="step2" 
                onNext={nextStep} 
                onAnswer={(value) => saveAnswer('timeToMake', value)}
              />
            )}
            {currentStep === 3 && (
              <Step3 key="step3" onNext={nextStep} />
            )}
            {currentStep === 4 && (
              <Step4 key="step4" onNext={nextStep} />
            )}
            {currentStep === 5 && (
              <Step5 
                key="step5" 
                onNext={nextStep}
                onAnswer={saveAnswer}
              />
            )}
            {currentStep === 6 && (
              <Step6 key="step6" onNext={nextStep} />
            )}
            {currentStep === 7 && (
              <Step7 key="step7" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default App



