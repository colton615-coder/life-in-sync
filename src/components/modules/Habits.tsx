import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Fire, CheckCircle, Trash } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function Habits() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', description: '' })

  const today = new Date().toISOString().split('T')[0]

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('Please enter a habit name')
      return
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    }

    setHabits((current) => [...(current || []), habit])
    setNewHabit({ name: '', description: '' })
    setDialogOpen(false)
    toast.success('Habit created!')
  }

  const toggleHabit = (habitId: string) => {
    setHabits((current) => {
      const updated = (current || []).map(habit => {
        if (habit.id !== habitId) return habit

        const completedDates = [...(habit.completedDates || [])]
        const todayIndex = completedDates.indexOf(today)

        if (todayIndex > -1) {
          completedDates.splice(todayIndex, 1)
          return { ...habit, completedDates, streak: Math.max(0, habit.streak - 1) }
        } else {
          completedDates.push(today)
          const newStreak = habit.streak + 1
          
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            toast.success(`🎉 ${newStreak} day streak! Amazing!`)
          }
          
          return { ...habit, completedDates, streak: newStreak }
        }
      })
      return updated
    })
  }

  const deleteHabit = (habitId: string) => {
    setHabits((current) => (current || []).filter(h => h.id !== habitId))
    toast.success('Habit deleted')
  }

  const isCompletedToday = (habit: Habit) => {
    return (habit.completedDates || []).includes(today)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground mt-2">Build consistency, one day at a time</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Habit Name</label>
                <Input
                  placeholder="e.g., Morning meditation"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  placeholder="Why this habit matters..."
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                />
              </div>
              <Button onClick={addHabit} className="w-full">Create Habit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!habits || habits.length === 0 ? (
        <NeumorphicCard className="text-center py-12">
          <Fire size={48} weight="duotone" className="text-accent mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No habits yet</h3>
          <p className="text-muted-foreground">Start your first habit and build a streak!</p>
        </NeumorphicCard>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => (
            <NeumorphicCard key={habit.id} className="relative">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="flex-shrink-0 mt-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <CheckCircle
                      size={32}
                      weight={isCompletedToday(habit) ? 'fill' : 'regular'}
                      className={isCompletedToday(habit) ? 'text-accent' : 'text-muted-foreground'}
                    />
                  </motion.div>
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Fire weight="fill" className="text-orange-500" />
                    <span className="font-semibold">{habit.streak} day streak</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteHabit(habit.id)}
                  className="flex-shrink-0"
                >
                  <Trash size={20} />
                </Button>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      )}
    </div>
  )
}
