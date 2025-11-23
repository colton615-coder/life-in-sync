import { useEffect, useRef } from 'react'
import { SwingPoseData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OverlayCanvasProps {
  poseData: SwingPoseData[]
  currentFrame: number // Index of the current frame
  className?: string
  showOverlay: boolean
}

const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
}

export function OverlayCanvas({
  poseData,
  currentFrame,
  className,
  showOverlay
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize handling
    const updateCanvasSize = () => {
      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        ctx.scale(dpr, dpr)
      }
    }

    updateCanvasSize()
    // We might want a resize observer here in a real scenario,
    // but for now we'll rely on parent container sizing or initial load.
    // Ideally, the parent VideoPlayerContainer handles the aspect ratio.

    if (!showOverlay) {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
      return
    }

    const pose = poseData[currentFrame]
    if (!pose || !pose.landmarks) {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)
      return
    }

    const width = canvas.width / window.devicePixelRatio
    const height = canvas.height / window.devicePixelRatio

    ctx.clearRect(0, 0, width, height)

    // Helper to get coordinates
    const getPoint = (idx: number) => {
        const lm = pose.landmarks[idx]
        return { x: lm.x * width, y: lm.y * height, v: lm.visibility }
    }

    // --- Draw Logic ---

    // 1. Head Circle
    const nose = getPoint(LANDMARK_INDICES.NOSE)
    const lEar = getPoint(7) // Approximate ear indices if available, otherwise infer radius
    const rEar = getPoint(8)

    if (nose.v > 0.5) {
        // Estimate head radius based on eye/ear distance or fixed ratio of height
        // Using a simple heuristic here
        const headRadius = Math.abs(getPoint(LANDMARK_INDICES.LEFT_SHOULDER).x - getPoint(LANDMARK_INDICES.RIGHT_SHOULDER).x) * 0.4 || 20

        ctx.beginPath()
        ctx.arc(nose.x, nose.y, headRadius, 0, 2 * Math.PI)
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)' // Yellow
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
    }

    // 2. Spine Angle Line
    // From midpoint of hips to midpoint of shoulders (or nose/neck)
    const lHip = getPoint(LANDMARK_INDICES.LEFT_HIP)
    const rHip = getPoint(LANDMARK_INDICES.RIGHT_HIP)
    const lShoulder = getPoint(LANDMARK_INDICES.LEFT_SHOULDER)
    const rShoulder = getPoint(LANDMARK_INDICES.RIGHT_SHOULDER)

    if (lHip.v > 0.5 && rHip.v > 0.5 && lShoulder.v > 0.5 && rShoulder.v > 0.5) {
        const midHip = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 }
        const midShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 }

        // Extend the line a bit past the head
        const dx = midShoulder.x - midHip.x
        const dy = midShoulder.y - midHip.y
        const angle = Math.atan2(dy, dx)
        const len = Math.sqrt(dx*dx + dy*dy) * 1.5 // extend 50%

        const endX = midHip.x + Math.cos(angle) * len
        const endY = midHip.y + Math.sin(angle) * len

        ctx.beginPath()
        ctx.moveTo(midHip.x, midHip.y)
        ctx.lineTo(endX, endY)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)' // Cyan
        ctx.lineWidth = 2
        ctx.stroke()
    }

    // 3. Shoulder Plane
    if (lShoulder.v > 0.5 && rShoulder.v > 0.5) {
        ctx.beginPath()
        ctx.moveTo(lShoulder.x, lShoulder.y)
        ctx.lineTo(rShoulder.x, rShoulder.y)
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)' // Red
        ctx.lineWidth = 2
        ctx.stroke()
    }

    // 4. Key Joints (Subtle)
    const joints = [
        LANDMARK_INDICES.LEFT_ELBOW, LANDMARK_INDICES.RIGHT_ELBOW,
        LANDMARK_INDICES.LEFT_WRIST, LANDMARK_INDICES.RIGHT_WRIST,
        LANDMARK_INDICES.LEFT_KNEE, LANDMARK_INDICES.RIGHT_KNEE,
        LANDMARK_INDICES.LEFT_ANKLE, LANDMARK_INDICES.RIGHT_ANKLE
    ]

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    joints.forEach(idx => {
        const p = getPoint(idx)
        if (p.v > 0.5) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI)
            ctx.fill()
        }
    })

  }, [poseData, currentFrame, showOverlay])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none z-10", className)}
    />
  )
}
