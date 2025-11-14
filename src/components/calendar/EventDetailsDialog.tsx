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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Trash,
  Pencil,
  Plus,
  CalendarBlank,
} from '@phosphor-icons/react'
import { EditEventDialog } from './EditEventDialog'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EventDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  events: CalendarEvent[]
  onDelete: (eventId: string) => void
  onEdit: (event: CalendarEvent) => void
  onAddNew: () => void
}

export function EventDetailsDialog({
  open,
  onOpenChange,
  date,
  events,
  onDelete,
  onEdit,
  onAddNew,
}: EventDetailsDialogProps) {
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'event':
        return 'bg-primary text-primary-foreground'
      case 'plan':
        return 'bg-accent text-accent-foreground'
      case 'reminder':
        return 'bg-secondary text-secondary-foreground'
      case 'meeting':
        return 'bg-chart-2 text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const handleDelete = () => {
    if (eventToDelete) {
      onDelete(eventToDelete)
      toast.success('Event deleted')
      setDeleteDialogOpen(false)
      setEventToDelete(null)
      
      if (events.length === 1) {
        onOpenChange(false)
      }
    }
  }

  const confirmDelete = (eventId: string) => {
    setEventToDelete(eventId)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarBlank weight="fill" className="text-primary" />
              {formatDate(date)}
            </DialogTitle>
            <DialogDescription>
              {events.length === 0 
                ? 'No events scheduled for this day'
                : `${events.length} event${events.length > 1 ? 's' : ''} scheduled`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarBlank size={48} className="mx-auto mb-3 opacity-50" />
                <p>No events for this day</p>
                <Button onClick={onAddNew} variant="outline" className="mt-4 gap-2">
                  <Plus weight="bold" />
                  Add Event
                </Button>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <Badge className={getCategoryColor(event.category)}>
                              {event.category}
                            </Badge>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}

                          {(event.startTime || event.endTime) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock weight="bold" />
                              {event.startTime && formatTime(event.startTime)}
                              {event.startTime && event.endTime && ' - '}
                              {event.endTime && formatTime(event.endTime)}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingEvent(event)}
                          >
                            <Pencil weight="bold" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => confirmDelete(event.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash weight="bold" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {events.length > 0 && (
              <Button onClick={onAddNew} variant="outline" className="w-full gap-2">
                <Plus weight="bold" />
                Add Another Event
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingEvent && (
        <EditEventDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
          onSave={(updatedEvent) => {
            onEdit(updatedEvent)
            setEditingEvent(null)
            toast.success('Event updated')
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
