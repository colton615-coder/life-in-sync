import { useState } from 'react'
import { Habit, HabitIcon } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddHabit: (habit: Omit<Habit, 'id' | 'currentProgress' | 'streak'>) => void
}

const iconOptions: { value: HabitIcon; Icon: any; label: string }[] = [
  { value: 'droplet', Icon: Drop, label: 'Water' },
  { value: 'book', Icon: BookOpen, label: 'Reading' },
  { value: 'dumbbell', Icon: Barbell, label: 'Exercise' },
  { value: 'apple', Icon: AppleLogo, label: 'Nutrition' },
  { value: 'moon', Icon: MoonStars, label: 'Sleep' },
  { value: 'heart', Icon: HeartStraight, label: 'Meditation' },
]

export function AddHabitDialog({ open, onOpenChange, onAddHabit }: AddHabitDialogProps) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<HabitIcon>('droplet')
  const [targetCount, setTargetCount] = useState(8)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAddHabit({
        name: name.trim(),
        icon: selectedIcon,
        targetCount,
      })
      setName('')
      setSelectedIcon('droplet')
      setTargetCount(8)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] glass-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Deploy New Protocol
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
              className="glass-morphic border-border/50 focus:border-primary h-12 text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-foreground font-semibold">Interface Icon</Label>
            <div className="grid grid-cols-3 gap-3">
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
                      ? 'glass-card border-primary bg-primary/20 text-primary neon-glow'
                      : 'glass-morphic border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon weight={selectedIcon === value ? 'fill' : 'regular'} className="w-8 h-8" />
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
              className="glass-morphic border-border/50 focus:border-primary h-12 text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Set the number of daily executions required for completion
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="glass-morphic border-border/50 hover:border-destructive/50 hover:text-destructive"
            >
              Abort
            </Button>
            <Button 
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Initialize
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
