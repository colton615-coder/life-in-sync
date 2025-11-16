import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List } from '@phosphor-icons/react'

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
      className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          onClick={onClick}
          className={`
            w-14 h-14 md:w-16 md:h-16 rounded-xl transition-all duration-200
            ${isOpen 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : 'bg-card hover:bg-card/80 text-primary border border-primary/30 hover:border-primary button-glow'
            }
          `}
        >
          <motion.div
            animate={{ 
              rotate: isOpen ? 90 : 0
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
          >
            <List size={24} weight="bold" className="md:w-7 md:h-7" />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  )
}
