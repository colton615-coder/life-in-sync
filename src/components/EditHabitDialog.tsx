import { useState, useEffect } from 'react'
import { Habit, HabitIcon } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
  onEditHabit: (habitId: string, updates: Partial<Habit>) => void
}

const iconOptions: { value: HabitIcon; Icon: any; label: string }[] = [
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
      setSelectedIcon(habit.icon || 'droplet')
      setTargetCount(habit.targetCount || 8)
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
      <DialogContent className="sm:max-w-[550px] glass-card border-accent/30">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            Modify Protocol
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label htmlFor="habit-name" className="text-foreground font-semibold">Protocol Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Hydration, Knowledge, Training"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass-morphic border-border/50 focus:border-accent h-12 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Interface Icon</Label>
            <div className="grid grid-cols-3 gap-3" role="group" aria-label="Icon selection">
              {iconOptions.map(({ value, Icon, label }, index) => (
                <motion.button
                  key={value}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedIcon(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    selectedIcon === value
                      ? 'glass-card border-accent bg-accent/20 text-accent neon-glow'
                      : 'glass-morphic border-border/50 hover:border-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={`Select ${label} icon`}
                  aria-pressed={selectedIcon === value}
                >
                  <Icon weight={selectedIcon === value ? 'fill' : 'regular'} className="w-8 h-8" aria-hidden="true" />
                  <span className="text-sm font-medium">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="target-count" className="text-foreground font-semibold">Daily Target (1-20)</Label>
            <Input
              id="target-count"
              type="number"
              min="1"
              max="20"
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              required
              className="glass-morphic border-border/50 focus:border-accent h-12 text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Adjust the number of daily executions required
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="glass-morphic border-border/50 hover:border-destructive/50 hover:text-destructive"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="glass-card bg-gradient-to-r from-accent/30 to-secondary/30 hover:from-accent/50 hover:to-secondary/50 border-accent/50"
            >
              Update Protocol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
