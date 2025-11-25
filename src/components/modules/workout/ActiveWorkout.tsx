import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkoutPlan, Exercise, CompletedExercise, WorkoutSet, PersonalRecord } from '@/lib/types'
import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, X, Check, Timer, Barbell, ArrowLeft, ArrowRight, SkipForward } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { GlassKeypad } from '@/components/ui/GlassKeypad'
import { PowerSlider } from '@/components/ui/PowerSlider'
import { useKV } from '@/hooks/use-kv'
import { updatePersonalRecords, getPersonalRecord } from '@/lib/workout/pr-manager'
import { toast } from 'sonner'

interface ActiveWorkoutProps {
  workout: WorkoutPlan
  onFinish: (completed: boolean) => void
}

type SetFocus = 'weight' | 'reps' | null

export function ActiveWorkout({ workout, onFinish }: ActiveWorkoutProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([])

  // Initialize granular sets for the current exercise
  // We map the abstract "3 sets" to concrete objects
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([])

  const [startTime] = useState(Date.now())
  const [duration, setDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const [keypadOpen, setKeypadOpen] = useState(false)
  const [keypadValue, setKeypadValue] = useState('')
  const [keypadFocus, setKeypadFocus] = useState<{setIndex: number, field: SetFocus} | null>(null)

  const [restTimer, setRestTimer] = useState(0)
  const [restActive, setRestActive] = useState(false)

  const [personalRecords, setPersonalRecords] = useKV<PersonalRecord[]>('personal-records', [])
  const [currentPR, setCurrentPR] = useState<PersonalRecord | undefined>(undefined)

  const activeExercise = workout.exercises[activeExerciseIndex]

  // Timer
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, isPaused])

  // Rest Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (restActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setRestActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [restActive, restTimer])

  // Initialize sets when exercise changes
  useEffect(() => {
    if (!activeExercise) return

    // Check if we already have data for this exercise (e.g. if we went back)
    const existingData = completedExercises.find(e => e.exerciseId === activeExercise.id)

    if (existingData) {
      setCurrentSets(existingData.sets)
    } else {
      const initialSets: WorkoutSet[] = Array.from({ length: activeExercise.sets || 3 }).map(() => ({
        id: crypto.randomUUID(),
        reps: activeExercise.reps || 0,
        weight: activeExercise.weight || 0,
        completed: false
      }))
      setCurrentSets(initialSets)
    }

    // Load PR
    setCurrentPR(getPersonalRecord(personalRecords || [], activeExercise.name))

  }, [activeExerciseIndex, activeExercise, completedExercises, personalRecords])

  const handleSetUpdate = (index: number, field: 'weight' | 'reps', value: number) => {
    const newSets = [...currentSets]
    newSets[index] = { ...newSets[index], [field]: value }
    setCurrentSets(newSets)
    updateCompletedExercises(newSets)
  }

  const updateCompletedExercises = (sets: WorkoutSet[]) => {
    setCompletedExercises(prev => {
      const existing = prev.findIndex(e => e.exerciseId === activeExercise.id)
      const newEntry: CompletedExercise = {
        exerciseId: activeExercise.id,
        name: activeExercise.name,
        sets
      }

      if (existing !== -1) {
        const copy = [...prev]
        copy[existing] = newEntry
        return copy
      } else {
        return [...prev, newEntry]
      }
    })
  }

  const completeSet = (index: number) => {
    const newSets = [...currentSets]
    newSets[index] = { ...newSets[index], completed: true, completedAt: new Date().toISOString() }
    setCurrentSets(newSets)
    updateCompletedExercises(newSets)

    // Start Rest Timer (90s default)
    setRestTimer(90)
    setRestActive(true)

    // Check for PRs immediately
    const updatedRecs = updatePersonalRecords(
        personalRecords || [],
        activeExercise.id,
        activeExercise.name,
        newSets,
        new Date().toISOString()
    )
    if (JSON.stringify(updatedRecs) !== JSON.stringify(personalRecords)) {
        setPersonalRecords(updatedRecs)
        toast.success("New Personal Record!")
    }
  }

  const openKeypad = (index: number, field: SetFocus) => {
    const set = currentSets[index]
    setKeypadFocus({ setIndex: index, field })
    setKeypadValue(field === 'weight' ? (set.weight || 0).toString() : (set.reps || 0).toString())
    setKeypadOpen(true)
  }

  const handleKeypadSubmit = (val: string) => {
    if (keypadFocus) {
      handleSetUpdate(keypadFocus.setIndex, keypadFocus.field!, parseFloat(val))
    }
    setKeypadOpen(false)
  }

  const nextExercise = () => {
    setRestActive(false)
    if (activeExerciseIndex < workout.exercises.length - 1) {
      setActiveExerciseIndex(prev => prev + 1)
    } else {
      onFinish(true)
    }
  }

  const prevExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex(prev => prev - 1)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white pb-safe">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={() => onFinish(false)} className="text-white/50 hover:text-white">
          <X size={24} />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-mono text-primary font-bold tracking-widest uppercase">
            {activeExerciseIndex + 1} / {workout.exercises.length}
          </span>
          <span className="text-sm font-bold tracking-wide">{formatTime(duration)}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className={cn("text-white/50 hover:text-white", isPaused && "text-amber-500")}>
          {isPaused ? <Play weight="fill" size={24} /> : <Pause weight="fill" size={24} />}
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Exercise Header */}
        <div className="space-y-2">
           <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold leading-tight">{activeExercise.name}</h2>
              {currentPR && (
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider">PR</span>
                      <span className="text-sm font-mono font-bold text-white">{currentPR.oneRepMax} lbs</span>
                  </div>
              )}
           </div>

           <div className="flex gap-2">
             {activeExercise.muscleGroups.map(m => (
               <span key={m} className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/60 uppercase tracking-wide">
                 {m}
               </span>
             ))}
           </div>
        </div>

        {/* Sets Grid */}
        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-2 text-[10px] font-mono text-white/40 uppercase tracking-wider">
            <span>Set</span>
            <span className="text-center">Lbs</span>
            <span className="text-center">Reps</span>
            <span>Status</span>
          </div>

          <AnimatePresence>
            {currentSets.map((set, idx) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "grid grid-cols-[auto_1fr_1fr_auto] items-center gap-3 p-3 rounded-xl border transition-all",
                  set.completed
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-sm font-bold font-mono text-white/70">
                  {idx + 1}
                </div>

                <button
                  onClick={() => openKeypad(idx, 'weight')}
                  disabled={set.completed}
                  className={cn(
                    "h-12 rounded-lg bg-black/40 border border-transparent hover:border-white/20 flex items-center justify-center text-xl font-mono font-bold transition-all",
                    set.completed && "opacity-50"
                  )}
                >
                  {set.weight}
                </button>

                <button
                  onClick={() => openKeypad(idx, 'reps')}
                  disabled={set.completed}
                  className={cn(
                    "h-12 rounded-lg bg-black/40 border border-transparent hover:border-white/20 flex items-center justify-center text-xl font-mono font-bold transition-all",
                    set.completed && "opacity-50"
                  )}
                >
                  {set.reps}
                </button>

                <div className="w-8 flex justify-end">
                   {set.completed && <Check weight="bold" className="text-primary" size={20} />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Current Set Interaction */}
        <div className="pt-4">
           {!currentSets.every(s => s.completed) ? (
             <PowerSlider
               onConfirm={() => {
                 const firstIncomplete = currentSets.findIndex(s => !s.completed)
                 if (firstIncomplete !== -1) completeSet(firstIncomplete)
               }}
               label={`LOG SET ${currentSets.findIndex(s => !s.completed) + 1}`}
             />
           ) : (
             <Button
                onClick={nextExercise}
                className="w-full h-14 text-lg font-bold button-glow"
             >
                Next Exercise <ArrowRight className="ml-2" weight="bold" />
             </Button>
           )}
        </div>
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restActive && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-primary/20 p-6 pb-safe z-40 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-widest">Resting</span>
                <div className="text-4xl font-mono font-bold text-white tabular-nums">
                  {formatTime(restTimer)}
                </div>
              </div>
              <div className="flex gap-3">
                 <Button variant="outline" size="sm" onClick={() => setRestTimer(prev => prev + 30)}>+30s</Button>
                 <Button onClick={() => setRestActive(false)}>Skip</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Keypad */}
      <GlassKeypad
        open={keypadOpen}
        onClose={() => setKeypadOpen(false)}
        onValueChange={(val) => {
            setKeypadValue(val)
            if (keypadFocus) {
                 // Real-time update
                 handleSetUpdate(keypadFocus.setIndex, keypadFocus.field!, parseFloat(val) || 0)
            }
        }}
        value={keypadValue}
        label={keypadFocus?.field?.toUpperCase()}
        suffix={keypadFocus?.field === 'weight' ? 'lbs' : 'reps'}
      />

      {/* Navigation Footer */}
      {!restActive && !keypadOpen && (
        <div className="p-4 bg-black/80 backdrop-blur-lg border-t border-white/10 flex justify-between items-center">
            <Button variant="ghost" disabled={activeExerciseIndex === 0} onClick={prevExercise}>
               <ArrowLeft /> Prev
            </Button>

            <div className="flex gap-1">
               {workout.exercises.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i === activeExerciseIndex ? "bg-primary" : "bg-white/20"
                    )}
                  />
               ))}
            </div>

            <Button variant="ghost" onClick={nextExercise}>
               Skip <SkipForward />
            </Button>
        </div>
      )}
    </div>
  )
}
