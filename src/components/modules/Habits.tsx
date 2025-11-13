import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabGroup } from '@/components/TabGroup'
import { Plus, Fire, CheckCircle, Trash, Clock, Hash, Check } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit, TrackingType, HabitEntry } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export function Habits() {
  const [habits, setHabits] = useKV<Habit[]>('habits', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [trackDialogOpen, setTrackDialogOpen] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [trackValue, setTrackValue] = useState<string>('')
  const [filterTab, setFilterTab] = useState('all')
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
      case 'boolean': return <Check size={18} />
      case 'numerical': return <Hash size={18} />
      case 'time': return <Clock size={18} />
    }
  }

  const getTrackingLabel = (type: TrackingType) => {
    switch (type) {
      case 'boolean': return 'Check-off'
      case 'numerical': return 'Numerical'
      case 'time': return 'Time-based'
    }
  }

  const filteredHabits = habits?.filter(habit => {
    if (filterTab === 'all') return true
    if (filterTab === 'active') return habit.streak > 0
    if (filterTab === 'pending') return !isCompletedToday(habit)
    return true
  }) || []

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Track behaviors numerically, by time, or simple completion</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={20} weight="bold" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] modal-content">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Habit</DialogTitle>
              <DialogDescription>
                Build consistency by tracking your daily behaviors
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name" className="text-sm font-semibold">Habit Name</Label>
                <Input
                  id="habit-name"
                  placeholder="e.g., Morning meditation, Read pages, Exercise"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit-description" className="text-sm font-semibold">Description (Optional)</Label>
                <Textarea
                  id="habit-description"
                  placeholder="Why this habit matters..."
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking-type" className="text-sm font-semibold">Tracking Type</Label>
                <Select 
                  value={newHabit.trackingType} 
                  onValueChange={(value) => setNewHabit({ ...newHabit, trackingType: value as TrackingType })}
                >
                  <SelectTrigger id="tracking-type" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">
                      <div className="flex items-center gap-2">
                        <Check size={16} />
                        Simple Check-off
                      </div>
                    </SelectItem>
                    <SelectItem value="numerical">
                      <div className="flex items-center gap-2">
                        <Hash size={16} />
                        Numerical (reps, pages, etc.)
                      </div>
                    </SelectItem>
                    <SelectItem value="time">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Time-based (minutes)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newHabit.trackingType === 'numerical' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-value" className="text-sm font-semibold">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      placeholder="e.g., 50"
                      value={newHabit.target}
                      onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-semibold">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., reps, pages"
                      value={newHabit.unit}
                      onChange={(e) => setNewHabit({ ...newHabit, unit: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              )}
              {newHabit.trackingType === 'time' && (
                <div className="space-y-2">
                  <Label htmlFor="target-minutes" className="text-sm font-semibold">Target (minutes)</Label>
                  <Input
                    id="target-minutes"
                    type="number"
                    placeholder="e.g., 30"
                    value={newHabit.target}
                    onChange={(e) => setNewHabit({ ...newHabit, target: e.target.value })}
                    className="h-11"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={addHabit} className="flex-1 h-11 shadow-md">Create Habit</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TabGroup
        tabs={[
          { id: 'all', label: 'All Habits' },
          { id: 'active', label: 'Active Streaks' },
          { id: 'pending', label: 'Pending Today' },
        ]}
        activeTab={filterTab}
        onChange={setFilterTab}
      />

      {!habits || habits.length === 0 ? (
        <Card className="text-center py-16">
          <Fire size={56} weight="duotone" className="text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2">No habits yet</h3>
          <p className="text-muted-foreground text-[15px]">Start your first habit and build a streak!</p>
        </Card>
      ) : filteredHabits.length === 0 ? (
        <Card className="text-center py-16">
          <CheckCircle size={56} weight="duotone" className="text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2">No habits in this filter</h3>
          <p className="text-muted-foreground text-[15px]">Try a different filter to see your habits</p>
        </Card>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {filteredHabits.map((habit) => {
            const completed = isCompletedToday(habit)
            const progress = getTodayProgress(habit)
            
            return (
              <motion.div key={habit.id} variants={item}>
                <Card className="relative">
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
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {habit.trackingType === 'boolean' ? (
                          <CheckCircle
                            size={36}
                            weight={completed ? 'fill' : 'regular'}
                            className={completed ? 'text-primary' : 'text-muted-foreground'}
                          />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${
                            completed ? 'bg-primary border-primary text-white' : 'border-muted-foreground text-muted-foreground'
                          }`}>
                            {getTrackingIcon(habit.trackingType || 'boolean')}
                          </div>
                        )}
                      </motion.div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{habit.name}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1.5 text-xs font-medium">
                          {getTrackingIcon(habit.trackingType || 'boolean')}
                          {getTrackingLabel(habit.trackingType || 'boolean')}
                        </Badge>
                      </div>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground mb-3">{habit.description}</p>
                      )}
                      {progress && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold mb-3">
                          {progress}
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Fire weight="fill" className="text-orange-500" size={20} />
                          <span className="font-semibold text-sm">{habit.streak} day streak</span>
                        </div>
                        {completed && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            ✓ Done today
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteHabit(habit.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash size={20} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <Dialog open={trackDialogOpen} onOpenChange={setTrackDialogOpen}>
        <DialogContent className="sm:max-w-[420px] modal-content">
          <DialogHeader>
            <DialogTitle className="text-2xl">Track {selectedHabit?.name}</DialogTitle>
            <DialogDescription>
              Log your progress for today
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="track-value" className="text-sm font-semibold">
                {selectedHabit?.trackingType === 'numerical' 
                  ? `Enter value (${selectedHabit.unit})` 
                  : 'Enter minutes'}
              </Label>
              <Input
                id="track-value"
                type="number"
                placeholder={selectedHabit?.trackingType === 'numerical' 
                  ? `Target: ${selectedHabit.target} ${selectedHabit.unit}` 
                  : `Target: ${selectedHabit?.target} min`}
                value={trackValue}
                onChange={(e) => setTrackValue(e.target.value)}
                autoFocus
                className="h-12 text-lg"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={trackHabit} className="flex-1 h-11 shadow-md">Save Progress</Button>
              <Button variant="outline" onClick={() => setTrackDialogOpen(false)} className="h-11">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
