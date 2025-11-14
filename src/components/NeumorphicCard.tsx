import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface NeumorphicCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  pressed?: boolean
  inset?: boolean
  onClick?: () => void
}

export function NeumorphicCard({ 
  children, 
  className, 
  hover = false, 
  pressed = false,
  inset = false,
  onClick 
}: NeumorphicCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl bg-card p-6',
        inset ? 'neumorphic-inset' : 'neumorphic',
        hover && 'neumorphic-hover cursor-pointer',
        pressed && 'neumorphic-pressed',
        className
      )}
    >
      {children}
    </div>
  )
}
