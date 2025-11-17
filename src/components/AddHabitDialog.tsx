import { useState, useEffect } from 'react'
import { Habit, HabitIcon } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { FormStepIndicator } from './FormStepIndicator'

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddHabit: (habit: Omit<Habit, 'id' | 'currentProgress' | 'streak'>) => void
}

const iconOptions: { value: HabitIcon; Icon: React.ElementType; label: string }[] = [
  { value: 'droplet', Icon: Drop, label: 'Water' },
  { value: 'book', Icon: BookOpen, label: 'Reading' },
  { value: 'dumbbell', Icon: Barbell, label: 'Exercise' },
  { value: 'apple', Icon: AppleLogo, label: 'Nutrition' },
  { value: 'moon', Icon: MoonStars, label: 'Sleep' },
  { value: 'heart', Icon: HeartStraight, label: 'Meditation' },
]

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<HabitIcon>('droplet')
  const [targetCount, setTargetCount] = useState(8)
  const [nameError, setNameError] = useState('')
  const [targetError, setTargetError] = useState('')
  const [touched, setTouched] = useState({ name: false, target: false })

  useEffect(() => {
    if (!open) {
      setCurrentStep(1)
      setName('')
      setSelectedIcon('droplet')
      setTargetCount(8)
      setNameError('')
      setTargetError('')
      setTouched({ name: false, target: false })
    }
  }, [open])

  const validateName = (value: string) => {
    if (!value.trim()) {
      return 'Protocol name is required'
    }
    if (value.trim().length < 2) {
      return 'Protocol name must be at least 2 characters'
    }
    if (value.trim().length > 50) {
      return 'Protocol name must be less than 50 characters'
    }
    return ''
  }

  const validateTarget = (value: number) => {
    if (value < 1) {
      return 'Target must be at least 1'
    }
    if (value > 20) {
      return 'Target cannot exceed 20'
    }
    if (!Number.isInteger(value)) {
      return 'Target must be a whole number'
    }
    return ''
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (touched.name) {
      setNameError(validateName(value))
    }
  }

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }))
    setNameError(validateName(name))
  }

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setTargetCount(value)
    if (touched.target) {
      setTargetError(validateTarget(value))
    }
  }

  const handleTargetBlur = () => {
    setTouched((prev) => ({ ...prev, target: true }))
    setTargetError(validateTarget(targetCount))
  }

  const canProceedToStep2 = () => {
    const error = validateName(name)
    return !error
  }

  const canSubmit = () => {
    const nameErr = validateName(name)
    const targetErr = validateTarget(targetCount)
    return !nameErr && !targetErr
  }

  const handleNext = () => {
    if (currentStep === 1) {
      setTouched((prev) => ({ ...prev, name: true }))
      const error = validateName(name)
      setNameError(error)
      if (!error) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = () => {
    setTouched({ name: true, target: true })
    const nameErr = validateName(name)
    const targetErr = validateTarget(targetCount)
    
    setNameError(nameErr)
    setTargetError(targetErr)
    
    if (!nameErr && !targetErr) {
      onAddHabit({
        name: name.trim(),
        icon: selectedIcon,
        targetCount,
      })
      onOpenChange(false)
    }
  }

  const stepLabels = ['Name', 'Icon', 'Target']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] glass-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Deploy New Protocol
          </DialogTitle>
        </DialogHeader>

        <FormStepIndicator
          currentStep={currentStep}
          totalSteps={3}
          stepLabels={stepLabels}
          className="mt-6 mb-4"
        />

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <Label htmlFor="habit-name" className="text-foreground font-semibold">
                    Protocol Name
                  </Label>
                  <Input
                    id="habit-name"
                    placeholder="e.g., Hydration, Knowledge, Training"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    className={cn(
                      'glass-morphic border-border/50 focus:border-primary h-12 text-lg',
                      nameError && touched.name && 'border-destructive focus:border-destructive'
                    )}
                    aria-invalid={!!nameError && touched.name}
                    aria-describedby={nameError && touched.name ? 'name-error' : 'name-helper'}
                  />
                  {nameError && touched.name ? (
                    <p id="name-error" className="text-sm text-destructive font-medium" role="alert">
                      {nameError}
                    </p>
                  ) : (
                    <p id="name-helper" className="text-sm text-muted-foreground">
                      Choose a memorable name for your habit
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold">Interface Icon</Label>
                  <div className="grid grid-cols-3 gap-3" role="group" aria-label="Icon selection">
                    {iconOptions.map(({ value, Icon, label }, index) => (
                      <motion.button
                        key={value}
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedIcon(value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          selectedIcon === value
                            ? 'glass-card border-primary bg-primary/20 text-primary neon-glow'
                            : 'glass-morphic border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        )}
                        aria-label={`Select ${label} icon`}
                        aria-pressed={selectedIcon === value}
                      >
                        <Icon weight={selectedIcon === value ? 'fill' : 'regular'} className="w-8 h-8" aria-hidden="true" />
                        <span className="text-sm font-medium">{label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select an icon that represents your habit
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <Label htmlFor="target-count" className="text-foreground font-semibold">
                    Daily Target
                  </Label>
                  <Input
                    id="target-count"
                    type="number"
                    min="1"
                    max="20"
                    value={targetCount}
                    onChange={handleTargetChange}
                    onBlur={handleTargetBlur}
                    className={cn(
                      'glass-morphic border-border/50 focus:border-primary h-12 text-lg',
                      targetError && touched.target && 'border-destructive focus:border-destructive'
                    )}
                    aria-invalid={!!targetError && touched.target}
                    aria-describedby={targetError && touched.target ? 'target-error' : 'target-helper'}
                  />
                  {targetError && touched.target ? (
                    <p id="target-error" className="text-sm text-destructive font-medium" role="alert">
                      {targetError}
                    </p>
                  ) : (
                    <p id="target-helper" className="text-sm text-muted-foreground">
                      Set how many times you'll complete this habit each day (1-20)
                    </p>
                  )}
                </div>

                <div className="glass-morphic rounded-lg p-4 border border-border/50 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Summary</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><span className="font-medium text-foreground">Name:</span> {name || 'Not set'}</p>
                    <p><span className="font-medium text-foreground">Icon:</span> {iconOptions.find(i => i.value === selectedIcon)?.label}</p>
                    <p><span className="font-medium text-foreground">Daily Target:</span> {targetCount}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="glass-morphic border-border/50 hover:border-destructive/50 hover:text-destructive"
          >
            Abort
          </Button>

          <div className="flex gap-2 ml-auto">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="glass-morphic border-border/50 hover:border-primary/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !canProceedToStep2()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Initialize
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
