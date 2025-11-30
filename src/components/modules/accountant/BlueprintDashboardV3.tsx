import { useMemo } from 'react';
import { FinancialAudit } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface BlueprintDashboardV3Props {
  audit: FinancialAudit;
  report: FinancialReport;
}

export function BlueprintDashboardV3({ audit, report }: BlueprintDashboardV3Props) {
  // --- 1. Metric Calculations ---

  const { burnRate, runwayDays, isColdStart } = useMemo(() => {
    // Total Monthly Budget from the Report
    const totalBudget = report.proposedBudget.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
    const liquidAssets = audit.liquidAssets || 0;

    // Determine Burn Rate Strategy
    // For V3.0 Foundation, we assume start date is the audit.lastUpdated date.
    // In a real scenario, we'd query the transaction history from IDB or a store.
    const auditDate = parseISO(audit.lastUpdated);
    const daysSinceAudit = Math.max(0, differenceInDays(new Date(), auditDate));

    const COLD_START_PERIOD = 7;
    let calculatedBurnRate = 0;
    let isCold = false;

    if (daysSinceAudit < COLD_START_PERIOD) {
      // Cold Start: Default to Budget / 30
      calculatedBurnRate = totalBudget / 30;
      isCold = true;
    } else {
      // Rolling Average Logic (Stubbed for Foundation)
      // TODO: Connect to actual transaction history sum / 30
      // For now, we fall back to budget-based to prevent 'Infinity' errors if no history exists yet.
      calculatedBurnRate = totalBudget / 30;
    }

    // Runway Calculation: Liquid Assets / Daily Burn
    // Avoid division by zero
    const runway = calculatedBurnRate > 0 ? liquidAssets / calculatedBurnRate : 0;

    return {
      burnRate: calculatedBurnRate,
      runwayDays: Math.floor(runway),
      isColdStart: isCold
    };
  }, [audit.liquidAssets, audit.lastUpdated, report.proposedBudget]);

  // --- 2. Color Logic ---
  const runwayColor = runwayDays < 30 ? "text-red-500" : runwayDays < 90 ? "text-amber-400" : "text-cyan-400";
  const runwayBorder = runwayDays < 30 ? "border-red-500/50" : runwayDays < 90 ? "border-amber-500/50" : "border-cyan-500/50";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">

      {/* --- Section A: The HUD (Cockpit Headers) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Burn Rate */}
        <Card className="glass-card p-4 flex flex-col items-center justify-center border-white/5 bg-black/40">
           <div className="flex items-center gap-2 mb-1 text-muted-foreground">
             <Activity className="h-4 w-4" />
             <span className="text-xs uppercase tracking-widest">Daily Burn</span>
           </div>
           <span className="text-2xl font-mono font-bold text-white">
             {formatCurrency(burnRate)}
           </span>
           <span className="text-[10px] text-white/40 mt-1">
             {isColdStart ? "(Est. Project)" : "(30-Day Avg)"}
           </span>
        </Card>

        {/* RUNWAY (Hero Metric) */}
        <Card className={cn("glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden border-2", runwayBorder)}>
            <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-b pointer-events-none",
                runwayDays < 30 ? "from-red-500" : "from-cyan-500")}
            />
            <span className="text-sm font-bold text-white/80 uppercase tracking-[0.2em] mb-2">Runway</span>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-6xl font-mono font-bold tracking-tighter drop-shadow-lg", runwayColor)}>
                    {runwayDays}
                </span>
                <span className="text-sm text-muted-foreground font-medium">Days</span>
            </div>
             {runwayDays < 30 && (
                <div className="mt-2 flex items-center gap-1 text-red-400 text-xs font-bold animate-pulse">
                    <TrendingDown className="h-3 w-3" /> CRITICAL
                </div>
            )}
        </Card>

        {/* Liquid Assets */}
        <Card className="glass-card p-4 flex flex-col items-center justify-center border-white/5 bg-black/40">
           <div className="flex items-center gap-2 mb-1 text-muted-foreground">
             <DollarSign className="h-4 w-4" />
             <span className="text-xs uppercase tracking-widest">Liquidity</span>
           </div>
           <span className="text-2xl font-mono font-bold text-emerald-400">
             {formatCurrency(audit.liquidAssets || 0)}
           </span>
           <span className="text-[10px] text-white/40 mt-1">
             Cash on Hand
           </span>
        </Card>
      </div>

      {/* --- Section B: Holographic Sankey Placeholder --- */}
      <Card className="glass-card min-h-[300px] flex items-center justify-center border-dashed border-white/10 relative overflow-hidden">
          {/*
            TODO: Implement Holographic Sankey Diagram using d3-sankey for math
            and custom SVG/Framer Motion for rendering.

            Requirements:
            - Input: audit.monthlyIncome
            - Flows: Income -> Categories -> Subcategories
            - Aesthetic: Cyan/Magenta gradients, neon glow, stroke-width = volume
          */}
          <div className="text-center space-y-2 opacity-50">
             <div className="w-16 h-16 rounded-full border border-cyan-500/30 mx-auto flex items-center justify-center animate-spin-slow">
                 <div className="w-2 h-2 bg-cyan-400 rounded-full" />
             </div>
             <p className="text-sm font-mono text-cyan-400">Initializing Holographic Projection...</p>
             <p className="text-xs text-muted-foreground">Sankey Visualization Module Loading</p>
          </div>
      </Card>

      {/* --- Section C: Forecast/Flight Path Placeholder --- */}
      <Card className="glass-card p-4 border-white/5">
          <h3 className="text-sm font-bold text-white mb-4">Flight Path Prediction</h3>
          <div className="h-32 flex items-end justify-between gap-1 px-2">
              {/* Dummy Bars for visual placeholder of 'Forecast' */}
              {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full bg-cyan-900/40 rounded-t-sm hover:bg-cyan-500/60 transition-colors"
                    style={{ height: `${20 + Math.random() * 60}%` }}
                  />
              ))}
          </div>
      </Card>

    </div>
  );
}
