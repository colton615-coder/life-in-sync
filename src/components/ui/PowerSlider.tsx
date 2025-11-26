import React, { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface PowerSliderProps {
  onConfirm: () => void
  label?: string
  resetOnRelease?: boolean
  className?: string
  disabled?: boolean
}

export function PowerSlider({
  onConfirm,
  label = "SLIDE TO LOG",
  resetOnRelease = true,
  className,
  disabled = false
}: PowerSliderProps) {
  const [completed, setCompleted] = useState(false)
  const controls = useAnimation()
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (constraintsRef.current) {
      setWidth(constraintsRef.current.offsetWidth)
    }
  }, [])

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = width * 0.5 // 50% threshold
    if (info.offset.x > threshold && !disabled) {
      setCompleted(true)
      await controls.start({ x: width - 56 }) // Lock to end
      onConfirm()
      if (resetOnRelease) {
        setTimeout(() => reset(), 1000)
      }
    } else {
      controls.start({ x: 0 })
    }
  }

  const reset = () => {
    setCompleted(false)
    controls.start({ x: 0 })
  }

  return (
    <div
      ref={constraintsRef}
      className={cn(
        "relative h-14 rounded-full bg-white/5 border border-white/10 overflow-hidden select-none touch-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Track Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.span
          animate={{ opacity: completed ? 0 : 0.5 }}
          className="text-xs font-bold tracking-[0.2em] text-white/50"
        >
          {completed ? "CONFIRMED" : label}
        </motion.span>
      </div>

      {/* Progress Fill */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary/20"
        style={{ width: controls.bg }} // Use motion value if needed, but simplistic for now
      />

      {/* Slider Handle */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={{ scale: 1.05 }}
        className={cn(
          "absolute top-1 bottom-1 left-1 w-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10",
          completed ? "bg-primary text-black" : "bg-white text-black"
        )}
      >
        {completed ? (
          <Check weight="bold" size={20} />
        ) : (
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-black/20 rounded-full" />
            <div className="w-0.5 h-3 bg-black/20 rounded-full" />
            <div className="w-0.5 h-3 bg-black/20 rounded-full" />
          </div>
        )}
      </motion.div>
    </div>
  )
}
