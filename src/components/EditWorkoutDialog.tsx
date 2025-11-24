import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WorkoutPlan, Exercise } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Trash, Plus, PencilSimple } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EditWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout: WorkoutPlan | null
  onSave: (workoutId: string, updates: Partial<WorkoutPlan>) => void
}

export function EditWorkoutDialog({ open, onOpenChange, workout, onSave }: EditWorkoutDialogProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])

  useEffect(() => {
    if (workout) {
      setName(workout.name)
      setExercises(JSON.parse(JSON.stringify(workout.exercises))) // Deep copy
    }
  }, [workout])

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Workout name cannot be empty')
      return
    }

    if (!workout) return

    onSave(workout.id, {
      name: name,
      exercises: exercises,
      estimatedDuration: exercises.reduce((acc, ex) => acc + (ex.duration || (ex.reps! * ex.sets! * 3)), 0) / 60
    })

    onOpenChange(false)
  }

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] glass-card border-white/10 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Workout Plan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Customize your training regimen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 flex-1 overflow-hidden flex flex-col">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-1.5 block">Workout Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
             <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-400 block">Exercises ({exercises.length})</label>
             </div>

             <ScrollArea className="flex-1 pr-4 -mr-4">
               <div className="space-y-2 pb-4">
                 {exercises.map((exercise, index) => (
                   <div
                     key={`${exercise.id}-${index}`}
                     className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2"
                   >
                     <div className="flex items-start justify-between gap-2">
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize flex-shrink-0">
                             {exercise.category}
                           </Badge>
                           <span className="text-sm font-medium text-white truncate">{exercise.name}</span>
                         </div>
                       </div>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removeExercise(index)}
                         className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-red-400/10 -mr-1"
                       >
                         <Trash size={14} />
                       </Button>
                     </div>

                     <div className="grid grid-cols-3 gap-2">
                        {exercise.type === 'reps' ? (
                          <>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Sets</label>
                              <Input
                                type="number"
                                value={exercise.sets || ''}
                                onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                                className="h-7 text-xs bg-black/20 border-white/5"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-500 block mb-0.5">Reps</label>
                              <Input
                                type="number"
                                value={exercise.reps || ''}
                                onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                                className="h-7 text-xs bg-black/20 border-white/5"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-0.5">Duration (sec)</label>
                            <Input
                              type="number"
                              value={exercise.duration || ''}
                              onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value) || 0)}
                              className="h-7 text-xs bg-black/20 border-white/5"
                            />
                          </div>
                        )}
                        <div>
                           <label className="text-[10px] text-slate-500 block mb-0.5">Weight (opt)</label>
                           <Input
                             type="number"
                             value={exercise.weight || ''}
                             onChange={(e) => updateExercise(index, 'weight', parseInt(e.target.value) || 0)}
                             className="h-7 text-xs bg-black/20 border-white/5"
                             placeholder="lbs"
                           />
                        </div>
                     </div>
                   </div>
                 ))}
                 {exercises.length === 0 && (
                   <div className="text-center py-8 text-slate-500 text-sm">
                     No exercises in this plan.
                   </div>
                 )}
               </div>
             </ScrollArea>
          </div>

          <div className="flex gap-3 pt-2 mt-auto">
            <Button
              onClick={handleSave}
              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
