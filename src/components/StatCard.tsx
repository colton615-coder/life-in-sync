import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: string
  onClick?: () => void
}

export function StatCard({ icon, label, value, trend, onClick }: StatCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'stat-card rounded-xl p-6 flex flex-col gap-3',
        onClick && 'cursor-pointer'
      )}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center justify-between">
        <div className="text-primary text-2xl">{icon}</div>
        {trend && (
          <span className="text-sm font-medium text-muted-foreground">{trend}</span>
        )}
      </div>
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-bold tabular-nums text-foreground"
        >
          {value}
        </motion.div>
        <div className="text-sm font-medium text-muted-foreground mt-2">{label}</div>
      </div>
    </motion.div>
  )
}
