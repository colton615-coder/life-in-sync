import { motion } from 'framer-motion'
import { List, X } from '@phosphor-icons/react'

interface NavigationButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function NavigationButton({ onClick, isOpen }: NavigationButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center',
          'transition-all duration-300 cursor-pointer shadow-lg',
          isOpen 
            ? 'bg-primary text-primary-foreground shadow-primary/30' 
            : 'bg-card/90 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card hover:border-border'
        )}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 90 : 0
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 25
          }}
        >
          {isOpen ? (
            <X size={24} weight="bold" className="md:w-7 md:h-7" />
          ) : (
            <List size={24} weight="bold" className="md:w-7 md:h-7" />
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
