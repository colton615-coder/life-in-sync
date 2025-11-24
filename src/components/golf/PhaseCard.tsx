import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhaseMetric } from '@/lib/types'

interface PhaseCardProps {
  phase: PhaseMetric
  isActive: boolean
  onClick: () => void
  index: number
}

export function PhaseCard({ phase, isActive, onClick, index }: PhaseCardProps) {
  const statusColor = {
    excellent: 'text-emerald-400',
    good: 'text-emerald-400',
    fair: 'text-orange-400',
    poor: 'text-red-400'
  }

  const statusBg = {
    excellent: 'bg-emerald-500/10 border-emerald-500/20',
    good: 'bg-emerald-500/10 border-emerald-500/20',
    fair: 'bg-orange-500/10 border-orange-500/20',
    poor: 'bg-red-500/10 border-red-500/20'
  }

  const Icon = {
    excellent: CheckCircle,
    good: CheckCircle,
    fair: AlertTriangle,
    poor: XCircle
  }[phase.status]

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-xl border transition-all group text-left",
        isActive
          ? "bg-[#2E8AF7]/10 border-[#2E8AF7]/50 shadow-[0_0_15px_rgba(46,138,247,0.2)]"
          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon */}
        <div className={cn("p-2 rounded-full border backdrop-blur-sm", statusBg[phase.status])}>
          <Icon size={18} className={statusColor[phase.status]} />
        </div>

        {/* Text Content */}
        <div>
          <h3 className={cn("text-sm font-bold uppercase tracking-wide", isActive ? "text-white" : "text-slate-300")}>
            {index + 1}. {phase.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase">{phase.keyMetric.label}:</span>
            <span className={cn("text-xs font-mono font-bold", statusColor[phase.status])}>
              {phase.keyMetric.value}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Score Badge */}
        <div className={cn(
            "px-2 py-1 rounded text-[10px] font-mono font-bold border",
            statusBg[phase.status],
            statusColor[phase.status]
        )}>
            {phase.score}
        </div>

        <ChevronRight size={16} className={cn("text-slate-600 transition-transform group-hover:translate-x-1", isActive && "text-[#2E8AF7]")} />
      </div>
    </motion.button>
  )
}
