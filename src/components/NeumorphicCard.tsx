import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface NeumorphicCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  pressed?: boolean
  inset?: boolean
  glow?: boolean
  onClick?: () => void
  animate?: boolean
}

export function NeumorphicCard({ 
  children, 
  className, 
  hover = false, 
  pressed = false,
  inset = false,
  glow = false,
  onClick,
  animate = true
}: NeumorphicCardProps) {
  const classes = cn(
    'rounded-2xl md:rounded-3xl bg-card',
    inset ? 'neumorphic-inset' : 'neumorphic-card',
    hover && !pressed && 'cursor-pointer',
    glow && 'glow-border',
    className
  )

  if (animate) {
    return (
      <motion.div
        onClick={onClick}
        className={classes}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -4 } : undefined}
        whileTap={pressed ? { scale: 0.98 } : undefined}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={classes}
    >
      {children}
    </div>
  )
}
