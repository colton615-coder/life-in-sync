import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarBlank, Clock, TextAlignLeft, Tag } from '@phosphor-icons/react'

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (event: CalendarEvent) => void
  initialDate?: string
}

export function AddEventDialog({ open, onOpenChange, onAdd, initialDate }: AddEventDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [category, setCategory] = useState<CalendarEvent['category']>('event')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      createdAt: new Date().toISOString(),
    }

    onAdd(newEvent)
    toast.success('Event created!', { icon: '🎉' })
    
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setStartTime('')
    setEndTime('')
    setCategory('event')
    onOpenChange(false)
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'event': return 'from-blue-500 to-cyan-500'
      case 'plan': return 'from-purple-500 to-pink-500'
      case 'reminder': return 'from-orange-500 to-amber-500'
      case 'meeting': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90 backdrop-blur-xl border-2 border-purple-200/50 dark:border-purple-800/50">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <CalendarBlank className="w-6 h-6 text-purple-500" weight="duotone" />
            Create New Event
          </DialogTitle>
          <DialogDescription className="text-base">
            Add a new event, plan, or reminder to your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
              <TextAlignLeft className="w-4 h-4" weight="duotone" />
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the event?"
              className="h-12 text-base border-2 focus-visible:border-purple-400 rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="text-base border-2 focus-visible:border-purple-400 rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                <CalendarBlank className="w-4 h-4" weight="duotone" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 border-2 focus-visible:border-purple-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4" weight="duotone" />
                Category
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CalendarEvent['category'])}>
                <SelectTrigger id="category" className="h-12 border-2 focus-visible:border-purple-400 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500`} />
                      Event
                    </div>
                  </SelectItem>
                  <SelectItem value="plan">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500`} />
                      Plan
                    </div>
                  </SelectItem>
                  <SelectItem value="reminder">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-500`} />
                      Reminder
                    </div>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500`} />
                      Meeting
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" weight="duotone" />
                Start Time
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 border-2 focus-visible:border-purple-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm font-semibold">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12 border-2 focus-visible:border-purple-400 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${getCategoryColor(category)} text-white hover:shadow-xl transition-all duration-300 font-semibold`}
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
