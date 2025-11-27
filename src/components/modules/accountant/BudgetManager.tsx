import { useState } from 'react';
import { FinancialAudit } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { useKV } from '@/hooks/use-kv';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, AlertCircle, RefreshCw, ChevronRight, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetManagerProps {
  audit: FinancialAudit;
  setAudit: (audit: FinancialAudit) => void;
}

export function BudgetManager({ audit, setAudit }: BudgetManagerProps) {
  const [report] = useKV<FinancialReport | null>('finance-report-v2', null);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'advice'>('overview');

  // If report is missing but audit is 'completed', something is wrong.
  if (!report) {
    return (
        <div className="text-center p-10">
            <h2 className="text-xl font-bold text-red-400">System Error</h2>
            <p>The Audit is complete, but the Blueprint is missing.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Reinitialize</Button>
        </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // --- Views ---

  const Overview = () => {
      const totalBudget = report.proposedBudget.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
      const income = audit.monthlyIncome || 0;
      const savingsRate = income > 0 ? ((income - totalBudget) / income) * 100 : 0;

      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard title="Monthly Income" value={formatCurrency(income)} color="text-white" />
                  <MetricCard title="Target Spend" value={formatCurrency(totalBudget)} color="text-cyan-400" />
                  <MetricCard
                    title="Est. Savings"
                    value={`${savingsRate.toFixed(1)}%`}
                    subValue={formatCurrency(income - totalBudget)}
                    color={savingsRate > 10 ? "text-green-400" : "text-amber-400"}
                  />
              </div>

              <Card className="glass-card p-6">
                  <h3 className="text-lg font-bold text-gradient-cyan mb-4">Executive Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                      {report.executiveSummary}
                  </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.spendingAnalysis.slice(0, 4).map(analysis => (
                      <Card key={analysis.categoryId} className="glass-card p-4 border-l-2 border-l-white/10">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold">{analysis.categoryName}</h4>
                              <span className={cn(
                                  "text-xs font-mono px-2 py-1 rounded",
                                  analysis.healthScore >= 8 ? "bg-green-500/20 text-green-400" :
                                  analysis.healthScore >= 5 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                              )}>
                                  Score: {analysis.healthScore}/10
                              </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{analysis.aiSummary}</p>
                      </Card>
                  ))}
              </div>
          </div>
      );
  };

  const BudgetView = () => {
      return (
          <div className="space-y-4">
              {report.proposedBudget.map(cat => (
                  <Card key={cat.categoryId} className="glass-card p-0 overflow-hidden">
                      <div className="bg-white/5 p-4 flex justify-between items-center">
                          <h3 className="font-bold text-lg">{cat.categoryName}</h3>
                          <span className="font-mono text-cyan-400 font-bold">{formatCurrency(cat.allocatedAmount)}</span>
                      </div>
                      <div className="p-4 space-y-3">
                          {cat.subcategories.map(sub => (
                              <div key={sub.subcategoryId} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                  <span className="text-muted-foreground">{sub.subcategoryName}</span>
                                  <span className="font-mono">{formatCurrency(sub.allocatedAmount)}</span>
                              </div>
                          ))}
                      </div>
                  </Card>
              ))}
          </div>
      );
  };

  const AdviceView = () => {
      return (
          <div className="space-y-4">
              {report.moneyManagementAdvice.map((tip, idx) => (
                  <Card key={idx} className="glass-card p-6 border-t-2 border-t-cyan-500/50">
                      <div className="flex items-center gap-3 mb-2">
                          <BrainCircuit className="h-5 w-5 text-cyan-400" />
                          <h3 className="font-bold text-lg">{tip.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-3">{tip.description}</p>
                      {tip.relatedCategoryName && (
                          <div className="inline-block bg-white/5 px-2 py-1 rounded text-xs text-white/50">
                              Re: {tip.relatedCategoryName}
                          </div>
                      )}
                  </Card>
              ))}
          </div>
      );
  };

  return (
    <div className="pt-4 pb-20 space-y-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gradient-cyan">The Blueprint</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Version 2.0 • Active</p>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
            </Button>
       </div>

       {/* Navigation Tabs */}
       <div className="flex p-1 bg-black/40 rounded-lg border border-white/10">
           {['overview', 'budget', 'advice'].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={cn(
                     "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                     activeTab === tab ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                 )}
               >
                   {tab}
               </button>
           ))}
       </div>

       <AnimatePresence mode="wait">
           <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
           >
               {activeTab === 'overview' && <Overview />}
               {activeTab === 'budget' && <BudgetView />}
               {activeTab === 'advice' && <AdviceView />}
           </motion.div>
       </AnimatePresence>

       {/* Footer / Consult Action */}
       <div className="pt-8 text-center">
           <p className="text-xs text-muted-foreground mb-4">Need to adjust your strategy?</p>
           <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
               Consult The Accountant <ChevronRight className="ml-1 h-3 w-3" />
           </Button>
       </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, color }: { title: string, value: string, subValue?: string, color: string }) {
    return (
        <Card className="glass-card p-4 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">{title}</p>
            <p className={cn("text-2xl font-mono font-bold tracking-tight", color)}>{value}</p>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
        </Card>
    )
}
