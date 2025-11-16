import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 mb-6 md:mb-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="icon-circle-glow flex-shrink-0">
              <div className="text-accent-foreground">
                {icon}
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gradient-cyan">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-base md:text-lg mt-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  )
}
