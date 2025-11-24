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
import { useKV } from '@/hooks/use-kv'
import { useMemo } from 'react'
import { GlassCard } from '@/components/shell/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkline, TrendIndicator } from '@/components/Sparkline'
import { QuickActionsFab } from '@/components/QuickActionsFab'

interface DashboardProps {
  onNavigate: (module: Module) => void
}

// Reusable Dashboard Tile Wrapper
const DashboardTile = ({
    title,
    icon,
    children,
    onClick
}: {
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    onClick?: () => void
}) => {
    return (
        <GlassCard
            className="p-6 transition-transform hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white tracking-wider uppercase">{title}</h3>
                <div className="text-cyan-400">
                    {icon}
                </div>
            </div>
            {children}
        </GlassCard>
    )
}

// Calculation Logic (Preserved)
const calculateHabitStats = (habits: Habit[] | null, today: string) => {
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
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [habits] = useKV<Habit[]>('habits', [])
  const [expenses] = useKV<Expense[]>('expenses', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [completedWorkouts] = useKV<CompletedWorkout[]>('completed-workouts', [])
  const [knoxMessages] = useKV<ChatMessage[]>('knox-messages', [])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const habitStats = useMemo(() => calculateHabitStats(habits, today), [habits, today])

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
    <div className="pt-2 md:pt-4 pb-24 md:pb-16 relative">
      <QuickActionsFab />

      {/* Greeting / Context (Optional - LifeCore handles the main header now, but we can have subheaders) */}
      <div className="space-y-1 mb-8 px-2">
         <h2 className="text-sm font-light text-slate-400 uppercase tracking-widest">Command Center</h2>
         <p className="text-xl text-white font-light">Welcome back, Architect.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Habits Widget */}
        <DashboardTile
          title="Habits"
          icon={<Fire size={20} weight="duotone" />}
          onClick={() => onNavigate('habits')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Today's Progress</span>
              <span className="font-mono text-xs text-cyan-300">
                {habitStats.completedToday}/{habitStats.total}
              </span>
            </div>
            {/* Custom Progress Bar for Dark Theme */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${habitStats.percentComplete}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-mono text-white">{habitStats.longestStreak}</div>
                  {/* Trend Indicator would need style update, omitting for simplicity or mapping later */}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Best Streak</div>
              </div>
              <div>
                <div className="text-xl font-mono text-white">{habitStats.averageStreak}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Streak</div>
              </div>
            </div>

            {habitStats.trend7Days.length > 0 && (
               <div className="pt-3 border-t border-white/5">
                <Sparkline 
                  data={habitStats.trend7Days} 
                  width={120} 
                  height={32}
                  color="#22d3ee" // Cyan-400
                  strokeWidth={2}
                />
               </div>
            )}
          </div>
        </DashboardTile>

        {/* Finance Widget */}
        <DashboardTile
          title="Finance"
          icon={<CurrencyDollar size={20} weight="duotone" />}
          onClick={() => onNavigate('finance')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-mono text-white">
                ${financeStats.totalSpent.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Spent This Month</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-lg font-mono text-slate-200">{financeStats.transactionCount}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Txns</div>
              </div>
              <div>
                <div className="text-lg font-mono text-slate-200">
                  ${financeStats.averageTransaction > 0 ? financeStats.averageTransaction.toFixed(0) : '0'}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg/Txn</div>
              </div>
            </div>
            {financeStats.topCategory && (
              <div className="pt-3 border-t border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Top Spend</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">{financeStats.topCategory.name}</span>
                  <span className="text-sm font-mono text-cyan-300">
                    ${financeStats.topCategory.amount.toFixed(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </DashboardTile>

        {/* Tasks Widget */}
        <DashboardTile
          title="Tasks"
          icon={<CheckCircle size={20} weight="duotone" />}
          onClick={() => onNavigate('tasks')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Completion Rate</span>
              <span className="font-mono text-xs text-purple-300">
                {taskStats.completionRate}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-purple-400 transition-all duration-500"
                    style={{ width: `${taskStats.completionRate}%` }}
                />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <div className="text-xl font-mono text-white">{taskStats.active}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active</div>
              </div>
              <div>
                <div className="text-xl font-mono text-rose-400">{taskStats.highPriority}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">High Prio</div>
              </div>
            </div>
          </div>
        </DashboardTile>

        {/* Workouts Widget */}
        <DashboardTile
          title="Workouts"
          icon={<Barbell size={20} weight="duotone" />}
          onClick={() => onNavigate('workouts')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-mono text-white">{workoutStats.total}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Sessions</div>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">This Week</span>
                <Badge variant="outline" className="border-white/20 text-slate-300 font-mono text-xs px-2 py-0.5">
                  {workoutStats.thisWeek}
                </Badge>
              </div>
            </div>
            {workoutStats.thisWeek > 0 && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 mt-2">
                <TrendUp size={14} weight="bold" />
                <span>Momentum Active</span>
              </div>
            )}
          </div>
        </DashboardTile>

        {/* Knox Widget */}
        <DashboardTile
          title="AI Knox"
          icon={<Brain size={20} weight="duotone" />}
          onClick={() => onNavigate('knox')}
        >
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-mono text-white">{knoxStats.conversations}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Conversations</div>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Messages</span>
                <span className="font-mono text-xs text-slate-300">
                  {knoxStats.totalMessages}
                </span>
              </div>
            </div>
            {knoxStats.conversations === 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Sparkle size={14} />
                <span>Initialize System</span>
              </div>
            )}
          </div>
        </DashboardTile>

        {/* Quick Stats Widget */}
        <DashboardTile
          title="Quick Stats"
          icon={<Target size={20} weight="duotone" />}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Fire size={14} className="text-cyan-400" />
                <span className="text-xs text-slate-300">Habits</span>
              </div>
              <span className="text-xs font-mono text-white">{habitStats.completedToday}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ListChecks size={14} className="text-purple-400" />
                <span className="text-xs text-slate-300">Tasks</span>
              </div>
              <span className="text-xs font-mono text-white">{taskStats.completed}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Barbell size={14} className="text-emerald-400" />
                <span className="text-xs text-slate-300">Workouts</span>
              </div>
              <span className="text-xs font-mono text-white">{workoutStats.thisWeek}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={14} className="text-amber-400" />
                <span className="text-xs text-slate-300">Expenses</span>
              </div>
              <span className="text-xs font-mono text-white">{financeStats.transactionCount}</span>
            </div>
          </div>
        </DashboardTile>
      </div>
    </div>
  )
}
