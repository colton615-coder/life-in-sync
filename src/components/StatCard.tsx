import { NeumorphicCard } from './NeumorphicCard'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: string
  onClick?: () => void
}

export function StatCard({ icon, label, value, trend, onClick }: StatCardProps) {
  return (
    <NeumorphicCard hover={!!onClick} onClick={onClick} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-accent text-2xl">{icon}</div>
        {trend && (
          <span className="text-xs text-muted-foreground">{trend}</span>
        )}
      </div>
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold tabular-nums"
        >
          {value}
        </motion.div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </NeumorphicCard>
  )
}
