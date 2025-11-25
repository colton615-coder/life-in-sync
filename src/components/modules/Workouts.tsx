import { useState } from 'react'
import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Barbell, Trophy, Sparkle, Play, Timer, ClockCounterClockwise, PencilSimple, Trash } from '@phosphor-icons/react'
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
import { EditWorkoutDialog } from '@/components/EditWorkoutDialog'

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

  const [editWorkout, setEditWorkout] = useState<WorkoutPlan | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

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

  const updateWorkoutPlan = (workoutId: string, updates: Partial<WorkoutPlan>) => {
    setWorkoutPlans((current) =>
      (current || []).map(w =>
        w.id === workoutId ? { ...w, ...updates } : w
      )
    )
    toast.success('Workout updated')
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
    <div className="pt-3 md:pt-5 space-y-3 md:space-y-4 px-1 md:px-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Barbell weight="duotone" className="text-primary" size={24} />
            Workouts
          </h1>
          <p className="text-muted-foreground mt-1 text-xs md:text-sm">Build strength, one rep at a time</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {[...(workoutPlans || [])].reverse().map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="neumorphic-card hover:glow-border group h-full flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm md:text-base truncate">{workout.name}</h3>
                              <Badge className={cn("text-[10px] px-1.5 py-0 capitalize", difficultyColors[workout.difficulty])}>
                                {workout.difficulty}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Barbell size={12} weight="duotone" />
                                {workout.focus}
                              </span>
                              <span>•</span>
                              <span>{workout.exercises.length} exercises</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Overview
                            </h4>
                            <span className="text-[10px] font-mono text-primary">
                              ~{workout.estimatedDuration} MIN
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                             {workout.exercises.slice(0, 3).map((ex, i) => (
                               <Badge key={i} variant="outline" className="text-[10px] bg-black/20 border-white/5 truncate max-w-[100px]">
                                 {ex.name}
                               </Badge>
                             ))}
                             {workout.exercises.length > 3 && (
                               <Badge variant="outline" className="text-[10px] bg-black/20 border-white/5">
                                 +{workout.exercises.length - 3}
                               </Badge>
                             )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                              <Button
                                onClick={() => startWorkout(workout)}
                                size="sm"
                                className="w-full button-glow gap-1.5 h-9"
                                aria-label="Start workout"
                              >
                                <Play weight="fill" size={16} />
                                <span className="font-bold">START</span>
                              </Button>
                            </motion.div>

                            <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                      setEditWorkout(workout)
                                      setIsEditOpen(true)
                                  }}
                                  className="h-9 w-9 text-muted-foreground hover:text-white"
                                  aria-label="Edit workout"
                                >
                                  <PencilSimple size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteWorkout(workout.id)}
                                  className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 text-muted-foreground"
                                  aria-label="Delete workout"
                                >
                                  <Trash size={16} />
                                </Button>
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
                  // Calculate total volume
                  const totalVolume = workout.exercises?.reduce((acc, ex) => {
                    return acc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0)
                  }, 0) || 0

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
                              {totalVolume > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{totalVolume.toLocaleString()} lbs vol</span>
                                </>
                              )}
                            </div>

                            {/* Detailed Exercise Summary */}
                            {workout.exercises && workout.exercises.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {workout.exercises.slice(0, 3).map((ex, i) => (
                                  <div key={i} className="flex justify-between text-xs">
                                     <span className="text-muted-foreground">{ex.name}</span>
                                     <span className="font-mono">{ex.sets.filter(s => s.completed).length} sets</span>
                                  </div>
                                ))}
                                {workout.exercises.length > 3 && (
                                   <div className="text-[10px] text-muted-foreground/50 pt-1">
                                     +{workout.exercises.length - 3} more exercises
                                   </div>
                                )}
                              </div>
                            )}

                            <div className="mt-3 space-y-2">
                              <div className="slider-track h-1 w-full">
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

      <EditWorkoutDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        workout={editWorkout}
        onSave={updateWorkoutPlan}
      />
    </div>
  )
}
