import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react' // Using lucide-react for consistency or phosphor
import { Warning } from '@phosphor-icons/react'
import { SwingMetrics } from '@/lib/types'
import { cn } from '@/lib/utils'

interface KnoxHUDProps {
  metrics?: SwingMetrics
  className?: string
}

export function KnoxHUD({ metrics, className }: KnoxHUDProps) {
  const [activeAlert, setActiveAlert] = useState<{ title: string; message: string; type: 'critical' | 'warning' } | null>(null)

  // Logic to detect "Single-Point Failures"
  useEffect(() => {
    if (!metrics) return

    let newAlert = null

    // 1. Critical: Head Stability (Poor)
    if (metrics.headMovement.stability === 'poor') {
        newAlert = {
            title: 'CRITICAL FAULT DETECTED',
            message: 'Excessive vertical/lateral head movement. Fix axis immediately.',
            type: 'critical' as const
        }
    }
    // 2. Critical: Hip Rotation (Too Low)
    else if (metrics.hipRotation.total < 45) {
        newAlert = {
            title: 'POWER LEAK DETECTED',
            message: `Hip rotation at ${metrics.hipRotation.total.toFixed(0)}° is critically low. Target > 45°.`,
            type: 'critical' as const
        }
    }
    // 3. Critical: Tempo (Too Fast/Slow)
    else if (Math.abs(metrics.tempo.ratio - 2.0) > 0.5) {
         newAlert = {
            title: 'RHYTHM FAILURE',
            message: `Tempo ratio ${metrics.tempo.ratio.toFixed(2)}:1 is outside acceptable variance.`,
            type: 'warning' as const
        }
    }

    // Only update if different to avoid loops, though effects run on dependency change
    // For this demo, we just set it. In a real app, we might want a queue or debounce.
    setActiveAlert(newAlert)

  }, [metrics])

  const dismissAlert = () => {
      setActiveAlert(null)
  }

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={cn(
            "fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md pointer-events-auto",
            className
          )}
        >
          <div className={cn(
              "glass-card p-4 border-l-4 flex items-start gap-4",
              activeAlert.type === 'critical' ? "border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-l-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          )}>
             <div className={cn(
                 "p-2 rounded-full bg-white/5",
                 activeAlert.type === 'critical' ? "text-red-500" : "text-amber-500"
             )}>
                 <Warning size={24} weight="fill" />
             </div>

             <div className="flex-1 pt-1">
                 <h4 className={cn(
                     "text-xs font-bold tracking-[0.2em] uppercase mb-1",
                      activeAlert.type === 'critical' ? "text-red-400" : "text-amber-400"
                 )}>
                     {activeAlert.title}
                 </h4>
                 <p className="text-xs text-slate-300 font-mono leading-relaxed">
                     {activeAlert.message}
                 </p>
             </div>

             <button
                onClick={dismissAlert}
                className="text-slate-500 hover:text-white transition-colors p-1"
             >
                 <X size={16} />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
