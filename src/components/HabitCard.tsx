import { Habit, HabitIcon } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trash, PencilSimple, Fire, Drop, Target } from '@phosphor-icons/react'
import * as Icons from '@phosphor-icons/react'
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

const iconColors = [
  'text-[#6DD4FF]',
  'text-[#FF6B9D]',
  'text-[#FFD93D]',
  'text-[#95F985]',
  'text-[#C77DFF]',
  'text-[#FF9770]',
  'text-[#7FFFD4]',
  'text-[#FFB6C1]',
]

const getIconColor = (index: number) => iconColors[index % iconColors.length]

export function HabitCard({ habit, onUpdateProgress, onDelete, onOpenEditDialog, className, style }: HabitCardProps) {
  const getIconComponent = () => {
    if (!habit.icon) return Drop
    const IconComponent = (Icons as any)[habit.icon]
    if (IconComponent) return IconComponent
    
    const name = habit.name.toLowerCase()
    
    if (name.includes('water') || name.includes('drink') || name.includes('hydrat')) return Drop
    if (name.includes('exercise') || name.includes('workout') || name.includes('gym') || name.includes('run')) return Icons.Barbell
    if (name.includes('read') || name.includes('book')) return Icons.Book
    if (name.includes('sleep') || name.includes('rest')) return Icons.Moon
    if (name.includes('meditat') || name.includes('mindful')) return Icons.FlowerLotus
    if (name.includes('walk')) return Icons.PersonSimpleRun
    if (name.includes('stretch') || name.includes('yoga')) return Icons.FlowerLotus
    if (name.includes('food') || name.includes('eat') || name.includes('meal')) return Icons.ForkKnife
    if (name.includes('vitamin') || name.includes('supplement') || name.includes('medicine')) return Icons.FirstAid
    if (name.includes('journal') || name.includes('write')) return Icons.BookOpen
    if (name.includes('learn') || name.includes('study')) return Icons.GraduationCap
    if (name.includes('clean')) return Icons.House
    if (name.includes('call') || name.includes('contact') || name.includes('friend')) return Icons.Chats
    
    return Target
  }

  const IconComponent = getIconComponent()
  const progressPercent = ((habit.currentProgress || 0) / (habit.targetCount || 1)) * 100
  const isComplete = (habit.currentProgress || 0) >= (habit.targetCount || 1)

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
    const isFilled = index < (habit.currentProgress || 0)
    
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
    for (let i = 0; i < (habit.targetCount || 1); i++) {
      const isFilled = i < (habit.currentProgress || 0)
      const colorClass = getIconColor(i)
      
      icons.push(
        <motion.button
          key={i}
          onClick={() => handleIconClick(i)}
          whileHover={{ scale: 1.15, y: -6 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={cn(
            'w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-300',
            'cursor-pointer relative overflow-hidden',
            isFilled
              ? 'glass-card bg-gradient-to-br from-accent-vibrant/30 via-accent-vibrant/30 to-secondary/30 border-2 shadow-2xl'
              : 'glass-morphic border border-border/40 hover:border-accent-vibrant/40 hover:bg-card/50'
          )}
        >
          <IconComponent
            weight={isFilled ? 'fill' : 'regular'}
            className={cn(
              'w-11 h-11 md:w-14 md:h-14 transition-all duration-300',
              isFilled 
                ? `${colorClass} drop-shadow-[0_0_12px_currentColor] brightness-125` 
                : 'text-muted-foreground/60'
            )}
          />
          {isFilled && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-vibrant/10 via-accent-vibrant/10 to-secondary/10"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              />
            </>
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
      <Card className={cn('glass-card p-6 md:p-8 shadow-2xl border-border/30 hover:border-accent-vibrant/30 transition-all duration-500', className)}>
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
              <span className="text-accent-vibrant font-semibold text-lg">{habit.currentProgress || 0}</span>
              <span className="text-muted-foreground/60 mx-1">/</span>
              <span className="text-foreground/80">{habit.targetCount || 1}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEdit}
                className="text-muted-foreground hover:text-accent-vibrant hover:bg-accent-vibrant/10 glass-morphic border border-transparent hover:border-accent-vibrant/30"
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
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-accent-vibrant via-accent-vibrant to-accent-vibrant transition-all duration-500"
            style={{ width: `${progressPercent}%`, boxShadow: '0 0 20px currentColor' }}
          />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
          {renderIconGrid()}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mt-6 p-4 glass-card bg-gradient-to-r from-success/20 to-accent-vibrant/20 border-success/30 rounded-xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-accent-vibrant/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
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
