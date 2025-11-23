import { useRef, useState, useEffect } from 'react'
import { motion, useDragControls, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RotaryScrubberProps {
  className?: string
  onChange: (delta: number) => void
  onEnd?: () => void
  sensitivity?: number
}

export function RotaryScrubber({
  className,
  onChange,
  onEnd,
  sensitivity = 1
}: RotaryScrubberProps) {
  const controls = useDragControls()
  const [rotation, setRotation] = useState(0)

  // We use this to track cumulative drag for the session to prevent jumps
  const dragStartRotation = useRef(0)

  const handleDragStart = () => {
    dragStartRotation.current = rotation
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Master Directive: "Map user Drag X (pixels) directly to Rotation (degrees)"
    // 1 pixel moved on X axis = 1 degree of rotation (adjusted by sensitivity)

    const dragDeltaX = info.offset.x
    const newRotation = dragStartRotation.current + (dragDeltaX * sensitivity)

    setRotation(newRotation)

    // Calculate the delta for this specific frame event (approximate) or just pass total rotation change?
    // The parent expects a delta to scrub video.
    // If we pass the total rotation change from start, the parent might scrub too much if it accumulates.
    // Better to pass the *incremental* change.
    // However, `info.delta.x` gives us the per-frame delta.

    const incrementalDelta = info.delta.x * sensitivity
    onChange(incrementalDelta)
  }

  const handleDragEnd = () => {
    if (onEnd) onEnd()
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/*
        Outer Ring / Housing
        "Dark gradient from-gray-800 to-black with a subtle bevel"
      */}
      <div
        className="w-24 h-24 rounded-full bg-gradient-to-b from-[#1c2230] to-[#0f1219] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),_0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center ring-1 ring-black"
        aria-label="Video scrubber control"
      >
        {/*
           The Knob (Rotatable Element)
           "Convex knob. Physical cylinder viewed from top."
        */}
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2b3240] to-[#151925] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),_0_5px_10px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing flex items-center justify-center relative border border-white/5"
          style={{ rotate: rotation }}
          drag="x"
          dragControls={controls}
          dragConstraints={{ left: 0, right: 0 }} // Unconstrained dragging visually, but we don't want the element to move x/y, just rotate.
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.98 }}
        >
          {/*
             The Dimple (Finger Placement)
             "Small circular div, inset shadow, positioned at the top"
          */}
          <div className="absolute top-2 w-3 h-3 rounded-full bg-[#0f1219] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" />

          {/* Optional: Radial Texture/Grip lines for "Physical" feel */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" />
          </svg>

          {/* Center Cap decoration */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#2E8AF7]/10 to-transparent border border-[#2E8AF7]/20" />

        </motion.div>
      </div>
    </div>
  )
}
