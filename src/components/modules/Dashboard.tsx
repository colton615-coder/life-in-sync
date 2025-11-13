import { StatCard } from '../StatCard'
import { Card } from '../Card'
import { 
  Fire, 
  CurrencyDollar, 
  CheckCircle, 
  Barbell,
  Target,
  ChartBar,
  ArrowRight
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Habit, Task, Expense } from '@/lib/types'

import { Module } from '@/lib/types'
import { motion } from 'framer-motion'

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-[15px]">Your life at a glance</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <motion.div variants={item}>
          <StatCard
            icon={<Fire weight="fill" />}
            label="Active Streaks"
            value={activeStreaks}
            onClick={() => onNavigate('habits')}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            icon={<CheckCircle weight="fill" />}
            label="Task Completion"
            value={`${completionRate}%`}
            trend={`${completedTasks}/${totalTasks}`}
            onClick={() => onNavigate('tasks')}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            icon={<CurrencyDollar weight="fill" />}
            label="Month Spending"
            value={`$${monthExpenses.toFixed(0)}`}
            trend={`${todayExpenses} today`}
            onClick={() => onNavigate('finance')}
          />
        </motion.div>
      </motion.div>

      <div>
        <h2 className="text-xl font-semibold mb-5">Quick Access</h2>
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <motion.div variants={item}>
            <ModuleCard
              icon={<Target size={32} weight="duotone" />}
              title="Habits"
              description="Track daily habits and build streaks"
              onClick={() => onNavigate('habits')}
            />
          </motion.div>
          <motion.div variants={item}>
            <ModuleCard
              icon={<ChartBar size={32} weight="duotone" />}
              title="Finance"
              description="Manage budget and expenses"
              onClick={() => onNavigate('finance')}
            />
          </motion.div>
          <motion.div variants={item}>
            <ModuleCard
              icon={<CheckCircle size={32} weight="duotone" />}
              title="Tasks"
              description="Organize your to-do list"
              onClick={() => onNavigate('tasks')}
            />
          </motion.div>
          <motion.div variants={item}>
            <ModuleCard
              icon={<Barbell size={32} weight="duotone" />}
              title="Workouts"
              description="Track fitness and PRs"
              onClick={() => onNavigate('workouts')}
            />
          </motion.div>
        </motion.div>
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
    <Card hover onClick={onClick} className="group">
      <div className="flex items-start gap-4">
        <div className="text-primary group-hover:scale-110 transition-transform duration-200 flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
            <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        </div>
      </div>
    </Card>
  )
}
