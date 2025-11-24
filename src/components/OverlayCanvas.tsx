import { useEffect, useRef } from 'react'
import { SwingPoseData, SwingLandmark } from '@/lib/types'
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
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
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
        // Avoid infinite loop resizing, trust parent dimensions
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`
            ctx.scale(dpr, dpr)
        }
      }
    }

    updateCanvasSize()

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

    const drawLine = (idx1: number, idx2: number, color: string, width = 3) => {
        const p1 = getPoint(idx1)
        const p2 = getPoint(idx2)
        if (p1.v > 0.5 && p2.v > 0.5) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = color
            ctx.lineWidth = width
            ctx.lineCap = 'round'
            ctx.stroke()
        }
    }

    const drawPoint = (idx: number, color: string, radius = 4) => {
        const p = getPoint(idx)
        if (p.v > 0.5) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'
            ctx.lineWidth = 1
            ctx.stroke()
        }
    }

    // --- SKELETON RENDERER ---

    // Colors
    // Right Side (User's Right) -> Red/Pink
    const RIGHT_COLOR = '#FF4F4F'
    // Left Side (User's Left) -> Cyan/Blue
    const LEFT_COLOR = '#2E8AF7'
    // Center -> White
    const CENTER_COLOR = '#FFFFFF'

    // 1. Torso Box
    drawLine(LANDMARK_INDICES.LEFT_SHOULDER, LANDMARK_INDICES.RIGHT_SHOULDER, CENTER_COLOR, 4)
    drawLine(LANDMARK_INDICES.LEFT_HIP, LANDMARK_INDICES.RIGHT_HIP, CENTER_COLOR, 4)
    drawLine(LANDMARK_INDICES.LEFT_SHOULDER, LANDMARK_INDICES.LEFT_HIP, LEFT_COLOR, 3)
    drawLine(LANDMARK_INDICES.RIGHT_SHOULDER, LANDMARK_INDICES.RIGHT_HIP, RIGHT_COLOR, 3)

    // 2. Arms
    // Left Arm
    drawLine(LANDMARK_INDICES.LEFT_SHOULDER, LANDMARK_INDICES.LEFT_ELBOW, LEFT_COLOR, 4)
    drawLine(LANDMARK_INDICES.LEFT_ELBOW, LANDMARK_INDICES.LEFT_WRIST, LEFT_COLOR, 4)
    // Right Arm
    drawLine(LANDMARK_INDICES.RIGHT_SHOULDER, LANDMARK_INDICES.RIGHT_ELBOW, RIGHT_COLOR, 4)
    drawLine(LANDMARK_INDICES.RIGHT_ELBOW, LANDMARK_INDICES.RIGHT_WRIST, RIGHT_COLOR, 4)

    // 3. Legs
    // Left Leg
    drawLine(LANDMARK_INDICES.LEFT_HIP, LANDMARK_INDICES.LEFT_KNEE, LEFT_COLOR, 4)
    drawLine(LANDMARK_INDICES.LEFT_KNEE, LANDMARK_INDICES.LEFT_ANKLE, LEFT_COLOR, 4)
    drawLine(LANDMARK_INDICES.LEFT_ANKLE, LANDMARK_INDICES.LEFT_HEEL, LEFT_COLOR, 2)
    drawLine(LANDMARK_INDICES.LEFT_HEEL, LANDMARK_INDICES.LEFT_FOOT_INDEX, LEFT_COLOR, 2)
    drawLine(LANDMARK_INDICES.LEFT_ANKLE, LANDMARK_INDICES.LEFT_FOOT_INDEX, LEFT_COLOR, 2)

    // Right Leg
    drawLine(LANDMARK_INDICES.RIGHT_HIP, LANDMARK_INDICES.RIGHT_KNEE, RIGHT_COLOR, 4)
    drawLine(LANDMARK_INDICES.RIGHT_KNEE, LANDMARK_INDICES.RIGHT_ANKLE, RIGHT_COLOR, 4)
    drawLine(LANDMARK_INDICES.RIGHT_ANKLE, LANDMARK_INDICES.RIGHT_HEEL, RIGHT_COLOR, 2)
    drawLine(LANDMARK_INDICES.RIGHT_HEEL, LANDMARK_INDICES.RIGHT_FOOT_INDEX, RIGHT_COLOR, 2)
    drawLine(LANDMARK_INDICES.RIGHT_ANKLE, LANDMARK_INDICES.RIGHT_FOOT_INDEX, RIGHT_COLOR, 2)

    // 4. Joints (Draw over lines)
    const joints = [
        { idx: LANDMARK_INDICES.LEFT_SHOULDER, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_SHOULDER, color: RIGHT_COLOR },
        { idx: LANDMARK_INDICES.LEFT_ELBOW, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_ELBOW, color: RIGHT_COLOR },
        { idx: LANDMARK_INDICES.LEFT_WRIST, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_WRIST, color: RIGHT_COLOR },
        { idx: LANDMARK_INDICES.LEFT_HIP, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_HIP, color: RIGHT_COLOR },
        { idx: LANDMARK_INDICES.LEFT_KNEE, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_KNEE, color: RIGHT_COLOR },
        { idx: LANDMARK_INDICES.LEFT_ANKLE, color: LEFT_COLOR },
        { idx: LANDMARK_INDICES.RIGHT_ANKLE, color: RIGHT_COLOR },
    ]

    joints.forEach(j => drawPoint(j.idx, 'white', 3)) // White inner
    joints.forEach(j => drawPoint(j.idx, j.color, 5)) // Color outer ring? No, drawPoint fills.

    // Let's make joints pop
    joints.forEach(j => {
        const p = getPoint(j.idx)
        if (p.v > 0.5) {
             ctx.beginPath()
             ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
             ctx.fillStyle = j.color
             ctx.fill()
             ctx.beginPath()
             ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI)
             ctx.fillStyle = 'white'
             ctx.fill()
        }
    })

    // 5. Head
    // Draw line from nose to mid-shoulder
    const nose = getPoint(LANDMARK_INDICES.NOSE)
    const lShoulder = getPoint(LANDMARK_INDICES.LEFT_SHOULDER)
    const rShoulder = getPoint(LANDMARK_INDICES.RIGHT_SHOULDER)
    const midShoulder = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 }

    if (nose.v > 0.5) {
        ctx.beginPath()
        ctx.moveTo(nose.x, nose.y)
        ctx.lineTo(midShoulder.x, midShoulder.y)
        ctx.strokeStyle = CENTER_COLOR
        ctx.lineWidth = 2
        ctx.stroke()

        // Head circle
        ctx.beginPath()
        ctx.arc(nose.x, nose.y, 15 * (width/1000 + 0.5), 0, 2 * Math.PI) // Scale roughly
        ctx.strokeStyle = CENTER_COLOR
        ctx.lineWidth = 2
        ctx.stroke()
    }


  }, [poseData, currentFrame, showOverlay])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none z-10", className)}
    />
  )
}
