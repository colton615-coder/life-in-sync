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
          <div className="w-9 h-9 rounded-lg glass-morphic border border-icon-primary/40 flex items-center justify-center">
            <Target size={18} className="text-icon-primary drop-shadow-[0_0_6px_currentColor]" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-normal">Total</div>
            <div className="text-lg font-semibold tabular-nums text-foreground">{stats.total}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg glass-morphic border border-icon-accent/40 flex items-center justify-center">
            <CheckCircle size={18} className="text-icon-accent drop-shadow-[0_0_6px_currentColor]" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-normal">Active</div>
            <div className="text-lg font-semibold tabular-nums text-foreground">{stats.active}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-lg glass-morphic border border-icon-vibrant/40 flex items-center justify-center">
            <CheckCircle size={18} className="text-icon-vibrant drop-shadow-[0_0_6px_currentColor]" weight="fill" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-normal">Done</div>
            <div className="text-lg font-semibold tabular-nums text-foreground">{stats.completed}</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2"
        >
          <div className={cn(
            "w-9 h-9 rounded-lg glass-morphic flex items-center justify-center",
            stats.streak !== undefined ? "border border-icon-secondary/40" : "border border-icon-primary/40"
          )}>
            {stats.streak !== undefined ? (
              <Fire size={18} className="text-icon-secondary drop-shadow-[0_0_6px_currentColor]" weight="fill" />
            ) : (
              <TrendUp size={18} className="text-icon-primary drop-shadow-[0_0_6px_currentColor]" weight="fill" />
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-normal">
              {stats.streak !== undefined ? 'Rate' : 'Rate'}
            </div>
            <div className="text-lg font-semibold tabular-nums text-foreground">
              {stats.completionRate || 0}%
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
