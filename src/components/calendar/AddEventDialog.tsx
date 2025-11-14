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
    toast.success('Event added successfully')
    
    setTitle('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setStartTime('')
    setEndTime('')
    setCategory('event')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event or plan for your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CalendarEvent['category'])}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="plan">Plan</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
