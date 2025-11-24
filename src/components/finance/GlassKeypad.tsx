import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Backspace } from '@phosphor-icons/react'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface GlassKeypadProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onConfirm: () => void
  className?: string
  confirmDisabled?: boolean
}

export function GlassKeypad({ onKeyPress, onBackspace, onConfirm, className, confirmDisabled }: GlassKeypadProps) {
  const { triggerHaptic } = useHapticFeedback()

  const handlePress = (key: string) => {
    triggerHaptic('light')
    onKeyPress(key)
  }

  const handleBackspace = () => {
    triggerHaptic('medium')
    onBackspace()
  }

  const handleConfirm = () => {
      if (confirmDisabled) return
      triggerHaptic('success')
      onConfirm()
  }

  return (
    <div className={cn("grid grid-cols-3 gap-3 p-4 select-none", className)}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <motion.button
          key={num}
          whileTap={{ scale: 0.95, backgroundColor: "rgba(255,255,255,0.1)" }}
          onClick={() => handlePress(num.toString())}
          className="h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-mono text-white shadow-sm backdrop-blur-sm transition-colors active:border-[#2E8AF7]/50 active:shadow-[0_0_15px_rgba(46,138,247,0.2)]"
        >
          {num}
        </motion.button>
      ))}

      <motion.button
        whileTap={{ scale: 0.95, backgroundColor: "rgba(255,255,255,0.1)" }}
        onClick={() => handlePress('.')}
        className="h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-mono text-white shadow-sm backdrop-blur-sm"
      >
        .
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95, backgroundColor: "rgba(255,255,255,0.1)" }}
        onClick={() => handlePress('0')}
        className="h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-mono text-white shadow-sm backdrop-blur-sm"
      >
        0
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95, backgroundColor: "rgba(239,68,68,0.2)" }}
        onClick={handleBackspace}
        className="h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white shadow-sm backdrop-blur-sm hover:bg-red-500/10 active:text-red-400"
      >
        <Backspace size={24} />
      </motion.button>

      <div className="col-span-3 mt-2">
           <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={cn(
                "w-full h-14 rounded-2xl flex items-center justify-center text-lg font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(46,138,247,0.3)]",
                confirmDisabled
                 ? "bg-white/5 text-slate-500 cursor-not-allowed shadow-none border border-white/5"
                 : "bg-[#2E8AF7] text-white hover:bg-[#2E8AF7]/90 hover:shadow-[0_0_30px_rgba(46,138,247,0.5)]"
            )}
           >
               Confirm
           </motion.button>
      </div>
    </div>
  )
}
