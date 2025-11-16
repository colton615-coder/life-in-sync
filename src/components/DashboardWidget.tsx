import { ReactNode } from 'react'
import { NeumorphicCard } from './NeumorphicCard'
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        "w-full",
        onClick && "cursor-pointer group",
        className
      )}
    >
      <div className={cn(
        "neumorphic-card h-full transition-all duration-300",
        onClick && "hover:glow-border"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-circle-glow flex items-center justify-center w-12 h-12">
            <div className="text-accent-foreground">
              {icon}
            </div>
          </div>
          <h3 className="widget-title flex-1">{title}</h3>
        </div>
        <div className="text-foreground">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
