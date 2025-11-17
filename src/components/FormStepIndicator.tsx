import { cn } from '@/lib/utils'
import { Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface FormStepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
  className?: string
}

export function FormStepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  className,
}: FormStepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className={cn('w-full', className)} role="navigation" aria-label="Form progress">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
        <p className="text-sm font-medium text-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step) => {
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep
          const label = stepLabels?.[step - 1]

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    isCompleted &&
                      'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20',
                    isCurrent &&
                      'border-primary bg-primary/10 text-primary animate-glow-pulse',
                    !isCompleted &&
                      !isCurrent &&
                      'border-border bg-card text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={
                    label
                      ? `Step ${step}: ${label}`
                      : `Step ${step} of ${totalSteps}`
                  }
                >
                  {isCompleted ? (
                    <Check weight="bold" className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <span className="font-semibold text-sm">{step}</span>
                  )}
                </motion.div>

                {label && (
                  <span
                    className={cn(
                      'mt-2 text-xs text-center transition-colors',
                      isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                )}
              </div>

              {step < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Currently on step {currentStep} of {totalSteps}
        {stepLabels?.[currentStep - 1] && `: ${stepLabels[currentStep - 1]}`}
      </div>
    </div>
  )
}
