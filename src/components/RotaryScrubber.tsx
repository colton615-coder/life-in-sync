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
  sensitivity = 0.05
}: RotaryScrubberProps) {
  const controls = useDragControls()
  const [rotation, setRotation] = useState(0)
  const centerRef = useRef<{ x: number; y: number } | null>(null)
  const knobRef = useRef<HTMLDivElement>(null)

  // Calculate center point on mount/resize
  useEffect(() => {
    const updateCenter = () => {
      if (knobRef.current) {
        const rect = knobRef.current.getBoundingClientRect()
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

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!centerRef.current) return

    // Vector from center to current pointer position
    // We use the pointer position relative to the viewport
    // info.point.x/y are absolute coordinates
    const currentAngle = Math.atan2(
      info.point.y - centerRef.current.y,
      info.point.x - centerRef.current.x
    )

    // We track the change in angle more simply by using the delta movements
    // But purely using delta x/y can be unintuitive for circular motion.
    // A better approach for a "jog dial" that feels like infinite scrolling:
    // We interpret horizontal drag or rotational drag as value changes.

    // However, for a true rotary feel, we want to track the angle change.
    // Since we don't have the 'previous' angle easily in this frame without state,
    // let's use a simpler approximation that works well for "scrubbing":
    // Rotating clockwise = positive, counter-clockwise = negative.

    // Let's use the cross product of the radius vector and the movement vector
    // to determine rotation direction and magnitude.
    // r = (px - cx, py - cy)
    // v = (dx, dy)
    // cross = rx * vy - ry * vx
    // This gives us the torque/rotation direction.

    const rx = info.point.x - centerRef.current.x
    const ry = info.point.y - centerRef.current.y
    const vx = info.delta.x
    const vy = info.delta.y

    // Normalize radius to keep sensitivity consistent regardless of distance from center
    const radius = Math.sqrt(rx * rx + ry * ry)
    if (radius === 0) return // avoid divide by zero at exact center

    // The "angular" movement contribution
    const angularDelta = (rx * vy - ry * vx) / radius

    // Update visual rotation state
    const rotationDelta = angularDelta * 2 // Multiplier for visual feel
    setRotation(r => r + rotationDelta)

    // Trigger callback with scaled delta
    // We might want to use the raw angular delta or a sensitivity multiplier
    onChange(rotationDelta * sensitivity)
  }

  const handleDragEnd = () => {
    if (onEnd) onEnd()
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Ring / Housing */}
      <div
        className="w-32 h-32 rounded-full bg-slate-900 neumorphic-concave flex items-center justify-center"
        aria-label="Video scrubber control"
      >
        {/* The Knob itself */}
        <motion.div
          ref={knobRef}
          className="w-24 h-24 rounded-full neumorphic-convex cursor-grab active:cursor-grabbing flex items-center justify-center relative"
          style={{ rotate: rotation }}
          drag
          dragControls={controls}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 0.98 }}
        >
          {/* Indicator Dimple/Line */}
          <div className="absolute top-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

          {/* Grip Texture (optional, simple radial lines) */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="1" strokeDasharray="1 4" />
          </svg>

          {/* Inner Label */}
          <div className="font-mono text-[10px] text-slate-500 select-none pointer-events-none" style={{ transform: `rotate(${-rotation}deg)` }}>
            SCRUB
          </div>
        </motion.div>
      </div>
    </div>
  )
}
