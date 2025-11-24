import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface VirtualJogDialProps {
  onSeek: (delta: number) => void
  className?: string
  sensitivity?: number // Seconds per full rotation
}

export function VirtualJogDial({ onSeek, className, sensitivity = 1.0 }: VirtualJogDialProps) {
  const { triggerHaptic } = useHapticFeedback()
  const [isDragging, setIsDragging] = useState(false)
  const rotation = useMotionValue(0)
  const lastAngle = useRef(0)
  const centerRef = useRef<{ x: number, y: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Calculate angle from center to point
  const getAngle = (point: { x: number, y: number }) => {
    if (!centerRef.current) return 0
    const dx = point.x - centerRef.current.x
    const dy = point.y - centerRef.current.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  const handlePanStart = () => {
    setIsDragging(true)
    triggerHaptic('light')
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    }
  }

  const handlePan = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!centerRef.current) return

    const angle = getAngle(info.point)
    // Initialize lastAngle on first move if needed, but usually we track delta
    // A simpler approach for "infinite" scroll: check delta of angle

    // We need to handle the -180/180 wrap-around
    let delta = angle - lastAngle.current
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360

    // Ignore large jumps (initial touch)
    if (Math.abs(delta) > 50) delta = 0

    // Update visual rotation
    const currentRot = rotation.get()
    rotation.set(currentRot + delta)

    // Trigger seek
    // 360 degrees = sensitivity seconds
    const seekDelta = (delta / 360) * sensitivity
    if (Math.abs(seekDelta) > 0.001) {
        onSeek(seekDelta)
    }

    // Haptics on significant ticks (every 30 degrees)
    if (Math.floor((currentRot + delta) / 30) !== Math.floor(currentRot / 30)) {
       triggerHaptic('light')
    }

    lastAngle.current = angle
  }

  const handlePanEnd = () => {
    setIsDragging(false)
    triggerHaptic('medium')
  }

  // Initialize center on mount (and resize)
  useEffect(() => {
    const updateCenter = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            centerRef.current = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            }
        }
    }

    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  return (
    <div className={cn("relative flex items-center justify-center", className)} ref={ref}>
      {/* Glow Effect Background */}
      <div className={cn(
          "absolute inset-0 rounded-full bg-[#2E8AF7]/5 blur-xl transition-opacity duration-300",
          isDragging ? "opacity-100" : "opacity-0"
      )} />

      <motion.div
        className="relative w-32 h-32 rounded-full cursor-grab active:cursor-grabbing touch-none"
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ rotate: rotation }}
      >
         {/* Glass Ring */}
         <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)] box-border">
             {/* Inner Bevel */}
             <div className="absolute inset-2 rounded-full border border-white/5 bg-black/20" />
         </div>

         {/* Center Cap (Stationary visually relative to container? No, this rotates) */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-[#151925] border border-white/10 shadow-inner flex items-center justify-center">
                 <div className={cn(
                     "w-2 h-2 rounded-full transition-colors duration-300",
                     isDragging ? "bg-[#2E8AF7] shadow-[0_0_10px_#2E8AF7]" : "bg-white/20"
                 )} />
             </div>
         </div>

         {/* Tick Marks */}
         {Array.from({ length: 12 }).map((_, i) => (
             <div
                key={i}
                className="absolute w-1 h-2 bg-white/20 rounded-full top-4 left-1/2 -translate-x-1/2 origin-[50%_48px]"
                style={{ transform: `translateX(-50%) rotate(${i * 30}deg) translateY(0)` }}
             />
         ))}

         {/* Indicator Line (The "Playhead" on the wheel) */}
         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-[#2E8AF7] rounded-full shadow-[0_0_8px_#2E8AF7]" />

      </motion.div>

      {/* Label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-slate-500 font-mono pointer-events-none">
          {isDragging ? 'Seek' : 'Scrub'}
      </div>
    </div>
  )
}
