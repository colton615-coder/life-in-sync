import { useState } from 'react'
import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Barbell, Trophy, Sparkle, Play, Timer, ClockCounterClockwise, PencilSimple, Trash, Lightning } from '@phosphor-icons/react'
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
    beginner: 'text-green-500 border-green-500/20 bg-green-500/10',
    intermediate: 'text-amber-500 border-amber-500/20 bg-amber-500/10',
    advanced: 'text-red-500 border-red-500/20 bg-red-500/10'
  }

  return (
    <div className="pt-3 md:pt-5 space-y-3 md:space-y-4 px-1 md:px-0">
      {/* Header Area */}
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
                <span className="hidden sm:inline">Generate</span>
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

      {/* Stats Area */}
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
            // Quick-Start Grid: 2 Columns on Mobile, 3 on Desktop
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {[...(workoutPlans || [])].reverse().map((workout, index) => (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Card
                        className="neumorphic-card hover:glow-border group h-full flex flex-col justify-between p-3 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => startWorkout(workout)}
                    >
                      {/* Gradient Overlay for "Active" feel */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-2 relative z-10">
                         {/* Header: Name & Difficulty */}
                        <div className="flex flex-col gap-1">
                             <div className="flex items-start justify-between">
                                <h3 className="font-bold text-sm leading-tight line-clamp-2 text-white/90 group-hover:text-white transition-colors">
                                    {workout.name}
                                </h3>
                                <Badge className={cn("text-[10px] px-1 py-0 h-4 capitalize border-0", difficultyColors[workout.difficulty])}>
                                    {workout.difficulty.substring(0, 3)}
                                </Badge>
                             </div>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground font-mono">
                           <span className="flex items-center gap-0.5">
                                <Timer size={10} weight="fill" />
                                {workout.estimatedDuration}m
                           </span>
                           <span className="flex items-center gap-0.5">
                                <Lightning size={10} weight="fill" />
                                {workout.exercises.length} Ex
                           </span>
                        </div>

                        {/* Focus Tags */}
                        <div className="flex flex-wrap gap-1 mt-1">
                             <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-white/10 text-slate-400">
                                 {workout.focus.split(' ')[0]}
                             </Badge>
                        </div>
                      </div>

                      {/* Footer Actions (Mini) */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 relative z-10">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                                START <Play weight="fill" size={10} />
                            </span>

                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-white rounded-full hover:bg-white/10"
                                  onClick={(e) => {
                                      e.stopPropagation()
                                      setEditWorkout(workout)
                                      setIsEditOpen(true)
                                  }}
                                >
                                  <PencilSimple size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                  onClick={(e) => {
                                      e.stopPropagation()
                                      deleteWorkout(workout.id)
                                  }}
                                >
                                  <Trash size={12} />
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

      <EditWorkoutDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        workout={editWorkout}
        onSave={updateWorkoutPlan}
      />
    </div>
  )
}
