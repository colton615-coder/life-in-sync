import { useMemo, useState } from 'react';
import { FinancialAudit } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { Card } from '@/components/Card';
import { cn } from '@/lib/utils';
import { TrendingDown, Activity, DollarSign } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { sankey, sankeyLinkHorizontal, SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey';

interface BlueprintDashboardV3Props {
  audit: FinancialAudit;
  report: FinancialReport;
}

// Custom types for D3 Sankey
// D3 Sankey modifies objects in place. We extend the base types.
interface MyNode extends SankeyNode<object, object> {
  name: string;
  value: number;
  color: string;
}

interface MyLink extends SankeyLink<MyNode, object> {
  source: MyNode;
  target: MyNode;
  value: number;
  color: string;
  width?: number; // Added by d3
}

export function BlueprintDashboardV3({ audit, report }: BlueprintDashboardV3Props) {
  const [sankeyMode, setSankeyMode] = useState<'budget' | 'actual'>('budget');

  // --- 1. Metric Calculations ---
  const { burnRate, runwayDays, isColdStart } = useMemo(() => {
    const totalBudget = report.proposedBudget.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
    const liquidAssets = audit.liquidAssets || 0;

    const auditDate = parseISO(audit.lastUpdated);
    const daysSinceAudit = Math.max(0, differenceInDays(new Date(), auditDate));

    const COLD_START_PERIOD = 7;
    let calculatedBurnRate = 0;
    let isCold = false;

    if (daysSinceAudit < COLD_START_PERIOD) {
      calculatedBurnRate = totalBudget / 30; // Daily burn from monthly budget
      isCold = true;
    } else {
      calculatedBurnRate = totalBudget / 30; // Stub for now
    }

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

  const formatCurrency = (val: number | null | undefined) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

  // --- 3. Sankey Data Prep ---
  const sankeyData = useMemo(() => {
    // We use a simpler data structure first, then map it to D3 compatible objects
    // To avoid TS complexity with D3's index/object duality, we'll build the graph carefully.

    const rawNodes: { name: string, value: number, color: string }[] = [];
    const rawLinks: { source: number, target: number, value: number, color: string }[] = [];

    const monthlyIncome = audit.monthlyIncome || 0;

    // Level 0: Income
    rawNodes.push({ name: 'Total Income', value: monthlyIncome, color: '#10b981' });
    const incomeNodeIndex = 0;

    let nodeCounter = 1;

    // Data Source Selection
    const sourceData = sankeyMode === 'budget' ? report.proposedBudget : audit.categories;

    // Process Categories (Level 1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sourceData.forEach((cat: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catValue = sankeyMode === 'budget' ? cat.allocatedAmount : (cat.subcategories?.reduce((sum: number, sub: any) => sum + (sub.amount || 0), 0) || 0);

      // Skip zero value categories to keep graph clean
      if (catValue <= 0) return;

      const catIndex = nodeCounter++;
      const catColor = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#06b6d4'][catIndex % 6];

      rawNodes.push({ name: cat.name || cat.categoryName, value: catValue, color: catColor });

      // Link Income -> Category
      rawLinks.push({
        source: incomeNodeIndex,
        target: catIndex,
        value: catValue,
        color: catColor
      });

      // Process Subcategories (Level 2)
      if (cat.subcategories) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         cat.subcategories.forEach((sub: any) => {
            const subValue = sankeyMode === 'budget' ? sub.allocatedAmount : (sub.amount || 0);
            if (subValue <= 0) return;

            const subIndex = nodeCounter++;
            const subName = sub.name || sub.subcategoryName;

            rawNodes.push({ name: subName, value: subValue, color: catColor });

             // Link Category -> Subcategory
            rawLinks.push({
                source: catIndex,
                target: subIndex,
                value: subValue,
                color: catColor
            });
         });
      }
    });

    // Handle Unallocated Income (if budget < income)
    // We calculate allocated from the links originating from income
    const totalAllocated = rawLinks.filter(l => l.source === 0).reduce((acc, l) => acc + l.value, 0);

    if (monthlyIncome > totalAllocated) {
        const surplus = monthlyIncome - totalAllocated;
        const surplusIndex = nodeCounter++;
        rawNodes.push({ name: 'Unallocated', value: surplus, color: '#334155' });
        rawLinks.push({
            source: incomeNodeIndex,
            target: surplusIndex,
            value: surplus,
            color: '#334155'
        });
    }

    return { nodes: rawNodes, links: rawLinks };
  }, [sankeyMode, audit.monthlyIncome, audit.categories, report.proposedBudget]);

  // Generate Sankey Layout
  const { nodes: sankeyNodes, links: sankeyLinks } = useMemo(() => {
      const width = 800; // SVG internal width
      const height = 400; // SVG internal height

      const sankeyGenerator = sankey<MyNode, MyLink>()
        .nodeWidth(10)
        .nodePadding(20)
        .extent([[0, 0], [width, height]]);

      // Prepare data for D3 (it needs to conform to SankeyGraph interface)
      // We map our raw nodes to objects D3 can mutate
      const graphInput: SankeyGraph<MyNode, MyLink> = {
          nodes: sankeyData.nodes.map(n => ({ ...n } as MyNode)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          links: sankeyData.links.map(l => ({ ...l } as any)) // Cast to any to let D3 resolve indices
      };

      // Execute D3 Layout
      const result = sankeyGenerator(graphInput);

      return result;
  }, [sankeyData]);


  // --- 4. Flight Path Chart Data ---
  const flightPathData = useMemo(() => {
    const data = [];
    let currentBalance = audit.liquidAssets || 0;
    const dailyBurn = burnRate;
    // Prevent division by zero
    const crashPointDay = dailyBurn > 0 ? currentBalance / dailyBurn : 999;

    for (let i = 0; i <= 90; i++) {
        data.push({
            day: i,
            balance: Math.max(0, currentBalance),
            isCrash: i > crashPointDay
        });
        currentBalance -= dailyBurn;
    }
    return { data, crashPointDay };
  }, [audit.liquidAssets, burnRate]);


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

      {/* --- Section B: Holographic Sankey Visualization --- */}
      <Card className="glass-card min-h-[400px] flex flex-col border-white/10 relative overflow-hidden bg-black/60">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />

          <div className="p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">Capital Flow</h3>
              </div>

              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setSankeyMode('budget')}
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", sankeyMode === 'budget' ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-300")}
                  >
                      Ideal
                  </button>
                  <button
                    onClick={() => setSankeyMode('actual')}
                    className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", sankeyMode === 'actual' ? "bg-magenta-500/20 text-fuchsia-400 border border-fuchsia-500/30" : "text-slate-500 hover:text-slate-300")}
                  >
                      Actual
                  </button>
              </div>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center overflow-x-auto">
             <svg width="800" height="400" viewBox="0 0 800 400" className="min-w-[800px]">
                 <defs>
                     {/* Define Gradients for Links */}
                     {sankeyLinks.map((link, i) => (
                         <linearGradient key={`grad-${i}`} id={`grad-${i}`} gradientUnits="userSpaceOnUse" x1={link.source.x1} x2={link.target.x0}>
                             <stop offset="0%" stopColor={link.color} stopOpacity="0.2" />
                             <stop offset="100%" stopColor={link.color} stopOpacity="0.5" />
                         </linearGradient>
                     ))}
                 </defs>

                 {/* Links */}
                 {sankeyLinks.map((link, i) => (
                     <path
                        key={`link-${i}`}
                        d={sankeyLinkHorizontal()(link) || undefined}
                        fill="none"
                        stroke={`url(#grad-${i})`}
                        strokeWidth={Math.max(1, link.width || 0)}
                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                        style={{ mixBlendMode: 'screen' }}
                     />
                 ))}

                 {/* Nodes */}
                 {sankeyNodes.map((node, i) => (
                     <g key={`node-${i}`}>
                         <rect
                             x={node.x0}
                             y={node.y0}
                             width={(node.x1 || 0) - (node.x0 || 0)}
                             height={(node.y1 || 0) - (node.y0 || 0)}
                             fill={node.color}
                             className="stroke-white/10"
                             rx={2}
                         />
                         {/* Labels */}
                         <text
                             x={node.x0 && node.x0 < 400 ? node.x1! + 6 : node.x0! - 6}
                             y={(node.y1! + node.y0!) / 2}
                             dy="0.35em"
                             textAnchor={node.x0 && node.x0 < 400 ? "start" : "end"}
                             className="text-[10px] font-mono fill-white/70 pointer-events-none"
                         >
                             {node.name}
                         </text>
                          <text
                             x={node.x0 && node.x0 < 400 ? node.x1! + 6 : node.x0! - 6}
                             y={(node.y1! + node.y0!) / 2 + 12}
                             dy="0.35em"
                             textAnchor={node.x0 && node.x0 < 400 ? "start" : "end"}
                             className="text-[9px] font-mono fill-white/40 pointer-events-none"
                         >
                             {formatCurrency(node.value)}
                         </text>
                     </g>
                 ))}
             </svg>
          </div>
      </Card>

      {/* --- Section C: Forecast/Flight Path (Custom SVG Area Chart) --- */}
      <Card className="glass-card p-4 border-white/5 bg-black/40">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <TrendingDown className="h-4 w-4 text-cyan-400" />
                 Flight Path Projection (90 Days)
             </h3>
             {flightPathData.crashPointDay < 90 && (
                 <div className="text-xs text-red-400 font-bold border border-red-500/30 px-2 py-1 rounded bg-red-500/10 animate-pulse">
                     IMPACT IN {Math.floor(flightPathData.crashPointDay)} DAYS
                 </div>
             )}
          </div>

          <div className="h-48 w-full relative">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                      <linearGradient id="flightPathGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                      </linearGradient>
                       <linearGradient id="crashGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </linearGradient>
                  </defs>

                  {/* Draw Chart */}
                  {(() => {
                      const maxBalance = Math.max(...flightPathData.data.map(d => d.balance), 100); // Ensure non-zero scale
                      // Normalize helper
                      const getY = (val: number) => 100 - ((val / maxBalance) * 100);
                      const getX = (day: number) => (day / 90) * 100;

                      // Build Path Data
                      const points = flightPathData.data.map(d => `${getX(d.day)},${getY(d.balance)}`).join(' ');
                      const areaPath = `M0,100 ${points} L100,100 Z`;

                      return (
                          <>
                            <path d={areaPath} fill="url(#flightPathGradient)" />
                            <polyline points={points} fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                          </>
                      )
                  })()}

                  {/* Crash Line */}
                  <line x1="0" y1="99" x2="100" y2="99" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />

                  {/* Crash Point Indicator */}
                  {flightPathData.crashPointDay < 90 && (
                      <g>
                          <circle
                            cx={(flightPathData.crashPointDay / 90) * 100}
                            cy="100"
                            r="1"
                            fill="#ef4444"
                            className="animate-ping"
                          />
                          <circle
                            cx={(flightPathData.crashPointDay / 90) * 100}
                            cy="100"
                            r="1"
                            fill="#ef4444"
                          />
                      </g>
                  )}
              </svg>

              {/* Axis Labels */}
              <div className="absolute bottom-0 left-0 w-full flex justify-between text-[9px] text-white/30 font-mono mt-1">
                  <span>Today</span>
                  <span>+30d</span>
                  <span>+60d</span>
                  <span>+90d</span>
              </div>
          </div>
      </Card>

    </div>
  );
}
