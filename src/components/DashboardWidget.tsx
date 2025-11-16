import { ReactNode } from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface DashboardWidgetProps {
  title: string
  icon: ReactNode
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function DashboardWidget({ title, icon, children, onClick, className }: DashboardWidgetProps) {
  const Component = onClick ? motion.button : motion.div
  
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={cn(
        "w-full text-left",
        onClick && "cursor-pointer group",
        className
      )}
    >
      <Card className={cn(
        "dashboard-card h-full",
        onClick && "group-hover:border-primary/50"
      )}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-foreground/80">{title}</h3>
        </div>
        {children}
      </Card>
    </Component>
  )
}
