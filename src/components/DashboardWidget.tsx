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
      whileHover={onClick ? { y: -3, scale: 1.005 } : {}}
      whileTap={onClick ? { scale: 0.995 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "w-full text-left",
        onClick && "cursor-pointer group",
        className
      )}
    >
      <Card className={cn(
        "h-full transition-all duration-200",
        onClick && "group-hover:shadow-lg group-hover:border-accent-vibrant/50"
      )}>
        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-2.5">
          <div className="p-1 md:p-1.5 rounded-lg bg-accent-vibrant/10 text-accent-vibrant flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-semibold text-xs md:text-sm">{title}</h3>
        </div>
        {children}
      </Card>
    </Component>
  )
}
