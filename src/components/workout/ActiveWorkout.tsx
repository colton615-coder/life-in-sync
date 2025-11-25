import { useState, useEffect, useCallback, useRef } from 'react'
import { WorkoutPlan } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PauseCircle, PlayCircle, SkipForward, XCircle, Clock, Heart, Timer } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PowerSlider } from '@/components/ui/PowerSlider'

interface ActiveWorkoutProps {
  workout: WorkoutPlan
  onFinish: (completed: boolean) => void
}

export function ActiveWorkout({ workout, onFinish }: ActiveWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  
  // Persistent Rest Timer
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  const currentExercise = workout.exercises[currentExerciseIndex]
  const [timeLeft, setTimeLeft] = useState(currentExercise.duration || 0)
  const nextExercise = workout.exercises[currentExerciseIndex + 1]

  const goToNextExercise = useCallback(() => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setIsResting(false) // Cancel explicit rest mode if moving manually
    } else {
      onFinish(true)
    }
  }, [currentExerciseIndex, workout.exercises, onFinish])

  // Workout Timer Logic
  useEffect(() => {
    if (isPaused || isPauseModalOpen) return

    let timer: NodeJS.Timeout

    if (currentExercise.type === 'time' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
             goToNextExercise()
             return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [timeLeft, isPaused, isPauseModalOpen, currentExercise.type, goToNextExercise])

  // Rest Timer Logic
  useEffect(() => {
      let timer: NodeJS.Timeout
      if (isResting) {
          timer = setInterval(() => {
              setRestTimer(prev => prev + 1)
          }, 1000)
      } else {
          setRestTimer(0)
      }
      return () => clearInterval(timer)
  }, [isResting])

  // Reset local state on exercise change
  useEffect(() => {
    setTimeLeft(workout.exercises[currentExerciseIndex].duration || 0)
    // If previous was a set, maybe auto-start rest? For now manual.
  }, [currentExerciseIndex, workout.exercises])

  const handleSkip = () => {
    goToNextExercise()
  }
  
  const handlePause = () => {
    setIsPaused(true)
    setIsPauseModalOpen(true)
  }

  const handleResume = () => {
    setIsPauseModalOpen(false)
    setIsPaused(false)
  }

  const handleEndWorkout = () => {
    setIsPauseModalOpen(false)
    onFinish(false)
  }
  
  const handleCompleteSet = () => {
      // Trigger rest timer visual or just move next
      // Ideally, we'd show a "Rest" overlay, but for "Flow State" we just move to next
      // If the NEXT exercise is explicitly "Rest", it will handle itself via 'time' logic above.
      // If the NEXT exercise is another Set, user might want to rest.
      // For now, Kinetic Engine means speed.
      goToNextExercise()
  }

  const timerProgress = currentExercise.duration ? (timeLeft / currentExercise.duration) * 100 : 0
  
  const isRepBased = currentExercise.type === 'reps'
  const isRestType = currentExercise.category.toLowerCase().includes('rest')

  // Pure Black UI Helpers
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Pure Black Background */}
      <div className="fixed inset-0 w-full h-full bg-black text-white" />

      <div className="relative z-10 flex flex-col h-full min-h-[100dvh] pt-6 pb-6 px-4 font-mono">

        {/* Top Bar: Progress & Status */}
        <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                    Exercise {currentExerciseIndex + 1} / {workout.exercises.length}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-white line-clamp-2 max-w-[70vw]">
                    {currentExercise.name.toUpperCase()}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] rounded-sm border-zinc-800 text-zinc-400 uppercase">
                        {currentExercise.category}
                    </Badge>
                     {isResting && (
                         <Badge variant="default" className="text-[10px] rounded-sm bg-emerald-900 text-emerald-400 border-none animate-pulse">
                            RESTING: {formatTime(restTimer)}
                         </Badge>
                     )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                 <button onClick={handlePause} className="p-2 rounded-full hover:bg-zinc-900 active:scale-95 transition-all">
                     <PauseCircle size={24} className="text-zinc-500" />
                 </button>
            </div>
        </div>

        {/* Center Stage: The Metric */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentExerciseIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center"
                >
                    {isRepBased ? (
                        <>
                             <span className="text-[120px] leading-none font-bold tracking-tighter text-white tabular-nums">
                                 {currentExercise.reps}
                             </span>
                             <span className="text-zinc-600 text-sm uppercase tracking-[0.2em] mt-2">Target Reps</span>
                             {currentExercise.sets && (
                                 <span className="text-emerald-500 text-xs uppercase tracking-widest mt-4 border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 rounded-full">
                                     Set {currentExercise.sets}
                                 </span>
                             )}
                        </>
                    ) : (
                        <>
                            <div className="relative flex items-center justify-center">
                                {/* Timer Circle Background */}
                                <svg className="w-64 h-64 transform -rotate-90">
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke="#18181b" // zinc-900
                                        strokeWidth="4"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke={isRestType ? "#10b981" : "#3b82f6"} // emerald-500 or blue-500
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={2 * Math.PI * 120}
                                        strokeDashoffset={(2 * Math.PI * 120) * (1 - (timerProgress / 100))}
                                        className="transition-all duration-1000 ease-linear"
                                        style={{ strokeLinecap: 'round' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                     <span className="text-6xl font-bold tracking-tighter text-white tabular-nums">
                                         {timeLeft}
                                     </span>
                                     <span className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Seconds</span>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
             </AnimatePresence>

             {/* Instructions / Details */}
             <div className="mt-12 w-full max-w-sm px-4 border-l-2 border-zinc-900 pl-4">
                 <p className="text-zinc-400 text-xs leading-relaxed">
                     {currentExercise.instructions.summary}
                 </p>
                 <div className="flex gap-2 mt-3">
                     <div className="flex items-center gap-1.5 text-zinc-600">
                         <Heart size={14} weight="fill" />
                         <span className="text-[10px] uppercase">Cardio</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-zinc-600">
                         <Timer size={14} weight="fill" />
                         <span className="text-[10px] uppercase">Tempo: 2-0-2</span>
                     </div>
                 </div>
             </div>
        </div>

        {/* Bottom Actions: The Kinetic Interface */}
        <div className="w-full max-w-md mx-auto space-y-4">
             {/* Next Up Preview */}
             {nextExercise && (
                 <div className="flex items-center justify-between px-2 text-zinc-600 text-xs uppercase tracking-wider mb-2">
                     <span>Up Next</span>
                     <span>{nextExercise.name}</span>
                 </div>
             )}

             {/* Primary Action */}
             {isRepBased ? (
                 <PowerSlider
                     onComplete={handleCompleteSet}
                     label="SWIPE TO COMPLETE"
                     className="h-16" // Taller for easier thumb access
                 />
             ) : (
                 <div className="grid grid-cols-2 gap-4">
                     <Button
                         variant="outline"
                         onClick={handleSkip}
                         className="h-14 border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900 hover:text-white uppercase tracking-widest text-xs"
                     >
                         Skip
                     </Button>
                     <Button
                         variant="outline"
                         onClick={handlePause}
                         className="h-14 border-zinc-800 bg-black text-zinc-400 hover:bg-zinc-900 hover:text-white uppercase tracking-widest text-xs"
                     >
                         Pause
                     </Button>
                 </div>
             )}
        </div>
      </div>
      
       {/* Pause Modal - Keeping Neumorphic for contrast or switch to flat black? Staying consistent with system modals for now, but darkening. */}
       <Dialog open={isPauseModalOpen} onOpenChange={(open) => !open && handleResume()}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl font-mono uppercase tracking-tight">System Paused</DialogTitle>
            <DialogDescription className="text-zinc-500">Recovery protocols active.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
             <Button
              onClick={handleResume}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 uppercase tracking-widest text-xs font-bold"
            >
              <PlayCircle className="mr-2 h-4 w-4" />Resume
            </Button>
            <Button
              onClick={handleEndWorkout}
              variant="outline"
              className="w-full h-12 border-red-900/50 text-red-500 hover:bg-red-950/30 uppercase tracking-widest text-xs font-bold"
            >
              <XCircle className="mr-2 h-4 w-4" />Abort Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
