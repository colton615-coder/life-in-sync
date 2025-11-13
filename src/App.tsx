import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { HabitCard } from '@/components/HabitCard'
import { AddHabitDialog } from '@/components/AddHabitDialog'
import { EditHabitDialog } from '@/components/EditHabitDialog'
import { HistoryDialog } from '@/components/HistoryDialog'
import { CelebrationOverlay } from '@/components/CelebrationOverlay'
import { NavigationDrawer } from '@/components/NavigationDrawer'
import { NavigationButton } from '@/components/NavigationButton'
import { AbstractBackground } from '@/components/AbstractBackground'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Habit } from '@/lib/types'
import { getTodayKey } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [completionHistory, setCompletionHistory] = useKV<Record<string, string[]>>('completion-history', {})
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [celebratingHabit, setCelebratingHabit] = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState('habits')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleAddHabit = (habit: Omit<Habit, 'id' | 'currentProgress' | 'streak'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      currentProgress: 0,
      streak: 0,
    }
    setHabits((current) => [...(current || []), newHabit])
    toast.success('Habit created', {
      description: `"${habit.name}" added to your tracker`,
    })
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

  const handleTabChange = (tabId: string) => {
    if (tabId === 'history') {
      setHistoryDialogOpen(true)
    } else if (tabId === 'analytics' || tabId === 'settings') {
      toast.info('Coming soon', {
        description: `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} feature is under development`,
      })
    }
  }

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId)
    
    if (moduleId === 'history') {
      setHistoryDialogOpen(true)
    } else if (['dashboard', 'finance', 'tasks', 'workouts', 'knox', 'shopping', 'calendar', 'vault', 'settings'].includes(moduleId)) {
      toast.info('Coming soon', {
        description: `${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} module is under development`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <AbstractBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-16 pb-32">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Habit Matrix
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Track your progress with precision and style
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          {(!habits || habits.length === 0) ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="mb-8 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-3xl glass-card flex items-center justify-center border-2 border-primary/30"
                >
                  <Plus size={64} weight="bold" className="text-primary neon-glow" />
                </motion.div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Initialize Your First Protocol</h2>
              <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
                Deploy a new habit tracking system and monitor your daily execution
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setAddDialogOpen(true)} 
                  size="lg" 
                  className="glass-card bg-gradient-to-r from-primary/30 to-accent/30 hover:from-primary/50 hover:to-accent/50 border-primary/50 text-lg px-8 py-6 h-auto animate-glow"
                >
                  <Plus className="mr-2" size={24} weight="bold" />
                  Deploy Protocol
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="habits"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {(habits || []).map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <HabitCard
                      habit={habit}
                      onUpdateProgress={handleUpdateProgress}
                      onDelete={handleDeleteHabit}
                      onEdit={handleEditHabit}
                      onOpenEditDialog={handleOpenEditDialog}
                    />
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: habits.length * 0.1 + 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  size="lg"
                  className="w-full glass-card bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 border-primary/30 text-lg py-6 h-auto"
                >
                  <Plus className="mr-2" size={24} weight="bold" />
                  Deploy New Protocol
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NavigationButton 
        onClick={() => setDrawerOpen(!drawerOpen)}
        isOpen={drawerOpen}
      />

      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

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
        onOpenChange={(open) => {
          setHistoryDialogOpen(open)
          if (!open) setActiveModule('habits')
        }}
        habits={habits || []}
        completionHistory={completionHistory || {}}
      />

      {celebratingHabit && habits && (
        <CelebrationOverlay
          habit={habits.find((h) => h.id === celebratingHabit)!}
          onClose={() => setCelebratingHabit(null)}
        />
      )}

      <Toaster position="top-right" theme="dark" />
    </div>
  )
}

export default App
