import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { HabitCard } from '@/components/HabitCard'
import { AddHabitDialog } from '@/components/AddHabitDialog'
import { EditHabitDialog } from '@/components/EditHabitDialog'
import { HistoryDialog } from '@/components/HistoryDialog'
import { CelebrationOverlay } from '@/components/CelebrationOverlay'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, CalendarDots } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Habit } from '@/lib/types'
import { getTodayKey } from '@/lib/utils'

function App() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [completionHistory, setCompletionHistory] = useKV<Record<string, string[]>>('completion-history', {})
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [celebratingHabit, setCelebratingHabit] = useState<string | null>(null)

  const handleAddHabit = (habit: Omit<Habit, 'id' | 'currentProgress' | 'streak'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      currentProgress: 0,
      streak: 0,
    }
    setHabits((current) => [...(current || []), newHabit])
  }

  const handleUpdateProgress = (habitId: string, newProgress: number) => {
    setHabits((current) =>
      (current || []).map((habit) => {
        if (habit.id === habitId) {
          const updatedHabit = { ...habit, currentProgress: newProgress }
          
          if (newProgress === habit.targetCount && habit.currentProgress < habit.targetCount) {
            setCelebratingHabit(habitId)
            logCompletion(habitId)
            
            const newStreak = calculateStreak(habitId)
            updatedHabit.streak = newStreak
          }
          
          return updatedHabit
        }
        return habit
      })
    )
  }

  const logCompletion = (habitId: string) => {
    const today = getTodayKey()
    setCompletionHistory((current) => {
      const history = current || {}
      const habitHistory = history[habitId] || []
      if (!habitHistory.includes(today)) {
        return {
          ...history,
          [habitId]: [...habitHistory, today],
        }
      }
      return history
    })
  }

  const calculateStreak = (habitId: string): number => {
    const today = getTodayKey()
    const history = completionHistory || {}
    const habitHistory = history[habitId] || []
    
    if (!habitHistory.includes(today)) {
      habitHistory.push(today)
    }
    
    const sortedDates = habitHistory.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime())
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const date of sortedDates) {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      const diffDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === streak) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const handleDeleteHabit = (habitId: string) => {
    setHabits((current) => (current || []).filter((h) => h.id !== habitId))
  }

  const handleEditHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits((current) =>
      (current || []).map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit))
    )
    toast.success('Habit updated')
  }

  const handleOpenEditDialog = (habit: Habit) => {
    setEditingHabit(habit)
    setEditDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 md:mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-2">
            Habit Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Build better habits, one step at a time
          </p>
        </header>

        <Tabs defaultValue="habits" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="habits">My Habits</TabsTrigger>
            <TabsTrigger value="history" onClick={() => setHistoryDialogOpen(true)}>
              <CalendarDots className="mr-2" size={18} />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits" className="space-y-6">
            {(!habits || habits.length === 0) ? (
              <div className="text-center py-16 animate-slide-up">
                <div className="mb-6 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus size={48} weight="bold" className="text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Start Your First Habit</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Set a daily goal and track your progress with satisfying visual feedback
                </p>
                <Button onClick={() => setAddDialogOpen(true)} size="lg" className="animate-pulse-button">
                  <Plus className="mr-2" size={20} weight="bold" />
                  Add Your First Habit
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {(habits || []).map((habit, index) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onUpdateProgress={handleUpdateProgress}
                      onDelete={handleDeleteHabit}
                      onEdit={handleEditHabit}
                      onOpenEditDialog={handleOpenEditDialog}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="animate-slide-up"
                    />
                  ))}
                </div>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2" size={20} weight="bold" />
                  Add Another Habit
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddHabitDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddHabit={handleAddHabit}
      />

      <EditHabitDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        habit={editingHabit}
        onEditHabit={handleEditHabit}
      />

      <HistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        habits={habits || []}
        completionHistory={completionHistory || {}}
      />

      {celebratingHabit && habits && (
        <CelebrationOverlay
          habit={habits.find((h) => h.id === celebratingHabit)!}
          onClose={() => setCelebratingHabit(null)}
        />
      )}

      <Toaster position="top-right" />
    </div>
  )
}

export default App
