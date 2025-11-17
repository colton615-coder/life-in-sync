import { ReactNode, useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { Trash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SwipeableItemProps {
  children: ReactNode
  onDelete: () => void
  disabled?: boolean
  deleteThreshold?: number
  className?: string
}

export function SwipeableItem({
  children,
  onDelete,
  disabled = false,
  deleteThreshold = 100,
  className,
}: SwipeableItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-deleteThreshold, 0], [0.5, 1])
  const deleteIconOpacity = useTransform(
    x,
    [-deleteThreshold * 1.5, -deleteThreshold, -deleteThreshold * 0.5, 0],
    [1, 1, 0.5, 0]
  )
  const deleteIconScale = useTransform(
    x,
    [-deleteThreshold * 1.5, -deleteThreshold, 0],
    [1.2, 1, 0.8]
  )

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return

    if (info.offset.x < -deleteThreshold) {
      setIsDeleting(true)
      x.set(-300)
      setTimeout(() => {
        onDelete()
      }, 200)
    } else {
      x.set(0)
    }
  }

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-6 bg-destructive"
        style={{ opacity: deleteIconOpacity }}
      >
        <motion.div style={{ scale: deleteIconScale }}>
          <Trash className="w-6 h-6 text-destructive-foreground" weight="bold" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -deleteThreshold * 2, right: 0 }}
        dragElastic={{ left: 0.2, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        className={cn(
          'relative bg-card touch-pan-y',
          isDeleting && 'pointer-events-none'
        )}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
