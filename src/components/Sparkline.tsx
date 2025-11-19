import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
  strokeWidth?: number
  showDots?: boolean
  animate?: boolean
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#FFC74D',
  className,
  strokeWidth = 2,
  showDots = false,
  animate = true,
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (!data || data.length === 0) return null

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const padding = height * 0.1
    const effectiveHeight = height - padding * 2
    const stepX = width / (data.length - 1 || 1)

    const points = data.map((value, index) => {
      const x = index * stepX
      const normalizedValue = (value - min) / range
      const y = height - padding - normalizedValue * effectiveHeight
      return { x, y, value }
    })

    const pathD = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }
      return `${path} L ${point.x} ${point.y}`
    }, '')

    return { pathD, points }
  }, [data, width, height])

  if (!data || data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className={cn('opacity-50', className)}
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.3}
        />
      </svg>
    )
  }


  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {pathData && (
        <>
          <motion.path
            d={`${pathData.pathD} L ${width} ${height} L 0 ${height} Z`}
            fill={`url(#sparkline-gradient-${Math.random()})`}
            initial={animate ? { opacity: 0 } : undefined}
            animate={animate ? { opacity: 0.3 } : undefined}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          <motion.path
            d={pathData.pathD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
            animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{
              pathLength: { duration: 0.8, ease: 'easeInOut' },
              opacity: { duration: 0.3 },
            }}
          />

          {showDots &&
            pathData.points.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={index === pathData.points.length - 1 ? 3 : 2}
                fill={color}
                initial={animate ? { scale: 0, opacity: 0 } : undefined}
                animate={animate ? { scale: 1, opacity: 1 } : undefined}
                transition={{
                  duration: 0.3,
                  delay: animate ? 0.5 + index * 0.05 : 0,
                }}
              />
            ))}
        </>
      )}
    </svg>
  )
}

interface TrendIndicatorProps {
  data: number[]
  className?: string
  showPercentage?: boolean
}

export function TrendIndicator({ data, className, showPercentage = true }: TrendIndicatorProps) {
  const trend = useMemo(() => {
    if (!data || data.length < 2) return { direction: 'neutral' as const, percentage: 0 }

    const first = data[0]
    const last = data[data.length - 1]
    const change = last - first
    const percentage = first !== 0 ? (change / first) * 100 : 0

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
    }
  }, [data])

  const colors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  }

  const Arrow = () => {
    if (trend.direction === 'neutral') return null
    
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={cn('inline-block', colors[trend.direction])}
      >
        <path
          d={
            trend.direction === 'up'
              ? 'M8 3L12 7L11 8L8.5 5.5V13H7.5V5.5L5 8L4 7L8 3Z'
              : 'M8 13L4 9L5 8L7.5 10.5V3H8.5V10.5L11 8L12 9L8 13Z'
          }
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm font-medium', colors[trend.direction], className)}>
      <Arrow />
      {showPercentage && trend.percentage > 0 && (
        <span>{trend.percentage.toFixed(1)}%</span>
      )}
    </div>
  )
}
