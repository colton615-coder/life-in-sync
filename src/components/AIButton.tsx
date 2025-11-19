import { motion, HTMLMotionProps } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ReactNode, useState, useEffect } from 'react'

interface AIButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

const SARCASTIC_LOADING_MESSAGES = [
  "Convincing AI...",
  "Teaching robots...",
  "Asking ChatGPT...",
  "Pretending to work...",
  "Consulting algorithms...",
  "Making it fancy...",
  "Generating excuses...",
  "Summoning wisdom...",
  "Calculating dreams...",
  "Running calculations...",
  "Avoiding work...",
  "Teaching computers...",
  "Beep boop beep...",
  "Consulting AI...",
  "Making you wait...",
  "Justifying existence...",
  "Taking longer...",
  "Doing AI things...",
  "Loading suspiciously...",
]

export function AIButton({ children, loading = false, icon, size = 'md', variant = 'default', className, disabled, ...props }: AIButtonProps) {
    const [loadingMessage, setLoadingMessage] = useState('')
    
    const sizeClasses = {
      sm: 'gap-1.5 px-4 md:px-5 h-11 md:h-12 text-sm md:text-base',
      md: 'gap-2 px-6 md:px-8 h-14 md:h-16 text-base md:text-lg',
      lg: 'gap-2.5 px-8 md:px-10 h-16 md:h-20 text-lg md:text-xl'
    }

    const variantClasses = {
      default: 'text-[var(--color-text-on-brand)] bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-state-success)] hover:shadow-2xl hover:shadow-[var(--color-brand-primary)]/50',
      ghost: 'text-foreground bg-transparent border border-[var(--color-brand-primary)]/30 hover:bg-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/50',
      outline: 'text-[var(--color-brand-primary)] bg-transparent border-2 border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/10'
    }

    useEffect(() => {
      if (loading) {
        const randomMessage = SARCASTIC_LOADING_MESSAGES[Math.floor(Math.random() * SARCASTIC_LOADING_MESSAGES.length)]
        setLoadingMessage(randomMessage)
      }
    }, [loading])

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={cn(
        'rounded-2xl flex items-center justify-center font-semibold transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkle size={size === 'sm' ? 18 : size === 'lg' ? 26 : 22} weight="fill" />
          </motion.div>
          <span className="italic">{loadingMessage}</span>
        </>
      ) : (
        <>
          {icon || <Sparkle size={size === 'sm' ? 18 : size === 'lg' ? 26 : 22} weight="fill" className="md:w-6 md:h-6" />}
          {children}
        </>
      )}
    </motion.button>
  )
}
