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
    <div className="min-h-screen relative">
      {/* Background com partículas */}
      <div className="particles-bg" />
      
      {/* Logo Fixa no Topo */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <img 
          src="/images/HACKER MILLON PNG.png" 
          alt="24Games Logo" 
          className="h-12 w-auto object-contain mx-auto"
        />
      </div>
      
      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8 pt-20">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
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



