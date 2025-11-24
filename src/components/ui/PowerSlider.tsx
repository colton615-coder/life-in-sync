import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Check, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface PowerSliderProps {
  onComplete: () => void
  label?: string
  className?: string
}

export function PowerSlider({ onComplete, label = "Slide to Complete", className }: PowerSliderProps) {
  const [completed, setCompleted] = useState(false)
  const constraintsRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const { triggerHaptic } = useHapticFeedback()
  const widthRef = useRef(0)

  // Track progress for visual effects (0 to 1)
  const progress = useTransform(x, [0, 200], [0, 1])
  const opacity = useTransform(x, [0, 150], [1, 0])
  const glowOpacity = useTransform(x, [0, 200], [0, 1])

  useEffect(() => {
    if (constraintsRef.current) {
        widthRef.current = constraintsRef.current.offsetWidth - 56 // minus handle width
    }
  }, [])

  const handleDragEnd = () => {
    const currentX = x.get()
    const threshold = widthRef.current * 0.9 // 90% threshold

    if (currentX > threshold) {
      setCompleted(true)
      triggerHaptic('success')
      onComplete()
      // Lock it at the end visually for a moment before reset if needed
      // But typically onComplete unmounts or changes state
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 })
    }
  }

  const handleDrag = () => {
      // Haptics during drag? Maybe too much.
  }

  return (
    <div className={cn("relative h-14 w-full select-none touch-none", className)}>
        {/* Track */}
        <div
            ref={constraintsRef}
            className="absolute inset-0 rounded-full bg-black/40 border border-white/10 overflow-hidden backdrop-blur-md shadow-inner"
        >
            {/* Progress Fill */}
            <motion.div
                className="absolute inset-y-0 left-0 bg-[#2E8AF7]/20"
                style={{ width: x }}
            />

            {/* Label */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity }}
            >
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    {label} <CaretRight weight="bold" />
                </span>
            </motion.div>

            {/* Success State Overlay */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center bg-[#2E8AF7] z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: completed ? 1 : 0 }}
            >
                <span className="text-white font-bold flex items-center gap-2">
                    COMPLETED <Check weight="bold" />
                </span>
            </motion.div>
        </div>

        {/* Handle */}
        <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="absolute top-1 bottom-1 left-1 w-12 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
        >
             <CaretRight weight="bold" className="text-black" />
        </motion.div>
    </div>
  )
}
