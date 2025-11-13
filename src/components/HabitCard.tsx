import { Habit, HabitIcon } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Minus, Trash, Fire, Drop, BookOpen, Barbell, AppleLogo, MoonStars, HeartStraight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HabitCardProps {
  habit: Habit
  onUpdateProgress: (habitId: string, newProgress: number) => void
  onDelete: (habitId: string) => void
  onEdit: (habitId: string, updates: Partial<Habit>) => void
  className?: string
  style?: React.CSSProperties
}

const iconComponents: Record<HabitIcon, React.ComponentType<{ weight?: string; className?: string }>> = {
  droplet: Drop,
  book: BookOpen,
  dumbbell: Barbell,
  apple: AppleLogo,
  moon: MoonStars,
  heart: HeartStraight,
}

export function HabitCard({ habit, onUpdateProgress, onDelete, className, style }: HabitCardProps) {
  const IconComponent = iconComponents[habit.icon]
  const progressPercent = (habit.currentProgress / habit.targetCount) * 100
  const isComplete = habit.currentProgress >= habit.targetCount

  const handleIncrement = () => {
    if (habit.currentProgress < habit.targetCount) {
      onUpdateProgress(habit.id, habit.currentProgress + 1)
    }
  }

  const handleDecrement = () => {
    if (habit.currentProgress > 0) {
      onUpdateProgress(habit.id, habit.currentProgress - 1)
      toast.success('Progress decreased')
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete "${habit.name}"?`)) {
      onDelete(habit.id)
      toast.success('Habit deleted')
    }
  }

  const renderIconGrid = () => {
    const icons: React.ReactElement[] = []
    for (let i = 0; i < habit.targetCount; i++) {
      const isFilled = i < habit.currentProgress
      icons.push(
        <div
          key={i}
          className={cn(
            'w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
            isFilled
              ? 'bg-primary text-primary-foreground shadow-lg animate-fill-icon'
              : 'bg-muted text-muted-foreground border-2 border-dashed border-border'
          )}
        >
          <IconComponent
            weight={isFilled ? 'fill' : 'regular'}
            className={cn('w-8 h-8 md:w-10 md:h-10', isFilled && 'drop-shadow-sm')}
          />
        </div>
      )
    }
    return icons
  }

  return (
    <Card className={cn('p-6 md:p-8 shadow-lg', className)} style={style}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-semibold">{habit.name}</h3>
            {habit.streak > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Fire weight="fill" className="text-orange-500" />
                {habit.streak} day{habit.streak !== 1 && 's'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {habit.currentProgress} / {habit.targetCount} completed
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash size={20} />
        </Button>
      </div>

      <div className="mb-6">
        <Progress value={progressPercent} className="h-2" />
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 mb-6">{renderIconGrid()}</div>

      <div className="flex gap-3">
        <Button
          onClick={handleDecrement}
          variant="outline"
          size="lg"
          disabled={habit.currentProgress === 0}
          className="flex-1"
        >
          <Minus size={20} weight="bold" className="mr-2" />
          Undo
        </Button>
        <Button
          onClick={handleIncrement}
          size="lg"
          disabled={isComplete}
          className={cn(
            'flex-1',
            !isComplete && 'animate-pulse-button'
          )}
        >
          <Plus size={20} weight="bold" className="mr-2" />
          {isComplete ? 'Complete!' : 'Add One'}
        </Button>
      </div>

      {isComplete && (
        <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg text-center">
          <p className="text-success-foreground font-medium">🎉 Goal achieved for today!</p>
        </div>
      )}
    </Card>
  )
}
