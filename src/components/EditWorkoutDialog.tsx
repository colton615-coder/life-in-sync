import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WorkoutPlan, Exercise, WorkoutBlock } from '@/types/workout'
import { useState, useEffect } from 'react'
import { Trash, Plus, PencilSimple, ListPlus, Link as LinkIcon, Barbell } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ExercisePicker } from './workout/ExercisePicker'
import { v4 as uuidv4 } from 'uuid'
import { Separator } from '@/components/ui/separator'

interface EditWorkoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workout: WorkoutPlan | null
  onSave: (workout: WorkoutPlan) => void
}

export function EditWorkoutDialog({ open, onOpenChange, workout, onSave }: EditWorkoutDialogProps) {
  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  // Track which block we are adding to. If null, we are creating a new block.
  const [targetBlockId, setTargetBlockId] = useState<string | null>(null)

  // Reset or Load state when dialog opens or workout changes
  useEffect(() => {
    if (open) {
      if (workout) {
        setName(workout.name)
        setFocus(workout.focus || 'General')
        // Deep copy blocks to avoid mutation
        // Handle legacy flat workouts by converting to blocks if needed
        if ('blocks' in workout && Array.isArray(workout.blocks)) {
           setBlocks(JSON.parse(JSON.stringify(workout.blocks)))
        } else if ('exercises' in workout && Array.isArray(workout.exercises)) {
           // Migration for legacy flat structure
           const newBlocks: WorkoutBlock[] = (workout.exercises as Exercise[]).map(ex => ({
             id: uuidv4(),
             type: 'strength',
             rounds: 1,
             exercises: [ex]
           }))
           setBlocks(newBlocks)
        } else {
           setBlocks([])
        }
      } else {
        setName('')
        setFocus('')
        setBlocks([])
      }
    }
  }, [workout, open])

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Workout name cannot be empty')
      return
    }

    if (blocks.length === 0) {
      toast.error('Please add at least one exercise')
      return
    }

    // Calculate total duration
    const totalDuration = blocks.reduce((acc, block) => {
       const blockDuration = block.exercises.reduce((bAcc, ex) => {
          return bAcc + (ex.durationSeconds || ((ex.sets || 3) * (ex.reps || 10) * 3) + (ex.sets || 3) * (ex.restSeconds || 60))
       }, 0)
       return acc + (blockDuration * block.rounds)
    }, 0)

    const newWorkout: WorkoutPlan = {
      id: workout?.id || Date.now().toString(),
      name: name,
      focus: focus || 'Custom',
      blocks: blocks,
      // Maintain legacy support for UI components that expect flat list (optional, but good for safety)
      // @ts-expect-error - Mixing legacy and new Exercise types for compatibility
      exercises: blocks.flatMap(b => b.exercises),
      estimatedDuration: Math.ceil(totalDuration / 60),
      difficulty: workout?.difficulty || 'intermediate',
      createdAt: workout?.createdAt || new Date().toISOString()
    }

    onSave(newWorkout)
    onOpenChange(false)
  }

  const updateExercise = (blockId: string, exIndex: number, field: keyof Exercise, value: any) => {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b

      const newExercises = [...b.exercises]
      newExercises[exIndex] = { ...newExercises[exIndex], [field]: value }
      return { ...b, exercises: newExercises }
    }))
  }

  const removeExercise = (blockId: string, exIndex: number) => {
    setBlocks(prevBlocks => {
      return prevBlocks.map(b => {
        if (b.id !== blockId) return b

        const newExercises = b.exercises.filter((_, i) => i !== exIndex)
        return { ...b, exercises: newExercises }
      }).filter(b => b.exercises.length > 0) // Remove empty blocks
    })
  }

  const removeBlock = (blockId: string) => {
      setBlocks(blocks.filter(b => b.id !== blockId))
  }

  const openPickerForNewBlock = () => {
    setTargetBlockId(null)
    setPickerOpen(true)
  }

  const openPickerForBlock = (blockId: string) => {
    setTargetBlockId(blockId)
    setPickerOpen(true)
  }

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: Exercise = {
      ...exercise,
      id: uuidv4(),
      sets: exercise.sets || 3,
      reps: exercise.reps || 10,
      restSeconds: exercise.restSeconds || 60,
      weight: 0
    }

    if (targetBlockId) {
      // Add to existing block (Superset)
      setBlocks(blocks.map(b => {
        if (b.id !== targetBlockId) return b
        return {
          ...b,
          type: 'superset',
          exercises: [...b.exercises, newExercise]
        }
      }))
      toast.success(`Added to block (Superset created)`)
    } else {
      // Create new block
      const newBlock: WorkoutBlock = {
        id: uuidv4(),
        type: 'strength',
        rounds: 1,
        exercises: [newExercise]
      }
      setBlocks([...blocks, newBlock])
      toast.success(`Added ${exercise.name}`)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] glass-card border-white/10 max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 bg-white/5 border-b border-white/5">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
               <PencilSimple className="text-cyan-400" weight="duotone" />
              {workout ? 'Edit Workout Plan' : 'Create Custom Workout'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {workout ? 'Customize your training regimen' : 'Build your perfect session. Group exercises to create supersets.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#0a0a0a]/50">
            {/* Metadata Inputs */}
            <div className="grid grid-cols-2 gap-4 p-6 pb-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Workout Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Leg Day Destroyer"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Focus</label>
                <Input
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g., Strength"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                />
              </div>
            </div>

            <Separator className="bg-white/5" />

            <div className="flex items-center justify-between px-6 py-3 bg-white/[0.02]">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                 Workout Blocks ({blocks.length})
               </label>
               <Button
                 size="sm"
                 className="h-7 text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 button-glow"
                 onClick={openPickerForNewBlock}
               >
                 <Plus className="mr-1" size={12} weight="bold" />
                 Add New Block
               </Button>
            </div>

            <ScrollArea className="flex-1 px-6">
               <div className="space-y-4 pb-6 pt-2">
                 {blocks.map((block, bIndex) => (
                   <div
                     key={block.id}
                     className="rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group/block"
                   >
                     {/* Block Header (only if superset or for visual separation) */}
                     {block.exercises.length > 1 && (
                        <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                                <LinkIcon size={12} weight="bold" />
                                <span className="uppercase tracking-widest font-bold">Superset</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-slate-500 font-mono">ROUNDS:</label>
                                <Input
                                    className="h-5 w-12 text-center text-xs bg-black/20 border-white/10 p-0"
                                    value={block.rounds}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        setBlocks(blocks.map(b => b.id === block.id ? {...b, rounds: val} : b))
                                    }}
                                />
                            </div>
                        </div>
                     )}

                     <div className="p-3 space-y-3">
                       {block.exercises.map((exercise, exIndex) => (
                         <div key={exercise.id} className="relative group/ex">
                           {/* Connecting line for supersets */}
                           {block.exercises.length > 1 && exIndex < block.exercises.length - 1 && (
                               <div className="absolute left-3 top-8 bottom-[-14px] w-[2px] bg-white/10 z-0" />
                           )}

                           <div className="flex items-start gap-3 relative z-10">
                              <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 mt-0.5",
                                  block.exercises.length > 1 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/10 text-slate-500"
                              )}>
                                  {bIndex + 1}{String.fromCharCode(97 + exIndex)}
                              </div>

                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-200 truncate">{exercise.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeExercise(block.id, exIndex)}
                                      className="h-6 w-6 text-slate-600 hover:text-red-400 hover:bg-red-400/10 -mr-2 opacity-0 group-hover/ex:opacity-100 transition-opacity"
                                    >
                                      <Trash size={14} />
                                    </Button>
                                 </div>

                                 <div className="grid grid-cols-4 gap-2">
                                    {exercise.type === 'cardio' || exercise.durationSeconds ? (
                                        <div className="col-span-2">
                                            <label className="text-[9px] text-slate-500 uppercase tracking-wide block mb-0.5">Duration (s)</label>
                                            <Input
                                              type="number"
                                              value={exercise.durationSeconds || ''}
                                              onChange={(e) => updateExercise(block.id, exIndex, 'durationSeconds', parseInt(e.target.value) || 0)}
                                              className="h-7 text-xs bg-black/40 border-white/10 text-center font-mono"
                                            />
                                        </div>
                                    ) : (
                                      <>
                                        <div>
                                          <label className="text-[9px] text-slate-500 uppercase tracking-wide block mb-0.5">Sets</label>
                                          <Input
                                            type="number"
                                            value={exercise.sets || ''}
                                            onChange={(e) => updateExercise(block.id, exIndex, 'sets', parseInt(e.target.value) || 0)}
                                            className="h-7 text-xs bg-black/40 border-white/10 text-center font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[9px] text-slate-500 uppercase tracking-wide block mb-0.5">Reps</label>
                                          <Input
                                            type="number"
                                            value={exercise.reps || ''}
                                            onChange={(e) => updateExercise(block.id, exIndex, 'reps', parseInt(e.target.value) || 0)}
                                            className="h-7 text-xs bg-black/40 border-white/10 text-center font-mono"
                                          />
                                        </div>
                                      </>
                                    )}
                                    <div>
                                       <label className="text-[9px] text-slate-500 uppercase tracking-wide block mb-0.5">Lbs</label>
                                       <Input
                                         type="number"
                                         value={exercise.weight || ''}
                                         onChange={(e) => updateExercise(block.id, exIndex, 'weight', parseInt(e.target.value) || 0)}
                                         className="h-7 text-xs bg-black/40 border-white/10 text-center font-mono placeholder:text-white/10"
                                         placeholder="-"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-slate-500 uppercase tracking-wide block mb-0.5">Rest</label>
                                       <Input
                                         type="number"
                                         value={exercise.restSeconds || ''}
                                         onChange={(e) => updateExercise(block.id, exIndex, 'restSeconds', parseInt(e.target.value) || 0)}
                                         className="h-7 text-xs bg-black/40 border-white/10 text-center font-mono"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                         </div>
                       ))}

                       <div className="pl-9 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 px-2"
                            onClick={() => openPickerForBlock(block.id)}
                          >
                            <Plus className="mr-1" size={10} />
                            Add Exercise to Block
                          </Button>
                       </div>
                     </div>
                   </div>
                 ))}

                 {blocks.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                        <ListPlus size={24} className="opacity-50" />
                     </div>
                     <p className="text-sm font-medium text-slate-400 mb-1">Workout is empty</p>
                     <p className="text-xs text-slate-600 mb-4">Add exercises to build your session</p>
                     <Button variant="outline" onClick={openPickerForNewBlock} className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300">
                       <Plus className="mr-2" size={14} />
                       Add First Block
                     </Button>
                   </div>
                 )}
               </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md flex gap-3">
              <Button
                onClick={handleSave}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold button-glow"
              >
                {workout ? 'Save Changes' : 'Create Workout'}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>

        <ExercisePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handleAddExercise}
        />
      </Dialog>
    </>
  )
}
