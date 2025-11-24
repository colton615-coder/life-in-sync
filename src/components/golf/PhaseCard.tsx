import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, ChevronRight, Lightbulb, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhaseMetric } from '@/lib/types'

interface PhaseCardProps {
  phase: PhaseMetric
  isActive: boolean
  isExpanded: boolean
  onClick: () => void
  index: number
}

export function PhaseCard({ phase, isActive, isExpanded, onClick, index }: PhaseCardProps) {
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "rounded-xl border transition-all overflow-hidden",
        isActive || isExpanded
          ? "bg-[#2E8AF7]/10 border-[#2E8AF7]/50 shadow-[0_0_15px_rgba(46,138,247,0.2)]"
          : "bg-white/5 border-white/5"
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className={cn("p-2 rounded-full border backdrop-blur-sm", statusBg[phase.status])}>
            <Icon size={18} className={statusColor[phase.status]} />
          </div>

          {/* Text Content */}
          <div>
            <h3 className={cn("text-sm font-bold uppercase tracking-wide", isActive || isExpanded ? "text-white" : "text-slate-300")}>
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

          <ChevronRight size={16} className={cn("text-slate-600 transition-transform duration-300", isExpanded && "rotate-90 text-[#2E8AF7]")} />
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <div className="px-4 pb-4 space-y-4 pt-2 border-t border-white/5">
                    {/* Analysis */}
                    {phase.aiAnalysis && (
                        <div className="text-sm text-slate-300 leading-relaxed font-sans">
                            {phase.aiAnalysis}
                        </div>
                    )}

                    {/* Tips */}
                    {phase.tips && phase.tips.length > 0 && (
                         <div className="bg-[#151925]/80 rounded-lg p-3 border border-white/5">
                             <div className="flex items-center gap-2 mb-2 text-[#2E8AF7]">
                                 <Lightbulb size={14} />
                                 <span className="text-[10px] font-bold uppercase tracking-wider">Pro Tips</span>
                             </div>
                             <ul className="space-y-2">
                                 {phase.tips.map((tip, i) => (
                                     <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-snug">
                                         <span className="mt-1 min-w-[4px] h-[4px] rounded-full bg-[#2E8AF7]" />
                                         {tip}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    )}

                     {/* Drills */}
                    {phase.drills && phase.drills.length > 0 && (
                         <div className="bg-[#151925]/80 rounded-lg p-3 border border-white/5">
                             <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                 <Target size={14} />
                                 <span className="text-[10px] font-bold uppercase tracking-wider">Drills</span>
                             </div>
                             <ul className="space-y-2">
                                 {phase.drills.map((drill, i) => (
                                     <li key={i} className="text-xs text-slate-400 flex items-start gap-2 leading-snug">
                                         <span className="mt-1 min-w-[4px] h-[4px] rounded-full bg-emerald-400" />
                                         {drill}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    )}

                    {!phase.aiAnalysis && !phase.tips && !phase.drills && (
                        <div className="text-xs text-slate-500 italic text-center py-2">
                            Detailed analysis for this phase is pending...
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
