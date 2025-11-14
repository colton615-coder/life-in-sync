import { useState, useEffect } from 'react'
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

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent
  onSave: (event: CalendarEvent) => void
}

export function EditEventDialog({ open, onOpenChange, event, onSave }: EditEventDialogProps) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [date, setDate] = useState(event.date)
  const [startTime, setStartTime] = useState(event.startTime || '')
  const [endTime, setEndTime] = useState(event.endTime || '')
  const [category, setCategory] = useState<CalendarEvent['category']>(event.category)

  useEffect(() => {
    setTitle(event.title)
    setDescription(event.description || '')
    setDate(event.date)
    setStartTime(event.startTime || '')
    setEndTime(event.endTime || '')
    setCategory(event.category)
  }, [event])

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

    const updatedEvent: CalendarEvent = {
      ...event,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
    }

    onSave(updatedEvent)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to your event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CalendarEvent['category'])}>
                <SelectTrigger id="edit-category">
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
              <Label htmlFor="edit-start-time">Start Time</Label>
              <Input
                id="edit-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-end-time">End Time</Label>
              <Input
                id="edit-end-time"
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
