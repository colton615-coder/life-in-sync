import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Stat {
  value: string | number
  label: string
  gradient?: string
  textColor?: string
  icon?: ReactNode
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
      className={cn("flex items-center justify-center gap-3 md:gap-6 pt-2", className)}
    >
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-3 md:gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
              {stat.icon && <div className="flex-shrink-0 text-sm md:text-base">{stat.icon}</div>}
              <div className={cn(
                "text-xl md:text-3xl font-bold tabular-nums",
                stat.gradient 
                  ? `bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`
                  : stat.textColor || "text-foreground"
              )}>
                {stat.value}
              </div>
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground leading-tight">{stat.label}</div>
          </div>
          {index < stats.length - 1 && (
            <div className="h-10 md:h-12 w-px bg-border opacity-50 md:opacity-100" />
          )}
        </div>
      ))}
    </motion.div>
  )
}
