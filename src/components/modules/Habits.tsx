import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Fire, CheckCircle, Trash, Clock, Hash, Check, Minus } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit, TrackingType, HabitEntry } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function Habits() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [trackDialogOpen, setTrackDialogOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [trackValue, setTrackValue] = useState<string>('')
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    trackingType: 'boolean' as TrackingType,
    target: '',
    unit: ''
  })

  const today = new Date().toISOString().split('T')[0]

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      toast.error('Please enter a habit name')
      return
    }

    if (newHabit.trackingType !== 'boolean') {
      if (!newHabit.target || parseFloat(newHabit.target) <= 0) {
        toast.error('Please enter a valid target value')
        return
      }
      if (newHabit.trackingType === 'numerical' && !newHabit.unit.trim()) {
        toast.error('Please enter a unit (e.g., reps, pages, cups)')
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
      streak: 0,
      entries: [],
      createdAt: new Date().toISOString()
    }

    setHabits((current) => [...(current || []), habit])
    setNewHabit({ name: '', description: '', trackingType: 'boolean', target: '', unit: '' })
    setDialogOpen(false)
    toast.success('Habit created!')
  }

  const openTrackDialog = (habit: Habit) => {
    setSelectedHabit(habit)
    const todayEntry = getTodayEntry(habit)
    if (todayEntry) {
      if (habit.trackingType === 'numerical' && todayEntry.value !== undefined) {
        setTrackValue(todayEntry.value.toString())
      } else if (habit.trackingType === 'time' && todayEntry.minutes !== undefined) {
        setTrackValue(todayEntry.minutes.toString())
      }
    } else {
      setTrackValue('')
    }
    setTrackDialogOpen(true)
  }

  const trackHabit = () => {
    if (!selectedHabit) return

    if (selectedHabit.trackingType === 'boolean') {
      toggleBooleanHabit(selectedHabit.id)
      setTrackDialogOpen(false)
      return
    }

    const value = parseFloat(trackValue)
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid value')
      return
    }

    setHabits((current) => {
      const updated = (current || []).map(habit => {
        if (habit.id !== selectedHabit.id) return habit

        const entries = [...(habit.entries || [])]
        const todayIndex = entries.findIndex(e => e.date === today)

        const newEntry: HabitEntry = {
          date: today,
          ...(habit.trackingType === 'numerical' ? { value } : {}),
          ...(habit.trackingType === 'time' ? { minutes: value } : {})
        }

        const isTargetMet = value >= (habit.target || 0)

        if (todayIndex > -1) {
          entries[todayIndex] = newEntry
        } else {
          entries.push(newEntry)
        }

        const newStreak = calculateStreak(entries, habit)
        
        if (isTargetMet && todayIndex === -1) {
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            toast.success(`🎉 ${newStreak} day streak! Amazing!`)
          } else {
            toast.success('Progress logged!')
          }
        }

        return { ...habit, entries, streak: newStreak }
      })
      return updated
    })

    setTrackDialogOpen(false)
    setTrackValue('')
  }

  const toggleBooleanHabit = (habitId: string) => {
    setHabits((current) => {
      const updated = (current || []).map(habit => {
        if (habit.id !== habitId || habit.trackingType !== 'boolean') return habit

        const entries = [...(habit.entries || [])]
        const todayIndex = entries.findIndex(e => e.date === today)

        if (todayIndex > -1) {
          entries.splice(todayIndex, 1)
        } else {
          entries.push({ date: today, completed: true })
        }

        const newStreak = calculateStreak(entries, habit)
        
        if (todayIndex === -1) {
          if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
            toast.success(`🎉 ${newStreak} day streak! Amazing!`)
          }
        }

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
    setHabits((current) => (current || []).filter(h => h.id !== habitId))
    toast.success('Habit deleted')
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

  const getTrackingIcon = (type: TrackingType) => {
    switch (type) {
      case 'boolean': return <Check size={20} />
      case 'numerical': return <Hash size={20} />
      case 'time': return <Clock size={20} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground mt-2">Track behaviors numerically, by time, or simple completion</p>
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
                  placeholder="e.g., Morning meditation, Read pages, Exercise"
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
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tracking Type</label>
                <Select 
                  value={newHabit.trackingType} 
                  onValueChange={(value) => setNewHabit({ ...newHabit, trackingType: value as TrackingType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Simple Check-off</SelectItem>
                    <SelectItem value="numerical">Numerical (reps, pages, etc.)</SelectItem>
                    <SelectItem value="time">Time-based (minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newHabit.trackingType === 'numerical' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Value</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Unit</label>
                    <Input
                      placeholder="e.g., reps, pages, cups, km"
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                    />
                  </div>
                </>
              )}
              {newHabit.trackingType === 'time' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Target (minutes)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                  />
                </div>
              )}
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
          {habits.map((habit) => {
            const completed = isCompletedToday(habit)
            const progress = getTodayProgress(habit)
            
            return (
              <NeumorphicCard key={habit.id} className="relative">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => {
                      if (habit.trackingType === 'boolean') {
                        toggleBooleanHabit(habit.id)
                      } else {
                        openTrackDialog(habit)
                      }
                    }}
                    className="flex-shrink-0 mt-1"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {habit.trackingType === 'boolean' ? (
                        <CheckCircle
                          size={32}
                          weight={completed ? 'fill' : 'regular'}
                          className={completed ? 'text-accent' : 'text-muted-foreground'}
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          completed ? 'bg-accent border-accent text-white' : 'border-muted-foreground text-muted-foreground'
                        }`}>
                          {getTrackingIcon(habit.trackingType)}
                        </div>
                      )}
                    </motion.div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    )}
                    {progress && (
                      <p className="text-sm font-medium mt-2 text-accent">{progress}</p>
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
            )
          })}
        </div>
      )}

      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track {selectedHabit?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {selectedHabit?.trackingType === 'numerical' 
                  ? `Enter value (${selectedHabit.unit})` 
                  : 'Enter minutes'}
              </label>
              <Input
                type="number"
                placeholder={selectedHabit?.trackingType === 'numerical' 
                  ? `Target: ${selectedHabit.target} ${selectedHabit.unit}` 
                  : `Target: ${selectedHabit?.target} min`}
                value={trackValue}
                onChange={(e) => setTrackValue(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={trackHabit} className="flex-1">Save Progress</Button>
              <Button variant="outline" onClick={() => setTrackDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
