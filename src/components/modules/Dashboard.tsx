import { DashboardWidget } from '../DashboardWidget'
import { 
  Target,
  Fire,
  CurrencyDollar,
  CheckCircle,
  Barbell,
  Brain,
  TrendUp,
  ListChecks,
  Sparkle
} from '@phosphor-icons/react'
import { Module, Habit, Expense, Task, Workout, ChatMessage } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface DashboardProps {
  onNavigate: (module: Module) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [habits] = useKV<Habit[]>('habits', [])
  const [expenses] = useKV<Expense[]>('expenses', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [workouts] = useKV<Workout[]>('workouts', [])
  const [knoxMessages] = useKV<ChatMessage[]>('knox-messages', [])

  const today = new Date().toISOString().split('T')[0]

  const habitStats = useMemo(() => {
    const allHabits = habits || []
    const totalHabits = allHabits.length
    let completedToday = 0
    let totalStreak = 0
    let longestStreak = 0

    allHabits.forEach(habit => {
      const todayEntry = habit.entries?.find(e => e.date === today)
      if (todayEntry) {
        if (habit.trackingType === 'boolean' && todayEntry.completed) {
          completedToday++
        } else if (habit.trackingType === 'numerical' && habit.target && todayEntry.value && todayEntry.value >= habit.target) {
          completedToday++
        } else if (habit.trackingType === 'time' && habit.target && todayEntry.minutes && todayEntry.minutes >= habit.target) {
          completedToday++
        }
      }
      totalStreak += habit.streak || 0
      if ((habit.streak || 0) > longestStreak) {
        longestStreak = habit.streak || 0
      }
    })

    const percentComplete = totalHabits > 0 ? Math.floor((completedToday / totalHabits) * 100) : 0
    const averageStreak = totalHabits > 0 ? Math.floor(totalStreak / totalHabits) : 0

    return { 
      total: totalHabits, 
      completedToday, 
      percentComplete,
      longestStreak,
      averageStreak
    }
  }, [habits, today])

  const financeStats = useMemo(() => {
    const allExpenses = expenses || []
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthExpenses = allExpenses.filter(e => e.date.startsWith(thisMonth))
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    
    const categorySpending: Record<string, number> = {}
    monthExpenses.forEach(e => {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount
    })
    
    const categoryEntries = Object.entries(categorySpending)
    const topCategory = categoryEntries.length > 0 
      ? categoryEntries.sort((a, b) => b[1] - a[1])[0]
      : null
    
    return { 
      totalSpent, 
      transactionCount: monthExpenses.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      averageTransaction: monthExpenses.length > 0 ? totalSpent / monthExpenses.length : 0
    }
  }, [expenses])

  const taskStats = useMemo(() => {
    const allTasks = tasks || []
    const totalTasks = allTasks.length
    const completedTasks = allTasks.filter(t => t.completed).length
    const activeTasks = totalTasks - completedTasks
    const highPriorityActive = allTasks.filter(t => !t.completed && t.priority === 'high').length
    
    const completionRate = totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0
    
    return { 
      total: totalTasks, 
      completed: completedTasks,
      active: activeTasks,
      highPriority: highPriorityActive,
      completionRate
    }
  }, [tasks])

  const workoutStats = useMemo(() => {
    const allWorkouts = workouts || []
    const totalWorkouts = allWorkouts.length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekWorkouts = allWorkouts.filter(w => new Date(w.date) >= oneWeekAgo).length
    
    return { 
      total: totalWorkouts,
      thisWeek: weekWorkouts
    }
  }, [workouts])

  const knoxStats = useMemo(() => {
    const allMessages = knoxMessages || []
    const totalMessages = allMessages.length
    const userMessages = allMessages.filter(m => m.role === 'user').length
    
    return { 
      totalMessages,
      conversations: userMessages
    }
  }, [knoxMessages])

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">Your unified command center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <DashboardWidget
          title="Habits"
          icon={<Fire size={24} weight="duotone" />}
          onClick={() => onNavigate('habits')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Today's Progress</span>
              <Badge variant="secondary" className="font-semibold">
                {habitStats.completedToday}/{habitStats.total}
              </Badge>
            </div>
            <Progress value={habitStats.percentComplete} className="h-2" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-2xl font-bold text-primary">{habitStats.longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{habitStats.averageStreak}</div>
                <div className="text-xs text-muted-foreground">Avg Streak</div>
              </div>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Finance"
          icon={<CurrencyDollar size={24} weight="duotone" />}
          onClick={() => onNavigate('finance')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-primary">
                ${financeStats.totalSpent.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Spent This Month</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-xl font-bold">{financeStats.transactionCount}</div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
              <div>
                <div className="text-xl font-bold">
                  ${financeStats.averageTransaction > 0 ? financeStats.averageTransaction.toFixed(0) : '0'}
                </div>
                <div className="text-xs text-muted-foreground">Avg/Transaction</div>
              </div>
            </div>
            {financeStats.topCategory && (
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground mb-1">Top Category</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{financeStats.topCategory.name}</span>
                  <span className="text-sm font-bold text-primary">
                    ${financeStats.topCategory.amount.toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Tasks"
          icon={<CheckCircle size={24} weight="duotone" />}
          onClick={() => onNavigate('tasks')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completion Rate</span>
              <Badge variant="secondary" className="font-semibold">
                {taskStats.completionRate}%
              </Badge>
            </div>
            <Progress value={taskStats.completionRate} className="h-2" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-2xl font-bold text-primary">{taskStats.active}</div>
                <div className="text-xs text-muted-foreground">Active Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{taskStats.highPriority}</div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Workouts"
          icon={<Barbell size={24} weight="duotone" />}
          onClick={() => onNavigate('workouts')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-primary">{workoutStats.total}</div>
              <div className="text-xs text-muted-foreground">Total Workouts</div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <Badge variant="secondary" className="font-semibold">
                  {workoutStats.thisWeek} workouts
                </Badge>
              </div>
            </div>
            {workoutStats.thisWeek > 0 && (
              <div className="flex items-center gap-2 text-xs text-success">
                <TrendUp size={16} weight="bold" />
                <span>Keep up the momentum!</span>
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="AI Knox"
          icon={<Brain size={24} weight="duotone" />}
          onClick={() => onNavigate('knox')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-primary">{knoxStats.conversations}</div>
              <div className="text-xs text-muted-foreground">Conversations</div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Messages</span>
                <Badge variant="secondary" className="font-semibold">
                  {knoxStats.totalMessages}
                </Badge>
              </div>
            </div>
            {knoxStats.conversations === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkle size={16} />
                <span>Start a conversation</span>
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Quick Stats"
          icon={<Target size={24} weight="duotone" />}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Fire size={16} className="text-primary" />
                <span className="text-sm">Habits Completed</span>
              </div>
              <span className="text-sm font-bold">{habitStats.completedToday}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <ListChecks size={16} className="text-primary" />
                <span className="text-sm">Tasks Done</span>
              </div>
              <span className="text-sm font-bold">{taskStats.completed}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Barbell size={16} className="text-primary" />
                <span className="text-sm">Week Workouts</span>
              </div>
              <span className="text-sm font-bold">{workoutStats.thisWeek}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={16} className="text-primary" />
                <span className="text-sm">Expenses</span>
              </div>
              <span className="text-sm font-bold">{financeStats.transactionCount}</span>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  )
}
