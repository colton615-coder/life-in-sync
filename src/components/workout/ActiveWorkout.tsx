import { useState, useEffect } from 'react'
import { WorkoutPlan, Exercise } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PauseCircle, PlayCircle, SkipForward, XCircle, Check, Flame, Target, Wind, Clock } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ActiveWorkoutProps {
  workout: WorkoutPlan
  onFinish: (completed: boolean) => void
}

export function ActiveWorkout({ workout, onFinish }: ActiveWorkoutProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  
  const currentExercise = workout.exercises[currentExerciseIndex]
  const [timeLeft, setTimeLeft] = useState(currentExercise.duration || 0)
  const nextExercise = workout.exercises[currentExerciseIndex + 1]

  useEffect(() => {
    if (isPaused || isPauseModalOpen || currentExercise.type !== 'time') return

    if (timeLeft <= 0) {
        goToNextExercise()
        return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
   
  }, [timeLeft, isPaused, isPauseModalOpen, currentExercise.type, currentExerciseIndex])

  useEffect(() => {
    setTimeLeft(workout.exercises[currentExerciseIndex].duration || 0)
  }, [currentExerciseIndex, workout.exercises])

  const goToNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    } else {
      onFinish(true)
    }
  }

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
      goToNextExercise()
  }

  const timerProgress = currentExercise.duration ? (timeLeft / currentExercise.duration) * 100 : 0
  const workoutProgress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100
  
  const isRepBased = currentExercise.type === 'reps'

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase()
    if (lowerCategory.includes('warm')) return { 
      gradient: 'from-orange-500 to-amber-500', 
      bg: 'bg-orange-500/20', 
      text: 'text-orange-500', 
      color: 'rgb(249, 115, 22)', 
      icon: Flame 
    }
    if (lowerCategory.includes('cool') || lowerCategory.includes('stretch')) return { 
      gradient: 'from-blue-500 to-cyan-500', 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-500', 
      color: 'rgb(59, 130, 246)', 
      icon: Wind 
    }
    if (lowerCategory.includes('rest')) return { 
      gradient: 'from-purple-500 to-purple-600', 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-500', 
      color: 'rgb(168, 85, 247)', 
      icon: Clock 
    }
    return { 
      gradient: 'from-green-500 to-emerald-500', 
      bg: 'bg-green-500/20', 
      text: 'text-green-500', 
      color: 'rgb(34, 197, 94)', 
      icon: Target 
    }
  }

  const categoryStyle = getCategoryColor(currentExercise.category)
  const CategoryIcon = categoryStyle.icon

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-background via-background/95 to-primary/5" />

      <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-screen py-8 text-center px-4">
        <header className="flex flex-col items-center w-full space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative inline-flex items-center justify-center"
          >
            <svg className="w-14 h-14 transform -rotate-90">
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                stroke="hsl(var(--muted) / 0.2)" 
                strokeWidth="4" 
                fill="transparent" 
              />
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                stroke={categoryStyle.color}
                strokeWidth="4" 
                fill="transparent"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={(2 * Math.PI * 24) * (1 - (workoutProgress / 100))}
                className="transition-all duration-500"
                style={{ strokeLinecap: 'round' }}
              />
            </svg>
            <span className="absolute text-xs font-bold">{currentExerciseIndex + 1}/{workout.exercises.length}</span>
          </motion.div>

          <div className="flex justify-between items-center w-full max-w-2xl">
            <div className="flex-1 text-left">
                 <Badge className={cn("shadow-lg", categoryStyle.bg, categoryStyle.text, "border border-current/30")}>
                   <CategoryIcon className="h-3 w-3 mr-1" />
                   {currentExercise.category}
                 </Badge>
                 {isRepBased && currentExercise.sets && (
                   <p className="text-xs font-bold text-muted-foreground mt-1">
                     Set {currentExercise.sets}
                   </p>
                 )}
            </div>
            <motion.h1 
              key={currentExerciseIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-bold text-center flex-shrink-0 mx-4 bg-gradient-to-r bg-clip-text text-transparent", 
                categoryStyle.gradient
              )}
            >
              {currentExercise.name}
            </motion.h1>
            <div className="flex-1" />
          </div>
        </header>

        <div className="flex flex-col items-center gap-6 w-full max-w-2xl my-6">
          {currentExercise.asset && (
            <motion.div
              key={`image-${currentExerciseIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-lg"
            >
              <img 
                src={currentExercise.asset} 
                alt={currentExercise.name}
                className="w-full h-64 object-cover"
              />
            </motion.div>
          )}
          
          <motion.div
            key={`instructions-${currentExerciseIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full px-4 text-center space-y-3"
          >
            <p className="text-sm sm:text-base text-foreground/90">
              {currentExercise.instructions.summary}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentExercise.instructions.keyPoints.slice(0, 3).map((point, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {point}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {isRepBased ? (
            <motion.div 
              key={currentExerciseIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex flex-col items-center justify-center my-8"
            >
                <div className={cn(
                  "font-mono text-8xl sm:text-9xl font-bold bg-gradient-to-r bg-clip-text text-transparent", 
                  categoryStyle.gradient
                )}>
                    {currentExercise.reps}
                </div>
                 <span className="text-4xl sm:text-5xl text-muted-foreground font-bold">Reps</span>
            </motion.div>
        ) : (
            <div className="relative flex items-center justify-center my-8">
                <svg className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 transform -rotate-90">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={categoryStyle.color} />
                        <stop offset="100%" stopColor={categoryStyle.color} />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="140" 
                      stroke="hsl(var(--muted) / 0.2)" 
                      strokeWidth="12" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="50%" 
                      cy="50%" 
                      r="140" 
                      stroke="url(#progressGradient)" 
                      strokeWidth="12" 
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 140} 
                      strokeDashoffset={(2 * Math.PI * 140) * (1 - (timerProgress / 100))}
                      className="transition-all duration-1000 ease-linear"
                      style={{ strokeLinecap: 'round' }} 
                    />
                </svg>
                <motion.div 
                  key={timeLeft}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "absolute font-mono text-8xl sm:text-9xl font-bold bg-gradient-to-r bg-clip-text text-transparent", 
                    categoryStyle.gradient
                  )}
                >
                  {timeLeft}
                </motion.div>
            </div>
        )}

        <div className="w-full max-w-2xl space-y-4">
          <motion.div
            key={`next-${currentExerciseIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm elevated-card">
              <CardHeader className="flex-row items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-lg flex items-center justify-center">
                    {nextExercise ? (
                      <span className="text-2xl">💪</span>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                        END
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                      <CardTitle className="text-xs text-muted-foreground">Next Up</CardTitle>
                      <CardDescription className="text-sm sm:text-base font-semibold text-foreground">
                          {nextExercise ? nextExercise.name : 'Final Exercise!'}
                      </CardDescription>
                      {nextExercise && (
                        <Badge className={cn(
                          "mt-1 text-xs", 
                          getCategoryColor(nextExercise.category).bg, 
                          getCategoryColor(nextExercise.category).text
                        )}>
                          {nextExercise.category}
                        </Badge>
                      )}
                  </div>
                </div>
                 {nextExercise && (
                   <span className={cn(
                     "text-lg sm:text-xl font-bold", 
                     getCategoryColor(nextExercise.category).text
                   )}>
                     {nextExercise.duration ? `${nextExercise.duration}s` : `${nextExercise.reps}`}
                   </span>
                 )}
              </CardHeader>
            </Card>
          </motion.div>
          
          {isRepBased ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleCompleteSet}
                  size="lg"
                  className={cn(
                    "w-full h-14 sm:h-16 text-base sm:text-lg text-white transition-all bg-gradient-to-r neumorphic-button", 
                    categoryStyle.gradient
                  )}
                >
                  <Check className="mr-2" />
                  <span>Complete Set</span>
                </Button>
              </motion.div>
          ) : (
            <div className="flex justify-center gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className="neumorphic-button w-28 sm:w-32"
                  >
                    <PauseCircle className="mr-2" />
                    <span>Pause</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSkip}
                    size="lg"
                    variant="outline"
                    className="neumorphic-flat w-28 sm:w-32"
                  >
                    <SkipForward className="mr-2" />
                    <span>Skip</span>
                  </Button>
                </motion.div>
            </div>
          )}
        </div>
      </div>
      
       <Dialog open={isPauseModalOpen} onOpenChange={(open) => !open && handleResume()}>
        <DialogContent className="neumorphic">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl">Workout Paused</DialogTitle>
            <DialogDescription>Take a breather. Ready to get back to it?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleResume}
              className="w-full neumorphic-button"
            >
              <PlayCircle className="mr-2 h-4 w-4" />Resume Workout
            </Button>
            <Button
              onClick={handleEndWorkout}
              variant="destructive"
              className="w-full neumorphic-button"
            >
              <XCircle className="mr-2 h-4 w-4" />End Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
