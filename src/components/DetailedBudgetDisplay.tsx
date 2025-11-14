import { Card } from './Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, TrendUp, Target, Lightbulb, ChartBar, CalendarBlank, ArrowsClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DetailedBudget } from '@/lib/types'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface DetailedBudgetDisplayProps {
  budget: DetailedBudget
  onStartOver: () => void
}

export function DetailedBudgetDisplay({ budget, onStartOver }: DetailedBudgetDisplayProps) {
  const totalAllocated = Object.values(budget.allocations).reduce((sum, val) => sum + val, 0)
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const allocationEntries = Object.entries(budget.allocations)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      housing: <span className="text-xl">🏠</span>,
      utilities: <span className="text-xl">💡</span>,
      food: <span className="text-xl">🍽️</span>,
      transportation: <span className="text-xl">🚗</span>,
      insurance: <span className="text-xl">🛡️</span>,
      healthcare: <span className="text-xl">⚕️</span>,
      debtPayment: <span className="text-xl">💳</span>,
      savings: <span className="text-xl">💰</span>,
      retirement: <span className="text-xl">🏦</span>,
      entertainment: <span className="text-xl">🎬</span>,
      personal: <span className="text-xl">👤</span>,
      miscellaneous: <span className="text-xl">📦</span>
    }
    return icons[category] || <span className="text-xl">💵</span>
  }

  const formatCategoryName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Sparkle weight="fill" className="text-accent" size={32} />
            Your Personalized Budget
          </h2>
          <p className="text-muted-foreground mt-2">
            Created {new Date(budget.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onStartOver}
          className="gap-2"
        >
          <ArrowsClockwise size={18} />
          Start Over
        </Button>
      </div>

      <Card className="glass-card border-primary/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Total Monthly Income</div>
            <div className="text-3xl font-bold text-primary tabular-nums">
              ${budget.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Total Allocated</div>
            <div className="text-3xl font-bold tabular-nums">
              ${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium mb-1">Remaining</div>
            <div className={`text-3xl font-bold tabular-nums ${budget.totalIncome - totalAllocated >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${(budget.totalIncome - totalAllocated).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ChartBar weight="fill" className="text-primary" size={24} />
          Monthly Budget Breakdown
        </h3>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-3"
        >
          {allocationEntries.map(([category, amount]) => {
            const percentage = (amount / budget.totalIncome) * 100
            return (
              <motion.div key={category} variants={item}>
                <Card className="glass-morphic">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <div className="font-semibold">{formatCategoryName(category)}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of income</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold tabular-nums text-primary">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {budget.recommendations.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendUp weight="fill" className="text-accent" size={24} />
            AI Recommendations
          </h3>
          
          <div className="grid gap-4">
            {budget.recommendations.map((rec, index) => (
              <motion.div
                key={rec.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-accent/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{rec.category}</h4>
                        <Badge variant="secondary">{rec.percentage.toFixed(0)}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                      {rec.tips.length > 0 && (
                        <div className="space-y-2">
                          {rec.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex gap-2 text-sm">
                              <Lightbulb weight="fill" className="text-accent flex-shrink-0 mt-0.5" size={16} />
                              <span className="text-muted-foreground">{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-primary tabular-nums">
                      ${rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Card className="glass-card border-success/30">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target weight="fill" className="text-success" size={24} />
          Savings Strategy
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="glass-morphic p-4 rounded-xl">
            <div className="text-xs text-muted-foreground font-medium mb-1">Emergency Fund</div>
            <div className="text-2xl font-bold text-success tabular-nums">
              ${budget.savingsStrategy.emergencyFund.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="glass-morphic p-4 rounded-xl">
            <div className="text-xs text-muted-foreground font-medium mb-1">Short-term Savings</div>
            <div className="text-2xl font-bold text-success tabular-nums">
              ${budget.savingsStrategy.shortTermSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="glass-morphic p-4 rounded-xl">
            <div className="text-xs text-muted-foreground font-medium mb-1">Long-term Savings</div>
            <div className="text-2xl font-bold text-success tabular-nums">
              ${budget.savingsStrategy.longTermSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        
        <div className="glass-morphic p-4 rounded-xl border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <CalendarBlank weight="fill" className="text-success" size={18} />
            <span className="font-semibold text-sm">Timeline</span>
          </div>
          <p className="text-sm text-muted-foreground">{budget.savingsStrategy.timeline}</p>
        </div>
      </Card>

      {budget.debtStrategy && (
        <Card className="glass-card border-destructive/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">💳</span>
            Debt Payoff Strategy
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-morphic p-4 rounded-xl">
                <div className="text-xs text-muted-foreground font-medium mb-1">Recommended Monthly Payment</div>
                <div className="text-2xl font-bold tabular-nums">
                  ${budget.debtStrategy.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="glass-morphic p-4 rounded-xl">
                <div className="text-xs text-muted-foreground font-medium mb-1">Estimated Payoff</div>
                <div className="text-2xl font-bold">
                  {budget.debtStrategy.estimatedPayoffDate}
                </div>
              </div>
            </div>
            
            <div className="glass-morphic p-4 rounded-xl border border-border/50">
              <h4 className="font-semibold mb-3">Payoff Plan</h4>
              <p className="text-sm text-muted-foreground mb-4">{budget.debtStrategy.payoffPlan}</p>
              
              {budget.debtStrategy.tips.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <h5 className="font-semibold text-sm">Tips to Accelerate Payoff</h5>
                    {budget.debtStrategy.tips.map((tip, index) => (
                      <div key={index} className="flex gap-2 text-sm">
                        <span className="text-accent">•</span>
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {budget.actionItems.length > 0 && (
        <Card className="glass-card border-primary/30">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Action Items
          </h3>
          
          <div className="space-y-2">
            {budget.actionItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-morphic p-4 rounded-xl border border-border/50 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm flex-1">{item}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
