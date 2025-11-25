import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Backspace } from '@phosphor-icons/react'

interface GlassKeypadProps {
  open: boolean
  onClose: () => void
  onValueChange: (value: string) => void
  value: string
  label?: string
  suffix?: string
}

export function GlassKeypad({ open, onClose, onValueChange, value, label, suffix }: GlassKeypadProps) {
  const handleTap = (key: string) => {
    if (key === 'backspace') {
      onValueChange(value.slice(0, -1))
    } else if (key === '.') {
      if (!value.includes('.')) onValueChange(value + '.')
    } else {
      // Prevent leading zeros unless it's "0."
      if (value === '0' && key !== '.') {
        onValueChange(key)
      } else {
        onValueChange(value + key)
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Keypad */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 border-t border-white/10 shadow-2xl backdrop-blur-xl pb-safe"
          >
            {/* Header / Display */}
            <div className="flex flex-col items-center justify-center py-6 border-b border-white/5">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                {label || 'Enter Value'}
              </span>
              <div className="text-4xl font-bold font-mono text-white flex items-baseline gap-1">
                {value || '0'}
                {suffix && <span className="text-lg text-muted-foreground font-sans">{suffix}</span>}
              </div>
            </div>

            {/* Keys */}
            <div className="grid grid-cols-3 gap-[1px] bg-white/5 p-[1px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((key) => (
                <button
                  key={key}
                  onClick={() => handleTap(key.toString())}
                  className={cn(
                    "h-16 text-2xl font-medium font-mono text-white/90 active:bg-white/10 transition-colors",
                    "bg-black/40 backdrop-blur-md"
                  )}
                >
                  {key}
                </button>
              ))}
              <button
                onClick={() => handleTap('backspace')}
                className="h-16 flex items-center justify-center text-white/90 active:bg-white/10 transition-colors bg-black/40 backdrop-blur-md"
              >
                <Backspace size={24} />
              </button>
            </div>

            <div className="p-4 bg-black">
              <button
                onClick={onClose}
                className="w-full h-12 bg-white text-black font-bold rounded-lg text-lg active:scale-[0.98] transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
