import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Quotes } from '@phosphor-icons/react'
import type { DailyAffirmation as DailyAffirmationType } from './LoadingScreen'
import { getTodayKey } from '@/lib/utils'
import { useKV } from '@/hooks/use-kv'

export function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState<DailyAffirmationType | null>(null)
  // Use existing KV hook to read localStorage directly
  const [storedAffirmation] = useKV<DailyAffirmationType | null>('daily-affirmation', null)

  useEffect(() => {
    if (storedAffirmation && storedAffirmation.date === getTodayKey()) {
      setAffirmation(storedAffirmation)
    }
  }, [storedAffirmation])

  if (!affirmation) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="glass-card p-6 border border-border/50"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-1">
          <Quotes size={20} weight="duotone" className="text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/90 leading-relaxed mb-2 italic">
            "{affirmation.text}"
          </p>
          <cite className="text-xs text-muted-foreground not-italic">
            — {affirmation.author}
          </cite>
        </div>
      </div>
    </motion.div>
  )
}
