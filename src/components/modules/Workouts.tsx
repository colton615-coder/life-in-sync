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
import { callAIWithRetry, parseAIJsonResponse, validateAIResponse } from '@/lib/ai-utils'

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
    console.log('====================================')
    console.log('[Workout Generation] Starting new workout generation')
    console.log('[Workout Generation] User prompt:', workoutPrompt)
    console.log('====================================')
    
    if (!workoutPrompt.trim()) {
      console.warn('[Workout Generation] Empty prompt detected')
      toast.error('Please describe your workout')
      return
    }

    setGenerating(true)
    console.log('[Workout Generation] State set to generating')
    
    try {
      console.log('[Workout Generation] Step 0: Checking spark API availability')
      console.log('[Workout Generation] window.spark exists?', !!window.spark)
      console.log('[Workout Generation] window.spark.llm exists?', !!(window.spark && window.spark.llm))
      console.log('[Workout Generation] window.spark.llmPrompt exists?', !!(window.spark && window.spark.llmPrompt))
      
      if (!window.spark) {
        throw new Error('Spark API not available - window.spark is undefined')
      }
      if (!window.spark.llm) {
        throw new Error('Spark LLM API not available - window.spark.llm is undefined')
      }
      if (!window.spark.llmPrompt) {
        throw new Error('Spark llmPrompt API not available - window.spark.llmPrompt is undefined')
      }
      
      console.log('[Workout Generation] Step 1: Creating LLM prompt')
      const promptText = window.spark.llmPrompt`You are a fitness expert. Generate a complete workout plan based on this request: "${workoutPrompt}".

CRITICAL: If the user specifies a time duration (e.g., "15 minute", "30 min", etc.), you MUST create exercises that add up to approximately that duration.
- For time-based exercises (type: "time"), the "duration" field is in SECONDS
- For reps-based exercises (type: "reps"), estimate ~3 seconds per rep, so sets × reps × 3 = total seconds
- Calculate carefully to match the requested workout duration

Create a balanced workout with 6-10 exercises including warm-up, main work, and cool-down periods.

IMPORTANT: Return a valid JSON object (not an array) with the following structure. Ensure all fields are present:

{
  "workoutPlan": {
    "name": "30-Minute Full Body HIIT",
    "focus": "Full Body Conditioning",
    "difficulty": "intermediate",
    "exercises": [
      {
        "id": "jumping-jacks",
        "name": "Jumping Jacks",
        "type": "time",
        "category": "Warm-up",
        "duration": 60,
        "muscleGroups": ["legs", "cardio"],
        "difficulty": "beginner",
        "instructions": {
          "summary": "A dynamic full-body warm-up exercise",
          "keyPoints": ["Keep core engaged", "Land softly", "Maintain steady rhythm"]
        },
        "asset": "jumping-jacks"
      }
    ]
  }
}

For reps-based exercises, use: "type": "reps", "sets": 3, "reps": 12 (this equals ~108 seconds or ~2 minutes)
For time-based exercises, use: "type": "time", "duration": 60 (duration is in SECONDS, not minutes)

Examples:
- A 15-minute workout should have exercises totaling ~900 seconds (15 × 60)
- A 30-minute workout should have exercises totaling ~1800 seconds (30 × 60)

Muscle groups can include: chest, back, legs, arms, core, shoulders, cardio
Categories: "Warm-up", "Work", "Cool-down"
Difficulty levels: "beginner", "intermediate", "advanced"`

      console.log('[Workout Generation] Step 2: Calling AI with retry mechanism')
      console.log('[Workout Generation] Using model: gpt-4o, JSON mode: true')
      
      const response = await callAIWithRetry(promptText, 'gpt-4o', true)
      
      console.log('[Workout Generation] Step 3: AI response received')
      console.log('[Workout Generation] Response type:', typeof response)
      console.log('[Workout Generation] Response length:', response?.length)
      console.log('[Workout Generation] First 500 chars:', response?.substring(0, 500))
      console.log('[Workout Generation] Step 4: Parsing JSON response')
      const data = parseAIJsonResponse<{ workoutPlan: any }>(response, 'workoutPlan structure')
      
      console.log('[Workout Generation] Step 5: Parsed data structure')
      console.log('[Workout Generation] Data keys:', Object.keys(data))
      console.log('[Workout Generation] Has workoutPlan?', 'workoutPlan' in data)
      
      if (data.workoutPlan) {
        console.log('[Workout Generation] WorkoutPlan keys:', Object.keys(data.workoutPlan))
        console.log('[Workout Generation] WorkoutPlan name:', data.workoutPlan.name)
        console.log('[Workout Generation] WorkoutPlan focus:', data.workoutPlan.focus)
        console.log('[Workout Generation] WorkoutPlan difficulty:', data.workoutPlan.difficulty)
        console.log('[Workout Generation] Exercises type:', typeof data.workoutPlan.exercises)
        console.log('[Workout Generation] Exercises is array?', Array.isArray(data.workoutPlan.exercises))
        console.log('[Workout Generation] Exercises length:', data.workoutPlan.exercises?.length)
      }
      
      console.log('[Workout Generation] Step 6: Validating required fields')
      validateAIResponse(data, ['workoutPlan', 'workoutPlan.name', 'workoutPlan.exercises'])

      console.log('[Workout Generation] Step 7: Validating exercises array')
      if (!Array.isArray(data.workoutPlan.exercises)) {
        console.error('[Workout Generation] ERROR: exercises is not an array')
        console.error('[Workout Generation] exercises type:', typeof data.workoutPlan.exercises)
        console.error('[Workout Generation] exercises value:', data.workoutPlan.exercises)
        throw new Error('workoutPlan.exercises must be an array')
      }

      if (data.workoutPlan.exercises.length === 0) {
        console.error('[Workout Generation] ERROR: exercises array is empty')
        throw new Error('workoutPlan.exercises cannot be empty')
      }

      console.log('[Workout Generation] Step 8: Processing exercises')
      data.workoutPlan.exercises.forEach((ex: any, idx: number) => {
        console.log(`[Workout Generation] Exercise ${idx + 1}:`, {
          name: ex.name,
          type: ex.type,
          category: ex.category,
          duration: ex.duration,
          sets: ex.sets,
          reps: ex.reps
        })
      })

      console.log('[Workout Generation] Step 9: Calculating total duration')
      const totalDuration = data.workoutPlan.exercises.reduce((acc: number, ex: any) => {
        if (ex.type === 'time') {
          const duration = ex.duration || 0
          console.log(`[Workout Generation] Time-based exercise "${ex.name}": ${duration}s`)
          return acc + duration
        }
        if (ex.type === 'reps') {
          const sets = ex.sets || 3
          const reps = ex.reps || 10
          const estimatedTime = sets * reps * 3
          console.log(`[Workout Generation] Reps-based exercise "${ex.name}": ${sets} sets × ${reps} reps × 3s = ${estimatedTime}s`)
          return acc + estimatedTime
        }
        return acc
      }, 0)
      console.log('[Workout Generation] Total duration (seconds):', totalDuration)
      console.log('[Workout Generation] Estimated duration (minutes):', Math.ceil(totalDuration / 60))

      console.log('[Workout Generation] Step 10: Building workout plan object')
      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        name: data.workoutPlan.name || 'Custom Workout',
        focus: data.workoutPlan.focus || 'General Fitness',
        exercises: data.workoutPlan.exercises.map((ex: any) => ({
          ...ex,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          muscleGroups: ex.muscleGroups || [],
          difficulty: ex.difficulty || 'intermediate',
          instructions: ex.instructions || {
            summary: 'Perform this exercise with proper form',
            keyPoints: ['Focus on form', 'Breathe steadily', 'Control the movement']
          }
        })),
        estimatedDuration: Math.ceil(totalDuration / 60),
        difficulty: data.workoutPlan.difficulty || 'intermediate',
        createdAt: new Date().toISOString()
      }

      console.log('[Workout Generation] Step 11: Final workout object created')
      console.log('[Workout Generation] Workout ID:', workout.id)
      console.log('[Workout Generation] Workout name:', workout.name)
      console.log('[Workout Generation] Exercise count:', workout.exercises.length)
      console.log('[Workout Generation] Estimated duration:', workout.estimatedDuration, 'minutes')

      console.log('[Workout Generation] Step 12: Saving to KV store')
      setWorkoutPlans((current) => {
        console.log('[Workout Generation] Current plans count:', current?.length || 0)
        const newPlans = [...(current || []), workout]
        console.log('[Workout Generation] New plans count:', newPlans.length)
        return newPlans
      })
      
      console.log('[Workout Generation] Step 13: Cleanup and success')
      setDialogOpen(false)
      setWorkoutPrompt('')
      toast.success('Workout generated successfully!')
      
      console.log('====================================')
      console.log('[Workout Generation] ✅ SUCCESS - Workout generated and saved')
      console.log('====================================')
    } catch (error) {
      console.log('====================================')
      console.error('[Workout Generation] ❌ ERROR - Generation failed')
      console.error('[Workout Generation] Error type:', error?.constructor?.name)
      console.error('[Workout Generation] Error message:', error instanceof Error ? error.message : String(error))
      console.error('[Workout Generation] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('[Workout Generation] Full error object:', error)
      console.log('====================================')
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate workout'
      toast.error('Generation Failed', {
        description: errorMessage
      })
    } finally {
      setGenerating(false)
      console.log('[Workout Generation] State set to not generating')
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
            <Button 
              size="sm"
              className="gap-1.5 h-9 px-4 bg-accent-vibrant hover:bg-accent-vibrant/90 text-white shadow-sm"
            >
              <Sparkle weight="fill" size={16} />
              <span>Generate</span>
            </Button>
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
                            <Badge variant="secondary" className="text-xs capitalize">
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
