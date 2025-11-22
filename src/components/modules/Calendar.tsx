import { useState, useMemo } from 'react'
import { useKV } from '@/hooks/use-kv'
import { CalendarEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CaretLeft, 
  CaretRight, 
  Plus,
  CalendarBlank,
  Sparkle,
  Lightning,
  Star,
  FireSimple
} from '@phosphor-icons/react'
import { AddEventDialog } from '@/components/calendar/AddEventDialog'
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'

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
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

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

  const getCategoryColor = (category: string): { bg: string; text: string; glow: string } => {
    switch (category) {
      case 'event':
        return { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-blue-500', glow: 'shadow-blue-500/50' }
      case 'plan':
        return { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-purple-500', glow: 'shadow-purple-500/50' }
      case 'reminder':
        return { bg: 'bg-gradient-to-br from-orange-500 to-amber-500', text: 'text-orange-500', glow: 'shadow-orange-500/50' }
      case 'meeting':
        return { bg: 'bg-gradient-to-br from-green-500 to-emerald-500', text: 'text-green-500', glow: 'shadow-green-500/50' }
      default:
        return { bg: 'bg-gradient-to-br from-gray-500 to-slate-500', text: 'text-gray-500', glow: 'shadow-gray-500/50' }
    }
  }

  const totalEvents = events?.length || 0
  const upcomingEvents = events?.filter(e => new Date(e.date) >= new Date()).length || 0

  return (
    <div className="pt-2 md:pt-4 space-y-6 max-w-6xl mx-auto relative">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <motion.div 
          className="flex items-center justify-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <CalendarBlank className="w-10 h-10 text-white relative z-10" weight="duotone" />
          </div>
        </motion.div>
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            📅 Calendar 2.0
          </h1>
          <p className="text-lg text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-blue-500" weight="fill" />
            Time marches on whether you plan or not
            <Sparkle className="w-4 h-4 text-pink-500" weight="fill" />
          </p>
        </div>

        {totalEvents > 0 && (
          <StatCard 
            stats={[
              { 
                value: totalEvents, 
                label: 'Total Events',
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                value: upcomingEvents, 
                label: 'Upcoming',
                gradient: 'from-blue-500 to-cyan-500'
              }
            ]}
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl glass-card backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <motion.h2 
                className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                layoutId="month-year"
              >
                {MONTHS[month]} {year}
              </motion.h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToToday}
                className="border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 rounded-xl min-h-[44px] px-4 touch-manipulation"
              >
                <Lightning className="w-4 h-4 md:mr-1" weight="fill" />
                <span className="hidden md:inline ml-1">Today</span>
              </Button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-initial">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  className="h-14 w-full md:w-14 min-w-[44px] rounded-xl border-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 touch-manipulation"
                >
                  <CaretLeft className="w-6 h-6" weight="bold" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-initial">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-14 w-full md:w-14 min-w-[44px] rounded-xl border-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 touch-manipulation"
                >
                  <CaretRight className="w-6 h-6" weight="bold" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 md:flex-initial">
                <Button 
                  onClick={handleAddEvent} 
                  className="h-14 w-full md:w-auto px-6 gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-xl font-semibold touch-manipulation"
                >
                  <Plus className="w-5 h-5" weight="bold" />
                  <span className="hidden sm:inline">Add Event</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3 lg:gap-4">
            {DAYS.map(day => (
              <div
                key={day}
                className="text-center text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wider p-2 md:p-3"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
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
                const isHovered = hoveredDay === day

                return (
                  <motion.button
                    key={`${year}-${month}-${day}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ 
                      delay: index * 0.008,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={cn(
                      'aspect-square min-h-[48px] md:min-h-[56px] p-2 md:p-3 rounded-xl md:rounded-2xl relative overflow-hidden',
                      'flex flex-col items-center justify-center gap-0.5 md:gap-1',
                      'transition-all duration-300 group touch-manipulation',
                      today 
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold shadow-xl shadow-orange-500/50' 
                        : hasEvents
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 border-2 border-purple-200/50 dark:border-purple-700/50'
                        : 'glass-morphic hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 border-2 border-transparent hover:border-blue-500/30',
                      'backdrop-blur-sm'
                    )}
                  >
                    {today && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <span className={cn(
                      'text-sm md:text-base lg:text-lg font-bold relative z-10',
                      today ? 'text-white' : 'text-foreground'
                    )}>
                      {day}
                    </span>
                    
                    {hasEvents && (
                      <div className="flex gap-0.5 md:gap-1 flex-wrap justify-center items-center relative z-10">
                        {dayEvents.slice(0, 3).map((event, idx) => {
                          const colors = getCategoryColor(event.category)
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.008 + idx * 0.05 }}
                              className={cn(
                                'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full',
                                colors.bg,
                                isHovered && 'shadow-lg'
                              )}
                            />
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <Badge 
                            variant="secondary" 
                            className="text-[8px] px-1 py-0 h-3 md:h-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                          >
                            +{dayEvents.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {isHovered && hasEvents && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-lg whitespace-nowrap z-50 shadow-xl"
                      >
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </motion.div>
                    )}

                    {today && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ rotate: [0, 10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FireSimple className="w-4 h-4 text-yellow-300" weight="fill" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>

          {totalEvents > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-700">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500" />
                <span className="text-sm font-medium">Event</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                <span className="text-sm font-medium">Plan</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-700">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-amber-500" />
                <span className="text-sm font-medium">Reminder</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
                <span className="text-sm font-medium">Meeting</span>
              </div>
            </motion.div>
          )}
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
