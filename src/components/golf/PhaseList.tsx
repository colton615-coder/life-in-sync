import { useState } from 'react'
import { SwingMetrics } from '@/lib/types'
import { PhaseCard } from './PhaseCard'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PhaseListProps {
  metrics: SwingMetrics
  currentTimestamp: number
  onSelectPhase: (timestamp: number) => void
}

export function PhaseList({ metrics, currentTimestamp, onSelectPhase }: PhaseListProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null)

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

  const handlePhaseClick = (phaseKey: string, timestamp: number) => {
    // Accordion Logic: Toggle if same, otherwise set new
    if (expandedPhase === phaseKey) {
      setExpandedPhase(null)
    } else {
      setExpandedPhase(phaseKey)
      onSelectPhase(timestamp)
    }
  }

  return (
    <ScrollArea className="h-full w-full px-4 py-4">
      <div className="space-y-3 pb-20"> {/* Padding bottom for safe scrolling */}
        {phaseOrder.map((phaseKey, index) => {
          const phaseData = metrics.phases[phaseKey]
          if (!phaseData.valid) return null

          // Simple active check: Is the video roughly at this phase?
          const isActive = Math.abs(currentTimestamp - phaseData.timestamp) < 0.1
          const isExpanded = expandedPhase === phaseKey

          return (
            <PhaseCard
              key={phaseKey as string}
              index={index}
              phase={phaseData}
              isActive={isActive}
              isExpanded={isExpanded}
              onClick={() => handlePhaseClick(phaseKey, phaseData.timestamp)}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
}
