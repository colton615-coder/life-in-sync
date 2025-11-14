import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { CalendarEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { 
  CaretLeft, 
  CaretRight, 
  Plus,
} from '@phosphor-icons/react'
import { AddEventDialog } from '@/components/calendar/AddEventDialog'
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog'
import { motion, AnimatePresence } from 'framer-motion'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Calendar() {
  const [events, setEvents] = useKV<CalendarEvent[]>('calendar-events', [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }, [firstDayOfMonth, daysInMonth])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateString = (day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventsForDate = (day: number): CalendarEvent[] => {
    const dateStr = getDateString(day)
    return events?.filter(event => event.date === dateStr) || []
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear()
  }

  const handleDayClick = (day: number) => {
    const dateStr = getDateString(day)
    setSelectedDate(dateStr)
    setDetailsDialogOpen(true)
  }

  const handleAddEvent = () => {
    setAddDialogOpen(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((currentEvents) => (currentEvents || []).filter(e => e.id !== eventId))
  }

  const handleEditEvent = (updatedEvent: CalendarEvent) => {
    setEvents((currentEvents) => 
      (currentEvents || []).map(e => e.id === updatedEvent.id ? updatedEvent : e)
    )
  }

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'event':
        return 'bg-primary'
      case 'plan':
        return 'bg-accent'
      case 'reminder':
        return 'bg-secondary'
      case 'meeting':
        return 'bg-chart-2'
      default:
        return 'bg-muted'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your events and plans
          </p>
        </div>

        <Button onClick={handleAddEvent} className="gap-2">
          <Plus weight="bold" />
          Add Event
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neumorphic rounded-2xl p-6 md:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToToday}
              className="hidden md:flex"
            >
              Today
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
            >
              <CaretLeft weight="bold" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
            >
              <CaretRight weight="bold" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {DAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs md:text-sm font-semibold text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}

          <AnimatePresence mode="wait">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const dayEvents = getEventsForDate(day)
              const hasEvents = dayEvents.length > 0
              const today = isToday(day)

              return (
                <motion.button
                  key={`${year}-${month}-${day}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square p-2 rounded-lg
                    flex flex-col items-center justify-start gap-1
                    transition-all duration-200
                    hover:scale-105 hover:shadow-lg
                    ${today 
                      ? 'bg-primary text-primary-foreground font-bold shadow-md' 
                      : 'bg-card hover:bg-accent/50'
                    }
                    ${hasEvents && !today ? 'ring-2 ring-primary/20' : ''}
                  `}
                >
                  <span className={`text-sm md:text-base ${today ? 'font-bold' : ''}`}>
                    {day}
                  </span>
                  
                  {hasEvents && (
                    <div className="flex gap-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(event.category)}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      <AddEventDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={(newEvent) => {
          setEvents((currentEvents) => [...(currentEvents || []), newEvent])
        }}
        initialDate={selectedDate || undefined}
      />

      {selectedDate && (
        <EventDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          date={selectedDate}
          events={(events || []).filter(e => e.date === selectedDate)}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
          onAddNew={() => {
            setDetailsDialogOpen(false)
            setAddDialogOpen(true)
          }}
        />
      )}
    </div>
  )
}
