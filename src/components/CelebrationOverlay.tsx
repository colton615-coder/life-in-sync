import { useEffect } from 'react'
import { Habit } from '@/lib/types'
import { motion } from 'framer-motion'
import { Confetti } from '@/components/Confetti'
import { Button } from '@/components/ui/button'
import { CheckCircle, Fire } from '@phosphor-icons/react'

interface CelebrationOverlayProps {
  habit: Habit
  onClose: () => void
}

export function CelebrationOverlay({ habit, onClose }: CelebrationOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [onClose])

  const isMillestone = habit.streak === 7 || habit.streak === 30 || habit.streak === 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Confetti />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        className="bg-card p-8 md:p-12 rounded-3xl shadow-2xl max-w-md mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center">
            <CheckCircle size={64} weight="fill" className="text-success" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-semibold mb-2"
        >
          🎉 Awesome!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-6"
        >
          You've completed your <span className="font-semibold text-foreground">{habit.name}</span> goal for today!
        </motion.p>

        {habit.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex items-center justify-center gap-2 mb-8 p-4 bg-accent/10 rounded-2xl"
          >
            <Fire size={32} weight="fill" className={isMillestone ? 'text-orange-500' : 'text-accent'} />
            <span className="text-2xl font-bold">
              {habit.streak} day{habit.streak !== 1 && 's'} streak!
            </span>
          </motion.div>
        )}

        {isMillestone && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg font-semibold text-accent mb-6"
          >
            🔥 Milestone Achievement! 🔥
          </motion.p>
        )}

        <Button onClick={onClose} size="lg" className="w-full">
          Continue
        </Button>
      </motion.div>
    </motion.div>
  )
}
