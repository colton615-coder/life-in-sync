import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkoutPlan, CompletedExercise, WorkoutSet, PersonalRecord } from '@/lib/types'
import { generateSessionQueue, SessionStep, WorkStep } from '@/lib/workout/session-queue'
import { Button } from '@/components/ui/button'
import { Play, Pause, X, Check, Timer, SkipForward, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useGymSound } from '@/hooks/use-gym-sound'
import { useKV } from '@/hooks/use-kv'
import { updatePersonalRecords } from '@/lib/workout/pr-manager'
import { toast } from 'sonner'

interface ActiveWorkoutProps {
  workout: WorkoutPlan
  onFinish: (completed: boolean) => void
}

export function ActiveWorkout({ workout, onFinish }: ActiveWorkoutProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [queue] = useState<SessionStep[]>(() => generateSessionQueue(workout))
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentStep = queue[currentIndex]

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  // Data Collection (accumulate results as we go)
  const [completedExercises, setCompletedExercises] = useState<Map<string, WorkoutSet[]>>(new Map())
  const [personalRecords, setPersonalRecords] = useKV<PersonalRecord[]>('personal-records', [])

  const { playBuzzer, playSuccess } = useGymSound()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Initialize step
  useEffect(() => {
    if (!currentStep) return

    setIsPaused(false)

    if (currentStep.type === 'rest') {
      setTimeRemaining(currentStep.duration)
    } else if (currentStep.type === 'work' && currentStep.target.type === 'time') {
      setTimeRemaining(currentStep.target.value)
    } else {
      setTimeRemaining(0) // Rep based doesn't enforce a countdown
    }
  }, [currentIndex, currentStep])

  // Timer Tick
  useEffect(() => {
    if (isPaused || !currentStep) return

    const shouldTick =
      currentStep.type === 'rest' ||
      (currentStep.type === 'work' && currentStep.target.type === 'time')

    if (shouldTick && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
             // Timer finished
             handleTimerComplete()
             return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, timeRemaining, currentStep])

  // ---------------------------------------------------------------------------
  // Logic
  // ---------------------------------------------------------------------------

  const handleTimerComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    playBuzzer()

    // Auto-advance rest, but maybe wait for user on Work?
    // Requirement: "Auto-advance from Exercise A -> Rest -> Exercise B"
    // So if timer finishes, we advance.
    advanceQueue()
  }

  const advanceQueue = () => {
    // Save data if it was a work step
    if (currentStep.type === 'work') {
      logSetCompletion(currentStep)
    }

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      finishSession()
    }
  }

  const logSetCompletion = (step: WorkStep) => {
    const newSet: WorkoutSet = {
      id: crypto.randomUUID(),
      completed: true,
      reps: step.target.type === 'reps' ? step.target.value : undefined,
      duration: step.target.type === 'time' ? step.target.value : undefined,
      weight: step.target.weight,
      completedAt: new Date().toISOString()
    }

    setCompletedExercises(prev => {
      const map = new Map(prev)
      const existing = map.get(step.exercise.id) || []
      const updatedSets = [...existing, newSet]
      map.set(step.exercise.id, updatedSets)
      return map
    })

    // Update PRs
    const updatedRecs = updatePersonalRecords(
      personalRecords || [],
      step.exercise.id,
      step.exercise.name,
      [newSet], // Pass as a single-set update for now, or accumulate?
                // updatePersonalRecords usually takes all sets for an exercise to calculate volume/1RM.
                // We should probably grab the existing sets from state + this new one.
      new Date().toISOString()
    )

    // Check if we need to pass the *cumulative* sets for this exercise
    // Since we just updated the map in the functional update, we don't have the new map yet in this scope.
    // Let's do it safely:
    const currentSetsForExercise = completedExercises.get(step.exercise.id) || []
    const allSets = [...currentSetsForExercise, newSet]

    const newRecs = updatePersonalRecords(
        personalRecords || [],
        step.exercise.id,
        step.exercise.name,
        allSets,
        new Date().toISOString()
    )

    if (JSON.stringify(newRecs) !== JSON.stringify(personalRecords)) {
        setPersonalRecords(newRecs)
        toast.success("New Personal Record!")
    }
  }

  const finishSession = () => {
    playSuccess()
    // Transform Map back to CompletedExercise array if needed by parent
    // The parent currently expects just a boolean, but handles data saving internally
    // Wait, the parent (Workouts.tsx) handles data saving based on what *was* in the plan?
    // No, Workouts.tsx uses 'activeWorkoutPlan' state.
    // We should probably pass back the actual data, but the current interface is just onFinish(boolean).
    // Given the "Refactor" scope, I should probably rely on the assumption that if the user finished the session,
    // they did the work as defined in the setup.
    // NOTE: Workouts.tsx logic assumes if `completed` is true, it counts all exercises.
    onFinish(true)
  }

  const skipRest = () => {
    if (currentStep.type === 'rest') {
      advanceQueue()
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------

  const getProgress = () => {
    if (currentStep.type === 'rest') {
       return ((currentStep.duration - timeRemaining) / currentStep.duration) * 100
    }
    if (currentStep.type === 'work' && currentStep.target.type === 'time') {
       return ((currentStep.target.value - timeRemaining) / currentStep.target.value) * 100
    }
    return 0
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  if (!currentStep) return null

  const isRest = currentStep.type === 'rest'
  const isWork = currentStep.type === 'work'
  const isTimeBased = isRest || (isWork && currentStep.target.type === 'time')

  // Theme Colors
  const accentColor = isRest ? 'text-blue-500' : 'text-amber-500'
  const ringColor = isRest ? 'stroke-blue-500' : 'stroke-amber-500'
  const shadowColor = isRest ? 'shadow-blue-500/20' : 'shadow-amber-500/20'

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-[9999] flex flex-col text-white overflow-hidden font-sans">

      {/* 1. Header (Instructional) */}
      <div className="pt-safe px-6 pb-4 text-center z-10">
        <div className="flex justify-between items-start absolute top-4 left-4 right-4 z-20">
             <Button variant="ghost" size="icon" onClick={() => onFinish(false)} className="text-white/30 hover:text-white">
                <X size={24} />
             </Button>
             <div className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono tracking-widest uppercase text-white/50">
                Step {currentIndex + 1} / {queue.length}
             </div>
        </div>

        <div className="mt-12 space-y-2">
            {isWork && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`header-${currentStep.id}`}
                >
                    <h1 className="text-2xl font-bold tracking-tight">{currentStep.exercise.name}</h1>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        {currentStep.exercise.instructions?.summary || "Focus on form and controlled movements."}
                    </p>
                </motion.div>
            )}
            {isRest && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-blue-400 font-bold text-xl tracking-wide uppercase"
                >
                    Rest & Prepare
                </motion.div>
            )}
        </div>
      </div>

      {/* 2. Center (Timer/Counter) */}
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
             {isTimeBased ? (
                 <motion.div
                    key="timer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative w-64 h-64 flex items-center justify-center"
                 >
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full -rotate-90 transform">
                        {/* Background Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            className="stroke-white/5"
                            strokeWidth="12"
                        />
                        {/* Progress Ring */}
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            className={cn("transition-all duration-1000 ease-linear drop-shadow-lg", ringColor)}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="283" // 2 * pi * 45(%) approx? No, viewbox is unitless usually.
                                                  // Let's rely on standard pathLength 1 for simpler math if supported,
                                                  // but standard SVG math: r=45% of 256px = ~115px. C = 2*pi*115 = 722.
                                                  // Actually simpler to just use pathLength="100"
                            pathLength="100"
                            strokeDashoffset={100 - getProgress()} // Inverse logic for countdown?
                        />
                    </svg>

                    {/* Digital Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-7xl font-bold font-mono tracking-tighter tabular-nums drop-shadow-2xl", accentColor)}>
                            {isRest || currentStep.target.type === 'time' ? timeRemaining : ''}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-white/40 mt-2 font-semibold">Seconds</span>
                    </div>
                 </motion.div>
             ) : (
                 <motion.div
                    key="reps"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center space-y-4"
                 >
                    <div className="text-8xl font-bold font-mono text-white tracking-tighter drop-shadow-2xl">
                        {(currentStep as WorkStep).target.value}
                    </div>
                    <div className="text-sm uppercase tracking-widest text-amber-500 font-bold border border-amber-500/30 px-4 py-1 rounded-full bg-amber-500/10 inline-block">
                        Target Reps
                    </div>
                    {((currentStep as WorkStep).target.weight || 0) > 0 && (
                        <div className="text-2xl font-bold text-white/80 flex items-center justify-center gap-2">
                             <span className="text-white/40">@</span> {(currentStep as WorkStep).target.weight} <span className="text-base text-white/40">lbs</span>
                        </div>
                    )}
                 </motion.div>
             )}
        </AnimatePresence>
      </div>

      {/* 3. Footer Area */}
      <div className="pb-safe w-full bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 space-y-6 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,1)]">

        {/* Next Up Card */}
        <div className="neumorphic-inset bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5">
             <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border",
                    currentStep.nextUp?.type === 'rest'
                        ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                        : "bg-purple-500/20 border-purple-500/30 text-purple-400"
                )}>
                    {currentStep.nextUp?.type === 'rest' ? <Timer size={24} weight="duotone"/> : <Play size={24} weight="fill"/>}
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Next Up</div>
                    <div className="text-base font-bold text-white">{currentStep.nextUp?.name}</div>
                </div>
             </div>

             {currentStep.nextUp?.value ? (
                 <div className="text-right">
                    <div className="text-xl font-mono font-bold text-white/80">
                        {currentStep.nextUp.value}
                    </div>
                    <div className="text-[10px] text-white/30 uppercase">
                        {currentStep.nextUp.type === 'time' || currentStep.nextUp.type === 'rest' ? 'Sec' : 'Reps'}
                    </div>
                 </div>
             ) : null}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
            {isTimeBased ? (
                <Button
                    onClick={togglePause}
                    variant={isPaused ? "default" : "secondary"}
                    className={cn(
                        "h-14 rounded-2xl text-lg font-bold shadow-lg transition-all",
                        isPaused ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                >
                    {isPaused ? "Resume" : "Pause"}
                </Button>
            ) : (
                <div /> /* Spacer for alignment if no pause needed for reps */
            )}

            {/* Action Button */}
            {isRest ? (
                <Button
                    onClick={skipRest}
                    className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold shadow-lg shadow-blue-900/20 col-span-1"
                >
                    Skip Rest
                </Button>
            ) : (
                <Button
                    onClick={advanceQueue}
                    className={cn(
                        "h-14 rounded-2xl text-white text-lg font-bold shadow-lg transition-all",
                        isTimeBased ? "bg-white/10 hover:bg-white/20 col-span-1" : "bg-primary hover:bg-primary/90 text-black col-span-2 button-glow"
                    )}
                >
                    {isTimeBased ? "Skip" : (
                        <span className="flex items-center gap-2">
                            <Check weight="bold" /> Set Complete
                        </span>
                    )}
                </Button>
            )}
        </div>

      </div>
    </div>
  )
}
