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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick()
    }
  }

  const widgetContent = (
    <div className={cn(
      "neumorphic-card h-full min-h-[220px] md:min-h-[280px] transition-all duration-300",
      onClick && "hover:glow-border"
    )}>
      <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
          <div className="icon-circle-glow flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-xl md:text-2xl" aria-hidden="true">
            <div className="text-accent-foreground">
              {icon}
            </div>
          </div>
          <h3 className="dashboard-card-title flex-1 text-[11px] md:text-sm">{title}</h3>
        </div>
        <div className="text-foreground flex-1">
          {children}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View ${title} module` : undefined}
      className={cn(
        "w-full",
        onClick && "cursor-pointer group",
        className
      )}
    >
      {widgetContent}
    </motion.div>
  )
}
