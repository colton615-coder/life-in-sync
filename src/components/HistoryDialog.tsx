import { Habit } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { CheckCircle } from '@phosphor-icons/react'
import { useState } from 'react'

interface HistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habits: Habit[]
  completionHistory: Record<string, string[]>
}

export function HistoryDialog({ open, onOpenChange, habits, completionHistory }: HistoryDialogProps) {
  const [selectedHabit, setSelectedHabit] = useState<string | null>(habits[0]?.id || null)

  const selectedHabitData = habits.find((h) => h.id === selectedHabit)
  const completedDates = selectedHabit ? completionHistory[selectedHabit] || [] : []

  const completedDateObjects = completedDates.map((dateStr) => new Date(dateStr))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Completion History</DialogTitle>
        </DialogHeader>

        {habits.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p>No habits yet. Create your first habit to track history!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Habit</label>
              <div className="flex flex-wrap gap-2">
                {habits.map((habit) => (
                  <Badge
                    key={habit.id}
                    variant={selectedHabit === habit.id ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setSelectedHabit(habit.id)}
                  >
                    {habit.name}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedHabitData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-lg">{selectedHabitData.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current streak: {selectedHabitData.streak} day{selectedHabitData.streak !== 1 && 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{completedDates.length}</p>
                    <p className="text-sm text-muted-foreground">total completions</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-4">Days marked in blue are completed</p>
                  <Calendar
                    mode="multiple"
                    selected={completedDateObjects}
                    className="rounded-md mx-auto"
                    modifiers={{
                      completed: completedDateObjects,
                    }}
                    modifiersStyles={{
                      completed: {
                        backgroundColor: 'oklch(0.65 0.20 220)',
                        color: 'white',
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
