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
    <Card className={cn('glass-card border-primary/20 p-4', className)}>
      <div className="flex items-center justify-between gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg glass-morphic border border-primary/30 flex items-center justify-center">
            <Target size={18} className="text-primary" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total</div>
            <div className="text-lg font-bold tabular-nums">{stats.total}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg glass-morphic border border-accent/30 flex items-center justify-center">
            <CheckCircle size={18} className="text-accent" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Active</div>
            <div className="text-lg font-bold tabular-nums">{stats.active}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg glass-morphic border border-success/30 flex items-center justify-center">
            <CheckCircle size={18} className="text-success" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Done</div>
            <div className="text-lg font-bold tabular-nums">{stats.completed}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className={cn(
            "w-9 h-9 rounded-lg glass-morphic flex items-center justify-center",
            stats.streak !== undefined ? "border border-orange-500/30" : "border border-primary/30"
          )}>
            {stats.streak !== undefined ? (
              <Fire size={18} className="text-orange-500" weight="fill" />
            ) : (
              <TrendUp size={18} className="text-primary" weight="fill" />
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              {stats.streak !== undefined ? 'Rate' : 'Rate'}
            </div>
            <div className="text-lg font-bold tabular-nums">
              {stats.completionRate || 0}%
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
