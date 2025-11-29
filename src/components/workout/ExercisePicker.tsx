import { useState, useMemo } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { getMasterExercises } from '@/lib/master-exercises'
import { cn } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ExercisePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercise: any) => void
}

export function ExercisePicker({ open, onOpenChange, onSelect }: ExercisePickerProps) {
  const allExercises = useMemo(() => getMasterExercises(), [])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(allExercises.map(ex => ex.category))
    return Array.from(cats).sort()
  }, [allExercises])

  const filteredExercises = useMemo(() => {
    if (!selectedCategory) return allExercises
    return allExercises.filter(ex => ex.category === selectedCategory)
  }, [allExercises, selectedCategory])

  const handleSelect = (exercise: any) => {
    // Create a deep copy to avoid reference issues
    const newExercise = JSON.parse(JSON.stringify(exercise))
    // Initialize required workout fields from defaults
    newExercise.sets = exercise.defaultSets || 3
    newExercise.reps = exercise.defaultReps || 10
    newExercise.rest = exercise.defaultRest || 60
    newExercise.tempo = "3-0-1-0" // Default tempo
    newExercise.weight = 0 // Default weight

    // Remove defaults from the object we pass back
    delete newExercise.defaultSets
    delete newExercise.defaultReps
    delete newExercise.defaultRest

    onSelect(newExercise)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden glass-card border-white/10">
        <DialogHeader className="px-4 py-3 border-b border-white/10 bg-white/5">
          <DialogTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            Add Exercise
          </DialogTitle>
        </DialogHeader>

        <Command className="bg-transparent">
          <div className="p-2">
            <CommandInput placeholder="Search exercises..." className="h-9" />
          </div>

          <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar mask-fade-right">
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap",
                !selectedCategory ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "text-muted-foreground border-white/10"
              )}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map(cat => (
              <Badge
                key={cat}
                variant="outline"
                className={cn(
                  "cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap",
                  selectedCategory === cat ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "text-muted-foreground border-white/10"
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <div className="h-[1px] bg-white/10" />

          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No exercises found.
            </CommandEmpty>
            <CommandGroup heading={selectedCategory || "All Exercises"}>
              {filteredExercises.map((exercise) => (
                <CommandItem
                  key={exercise.name}
                  value={exercise.name}
                  onSelect={() => handleSelect(exercise)}
                  className="flex items-center justify-between p-2 rounded-md aria-selected:bg-white/10 cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-white">{exercise.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="text-cyan-400/80 uppercase tracking-wider font-bold">{exercise.category}</span>
                      <span>•</span>
                      <span>{exercise.muscleGroups[0]}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-cyan-500/20 hover:text-cyan-400">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
