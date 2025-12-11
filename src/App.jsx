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

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

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
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({
    timeToMake: null,
    freeTime: null,
    aiUsage: null,
    internetAccess: null,
  })

  // Adiciona entrada no histórico quando muda de step
  useEffect(() => {
    if (currentStep > 1) {
      // Adiciona uma entrada no histórico do navegador
      window.history.pushState({ step: currentStep }, '', `?step=${currentStep}`)
    }
  }, [currentStep])

  // Gerencia o botão voltar do navegador
  useEffect(() => {
    const handlePopState = (event) => {
      // Se está no Step 7 e tenta voltar, redireciona para /back
      if (currentStep === 7) {
        window.location.href = '/back'
        return
      }

      // Se não está no Step 7, volta para o step anterior
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1)
      } else {
        // Se está no Step 1 e tenta voltar, previne o comportamento padrão
        // (não deixa sair da página)
        event.preventDefault()
        window.history.pushState({ step: 1 }, '', window.location.pathname)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [currentStep])

  const nextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  const saveAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-0 pb-8">
        {/* Logo no Topo - Menor e colada no topo */}
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

        {/* Barra de Progresso - Aparece após Step 1 */}
        <ProgressBar currentStep={currentStep} showPercentage={currentStep === 7} />
        
        {/* Conteúdo */}
        <div className={`w-full ${currentStep === 3 ? 'max-w-full sm:max-w-md' : 'max-w-md'} flex items-center justify-center`}>
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 && (
              <Step1 key="step1" onNext={nextStep} />
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



