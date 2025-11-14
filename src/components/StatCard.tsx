import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Stat {
  value: string | number
  label: string
  gradient?: string
  textColor?: string
}

interface StatCardProps {
  stats: Stat[]
  className?: string
}

export function StatCard({ stats, className }: StatCardProps) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("flex items-center justify-center gap-6 pt-2", className)}
    >
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-6">
          <div className="text-center">
            <div className={cn(
              "text-3xl font-bold",
              stat.gradient 
                ? `bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`
                : stat.textColor || "text-foreground"
            )}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
          {index < stats.length - 1 && (
            <div className="h-12 w-px bg-border" />
          )}
        </div>
      ))}
    </motion.div>
  )
}
