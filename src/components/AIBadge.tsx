import { Badge } from '@/components/ui/badge'
import { Sparkle, Brain } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { AIProvider } from '@/lib/ai/types'

interface AIBadgeProps {
  provider: AIProvider
  className?: string
}

export function AIBadge({ provider, className }: AIBadgeProps) {
  const config = {
    spark: {
      label: "GPT-4o",
      icon: Sparkle,
      color: "text-primary"
    },
    gemini: {
      label: "Gemini 2.5",
      icon: Brain,
      color: "text-accent"
    }
  }

  const { label, icon: Icon, color } = config[provider]

  return (
    <Badge variant="outline" className={cn("gap-1.5", color, className)}>
      <Icon size={12} weight="fill" />
      {label}
    </Badge>
  )
}
