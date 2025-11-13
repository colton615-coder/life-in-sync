import { Habit, HabitIcon } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trash, PencilSimple, Fire, Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface HabitCardProps {
  habit: Habit
  onUpdateProgress: (habitId: string, newProgress: number) => void
  onDelete: (habitId: string) => void
  onEdit: (habitId: string, updates: Partial<Habit>) => void
  onOpenEditDialog: (habit: Habit) => void
  className?: string
  style?: React.CSSProperties
}

const iconComponents: Record<HabitIcon, any> = {
  droplet: Drop,
  book: BookOpen,
  dumbbell: Barbell,
  apple: AppleLogo,
  moon: MoonStars,
  heart: HeartStraight,
}

export function HabitCard({ habit, onUpdateProgress, onDelete, onOpenEditDialog, className, style }: HabitCardProps) {
  const IconComponent = iconComponents[habit.icon]
  const progressPercent = (habit.currentProgress / habit.targetCount) * 100
  const isComplete = habit.currentProgress >= habit.targetCount

  const handleDelete = () => {
    if (confirm(`Delete "${habit.name}"?`)) {
      onDelete(habit.id)
      toast.success('Habit deleted')
    }
  }

  const handleEdit = () => {
    onOpenEditDialog(habit)
  }

  const handleIconClick = (index: number) => {
    const isFilled = index < habit.currentProgress
    
    if (isFilled) {
      onUpdateProgress(habit.id, index)
      if (index > 0) {
        toast.success('Progress decreased')
      }
    } else {
      onUpdateProgress(habit.id, index + 1)
    }
  }

  const renderIconGrid = () => {
    const icons: React.ReactElement[] = []
    for (let i = 0; i < habit.targetCount; i++) {
      const isFilled = i < habit.currentProgress
      icons.push(
        <motion.button
          key={i}
          onClick={() => handleIconClick(i)}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={cn(
            'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
            'cursor-pointer relative',
            isFilled
              ? 'glass-card bg-gradient-to-br from-primary/40 to-accent/40 border-primary/50 shadow-xl neon-glow'
              : 'glass-morphic border-border/50 hover:border-primary/30'
          )}
        >
          <IconComponent
            weight={isFilled ? 'fill' : 'regular'}
            className={cn(
              'w-8 h-8 md:w-10 md:h-10 transition-all duration-300',
              isFilled ? 'text-primary drop-shadow-[0_0_8px_currentColor]' : 'text-muted-foreground'
            )}
          />
          {isFilled && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent animate-pulse-button" />
          )}
        </motion.button>
      )
    }
    return icons
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={style}
    >
      <Card className={cn('glass-card p-6 md:p-8 shadow-2xl border-border/30 hover:border-primary/30 transition-all duration-500', className)}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                {habit.name}
              </h3>
              {habit.streak > 0 && (
                <Badge variant="secondary" className="gap-1 px-3 py-1 glass-morphic border-secondary/30 animate-glow">
                  <Fire weight="fill" className="text-destructive drop-shadow-[0_0_4px_currentColor]" />
                  <span className="font-semibold">{habit.streak}</span>
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-base">
              <span className="text-primary font-semibold text-lg">{habit.currentProgress}</span>
              <span className="text-muted-foreground/60 mx-1">/</span>
              <span className="text-foreground/80">{habit.targetCount}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 glass-morphic border border-transparent hover:border-primary/30"
              >
                <PencilSimple size={20} weight="bold" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 glass-morphic border border-transparent hover:border-destructive/30"
              >
                <Trash size={20} weight="bold" />
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="mb-6 relative">
          <Progress value={progressPercent} className="h-3 glass-morphic" />
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500"
            style={{ width: `${progressPercent}%`, boxShadow: '0 0 20px currentColor' }}
          />
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {renderIconGrid()}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mt-6 p-4 glass-card bg-gradient-to-r from-success/20 to-accent/20 border-success/30 rounded-xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-accent/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <p className="text-success font-semibold relative z-10 flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              Goal Achieved
              <span className="text-2xl">✨</span>
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
