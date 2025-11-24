import { useRef, useEffect } from 'react'
import { SwingMetrics, PhaseMetric } from '@/lib/types'
import { PhaseCard } from './PhaseCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PhaseListProps {
  metrics: SwingMetrics
  currentTimestamp: number
  onSelectPhase: (timestamp: number) => void
}

export function PhaseList({ metrics, currentTimestamp, onSelectPhase }: PhaseListProps) {
  // Define the explicit order of phases
  const phaseOrder: (keyof SwingMetrics['phases'])[] = [
    'address',
    'takeaway',
    'backswing',
    'top',
    'downswing',
    'impact',
    'followThrough',
    'finish'
  ]

  // Determine active phase based on timestamp
  // We find the phase with the closest timestamp that is <= currentTimestamp,
  // OR just map the clicked state if we want manual selection.
  // For now, let's highlight the phase that matches the video time approx.

  return (
    <ScrollArea className="h-full w-full px-4 py-4">
      <div className="space-y-3 pb-20"> {/* Padding bottom for safe scrolling */}
        {phaseOrder.map((phaseKey, index) => {
          const phaseData = metrics.phases[phaseKey]
          if (!phaseData.valid) return null

          // Simple active check: Is the video roughly at this phase?
          // Since we don't know the exact duration of each phase, we can just check if
          // currentTimestamp is close to the snapshot timestamp.
          const isActive = Math.abs(currentTimestamp - phaseData.timestamp) < 0.1 // 100ms window

          return (
            <PhaseCard
              key={phaseKey as string}
              index={index}
              phase={phaseData}
              isActive={isActive}
              onClick={() => onSelectPhase(phaseData.timestamp)}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
}
