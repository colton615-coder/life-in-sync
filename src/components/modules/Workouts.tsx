import { useState } from 'react'
import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Barbell, Trophy, Sparkle, Play, Timer, ClockCounterClockwise } from '@phosphor-icons/react'
import { useKV } from '@/hooks/use-kv'
import { WorkoutPlan, CompletedWorkout } from '@/lib/types'
import { toast } from 'sonner'
import { ActiveWorkout } from '../workout/ActiveWorkout'
import { WorkoutSummary } from '../workout/WorkoutSummary'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { AIButton } from '@/components/AIButton'
import { StatCard } from '@/components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { generateWorkoutPlan } from '@/lib/workout-generator'

type WorkoutStage = 'planning' | 'active' | 'summary'

export function Workouts() {
  const [workoutPlans, setWorkoutPlans] = useKV<WorkoutPlan[]>('workout-plans', [])
  const [completedWorkouts, setCompletedWorkouts] = useKV<CompletedWorkout[]>('completed-workouts', [])
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [workoutPrompt, setWorkoutPrompt] = useState('')
  
  const [workoutStage, setWorkoutStage] = useState<WorkoutStage>('planning')
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  const generateWorkout = async () => {
    setGenerating(true)
    const workout = await generateWorkoutPlan(workoutPrompt)
    
    if (workout) {
      setWorkoutPlans((current) => {
        const newPlans = [...(current || []), workout]
        return newPlans
      })
      setDialogOpen(false)
      setWorkoutPrompt('')
    }
    
    setGenerating(false)
  }

  const startWorkout = (plan: WorkoutPlan) => {
    setActiveWorkoutPlan(plan)
    setWorkoutStage('active')
    setCompletedCount(0)
  }

  const handleWorkoutFinish = (completed: boolean) => {
    if (!activeWorkoutPlan) return

    const totalExercises = activeWorkoutPlan.exercises.filter(ex => ex.id !== 'rest').length
    const exercisesCompleted = completed ? totalExercises : completedCount

    if (completed || exercisesCompleted > 0) {
      const totalTime = activeWorkoutPlan.exercises
        .slice(0, exercisesCompleted)
        .reduce((acc, ex) => acc + (ex.duration || (ex.reps! * ex.sets! * 3)), 0)

      const completedWorkout: CompletedWorkout = {
        id: Date.now().toString(),
        workoutPlanId: activeWorkoutPlan.id,
        workoutName: activeWorkoutPlan.name,
        workoutFocus: activeWorkoutPlan.focus,
        completedExercises: exercisesCompleted,
        totalExercises: totalExercises,
        totalDuration: totalTime,
        calories: Math.round((totalTime / 60) * 8),
        date: new Date().toISOString().split('T')[0],
        completedAt: new Date().toISOString()
      }

      setCompletedWorkouts((current) => [...(current || []), completedWorkout])
      setCompletedCount(exercisesCompleted)
      setWorkoutStage('summary')
    } else {
      setWorkoutStage('planning')
      setActiveWorkoutPlan(null)
      toast.info('Workout cancelled')
    }
  }

  const handleDone = () => {
    setWorkoutStage('planning')
    setActiveWorkoutPlan(null)
    setCompletedCount(0)
  }

  const deleteWorkout = (workoutId: string) => {
    setWorkoutPlans((current) => (current || []).filter(w => w.id !== workoutId))
    toast.success('Workout deleted')
  }

  if (workoutStage === 'active' && activeWorkoutPlan) {
    return <ActiveWorkout workout={activeWorkoutPlan} onFinish={handleWorkoutFinish} />
  }

  if (workoutStage === 'summary' && activeWorkoutPlan) {
    return (
      <WorkoutSummary 
        workout={activeWorkoutPlan} 
        completedCount={completedCount}
        onDone={handleDone}
      />
    )
  }

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  return (
    <div className="pt-4 md:pt-6 space-y-5 md:space-y-6 px-1 md:px-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <Barbell weight="duotone" className="text-primary" size={28} />
            Workouts
          </h1>
          <p className="text-muted-foreground mt-1.5 md:mt-1 text-sm md:text-base">Build strength, one rep at a time</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="default"
                className="gap-2 h-11 md:h-9 px-5 md:px-4 button-glow"
              >
                <Sparkle weight="fill" size={18} className="md:w-4 md:h-4" />
                <span>Generate</span>
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="neumorphic-card">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkle weight="fill" className="text-primary" />
                AI Workout Generator
              </DialogTitle>
              <DialogDescription>
                Describe your ideal workout and let AI create a personalized plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="workout-prompt">What type of workout?</Label>
                <Input
                  id="workout-prompt"
                  placeholder="e.g., 30 min full body HIIT, upper body strength..."
                  value={workoutPrompt}
                  onChange={(e) => setWorkoutPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !generating) {
                      generateWorkout()
                    }
                  }}
                  className="neumorphic-inset"
                />
              </div>
              <AIButton 
                onClick={generateWorkout} 
                className="w-full"
                disabled={generating || !workoutPrompt.trim()}
                loading={generating}
              >
                {!generating && 'Generate Workout'}
              </AIButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <StatCard 
          stats={[
            { 
              value: (completedWorkouts || []).length, 
              label: 'Completed',
              icon: <Trophy weight="duotone" className="text-primary" size={20} />
            },
            { 
              value: Math.round((completedWorkouts || []).reduce((acc, w) => acc + w.totalDuration, 0) / 60), 
              label: 'Minutes',
              icon: <Timer weight="duotone" className="text-primary" size={20} />
            },
            { 
              value: (workoutPlans || []).length, 
              label: 'Saved Plans',
              icon: <Sparkle weight="duotone" className="text-primary" size={20} />
            }
          ]}
        />
      </Card>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 neumorphic-card p-1">
          <TabsTrigger value="workouts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Workouts
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="space-y-4 mt-4">
          {!workoutPlans || workoutPlans.length === 0 ? (
            <Card className="text-center py-16">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md mx-auto space-y-4"
              >
                <div className="icon-circle-glow mx-auto">
                  <Sparkle size={28} weight="duotone" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Ready to get started?</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate your first AI-powered workout plan
                  </p>
                </div>
              </motion.div>
            </Card>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {[...(workoutPlans || [])].reverse().map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="neumorphic-card hover:glow-border group">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-base md:text-lg">{workout.name}</h3>
                              <Badge className={cn("text-xs capitalize", difficultyColors[workout.difficulty])}>
                                {workout.difficulty}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Barbell size={14} weight="duotone" />
                                {workout.focus}
                              </span>
                              <span>•</span>
                              <span>{workout.exercises.length} exercises</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Timer size={14} weight="duotone" />
                                ~{workout.estimatedDuration} min
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => startWorkout(workout)}
                                size="sm"
                                className="button-glow gap-1.5"
                              >
                                <Play weight="fill" size={16} />
                                <span className="hidden sm:inline">Start</span>
                              </Button>
                            </motion.div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteWorkout(workout.id)}
                              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Barbell size={16} weight="bold" className="rotate-45" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Exercise Plan
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {workout.exercises.filter(e => e.category.toLowerCase().includes('work')).length} work sets
                            </Badge>
                          </div>
                          <div className="grid gap-1.5">
                            {workout.exercises.map((exercise, idx) => {
                              const isWarmup = exercise.category.toLowerCase().includes('warm')
                              const isCooldown = exercise.category.toLowerCase().includes('cool')
                              const isRest = exercise.category.toLowerCase().includes('rest')
                              
                              return (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.03 }}
                                  className={cn(
                                    "flex items-center justify-between py-2 px-3 rounded-lg transition-all",
                                    "neumorphic-inset hover:bg-muted/50",
                                    isWarmup && "border-l-2 border-orange-500/50",
                                    isCooldown && "border-l-2 border-brand-secondary/50",
                                    isRest && "border-l-2 border-brand-primary/50",
                                    !isWarmup && !isCooldown && !isRest && "border-l-2 border-brand-primary/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs text-muted-foreground font-mono w-5">
                                      {(idx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-sm font-medium truncate">{exercise.name}</span>
                                    <Badge variant="outline" className="text-xs capitalize ml-auto flex-shrink-0">
                                      {exercise.category}
                                    </Badge>
                                  </div>
                                  <span className="text-sm font-semibold text-primary ml-3 flex-shrink-0">
                                    {exercise.type === 'reps' 
                                      ? `${exercise.sets}×${exercise.reps}`
                                      : `${exercise.duration}s`
                                    }
                                  </span>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {!completedWorkouts || completedWorkouts.length === 0 ? (
            <Card className="text-center py-16">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md mx-auto space-y-4"
              >
                <div className="icon-circle mx-auto">
                  <ClockCounterClockwise size={28} weight="duotone" className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No workout history yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Complete your first workout to see it here
                  </p>
                </div>
              </motion.div>
            </Card>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {[...(completedWorkouts || [])].reverse().map((workout, index) => {
                  const completionRate = (workout.completedExercises / workout.totalExercises) * 100
                  
                  return (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="neumorphic-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Trophy weight="duotone" className="text-primary flex-shrink-0" size={18} />
                              <h3 className="font-semibold truncate">{workout.workoutName}</h3>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                              <span>{workout.date}</span>
                              <span>•</span>
                              <span>{Math.ceil(workout.totalDuration / 60)} min</span>
                              <span>•</span>
                              <span className="text-primary font-semibold">{workout.calories} cal</span>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {workout.completedExercises}/{workout.totalExercises} exercises
                                </span>
                                <span className="font-semibold text-primary">{Math.round(completionRate)}%</span>
                              </div>
                              <div className="slider-track h-1.5 w-full">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${completionRate}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                                  className="slider-fill h-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
