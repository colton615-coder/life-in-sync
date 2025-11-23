import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TriangleAlert, X } from 'lucide-react'
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
            title: 'CRITICAL FAULT',
            message: 'Excessive axis drift detected.',
            type: 'critical' as const
        }
    }
    // 2. Critical: Hip Rotation (Too Low)
    else if (metrics.hipRotation.total < 45) {
        newAlert = {
            title: 'POWER LEAK',
            message: `Hip rotation ${metrics.hipRotation.total.toFixed(0)}° < 45° threshold.`,
            type: 'critical' as const
        }
    }
    // 3. Critical: Tempo (Too Fast/Slow)
    else if (Math.abs(metrics.tempo.ratio - 2.0) > 0.5) {
         newAlert = {
            title: 'RHYTHM FAULT',
            message: `Tempo ratio ${metrics.tempo.ratio.toFixed(2)}:1 variance high.`,
            type: 'warning' as const
        }
    }

    setActiveAlert(newAlert)

  }, [metrics])

  const dismissAlert = () => {
      setActiveAlert(null)
  }

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={cn(
            "absolute top-6 right-6 z-50 max-w-[280px] pointer-events-auto",
            className
          )}
        >
          {/*
             MASTER DIRECTIVE: "HUD Warning"
             Location: Floating overlay on top of the video content (Top Right).
             Style: Red transparent background `bg-red-500/20`, pulsing red border, red monospaced text.
          */}
          <div className={cn(
              "flex items-start gap-3 p-3 rounded bg-red-500/10 border border-red-500/50 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.2)]",
              "animate-pulse-slow" // Custom slow pulse animation defined in main.css
          )}>
             <div className="text-red-500 mt-0.5 shrink-0">
                 <TriangleAlert size={16} />
             </div>

             <div className="flex-1 min-w-0">
                 <h4 className="text-[10px] font-bold tracking-widest uppercase text-red-400 mb-0.5">
                     {activeAlert.title}
                 </h4>
                 <p className="text-[10px] text-red-300/80 font-mono leading-tight">
                     {activeAlert.message}
                 </p>
             </div>

             <button
                onClick={dismissAlert}
                className="text-red-500/50 hover:text-red-400 transition-colors"
             >
                 <X size={14} />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
