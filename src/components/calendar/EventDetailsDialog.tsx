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
  Sparkle,
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
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

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

  const getCategoryColor = (category: string): { bg: string; border: string; text: string } => {
    switch (category) {
      case 'event':
        return { 
          bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20', 
          border: 'border-l-4 border-l-blue-500',
          text: 'text-blue-600 dark:text-blue-400'
        }
      case 'plan':
        return { 
          bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20', 
          border: 'border-l-4 border-l-purple-500',
          text: 'text-purple-600 dark:text-purple-400'
        }
      case 'reminder':
        return { 
          bg: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20', 
          border: 'border-l-4 border-l-orange-500',
          text: 'text-orange-600 dark:text-orange-400'
        }
      case 'meeting':
        return { 
          bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20', 
          border: 'border-l-4 border-l-green-500',
          text: 'text-green-600 dark:text-green-400'
        }
      default:
        return { 
          bg: 'bg-muted/50', 
          border: 'border-l-4 border-l-gray-500',
          text: 'text-muted-foreground'
        }
    }
  }

  const getCategoryBadge = (category: string): string => {
    switch (category) {
      case 'event':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0'
      case 'plan':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
      case 'reminder':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0'
      case 'meeting':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const handleDelete = () => {
    if (eventToDelete) {
      onDelete(eventToDelete)
      toast.success('Event deleted', { icon: '🗑️' })
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
        <DialogContent className="sm:max-w-[650px] bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90 backdrop-blur-xl border-2 border-blue-200/50 dark:border-blue-800/50">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <CalendarBlank className="w-6 h-6 text-blue-500" weight="duotone" />
              {formatDate(date)}
            </DialogTitle>
            <DialogDescription className="text-base flex items-center gap-2">
              {events.length === 0 ? (
                'No events scheduled for this day'
              ) : (
                <>
                  <Sparkle className="w-4 h-4 text-purple-500" weight="fill" />
                  {events.length} event{events.length > 1 ? 's' : ''} scheduled
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {events.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-20 h-20 flex items-center justify-center mx-auto mb-6"
                >
                  <CalendarBlank className="w-10 h-10 text-blue-500" weight="duotone" />
                </motion.div>
                <p className="text-lg font-medium text-foreground mb-2">No events yet</p>
                <p className="text-muted-foreground mb-6">Start planning your day</p>
                <Button 
                  onClick={onAddNew} 
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl transition-all duration-300"
                >
                  <Plus weight="bold" />
                  Add Event
                </Button>
              </motion.div>
            ) : (
              <ScrollArea className="max-h-[450px] pr-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {events.map((event, index) => {
                      const colors = getCategoryColor(event.category)
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "group p-5 rounded-2xl border-2 border-transparent hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 hover:shadow-lg",
                            colors.bg,
                            colors.border
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start gap-3 flex-wrap">
                                <h3 className="font-bold text-xl text-foreground flex-1">{event.title}</h3>
                                <Badge className={cn("text-xs font-semibold", getCategoryBadge(event.category))}>
                                  {event.category}
                                </Badge>
                              </div>

                              {event.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {event.description}
                                </p>
                              )}

                              {(event.startTime || event.endTime) && (
                                <div className={cn("flex items-center gap-2 text-sm font-medium", colors.text)}>
                                  <Clock weight="bold" className="w-4 h-4" />
                                  {event.startTime && formatTime(event.startTime)}
                                  {event.startTime && event.endTime && ' - '}
                                  {event.endTime && formatTime(event.endTime)}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setEditingEvent(event)}
                                  className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded-xl"
                                >
                                  <Pencil weight="duotone" className="w-5 h-5" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => confirmDelete(event.id)}
                                  className="h-10 w-10 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded-xl"
                                >
                                  <Trash weight="duotone" className="w-5 h-5" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}

            {events.length > 0 && (
              <Button 
                onClick={onAddNew} 
                variant="outline" 
                className="w-full gap-2 h-12 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 rounded-xl font-semibold"
              >
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
            toast.success('Event updated!', { icon: '✨' })
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-white to-white/90 dark:from-gray-900 dark:to-gray-900/90 backdrop-blur-xl border-2 border-red-200/50 dark:border-red-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Trash className="w-5 h-5 text-red-500" weight="duotone" />
              Delete Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action cannot be undone. This will permanently delete the event from your calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
