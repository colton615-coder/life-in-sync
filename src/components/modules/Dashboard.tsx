import { StatCard } from '../StatCard'
import { NeumorphicCard } from '../NeumorphicCard'
import { 
  Fire, 
  CurrencyDollar, 
  CheckCircle, 
  Barbell,
  Target,
  ChartBar
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit, Task, Expense } from '@/lib/types'

import { Module } from '@/lib/types'

interface DashboardProps {
  onNavigate: (module: Module) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [habits] = useKV<Habit[]>('habits', [])
  const [tasks] = useKV<Task[]>('tasks', [])
  const [expenses] = useKV<Expense[]>('expenses', [])

  const activeStreaks = habits?.filter(h => h.streak > 0).length || 0
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.completed).length || 0
  const todayExpenses = expenses?.filter(e => e.date === new Date().toISOString().split('T')[0]).length || 0
  const monthExpenses = expenses?.filter(e => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, e) => sum + e.amount, 0) || 0

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Your life at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Fire weight="fill" />}
          label="Active Streaks"
          value={activeStreaks}
          onClick={() => onNavigate('habits')}
        />
        <StatCard
          icon={<CheckCircle weight="fill" />}
          label="Task Completion"
          value={`${completionRate}%`}
          trend={`${completedTasks}/${totalTasks}`}
          onClick={() => onNavigate('tasks')}
        />
        <StatCard
          icon={<CurrencyDollar weight="fill" />}
          label="Month Spending"
          value={`$${monthExpenses.toFixed(0)}`}
          trend={`${todayExpenses} today`}
          onClick={() => onNavigate('finance')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModuleCard
          icon={<Target size={32} weight="duotone" />}
          title="Habits"
          description="Track daily habits and build streaks"
          onClick={() => onNavigate('habits')}
        />
        <ModuleCard
          icon={<ChartBar size={32} weight="duotone" />}
          title="Finance"
          description="Manage budget and expenses"
          onClick={() => onNavigate('finance')}
        />
        <ModuleCard
          icon={<CheckCircle size={32} weight="duotone" />}
          title="Tasks"
          description="Organize your to-do list"
          onClick={() => onNavigate('tasks')}
        />
        <ModuleCard
          icon={<Barbell size={32} weight="duotone" />}
          title="Workouts"
          description="Track fitness and PRs"
          onClick={() => onNavigate('workouts')}
        />
      </div>
    </div>
  )
}

interface ModuleCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function ModuleCard({ icon, title, description, onClick }: ModuleCardProps) {
  return (
    <NeumorphicCard hover onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="text-accent flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </NeumorphicCard>
  )
}
