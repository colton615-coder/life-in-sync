import { useState } from 'react'
import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Barbell, Trophy, Sparkle, Play, Timer, ClockCounterClockwise } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { WorkoutPlan, CompletedWorkout, PersonalRecord } from '@/lib/types'
import { toast } from 'sonner'
import { ActiveWorkout } from '../workout/ActiveWorkout'
import { WorkoutSummary } from '../workout/WorkoutSummary'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { AIButton } from '@/components/AIButton'
import { StatCard } from '@/components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type WorkoutStage = 'planning' | 'active' | 'summary'

export function Workouts() {
  const [workoutPlans, setWorkoutPlans] = useKV<WorkoutPlan[]>('workout-plans', [])
  const [completedWorkouts, setCompletedWorkouts] = useKV<CompletedWorkout[]>('completed-workouts', [])
  const [prs, setPrs] = useKV<PersonalRecord[]>('personal-records', [])
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [workoutPrompt, setWorkoutPrompt] = useState('')
  
  const [workoutStage, setWorkoutStage] = useState<WorkoutStage>('planning')
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  const generateWorkout = async () => {
    if (!workoutPrompt.trim()) {
      toast.error('Please describe your workout')
      return
    }

    setGenerating(true)
    try {
      const promptText = window.spark.llmPrompt`You are a fitness expert. Generate a complete workout plan based on this request: ${workoutPrompt}.

Create a balanced workout with 6-10 exercises including warm-up, main work, and cool-down periods.

For each exercise, provide:
- A unique ID (use the exercise name in kebab-case)
- Exercise name
- Type: "reps" or "time"
- Category: "Warm-up", "Work", "Cool-down", or "Rest"
- For reps exercises: sets (1-5) and reps (5-20)
- For time exercises: duration in seconds (20-60 for work, 10-30 for rest)
- Muscle groups targeted (array of strings like "chest", "legs", "core", etc.)
- Difficulty: "beginner", "intermediate", or "advanced"
- Detailed instructions with a summary and 3-5 key points
- Asset name (use generic names like "jumping-jacks", "push-ups", "squats", etc.)

Return ONLY valid JSON with this exact structure:
{
  "workoutPlan": {
    "name": "Descriptive workout name",
    "focus": "Main focus area (e.g., Upper Body Strength, HIIT Cardio)",
    "difficulty": "beginner|intermediate|advanced",
    "exercises": [
      {
        "id": "exercise-name-kebab-case",
        "name": "Exercise Name",
        "type": "reps",
        "category": "Warm-up",
        "sets": 2,
        "reps": 10,
        "muscleGroups": ["chest", "triceps"],
        "difficulty": "beginner",
        "instructions": {
          "summary": "Clear description of how to perform the exercise",
          "keyPoints": ["Point 1", "Point 2", "Point 3"]
        },
        "asset": "exercise-name"
      }
    ]
  }
}`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI service')
      }

      let data
      try {
        data = JSON.parse(response)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', response)
        throw new Error('Failed to parse AI response')
      }

      if (!data.workoutPlan || !data.workoutPlan.exercises || !Array.isArray(data.workoutPlan.exercises)) {
        console.error('Invalid workout plan structure:', data)
        throw new Error('AI returned invalid workout structure')
      }

      if (data.workoutPlan.exercises.length === 0) {
        throw new Error('AI returned empty workout plan')
      }

      const totalDuration = data.workoutPlan.exercises.reduce((acc: number, ex: any) => {
        if (ex.type === 'time') return acc + (ex.duration || 0)
        if (ex.type === 'reps') return acc + (ex.sets * ex.reps * 3)
        return acc
      }, 0)

      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        name: data.workoutPlan.name || 'Custom Workout',
        focus: data.workoutPlan.focus || 'General Fitness',
        exercises: data.workoutPlan.exercises,
        estimatedDuration: Math.ceil(totalDuration / 60),
        difficulty: data.workoutPlan.difficulty || 'intermediate',
        createdAt: new Date().toISOString()
      }

      setWorkoutPlans((current) => [...(current || []), workout])
      setDialogOpen(false)
      setWorkoutPrompt('')
      toast.success('Workout generated!')
    } catch (error) {
      console.error('Workout generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate workout'
      toast.error(errorMessage, {
        description: 'Please try again or rephrase your request'
      })
    } finally {
      setGenerating(false)
    }
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

  return (
    <div className="pt-2 md:pt-4 space-y-3 md:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">💪 Workouts</h1>
          <p className="text-muted-foreground mt-1 text-sm font-normal">Suffering is mandatory, results are optional</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Button 
                className="bg-accent-vibrant hover:bg-accent-vibrant/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkle weight="fill" />
                <span className="hidden sm:inline">⚡️ Generate</span>
                <span className="sm:hidden">⚡️</span>
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="neumorphic">
            <DialogHeader>
              <DialogTitle>AI Workout Generator</DialogTitle>
              <DialogDescription>
                Describe your ideal workout and let AI create a personalized plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="workout-prompt">What type of workout?</Label>
                <Input
                  id="workout-prompt"
                  placeholder="e.g., 30 min full body HIIT, upper body strength, beginner yoga..."
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

      <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300">
        <StatCard 
          stats={[
            { value: (completedWorkouts || []).length, label: 'Completed' },
            { value: Math.round((completedWorkouts || []).reduce((acc, w) => acc + w.totalDuration, 0) / 60), label: 'Minutes' },
            { value: (prs || []).length, label: 'Personal Records', icon: <Barbell weight="duotone" className="text-primary" size={20} /> }
          ]}
        />
      </Card>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workouts" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkle weight="duotone" className="text-primary" />
              Generated Workouts
            </h2>
            {!workoutPlans || workoutPlans.length === 0 ? (
              <Card className="text-center py-12 md:py-16">
                <div className="max-w-md mx-auto space-y-4">
                  <Sparkle size={48} weight="duotone" className="text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Ready to get started?</h3>
                    <p className="text-muted-foreground text-base">
                      Tap "⚡️ Generate" to create your first AI workout!
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {[...(workoutPlans || [])].reverse().map((workout) => (
                  <Card key={workout.id} className="elevated-card">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{workout.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {workout.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {workout.focus} • {workout.exercises.length} exercises • ~{workout.estimatedDuration} min
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startWorkout(workout)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9 md:h-10 text-sm shadow-lg"
                          >
                            <Play weight="fill" />
                            Start
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteWorkout(workout.id)}
                            className="hover:bg-destructive/10 hover:text-destructive h-9 w-9 md:h-10 md:w-10"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Exercises</h4>
                        <div className="space-y-1.5">
                          {workout.exercises.map((exercise, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <span className="text-sm font-medium">{exercise.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {exercise.type === 'reps' 
                                  ? `${exercise.sets} × ${exercise.reps} reps`
                                  : `${exercise.duration}s`
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClockCounterClockwise weight="duotone" className="text-accent" />
              Workout History
            </h2>
            {!completedWorkouts || completedWorkouts.length === 0 ? (
              <Card className="text-center py-12 md:py-16">
                <div className="max-w-md mx-auto space-y-4">
                  <ClockCounterClockwise size={48} weight="duotone" className="text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">No workout history yet</h3>
                    <p className="text-muted-foreground text-base">
                      Complete your first workout to see it here
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {[...(completedWorkouts || [])].reverse().map((workout) => (
                  <Card key={workout.id} className="elevated-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{workout.workoutName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workout.date} • {Math.ceil(workout.totalDuration / 60)} min • {workout.calories} cal
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completed {workout.completedExercises}/{workout.totalExercises} exercises
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.round((workout.completedExercises / workout.totalExercises) * 100)}%
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
