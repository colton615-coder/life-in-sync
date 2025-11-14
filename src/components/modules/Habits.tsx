import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Plus, Fire, CheckCircle, Trash, Clock, Hash, Check, Sparkle, X, ArrowRight, ArrowLeft, Minus } from '@phosphor-icons/react'
import * as Icons from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit, TrackingType, HabitEntry, HabitIcon } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Confetti } from '@/components/Confetti'
import { IconPicker } from '@/components/IconPicker'
import { StatCard } from '@/components/StatCard'

const trackingTypeOptions = [
  { value: 'boolean' as TrackingType, icon: Check, label: 'Simple Checkbox', description: 'Just mark it done' },
  { value: 'numerical' as TrackingType, icon: Hash, label: 'Track Numbers', description: 'Track reps, pages, glasses' },
  { value: 'time' as TrackingType, icon: Clock, label: 'Track Time', description: 'Measure minutes or hours' },
]

export function Habits() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [creationStep, setCreationStep] = useState(0)
  const [filterTab, setFilterTab] = useState('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [animatingStreak, setAnimatingStreak] = useState<string | null>(null)
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    trackingType: 'boolean' as TrackingType,
    target: '',
    unit: '',
    icon: 'Drop' as HabitIcon
  })

  const today = new Date().toISOString().split('T')[0]

  const resetCreation = () => {
    setCreationStep(0)
    setNewHabit({
      name: '',
      description: '',
      trackingType: 'boolean',
      target: '',
      unit: '',
      icon: 'Drop'
    })
  }

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('Please give your habit a name')
      return
    }

    if (newHabit.trackingType !== 'boolean') {
      if (!newHabit.target || parseFloat(newHabit.target) <= 0) {
        toast.error('Please set a daily goal')
        return
      }
      if (newHabit.trackingType === 'numerical' && !newHabit.unit.trim()) {
        toast.error('What are you counting? (e.g., reps, pages, cups)')
        return
      }
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      trackingType: newHabit.trackingType,
      target: newHabit.trackingType !== 'boolean' ? parseFloat(newHabit.target) : undefined,
      unit: newHabit.trackingType === 'numerical' ? newHabit.unit : newHabit.trackingType === 'time' ? 'minutes' : undefined,
      icon: newHabit.icon,
      streak: 0,
      entries: [],
      createdAt: new Date().toISOString()
    }

    setHabits((current) => [...(current || []), habit])
    toast.success(`🎉 ${newHabit.name} is ready to go!`)
    resetCreation()
  }

  const incrementNumerical = (habitId: string) => {
    setHabits((current) => {
      if (!current) return []
      
      const updated = current.map(habit => {
        if (habit.id !== habitId) return habit

        const entries = [...(habit.entries || [])]
        const todayIndex = entries.findIndex(e => e.date === today)
        
        const currentValue = todayIndex > -1 
          ? (habit.trackingType === 'numerical' ? (entries[todayIndex].value || 0) : (entries[todayIndex].minutes || 0))
          : 0
        
        const newValue = currentValue + 1

        const newEntry: HabitEntry = {
          date: today,
          ...(habit.trackingType === 'numerical' ? { value: newValue } : {}),
          ...(habit.trackingType === 'time' ? { minutes: newValue } : {})
        }

        const wasAlreadyComplete = currentValue >= (habit.target || 0)
        const isNowComplete = newValue >= (habit.target || 0)

        if (todayIndex > -1) {
          entries[todayIndex] = newEntry
        } else {
          entries.push(newEntry)
        }

        const newStreak = calculateStreak(entries, habit)
        
        if (isNowComplete && !wasAlreadyComplete) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
          
          setAnimatingStreak(habitId)
          setTimeout(() => setAnimatingStreak(null), 600)
          
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            toast.success(`🎉 ${newStreak} day streak! Amazing!`)
          } else {
            toast.success('🎉 Goal completed!')
          }
        }

        return { ...habit, entries, streak: newStreak }
      })
      return updated
    })
  }

  const decrementNumerical = (habitId: string) => {
    setHabits((current) => {
      if (!current) return []
      
      const updated = current.map(habit => {
        if (habit.id !== habitId) return habit

        const entries = [...(habit.entries || [])]
        const todayIndex = entries.findIndex(e => e.date === today)
        
        if (todayIndex === -1) return habit
        
        const currentValue = habit.trackingType === 'numerical' 
          ? (entries[todayIndex].value || 0) 
          : (entries[todayIndex].minutes || 0)
        
        if (currentValue <= 0) return habit
        
        const newValue = currentValue - 1

        if (newValue === 0) {
          entries.splice(todayIndex, 1)
        } else {
          const newEntry: HabitEntry = {
            date: today,
            ...(habit.trackingType === 'numerical' ? { value: newValue } : {}),
            ...(habit.trackingType === 'time' ? { minutes: newValue } : {})
          }
          entries[todayIndex] = newEntry
        }

        const newStreak = calculateStreak(entries, habit)

        return { ...habit, entries, streak: newStreak }
      })
      return updated
    })
  }

  const toggleBooleanHabit = (habitId: string) => {
    setHabits((current) => {
      if (!current) return []
      
      const updated = current.map(habit => {
        if (habit.id !== habitId || habit.trackingType !== 'boolean') return habit

        const entries = [...(habit.entries || [])]
        const todayIndex = entries.findIndex(e => e.date === today)

        if (todayIndex > -1) {
          entries.splice(todayIndex, 1)
        } else {
          entries.push({ date: today, completed: true })
          
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
          
          const newStreak = calculateStreak([...entries, { date: today, completed: true }], habit)
          
          setAnimatingStreak(habitId)
          setTimeout(() => setAnimatingStreak(null), 600)
          
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            toast.success(`🎉 ${newStreak} day streak! Amazing!`)
          } else {
            toast.success('🎉 Habit completed!')
          }
        }

        const newStreak = calculateStreak(entries, habit)

        return { ...habit, entries, streak: newStreak }
      })
      return updated
    })
  }

  const calculateStreak = (entries: HabitEntry[], habit: Habit): number => {
    if (entries.length === 0) return 0

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    let streak = 0
    let checkDate = new Date()
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date)
      const daysDiff = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff > streak + 1) break

      const isComplete = habit.trackingType === 'boolean' 
        ? entry.completed 
        : habit.trackingType === 'numerical'
        ? (entry.value || 0) >= (habit.target || 0)
        : (entry.minutes || 0) >= (habit.target || 0)

      if (isComplete) {
        streak++
        checkDate = entryDate
      } else {
        break
      }
    }

    return streak
  }

  const deleteHabit = (habitId: string) => {
    setHabits((current) => current ? current.filter(h => h.id !== habitId) : [])
    toast.success('Habit removed')
  }

  const getTodayEntry = (habit: Habit): HabitEntry | undefined => {
    return habit.entries?.find(e => e.date === today)
  }

  const isCompletedToday = (habit: Habit): boolean => {
    const todayEntry = getTodayEntry(habit)
    if (!todayEntry) return false

    if (habit.trackingType === 'boolean') {
      return todayEntry.completed === true
    } else if (habit.trackingType === 'numerical') {
      return (todayEntry.value || 0) >= (habit.target || 0)
    } else if (habit.trackingType === 'time') {
      return (todayEntry.minutes || 0) >= (habit.target || 0)
    }
    return false
  }

  const getTodayProgress = (habit: Habit): string => {
    const todayEntry = getTodayEntry(habit)
    if (!todayEntry) return ''

    if (habit.trackingType === 'numerical') {
      return `${todayEntry.value || 0} / ${habit.target} ${habit.unit}`
    } else if (habit.trackingType === 'time') {
      return `${todayEntry.minutes || 0} / ${habit.target} min`
    }
    return ''
  }

  const getIconComponent = (iconName: HabitIcon, habitName?: string) => {
    const IconComponent = (Icons as any)[iconName]
    if (IconComponent) return IconComponent
    
    if (!habitName) return Icons.Target
    
    const name = habitName.toLowerCase()
    
    if (name.includes('water') || name.includes('drink') || name.includes('hydrat')) return Icons.Drop
    if (name.includes('exercise') || name.includes('workout') || name.includes('gym')) return Icons.Barbell
    if (name.includes('run')) return Icons.PersonSimpleRun
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
    
    return Icons.Target
  }

  const { activeHabits, completedHabits } = (() => {
    const active: Habit[] = []
    const completed: Habit[] = []
    
    habits?.forEach(habit => {
      if (isCompletedToday(habit)) {
        completed.push(habit)
      } else {
        active.push(habit)
      }
    })
    
    return { activeHabits: active, completedHabits: completed }
  })()

  const filteredHabits = (() => {
    if (filterTab === 'all') return [...activeHabits, ...completedHabits]
    if (filterTab === 'active') return activeHabits
    if (filterTab === 'completed') return completedHabits
    return habits || []
  })()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  const getStepPrompt = () => {
    switch (creationStep) {
      case 1: return "What habit do you want to build?"
      case 2: return "Pick an icon that represents this habit"
      case 3: return "How do you want to track it?"
      case 4: 
        if (newHabit.trackingType === 'numerical') {
          return "What's your daily goal?"
        } else if (newHabit.trackingType === 'time') {
          return "How many minutes per day?"
        }
        return ""
      default: return ""
    }
  }

  const canProceedToNextStep = () => {
    switch (creationStep) {
      case 1: return newHabit.name.trim().length > 0
      case 2: return true
      case 3: return true
      case 4: 
        if (newHabit.trackingType === 'boolean') return true
        if (newHabit.trackingType === 'numerical') {
          return newHabit.target && parseFloat(newHabit.target) > 0 && newHabit.unit.trim().length > 0
        }
        if (newHabit.trackingType === 'time') {
          return newHabit.target && parseFloat(newHabit.target) > 0
        }
        return false
      default: return false
    }
  }

  return (
    <div className="pt-2 md:pt-4 space-y-3 md:space-y-4 animate-in fade-in duration-500">
      {showConfetti && <Confetti />}
      
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">🔥 Habits</h1>
          <p className="text-muted-foreground mt-1 text-sm font-normal">Same circus, different day</p>
        </div>
        {creationStep === 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreationStep(1)}
            className="gap-2 px-6 md:px-8 h-14 md:h-16 rounded-2xl flex items-center justify-center font-semibold text-base md:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
          >
            <Plus size={22} weight="bold" className="md:w-6 md:h-6" />
            <span className="hidden sm:inline">New Habit</span>
            <span className="sm:hidden">New</span>
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {creationStep > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card border-primary/30 shadow-xl p-3 md:p-6">
              <div className="flex items-start justify-between mb-3 md:mb-5">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full glass-card border-primary/30 flex items-center justify-center">
                    <Sparkle weight="fill" className="text-primary" size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">Create New Habit</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Step {creationStep} of {newHabit.trackingType === 'boolean' ? 3 : 4}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetCreation}
                  className="text-muted-foreground hover:text-foreground h-8 w-8 md:h-10 md:w-10"
                >
                  <X size={18} className="md:w-5 md:h-5" />
                </Button>
              </div>

              <div className="space-y-3 md:space-y-5">
                <motion.div
                  key={creationStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-base md:text-xl font-semibold mb-3 md:mb-5 text-primary">{getStepPrompt()}</h2>

                  {creationStep === 1 && (
                    <div className="space-y-2 md:space-y-3">
                      <Input
                        placeholder="e.g., Drink water, Read, Exercise, Meditate"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        className="h-11 md:h-12 text-base glass-morphic border-border/50 focus:border-primary"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && canProceedToNextStep()) {
                            setCreationStep(2)
                          }
                        }}
                      />
                      <Input
                        placeholder="Why does this matter to you? (optional)"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                        className="h-10 md:h-11 glass-morphic border-border/50 focus:border-primary"
                      />
                    </div>
                  )}

                  {creationStep === 2 && (
                    <IconPicker
                      value={newHabit.icon}
                      onChange={(iconName) => setNewHabit({ ...newHabit, icon: iconName })}
                    />
                  )}

                  {creationStep === 3 && (
                    <div className="grid gap-3">
                      {trackingTypeOptions.map(({ value, icon: Icon, label, description }) => (
                        <motion.button
                          key={value}
                          onClick={() => {
                            setNewHabit({ ...newHabit, trackingType: value })
                            if (value === 'boolean') {
                              setTimeout(() => addHabit(), 100)
                            } else {
                              setTimeout(() => setCreationStep(4), 100)
                            }
                          }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all text-left',
                            newHabit.trackingType === value
                              ? 'glass-card border-primary bg-primary/20'
                              : 'glass-morphic border-border/50 hover:border-primary/30'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center',
                            newHabit.trackingType === value ? 'bg-primary/30' : 'bg-muted/50'
                          )}>
                            <Icon size={20} weight="bold" className={cn(newHabit.trackingType === value ? 'text-primary' : 'text-muted-foreground', 'md:w-6 md:h-6')} />
                          </div>
                          <div>
                            <div className="font-semibold text-base md:text-lg">{label}</div>
                            <div className="text-xs md:text-sm text-muted-foreground">{description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {creationStep === 4 && (
                    <div className="space-y-3 md:space-y-4">
                      {newHabit.trackingType === 'numerical' && (
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-xs md:text-sm font-medium text-muted-foreground mb-1.5 md:mb-2 block">Target number</label>
                            <Input
                              type="number"
                              placeholder="e.g., 8"
                              value={newHabit.target}
                              onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                              className="h-11 md:h-12 text-base glass-morphic border-border/50 focus:border-primary"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-xs md:text-sm font-medium text-muted-foreground mb-1.5 md:mb-2 block">What are you counting?</label>
                            <Input
                              placeholder="e.g., glasses, pages, reps"
                              value={newHabit.unit}
                              onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                              className="h-11 md:h-12 text-base glass-morphic border-border/50 focus:border-primary"
                            />
                          </div>
                        </div>
                      )}
                      {newHabit.trackingType === 'time' && (
                        <div>
                          <label className="text-xs md:text-sm font-medium text-muted-foreground mb-1.5 md:mb-2 block">Minutes per day</label>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={newHabit.target}
                            onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                            className="h-11 md:h-12 text-base glass-morphic border-border/50 focus:border-primary"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (creationStep > 1) {
                        setCreationStep(creationStep - 1)
                      } else {
                        resetCreation()
                      }
                    }}
                    className="gap-2"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </Button>
                  <Button
                    onClick={() => {
                      if (creationStep === 3 && newHabit.trackingType === 'boolean') {
                        addHabit()
                      } else if (creationStep === 4) {
                        addHabit()
                      } else if (canProceedToNextStep()) {
                        setCreationStep(creationStep + 1)
                      }
                    }}
                    disabled={!canProceedToNextStep()}
                    className="gap-2 shadow-lg shadow-primary/20"
                  >
                    {creationStep === 4 || (creationStep === 3 && newHabit.trackingType === 'boolean') ? 'Create Habit' : 'Continue'}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {creationStep === 0 && (
        <>
          {habits && habits.length > 0 && (
            <StatCard 
              stats={[
                { value: habits.length, label: 'Total' },
                { value: activeHabits.length, label: 'Active' },
                { value: completedHabits.length, label: 'Done' }
              ]}
            />
          )}

          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit mx-auto">
            <button
              onClick={() => setFilterTab('all')}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                filterTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
            >
              All Habits
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                filterTab === 'active'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                filterTab === 'completed'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
            >
              Completed
            </button>
          </div>

          {!habits || habits.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <Fire size={48} weight="duotone" className="text-primary mx-auto mb-3 md:mb-4 md:w-14 md:h-14" />
              <h3 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">No habits yet</h3>
              <p className="text-muted-foreground text-sm md:text-[15px] mb-4 md:mb-6">Start your first habit and build a streak!</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCreationStep(1)}
                className="gap-2 px-6 md:px-8 h-14 md:h-16 rounded-2xl inline-flex items-center justify-center font-semibold text-base md:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <Plus size={22} weight="bold" className="md:w-6 md:h-6" />
                Create Your First Habit
              </motion.button>
            </Card>
          ) : filteredHabits.length === 0 ? (
            <Card className="text-center py-12 md:py-16">
              <CheckCircle size={48} weight="duotone" className="text-primary mx-auto mb-3 md:mb-4 md:w-14 md:h-14" />
              <h3 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">No habits in this filter</h3>
              <p className="text-muted-foreground text-sm md:text-[15px]">Try a different filter to see your habits</p>
            </Card>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-2 md:gap-3"
            >
              {filteredHabits.map((habit) => {
                const completed = isCompletedToday(habit)
                const progress = getTodayProgress(habit)
                const IconComponent = getIconComponent(habit.icon || 'Drop', habit.name)
                const todayEntry = getTodayEntry(habit)
                const currentValue = todayEntry 
                  ? (habit.trackingType === 'numerical' ? (todayEntry.value || 0) : (todayEntry.minutes || 0))
                  : 0
                
                const iconColors = [
                  'text-cyan-400',
                  'text-blue-400', 
                  'text-purple-400',
                  'text-pink-400',
                  'text-rose-400',
                  'text-orange-400',
                  'text-amber-400',
                  'text-yellow-400',
                  'text-lime-400',
                  'text-green-400',
                  'text-emerald-400',
                  'text-teal-400',
                ]
                
                const iconColor = iconColors[parseInt(habit.id) % iconColors.length]
                
                return (
                  <motion.div key={habit.id} variants={item}>
                    <Card className="relative glass-card hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-start gap-2.5 md:gap-4">
                        {habit.trackingType === 'boolean' ? (
                          <button
                            onClick={() => toggleBooleanHabit(habit.id)}
                            className="flex-shrink-0"
                          >
                            <motion.div
                              whileTap={{ scale: 0.85 }}
                              whileHover={{ scale: 1.05 }}
                              className={cn(
                                'w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center border-2 transition-all',
                                completed 
                                  ? 'glass-card border-primary bg-primary/20 shadow-lg shadow-primary/30' 
                                  : 'glass-morphic border-border/50'
                              )}
                            >
                              <IconComponent
                                size={28}
                                weight={completed ? 'fill' : 'regular'}
                                className={cn('transition-all md:hidden', completed ? iconColor : 'text-muted-foreground')}
                              />
                              <IconComponent
                                size={36}
                                weight={completed ? 'fill' : 'regular'}
                                className={cn('transition-all hidden md:block', completed ? iconColor : 'text-muted-foreground')}
                              />
                            </motion.div>
                          </button>
                        ) : (
                          <div className="flex-shrink-0">
                            <motion.div
                              className={cn(
                                'w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl flex items-center justify-center border-2 transition-all',
                                completed 
                                  ? 'glass-card border-primary bg-primary/20 shadow-lg shadow-primary/30' 
                                  : 'glass-morphic border-border/50'
                              )}
                            >
                              <IconComponent
                                size={28}
                                weight={completed ? 'fill' : 'regular'}
                                className={cn('transition-all md:hidden', completed ? iconColor : 'text-muted-foreground')}
                              />
                              <IconComponent
                                size={36}
                                weight={completed ? 'fill' : 'regular'}
                                className={cn('transition-all hidden md:block', completed ? iconColor : 'text-muted-foreground')}
                              />
                            </motion.div>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm md:text-lg">{habit.name}</h3>
                          </div>
                          {habit.description && (
                            <p className="text-xs md:text-sm text-muted-foreground mb-1.5 md:mb-2">{habit.description}</p>
                          )}
                          
                          {habit.trackingType !== 'boolean' && (
                            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                              <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg glass-card border border-primary/30 text-primary text-xs md:text-sm font-bold">
                                {currentValue} / {habit.target} {habit.unit || 'min'}
                              </div>
                              <div className="flex items-center gap-1 md:gap-1.5">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => decrementNumerical(habit.id)}
                                  disabled={currentValue === 0}
                                  className={cn(
                                    "w-7 h-7 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all",
                                    currentValue === 0 
                                      ? "glass-morphic border border-border/30 text-muted-foreground/30 cursor-not-allowed"
                                      : "glass-card border border-primary/30 text-primary hover:bg-primary/20"
                                  )}
                                >
                                  <Minus size={14} weight="bold" className="md:hidden" />
                                  <Minus size={18} weight="bold" className="hidden md:block" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => incrementNumerical(habit.id)}
                                  className="w-7 h-7 md:w-9 md:h-9 rounded-lg glass-card border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 transition-all shadow-lg shadow-primary/20"
                                >
                                  <Plus size={14} weight="bold" className="md:hidden" />
                                  <Plus size={18} weight="bold" className="hidden md:block" />
                                </motion.button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-1 md:gap-1.5">
                              <Fire weight="fill" className="text-orange-500" size={14} />
                              <motion.span 
                                key={`${habit.id}-${habit.streak}`}
                                animate={animatingStreak === habit.id ? {
                                  scale: [1, 1.4, 1],
                                  rotate: [0, 5, -5, 0]
                                } : {}}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="font-semibold text-xs md:text-sm"
                              >
                                {habit.streak}
                              </motion.span>
                              <span className="font-normal text-xs md:text-sm">day streak</span>
                            </div>
                            {completed && (
                              <Badge variant="outline" className="text-[10px] md:text-xs border-primary/30 text-primary glass-morphic px-1.5 py-0">
                                ✓ Done today
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="flex-shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-7 h-7 md:w-9 md:h-9"
                        >
                          <Trash size={14} className="md:hidden" />
                          <Trash size={18} className="hidden md:block" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
