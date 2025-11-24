import { GlassCard } from '@/components/shell/GlassCard'
import { Button } from '@/components/ui/button'
import { Plus, Fire, CheckCircle, Trash, Clock, Hash, Check, Sparkle, X, ArrowRight, ArrowLeft, Minus } from '@phosphor-icons/react'
import { HabitIcons } from '@/lib/habit-icons'
import { useKV } from '@/hooks/use-kv'
import { Habit, TrackingType, HabitEntry, HabitIcon } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Confetti } from '@/components/Confetti'
import { IconPicker } from '@/components/IconPicker'

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

  const getIconComponent = (iconName: HabitIcon, habitName?: string) => {
    const IconComponent = HabitIcons[iconName]
    if (IconComponent) return IconComponent
    return HabitIcons.Target
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
    <div className="pt-4 md:pt-6 space-y-4 md:space-y-5 animate-in fade-in duration-500 px-1 md:px-0">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-wide">Habits</h1>
          <p className="text-slate-400 mt-1 text-sm">Consistency is key, Architect.</p>
        </div>
        {creationStep === 0 && (
          <Button
            size="default"
            onClick={() => setCreationStep(1)}
            className="gap-2 h-10 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md rounded-full"
          >
            <Plus size={18} weight="bold" />
            <span>New Protocol</span>
          </Button>
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
            <GlassCard className="p-6">
              <div className="flex items-start justify-between mb-4 md:mb-5">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Sparkle weight="fill" size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg">New Protocol</h3>
                    <p className="text-sm text-slate-400">Step {creationStep} of {newHabit.trackingType === 'boolean' ? 3 : 4}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetCreation}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <motion.div
                  key={creationStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-light text-white mb-4">{getStepPrompt()}</h2>

                  {creationStep === 1 && (
                    <div className="space-y-3">
                      <Input
                        placeholder="e.g., Drink water, Read, Exercise"
                        value={newHabit.name}
                        onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && canProceedToNextStep()) {
                            setCreationStep(2)
                          }
                        }}
                      />
                      <Input
                        placeholder="Purpose (optional)"
                        value={newHabit.description}
                        onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
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
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                            newHabit.trackingType === value
                              ? 'bg-cyan-500/20 border-cyan-500/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            newHabit.trackingType === value ? 'text-cyan-400' : 'text-slate-400'
                          )}>
                            <Icon size={24} weight="regular" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{label}</div>
                            <div className="text-sm text-slate-400">{description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {creationStep === 4 && (
                    <div className="space-y-4">
                      {newHabit.trackingType === 'numerical' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Target</label>
                            <Input
                              type="number"
                              placeholder="e.g., 8"
                              value={newHabit.target}
                              onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-400 mb-2 block">Unit</label>
                            <Input
                              placeholder="e.g., pages"
                              value={newHabit.unit}
                              onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      )}
                      {newHabit.trackingType === 'time' && (
                        <div>
                          <label className="text-sm font-medium text-slate-400 mb-2 block">Minutes per day</label>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            value={newHabit.target}
                            onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (creationStep > 1) {
                        setCreationStep(creationStep - 1)
                      } else {
                        resetCreation()
                      }
                    }}
                    className="gap-2 text-slate-400 hover:text-white"
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
                    className="gap-2 bg-cyan-500 hover:bg-cyan-600 text-white border-0"
                  >
                    {creationStep === 4 || (creationStep === 3 && newHabit.trackingType === 'boolean') ? 'Initialize' : 'Continue'}
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {creationStep === 0 && (
        <>
          {!habits || habits.length === 0 ? (
            <GlassCard className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                  <Fire size={32} weight="duotone" />
              </div>
              <h3 className="font-light text-xl text-white mb-2">No active protocols</h3>
              <p className="text-slate-400 text-sm mb-6">Initiate your first habit sequence.</p>
              <Button
                onClick={() => setCreationStep(1)}
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Plus size={18} weight="bold" />
                Initialize Protocol
              </Button>
            </GlassCard>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {filteredHabits.map((habit) => {
                const completed = isCompletedToday(habit)
                const IconComponent = getIconComponent(habit.icon || 'Drop', habit.name)
                const todayEntry = getTodayEntry(habit)
                const currentValue = todayEntry 
                  ? (habit.trackingType === 'numerical' ? (todayEntry.value || 0) : (todayEntry.minutes || 0))
                  : 0
                
                return (
                  <motion.div key={habit.id} variants={item}>
                    <GlassCard className={cn(
                        "p-4 transition-all duration-300 group",
                         completed ? "border-emerald-500/30" : "hover:border-cyan-400/30"
                    )}>
                      <div className="flex items-center justify-between">
                        
                        {/* Left Section: Icon & Info */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => habit.trackingType === 'boolean' && toggleBooleanHabit(habit.id)}
                                disabled={habit.trackingType !== 'boolean'}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                                    completed
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        : "bg-white/5 text-slate-400 border border-white/10 group-hover:border-cyan-400/50"
                                )}
                            >
                                <IconComponent size={20} weight={completed ? "fill" : "regular"} />
                            </button>

                            <div>
                                <h3 className={cn(
                                    "font-medium transition-colors",
                                    completed ? "text-emerald-100" : "text-slate-200"
                                )}>
                                    {habit.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Fire size={12} weight="fill" className={completed ? "text-emerald-400" : "text-amber-500"} />
                                    <span className="text-xs text-slate-400">{habit.streak} day streak</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Controls or Status */}
                        <div className="flex items-center">
                            {completed ? (
                                <div className="h-8 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981] rounded-full" />
                            ) : (
                                <>
                                    {habit.trackingType !== 'boolean' && (
                                         <div className="flex items-center gap-2 mr-2">
                                            <span className="text-xs font-mono text-slate-300">
                                                {currentValue} / {habit.target} {habit.unit}
                                            </span>
                                            <button
                                                onClick={() => incrementNumerical(habit.id)}
                                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                         </div>
                                    )}
                                    <div className="h-8 w-1 bg-white/10 rounded-full" />
                                </>
                            )}
                        </div>
                      </div>
                    </GlassCard>
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
