import { motion, HTMLMotionProps } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AIButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function AIButton({ children, loading = false, icon, size = 'md', variant = 'default', className, disabled, ...props }: AIButtonProps) {
    const sizeClasses = {
      sm: 'gap-1.5 px-4 md:px-5 h-11 md:h-12 text-sm md:text-base',
      md: 'gap-2 px-6 md:px-8 h-14 md:h-16 text-base md:text-lg',
      lg: 'gap-2.5 px-8 md:px-10 h-16 md:h-20 text-lg md:text-xl'
    }

    const variantClasses = {
      default: 'text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50',
      ghost: 'text-foreground bg-transparent border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50',
      outline: 'text-purple-600 dark:text-purple-400 bg-transparent border-2 border-purple-500 hover:bg-purple-500/10'
    }

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
          <span>Generating...</span>
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
