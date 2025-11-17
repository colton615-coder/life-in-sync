import { useEffect, useRef, useState } from 'react'
import { SwingPoseData } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  poseData: SwingPoseData[]
  className?: string
  showSkeleton?: boolean
  showKeypoints?: boolean
  skeletonColor?: string
  keypointColor?: string
  lineWidth?: number
  keypointRadius?: number
}

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
] as const

const JOINT_COLORS: Record<string, string> = {
  head: '#60A5FA',
  shoulder: '#34D399',
  elbow: '#FBBF24',
  wrist: '#F87171',
  hip: '#A78BFA',
  knee: '#FB923C',
  ankle: '#EC4899',
  foot: '#10B981',
}

const getJointColor = (index: number): string => {
  if (index >= 0 && index <= 10) return JOINT_COLORS.head
  if (index >= 11 && index <= 12) return JOINT_COLORS.shoulder
  if (index >= 13 && index <= 14) return JOINT_COLORS.elbow
  if (index >= 15 && index <= 16) return JOINT_COLORS.wrist
  if (index >= 23 && index <= 24) return JOINT_COLORS.hip
  if (index >= 25 && index <= 26) return JOINT_COLORS.knee
  if (index >= 27 && index <= 28) return JOINT_COLORS.ankle
  return JOINT_COLORS.foot
}

export function PoseOverlay({
  videoRef,
  poseData,
  className,
  showSkeleton = true,
  showKeypoints = true,
  skeletonColor = 'rgba(96, 165, 250, 0.8)',
  keypointColor,
  lineWidth = 3,
  keypointRadius = 5
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      const rect = video.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(dpr, dpr)
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(video)

    return () => {
      resizeObserver.disconnect()
    }
  }, [videoRef])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !poseData || poseData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawPose = () => {
      if (!isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      const videoDuration = video.duration
      const currentTime = video.currentTime
      
      if (videoDuration === 0 || isNaN(currentTime)) return

      const frameIndex = Math.floor((currentTime / videoDuration) * poseData.length)
      const clampedIndex = Math.max(0, Math.min(frameIndex, poseData.length - 1))
      
      if (clampedIndex !== currentFrame) {
        setCurrentFrame(clampedIndex)
      }

      const pose = poseData[clampedIndex]
      if (!pose || !pose.landmarks) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const scaleX = canvas.width
      const scaleY = canvas.height

      const visibleLandmarks = pose.landmarks.filter(
        landmark => landmark.visibility > 0.5
      )

      if (showSkeleton) {
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
          const start = pose.landmarks[startIdx]
          const end = pose.landmarks[endIdx]

          if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
            const gradient = ctx.createLinearGradient(
              start.x * scaleX,
              start.y * scaleY,
              end.x * scaleX,
              end.y * scaleY
            )
            
            const startColor = getJointColor(startIdx)
            const endColor = getJointColor(endIdx)
            gradient.addColorStop(0, startColor)
            gradient.addColorStop(1, endColor)

            ctx.strokeStyle = skeletonColor
            ctx.shadowColor = skeletonColor
            ctx.shadowBlur = 8
            
            ctx.beginPath()
            ctx.moveTo(start.x * scaleX, start.y * scaleY)
            ctx.lineTo(end.x * scaleX, end.y * scaleY)
            ctx.stroke()
            
            ctx.shadowBlur = 0
          }
        })
      }

      if (showKeypoints) {
        visibleLandmarks.forEach((landmark, index) => {
          const x = landmark.x * scaleX
          const y = landmark.y * scaleY
          const alpha = landmark.visibility

          const color = keypointColor || getJointColor(index)
          
          ctx.shadowColor = color
          ctx.shadowBlur = 10
          
          ctx.fillStyle = color.replace(')', `, ${alpha})`)
          ctx.beginPath()
          ctx.arc(x, y, keypointRadius, 0, 2 * Math.PI)
          ctx.fill()

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
          ctx.lineWidth = 2
          ctx.stroke()
          
          ctx.shadowBlur = 0
        })
      }

      animationFrameRef.current = requestAnimationFrame(drawPose)
    }

    const handlePlay = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      drawPose()
    }

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      drawPose()
    }

    const handleSeeked = () => {
      drawPose()
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('timeupdate', drawPose)

    drawPose()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('timeupdate', drawPose)
    }
  }, [videoRef, poseData, currentFrame, showSkeleton, showKeypoints, skeletonColor, keypointColor, lineWidth, keypointRadius, isVisible])

  if (!poseData || poseData.length === 0) {
    return null
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 pointer-events-none z-10",
          className
        )}
        style={{ mixBlendMode: 'screen' }}
      />
      
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-3 py-1.5 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-lg border border-border hover:bg-accent transition-colors"
          aria-label={isVisible ? 'Hide pose overlay' : 'Show pose overlay'}
        >
          {isVisible ? 'Hide Skeleton' : 'Show Skeleton'}
        </button>
        
        {isVisible && (
          <div className="px-3 py-1.5 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-lg border border-border">
            Frame: {currentFrame + 1} / {poseData.length}
          </div>
        )}
      </div>
    </>
  )
}
