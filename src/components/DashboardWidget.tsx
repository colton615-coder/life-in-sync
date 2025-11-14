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
      whileHover={onClick ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "w-full text-left",
        onClick && "cursor-pointer group",
        className
      )}
    >
      <Card className={cn(
        "h-full transition-all duration-200",
        onClick && "group-hover:shadow-lg group-hover:border-primary/50"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="font-semibold text-base md:text-lg">{title}</h3>
        </div>
        {children}
      </Card>
    </Component>
  )
}
