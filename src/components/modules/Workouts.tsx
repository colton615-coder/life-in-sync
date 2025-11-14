import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Barbell, Trophy, Sparkle } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Workout, PersonalRecord } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'

export function Workouts() {
  const [workouts, setWorkouts] = useKV<Workout[]>('workouts', [])
  const [prs, setPrs] = useKV<PersonalRecord[]>('personal-records', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generating, setGenerating] = useState(false)

  const generateWorkout = async () => {
    setGenerating(true)
    try {
      const promptText = `Generate a balanced workout routine with 5 exercises. Return as JSON with this structure:
{
  "name": "Workout name",
  "exercises": [
    {"name": "Exercise name", "sets": 3, "reps": 10}
  ]
}
Only return the JSON, nothing else.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(response)

      const workout: Workout = {
        id: Date.now().toString(),
        name: data.name,
        exercises: data.exercises,
        duration: 45,
        date: new Date().toISOString().split('T')[0]
      }

      setWorkouts((current) => [...(current || []), workout])
      setDialogOpen(false)
      toast.success('Workout generated!')
    } catch (error) {
      toast.error('Failed to generate workout')
    } finally {
      setGenerating(false)
    }
  }

  const deleteWorkout = (workoutId: string) => {
    setWorkouts((current) => (current || []).filter(w => w.id !== workoutId))
    toast.success('Workout deleted')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">Track fitness and build strength</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-9 md:h-10 text-sm" size="sm">
              <Sparkle size={18} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Generate Workout</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI-Generated Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Let AI create a custom workout routine tailored for you.
              </p>
              <Button onClick={generateWorkout} className="w-full" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Workout'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Barbell size={32} weight="duotone" className="text-primary" />
            <div>
              <div className="text-3xl font-bold">{(workouts || []).length}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={32} weight="duotone" className="text-primary" />
            <div>
              <div className="text-3xl font-bold">{(prs || []).length}</div>
              <div className="text-sm text-muted-foreground">Personal Records</div>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
        {!workouts || workouts.length === 0 ? (
          <Card className="text-center py-12">
            <Barbell size={48} weight="duotone" className="text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No workouts yet</h3>
            <p className="text-muted-foreground">Generate your first AI-powered workout!</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {[...(workouts || [])].reverse().map((workout) => (
              <Card key={workout.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground">{workout.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWorkout(workout.id)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-y-2">
                  {workout.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-md bg-background/50"
                    >
                      <span className="font-medium">{exercise.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {exercise.sets} × {exercise.reps}
                        {exercise.weight && ` @ ${exercise.weight}lbs`}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
