import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Step1 from './components/Step1'
import Step2 from './components/Step2'
import Step3 from './components/Step3'
import Step4 from './components/Step4'
import Step5 from './components/Step5'
import Step6 from './components/Step6'
import Step7 from './components/Step7'

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({
    timeToMake: null,
    freeTime: null,
    aiUsage: null,
    internetAccess: null,
  })

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
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-2 pb-8">
        {/* Logo no Topo - Menor e colada no topo */}
        <div className="w-full max-w-md mb-2 flex justify-center">
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



