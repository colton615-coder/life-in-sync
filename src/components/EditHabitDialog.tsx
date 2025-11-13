import { useState, useEffect } from 'react'
import { Habit, HabitIcon } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
  onEditHabit: (habitId: string, updates: Partial<Habit>) => void
}

const iconOptions: { value: HabitIcon; Icon: React.ComponentType<{ weight?: string; className?: string }>; label: string }[] = [
  { value: 'droplet', Icon: Drop, label: 'Water' },
  { value: 'book', Icon: BookOpen, label: 'Reading' },
  { value: 'dumbbell', Icon: Barbell, label: 'Exercise' },
  { value: 'apple', Icon: AppleLogo, label: 'Nutrition' },
  { value: 'moon', Icon: MoonStars, label: 'Sleep' },
  { value: 'heart', Icon: HeartStraight, label: 'Meditation' },
]

export function EditHabitDialog({ open, onOpenChange, habit, onEditHabit }: EditHabitDialogProps) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<HabitIcon>('droplet')
  const [targetCount, setTargetCount] = useState(8)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setSelectedIcon(habit.icon)
      setTargetCount(habit.targetCount)
    }
  }, [habit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (habit && name.trim()) {
      onEditHabit(habit.id, {
        name: name.trim(),
        icon: selectedIcon,
        targetCount,
      })
      onOpenChange(false)
    }
  }

  if (!habit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Drink Water, Read Pages, Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-3 gap-3">
              {iconOptions.map(({ value, Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedIcon(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                    selectedIcon === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  )}
                >
                  <Icon weight={selectedIcon === value ? 'fill' : 'regular'} className="w-8 h-8" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-count">Daily Target (1-20)</Label>
            <Input
              id="target-count"
              type="number"
              min="1"
              max="20"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              required
            />
            <p className="text-sm text-muted-foreground">
              How many times do you want to complete this habit each day?
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
