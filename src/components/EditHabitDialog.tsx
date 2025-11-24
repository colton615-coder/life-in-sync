import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Habit, HabitIcon, TrackingType } from '@/lib/types'
import { useState, useEffect } from 'react'
import { IconPicker } from '@/components/IconPicker'
import { Check, Hash, Clock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
  onSave: (habitId: string, updates: Partial<Habit>) => void
}

const trackingTypeOptions = [
  { value: 'boolean' as TrackingType, icon: Check, label: 'Simple Checkbox', description: 'Just mark it done' },
  { value: 'numerical' as TrackingType, icon: Hash, label: 'Track Numbers', description: 'Track reps, pages, glasses' },
  { value: 'time' as TrackingType, icon: Clock, label: 'Track Time', description: 'Measure minutes or hours' },
]

export function EditHabitDialog({ open, onOpenChange, habit, onSave }: EditHabitDialogProps) {
  const [editedHabit, setEditedHabit] = useState<{
    name: string
    description: string
    trackingType: TrackingType
    target: string
    unit: string
    icon: HabitIcon
  }>({
    name: '',
    description: '',
    trackingType: 'boolean',
    target: '',
    unit: '',
    icon: 'Drop'
  })

  useEffect(() => {
    if (habit) {
      setEditedHabit({
        name: habit.name,
        description: habit.description || '',
        trackingType: habit.trackingType || 'boolean',
        target: habit.target ? habit.target.toString() : '',
        unit: habit.unit || '',
        icon: habit.icon || 'Drop'
      })
    }
  }, [habit])

  const handleSave = () => {
    if (!editedHabit.name.trim()) {
      toast.error('Please give your habit a name')
      return
    }

    if (editedHabit.trackingType !== 'boolean') {
      if (!editedHabit.target || parseFloat(editedHabit.target) <= 0) {
        toast.error('Please set a daily goal')
        return
      }
      if (editedHabit.trackingType === 'numerical' && !editedHabit.unit.trim()) {
        toast.error('What are you counting? (e.g., reps, pages, cups)')
        return
      }
    }

    if (!habit) return

    onSave(habit.id, {
      name: editedHabit.name,
      description: editedHabit.description,
      trackingType: editedHabit.trackingType,
      target: editedHabit.trackingType !== 'boolean' ? parseFloat(editedHabit.target) : undefined,
      unit: editedHabit.trackingType === 'numerical' ? editedHabit.unit : editedHabit.trackingType === 'time' ? 'minutes' : undefined,
      icon: editedHabit.icon
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Protocol</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modify your habit tracking parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-1.5 block">Name</label>
              <Input
                placeholder="e.g., Drink water, Read, Exercise"
                value={editedHabit.name}
                onChange={(e) => setEditedHabit({ ...editedHabit, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 mb-1.5 block">Purpose (Optional)</label>
              <Input
                placeholder="Why are you doing this?"
                value={editedHabit.description}
                onChange={(e) => setEditedHabit({ ...editedHabit, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Icon</label>
            <IconPicker
              value={editedHabit.icon}
              onChange={(iconName) => setEditedHabit({ ...editedHabit, icon: iconName })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">Tracking Method</label>
            <div className="grid gap-2">
              {trackingTypeOptions.map(({ value, icon: Icon, label, description }) => (
                <button
                  key={value}
                  onClick={() => setEditedHabit({ ...editedHabit, trackingType: value })}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    editedHabit.trackingType === value
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    editedHabit.trackingType === value ? 'text-cyan-400' : 'text-slate-400'
                  )}>
                    <Icon size={20} weight="regular" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(editedHabit.trackingType === 'numerical' || editedHabit.trackingType === 'time') && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="grid grid-cols-2 gap-4"
             >
               <div>
                 <label className="text-sm font-medium text-slate-400 mb-1.5 block">
                   {editedHabit.trackingType === 'time' ? 'Minutes per day' : 'Daily Target'}
                 </label>
                 <Input
                   type="number"
                   value={editedHabit.target}
                   onChange={(e) => setEditedHabit({ ...editedHabit, target: e.target.value })}
                   className="bg-white/5 border-white/10 text-white"
                 />
               </div>
               {editedHabit.trackingType === 'numerical' && (
                 <div>
                   <label className="text-sm font-medium text-slate-400 mb-1.5 block">Unit</label>
                   <Input
                     placeholder="e.g., pages"
                     value={editedHabit.unit}
                     onChange={(e) => setEditedHabit({ ...editedHabit, unit: e.target.value })}
                     className="bg-white/5 border-white/10 text-white"
                   />
                 </div>
               )}
             </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave}
              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
            >
              Save Changes
            </Button>
            <Button 
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
