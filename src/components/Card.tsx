import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ 
  children, 
  className, 
  hover = false, 
  onClick 
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-4',
        'dashboard-card',
        hover && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
