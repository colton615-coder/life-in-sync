import { Card } from './Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkle, TrendUp, Target, Lightbulb, ChartBar, CalendarBlank, ArrowsClockwise, CheckCircle, CurrencyCircleDollar } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
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
        staggerChildren: 0.06
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  const allocationEntries = Object.entries(budget.allocations)
    .filter(([_, amount]) => amount > 0)
    .sort(([_, a], [__, b]) => b - a)

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      housing: <span className="text-2xl">🏠</span>,
      utilities: <span className="text-2xl">💡</span>,
      food: <span className="text-2xl">🍽️</span>,
      transportation: <span className="text-2xl">🚗</span>,
      insurance: <span className="text-2xl">🛡️</span>,
      healthcare: <span className="text-2xl">⚕️</span>,
      debtPayment: <span className="text-2xl">💳</span>,
      savings: <span className="text-2xl">💰</span>,
      retirement: <span className="text-2xl">🏦</span>,
      entertainment: <span className="text-2xl">🎬</span>,
      personal: <span className="text-2xl">👤</span>,
      miscellaneous: <span className="text-2xl">📦</span>
    }
    return icons[category] || <span className="text-2xl">💵</span>
  }

  const formatCategoryName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const remaining = budget.totalIncome - totalAllocated

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-2">
            <Sparkle weight="fill" className="text-accent" size={36} />
            <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Personalized Budget
            </span>
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            Created {new Date(budget.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </motion.div>
        <Button
          variant="outline"
          onClick={onStartOver}
          className="gap-2 h-11 px-5 hover:bg-primary/10 hover:text-primary transition-all duration-300"
        >
          <ArrowsClockwise size={20} />
          <span className="font-semibold">Start Over</span>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-card border-primary/30 shadow-xl shadow-primary/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                Monthly Income
              </div>
              <div className="text-4xl font-bold text-primary tabular-nums">
                ${budget.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                Total Allocated
              </div>
              <div className="text-4xl font-bold tabular-nums">
                ${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                {remaining >= 0 ? 'Remaining' : 'Over Budget'}
              </div>
              <div className={`text-4xl font-bold tabular-nums ${remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <ChartBar weight="fill" className="text-primary" size={28} />
          Monthly Budget Breakdown
        </h3>
        
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {allocationEntries.map(([category, amount]) => {
            const percentage = (amount / budget.totalIncome) * 100
            return (
              <motion.div key={category} variants={item}>
                <Card className="glass-card hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                        {getCategoryIcon(category)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">{formatCategoryName(category)}</div>
                        <div className="text-sm text-muted-foreground font-medium">
                          {percentage.toFixed(1)}% of income
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold tabular-nums text-primary">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2.5" />
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>

      {budget.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <TrendUp weight="fill" className="text-accent" size={28} />
            AI Recommendations
          </h3>
          
          <div className="grid gap-5">
            {budget.recommendations.map((rec, index) => (
              <motion.div
                key={rec.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
              >
                <Card className="glass-card border-accent/30 hover:border-accent/50 transition-all duration-300 shadow-lg hover:shadow-accent/10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-xl">{rec.category}</h4>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {rec.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed mb-4">
                        {rec.reasoning}
                      </p>
                      {rec.tips.length > 0 && (
                        <div className="space-y-3 glass-morphic p-4 rounded-xl border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb weight="fill" className="text-accent" size={20} />
                            <span className="font-semibold text-sm">Tips</span>
                          </div>
                          {rec.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex gap-3 text-sm">
                              <span className="text-accent mt-1">•</span>
                              <span className="text-muted-foreground flex-1">{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums md:text-right">
                      ${rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="glass-card border-success/30 shadow-xl shadow-success/10">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Target weight="fill" className="text-success" size={28} />
            Savings Strategy
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-morphic p-5 rounded-2xl border border-success/20 hover:border-success/40 transition-all duration-300"
            >
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Emergency Fund</div>
              <div className="text-3xl font-bold text-success tabular-nums">
                ${budget.savingsStrategy.emergencyFund.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="glass-morphic p-5 rounded-2xl border border-success/20 hover:border-success/40 transition-all duration-300"
            >
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Short-term Savings</div>
              <div className="text-3xl font-bold text-success tabular-nums">
                ${budget.savingsStrategy.shortTermSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-morphic p-5 rounded-2xl border border-success/20 hover:border-success/40 transition-all duration-300"
            >
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Long-term Savings</div>
              <div className="text-3xl font-bold text-success tabular-nums">
                ${budget.savingsStrategy.longTermSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="glass-morphic p-5 rounded-2xl border border-success/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarBlank weight="fill" className="text-success" size={22} />
              <span className="font-semibold text-base">Timeline & Milestones</span>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">{budget.savingsStrategy.timeline}</p>
          </motion.div>
        </Card>
      </motion.div>

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="glass-card border-primary/30 shadow-xl shadow-primary/10">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <CheckCircle weight="fill" className="text-primary" size={28} />
              Action Items
            </h3>
            
            <div className="space-y-3">
              {budget.actionItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.06, duration: 0.4 }}
                  className="glass-morphic p-5 rounded-2xl border border-border/50 hover:border-primary/40 transition-all duration-300 flex items-start gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-base flex-1 leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
