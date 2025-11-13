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
      transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          onClick={onClick}
          className={`
            w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden
            ${isOpen 
              ? 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' 
              : 'glass-card text-primary hover:bg-primary/20 animate-glow'
            }
          `}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
            animate={{
              scale: isOpen ? 0 : [1, 1.5, 1],
              opacity: isOpen ? 0 : [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            animate={{ 
              rotate: isOpen ? 90 : 0,
              scale: isOpen ? 0.9 : 1
            }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            className="relative z-10"
          >
            <List size={28} weight="bold" />
          </motion.div>

          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </Button>
      </motion.div>
      
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute left-20 top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none"
        >
          <div className="glass-morphic rounded-lg px-3 py-1.5 text-xs font-medium text-foreground/80">
            Navigation
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
