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
import { Module, Habit, Expense, Task, CompletedWorkout, ChatMessage } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkline, TrendIndicator } from '@/components/Sparkline'

interface DashboardProps {
  onNavigate: (module: Module) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [habits] = useKV<Habit[]>('habits', [])
  const [expenses] = useKV<Expense[]>('expenses', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [completedWorkouts] = useKV<CompletedWorkout[]>('completed-workouts', [])
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

    const last7Days: number[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      let completedOnDate = 0
      allHabits.forEach(habit => {
        const entry = habit.entries?.find(e => e.date === dateStr)
        if (entry) {
          if (habit.trackingType === 'boolean' && entry.completed) {
            completedOnDate++
          } else if (habit.trackingType === 'numerical' && habit.target && entry.value && entry.value >= habit.target) {
            completedOnDate++
          } else if (habit.trackingType === 'time' && habit.target && entry.minutes && entry.minutes >= habit.target) {
            completedOnDate++
          }
        }
      })
      last7Days.push(totalHabits > 0 ? (completedOnDate / totalHabits) * 100 : 0)
    }

    return { 
      total: totalHabits, 
      completedToday, 
      percentComplete,
      longestStreak,
      averageStreak,
      trend7Days: last7Days
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
    const allWorkouts = completedWorkouts || []
    const totalWorkouts = allWorkouts.length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekWorkouts = allWorkouts.filter(w => new Date(w.completedAt) >= oneWeekAgo).length
    
    return { 
      total: totalWorkouts,
      thisWeek: weekWorkouts
    }
  }, [completedWorkouts])

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
    <div className="pt-2 md:pt-4 px-4 md:px-6 space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gradient-cyan">Dashboard</h1>
        <p className="text-muted-foreground text-base md:text-lg">Your life in numbers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <DashboardWidget
          title="Habits"
          icon={<Fire size={20} weight="duotone" />}
          onClick={() => onNavigate('habits')}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Today's Progress</span>
              <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                {habitStats.completedToday}/{habitStats.total}
              </Badge>
            </div>
            <Progress value={habitStats.percentComplete} className="h-1.5" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold text-primary">{habitStats.longestStreak}</div>
                  {habitStats.trend7Days.length > 0 && (
                    <TrendIndicator data={habitStats.trend7Days} showPercentage={false} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-normal">Best Streak</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-primary">{habitStats.averageStreak}</div>
                <div className="text-xs text-muted-foreground font-normal">Avg Streak</div>
              </div>
            </div>
            {habitStats.trend7Days.length > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Last 7 Days</div>
                <Sparkline 
                  data={habitStats.trend7Days} 
                  width={120} 
                  height={32}
                  color="oklch(0.68 0.19 211)"
                  strokeWidth={2}
                />
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Finance"
          icon={<CurrencyDollar size={20} weight="duotone" />}
          onClick={() => onNavigate('finance')}
        >
          <div className="space-y-2.5">
            <div>
              <div className="text-2xl font-semibold text-primary">
                ${financeStats.totalSpent.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground font-normal">Spent This Month</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-lg font-semibold">{financeStats.transactionCount}</div>
                <div className="text-xs text-muted-foreground font-normal">Transactions</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  ${financeStats.averageTransaction > 0 ? financeStats.averageTransaction.toFixed(0) : '0'}
                </div>
                <div className="text-xs text-muted-foreground font-normal">Avg/Transaction</div>
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
          icon={<CheckCircle size={20} weight="duotone" />}
          onClick={() => onNavigate('tasks')}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Completion Rate</span>
              <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                {taskStats.completionRate}%
              </Badge>
            </div>
            <Progress value={taskStats.completionRate} className="h-1.5" />
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="text-xl font-semibold text-primary">{taskStats.active}</div>
                <div className="text-xs text-muted-foreground font-normal">Active Tasks</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-destructive">{taskStats.highPriority}</div>
                <div className="text-xs text-muted-foreground font-normal">High Priority</div>
              </div>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Workouts"
          icon={<Barbell size={20} weight="duotone" />}
          onClick={() => onNavigate('workouts')}
        >
          <div className="space-y-2.5">
            <div>
              <div className="text-2xl font-semibold text-primary">{workoutStats.total}</div>
              <div className="text-xs text-muted-foreground font-normal">Total Workouts</div>
            </div>
            <div className="pt-1.5 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">This Week</span>
                <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                  {workoutStats.thisWeek} workouts
                </Badge>
              </div>
            </div>
            {workoutStats.thisWeek > 0 && (
              <div className="flex items-center gap-2 text-xs text-success">
                <TrendUp size={14} weight="bold" />
                <span>Keep up the momentum!</span>
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="AI Knox"
          icon={<Brain size={20} weight="duotone" />}
          onClick={() => onNavigate('knox')}
        >
          <div className="space-y-2.5">
            <div>
              <div className="text-2xl font-semibold text-primary">{knoxStats.conversations}</div>
              <div className="text-xs text-muted-foreground font-normal">Conversations</div>
            </div>
            <div className="pt-1.5 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Messages</span>
                <Badge variant="secondary" className="font-semibold text-xs px-2 py-0.5">
                  {knoxStats.totalMessages}
                </Badge>
              </div>
            </div>
            {knoxStats.conversations === 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkle size={14} />
                <span>Start a conversation</span>
              </div>
            )}
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Quick Stats"
          icon={<Target size={20} weight="duotone" />}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Fire size={14} className="text-primary" />
                <span className="text-xs">Habits Completed</span>
              </div>
              <span className="text-xs font-semibold">{habitStats.completedToday}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-primary" />
                <span className="text-xs">Tasks Done</span>
              </div>
              <span className="text-xs font-semibold">{taskStats.completed}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Barbell size={14} className="text-primary" />
                <span className="text-xs">Week Workouts</span>
              </div>
              <span className="text-xs font-semibold">{workoutStats.thisWeek}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={14} className="text-primary" />
                <span className="text-xs">Expenses</span>
              </div>
              <span className="text-xs font-semibold">{financeStats.transactionCount}</span>
            </div>
          </div>
        </DashboardWidget>
      </div>
    </div>
  )
}
