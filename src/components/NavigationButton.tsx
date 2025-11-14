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
            w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden
            ${isOpen 
              ? 'bg-destructive/80 hover:bg-destructive text-destructive-foreground' 
              : 'glass-card text-icon-vibrant hover:bg-icon-vibrant/20 animate-glow'
            }
          `}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-icon-vibrant/20 to-icon-accent/20"
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
            className="relative z-10 drop-shadow-[0_0_8px_currentColor]"
          >
            <List size={20} weight="bold" className="md:w-7 md:h-7" />
          </motion.div>

          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-icon-vibrant/50"
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
    </motion.div>
  )
}
