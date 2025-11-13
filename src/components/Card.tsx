import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
  onClick?: () => void
}

export function Card({ 
  children, 
  className, 
  hover = false, 
  glass = false,
  onClick 
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-6',
        glass ? 'glass-card' : 'elevated-card',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
