import { Card } from './Card'
import { Badge } from './ui/badge'
import { CheckCircle, Fire, Target, TrendUp } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  stats: {
    total: number
    active: number
    completed: number
    completionRate?: number
    streak?: number
  }
  className?: string
}

export function StatsCard({ title, stats, className }: StatsCardProps) {
  return (
    <Card className={cn('glass-card border-primary/20', className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendUp size={22} className="text-primary" weight="bold" />
        {title} Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl glass-morphic border border-border/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} className="text-primary" weight="fill" />
            <span className="text-xs text-muted-foreground font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">{stats.total}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl glass-morphic border border-border/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-accent" weight="fill" />
            <span className="text-xs text-muted-foreground font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">{stats.active}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl glass-morphic border border-border/30"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} className="text-success" weight="fill" />
            <span className="text-xs text-muted-foreground font-medium">Done Today</span>
          </div>
          <div className="text-2xl font-bold tabular-nums">{stats.completed}</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-xl glass-morphic border border-border/30"
        >
          <div className="flex items-center gap-2 mb-1">
            {stats.streak !== undefined ? (
              <Fire size={18} className="text-orange-500" weight="fill" />
            ) : (
              <TrendUp size={18} className="text-primary" weight="fill" />
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {stats.streak !== undefined ? 'Streak' : 'Rate'}
            </span>
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {stats.streak !== undefined ? (
              <span>{stats.streak} days</span>
            ) : (
              <span>{stats.completionRate || 0}%</span>
            )}
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
