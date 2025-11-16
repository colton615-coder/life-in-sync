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
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
          w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          ${isOpen 
            ? 'button-glow' 
            : 'button-neumorphic'
          }
        `}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0
          }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          {isOpen ? (
            <X size={28} weight="bold" className="text-accent-foreground md:w-8 md:h-8" />
          ) : (
            <List size={28} weight="bold" className="text-foreground md:w-8 md:h-8" />
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  )
}
