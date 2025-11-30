import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ReallocationProposalProps {
  deficitAmount: number;
  deficitCategory: string;
  sourceCategory: string;
  sourceAmountBefore: number;
  onApprove: () => void;
  onDecline: () => void;
}

export function ReallocationProposal({
  deficitAmount,
  deficitCategory,
  sourceCategory,
  sourceAmountBefore,
  onApprove,
  onDecline
}: ReallocationProposalProps) {
  // Determine if it's a critical deficit (high percentage or absolute value could be logic here,
  // but for UI we just style it as warning/action).

  const transferAmount = Math.abs(deficitAmount);
  const remainingSource = sourceAmountBefore - transferAmount;

  return (
    <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-amber-500/30 overflow-hidden relative shadow-lg shadow-amber-900/10">
      {/* Header with "Glitch" or "Alert" styling */}
      <div className="bg-amber-500/10 p-3 flex items-center gap-2 border-b border-amber-500/20">
        <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
        <span className="text-amber-500 font-bold uppercase tracking-wider text-xs">Deficit Detected</span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-slate-300">
          Spending in <span className="font-bold text-white">{deficitCategory}</span> has exceeded the budget by <span className="font-mono text-red-400">${transferAmount.toFixed(2)}</span>.
        </p>

        {/* Transfer Visualization */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 relative">
             <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                 <span>Source: {sourceCategory}</span>
                 <span>Target: {deficitCategory}</span>
             </div>

             <div className="flex items-center justify-between gap-2">
                 <div className="flex-1 text-center bg-black/40 rounded p-2 border border-white/5">
                     <div className="text-emerald-400 font-mono font-bold">${sourceAmountBefore.toFixed(0)}</div>
                     <div className="text-[10px] text-emerald-400/50">Available</div>
                 </div>

                 <div className="flex flex-col items-center">
                    <ArrowRight className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] text-amber-500 font-mono">-${transferAmount.toFixed(0)}</span>
                 </div>

                 <div className="flex-1 text-center bg-black/40 rounded p-2 border border-white/5">
                     <div className="text-red-400 font-mono font-bold">-${transferAmount.toFixed(0)}</div>
                     <div className="text-[10px] text-red-400/50">Deficit</div>
                 </div>
             </div>

             <div className="mt-2 text-center text-xs text-slate-400">
                 Post-Transfer {sourceCategory}: <span className="text-white font-mono">${remainingSource.toFixed(0)}</span>
             </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 border-white/10 hover:bg-white/5 text-slate-400 h-10"
          >
            Ignore
          </Button>
          <Button
            onClick={onApprove}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/20 h-10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}
