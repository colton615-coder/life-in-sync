import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CurrencyDollar, Trash, ChartPie, PencilSimple, Sparkle, TrendUp } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Expense, FinancialProfile, DetailedBudget } from '@/lib/types'
import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { EditExpenseDialog } from '@/components/EditExpenseDialog'
import { FinancialAdvisorInterview } from '@/components/FinancialAdvisorInterview'
import { DetailedBudgetDisplay } from '@/components/DetailedBudgetDisplay'
import { TabGroup } from '@/components/TabGroup'
import { SarcasticProgress } from '@/components/SarcasticLoader'
import { StatCard } from '@/components/StatCard'
import { AccessibleChart } from '@/components/AccessibleChart'
import { AutocompleteInput } from '@/components/AutocompleteInput'
import { VirtualList } from '@/components/VirtualList'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import { sanitizeForLLM, parseAIResponse } from '@/lib/security'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other']
const COLORS = ['#5fd4f4', '#9d7fff', '#6ee7b7', '#fbbf24', '#fb923c', '#f87171', '#94a3b8']

const CATEGORY_ICONS: Record<string, string> = {
  'Food': '🍽️',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛍️',
  'Bills': '📄',
  'Health': '⚕️',
  'Other': '💵'
}

export function Finance() {
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', [])
  const [financialProfile, setFinancialProfile] = useKV<FinancialProfile | null>('financial-profile', null)
  const [detailedBudget, setDetailedBudget] = useKV<DetailedBudget | null>('detailed-budget', null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState('expenses')
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    description: ''
  })
  const { triggerHaptic } = useHapticFeedback()
  const { playSound } = useSoundEffects()

  const historicalDescriptions = useMemo(() => {
    return (expenses || []).map(e => e.description).filter(Boolean)
  }, [expenses])

  const addExpense = useCallback(() => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error('Please enter a valid amount')
      triggerHaptic('error')
      playSound('error')
      return
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0]
    }

    setExpenses((current) => [...(current || []), expense])
    setNewExpense({ amount: '', category: 'Food', description: '' })
    setDialogOpen(false)
    triggerHaptic('success')
    playSound('success')
    toast.success('Expense logged!')
  }, [newExpense, setExpenses, triggerHaptic, playSound])

  const editExpense = useCallback((expenseId: string, updates: Partial<Expense>) => {
    setExpenses((current) => 
      (current || []).map(e => 
        e.id === expenseId ? { ...e, ...updates } : e
      )
    )
    toast.success('Expense updated!')
  }, [setExpenses])

  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses((current) => (current || []).filter(e => e.id !== expenseId))
    triggerHaptic('medium')
    playSound('delete')
    toast.success('Expense deleted')
  }, [setExpenses, triggerHaptic, playSound])

  const openEditDialog = useCallback((expense: Expense) => {
    setSelectedExpense(expense)
    setEditDialogOpen(true)
  }, [])

  const handleProfileComplete = useCallback(async (profile: FinancialProfile) => {
    setFinancialProfile(() => profile)
    setIsGeneratingBudget(true)
    
    try {
      const totalIncome = profile.monthlyIncome + (profile.partnerIncome || 0)
      
      const safeLocation = sanitizeForLLM(profile.location)
      const safeHousingType = sanitizeForLLM(profile.housingType)
      const safeDebtTypes = profile.debtTypes?.map(d => sanitizeForLLM(d)).join(', ') || ''
      const safeFinancialGoals = profile.financialGoals.map(g => sanitizeForLLM(g)).join(', ')
      const safeRiskTolerance = sanitizeForLLM(profile.riskTolerance)
      const safeSpendingHabits = sanitizeForLLM(profile.spendingHabits)
      const safeMajorExpenses = sanitizeForLLM(profile.majorExpenses)
      const safeConcerns = sanitizeForLLM(profile.concerns)
      
      const promptText = window.spark.llmPrompt`You are an expert financial advisor. Based on the following detailed financial profile, create a comprehensive, personalized budget plan.

FINANCIAL PROFILE:
- Total Monthly Income: $${totalIncome}
- Location: ${safeLocation}
- Dependents: ${profile.dependents}
- Housing: ${safeHousingType} ($${profile.monthlyHousingCost}/month)
- Has Debt: ${profile.hasDebt ? 'Yes' : 'No'}
${profile.hasDebt ? `- Debt Types: ${safeDebtTypes}
- Total Debt: $${profile.totalDebtAmount}
- Current Monthly Payment: $${profile.monthlyDebtPayment}` : ''}
- Financial Goals: ${safeFinancialGoals}
- Risk Tolerance: ${safeRiskTolerance}
- Emergency Fund Goal: ${profile.emergencyFundMonths} months
- Current Savings: $${profile.currentSavings || 0}
- Has Retirement: ${profile.hasRetirement ? 'Yes' : 'No'}
- Spending Habits: ${safeSpendingHabits}
${safeMajorExpenses ? `- Upcoming Expenses: ${safeMajorExpenses}` : ''}
${safeConcerns ? `- Concerns: ${safeConcerns}` : ''}

Create a detailed budget allocation for ALL of these categories:
- housing: Monthly housing cost (rent/mortgage)
- utilities: Gas, electric, water, internet, phone
- food: Groceries and dining out
- transportation: Car payment, insurance, gas, maintenance, public transit
- insurance: Health, life, disability (non-auto)
- healthcare: Medical expenses, prescriptions, copays
- debtPayment: Minimum debt payments + extra toward high-interest debt
- savings: Emergency fund and short-term savings
- retirement: 401k, IRA, or other retirement contributions
- entertainment: Streaming, hobbies, activities, going out
- personal: Clothing, haircuts, personal care
- miscellaneous: Everything else

RETURN ONLY VALID JSON (no markdown, no code blocks) in this EXACT format:
{
  "budget": {
    "allocations": {
      "housing": 1200,
      "utilities": 150,
      "food": 500,
      "transportation": 400,
      "insurance": 200,
      "healthcare": 150,
      "debtPayment": 300,
      "savings": 600,
      "retirement": 400,
      "entertainment": 200,
      "personal": 100,
      "miscellaneous": 100
    },
    "recommendations": [
      {
        "category": "Category Name",
        "amount": 500,
        "percentage": 15,
        "reasoning": "Detailed explanation of why this allocation makes sense",
        "tips": ["Specific actionable tip 1", "Specific actionable tip 2"]
      }
    ],
    "savingsStrategy": {
      "emergencyFund": 500,
      "shortTermSavings": 200,
      "longTermSavings": 300,
      "timeline": "Detailed timeline with milestones"
    },
    ${profile.hasDebt ? `"debtStrategy": {
      "payoffPlan": "Detailed strategy (avalanche/snowball method)",
      "monthlyPayment": 350,
      "estimatedPayoffDate": "Month Year",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    },` : ''}
    "actionItems": [
      "Specific action item 1",
      "Specific action item 2",
      "Specific action item 3",
      "Specific action item 4",
      "Specific action item 5"
    ]
  }
}

CRITICAL RULES:
1. All allocation amounts must be realistic and sum to approximately the total income
2. Consider their location's cost of living (${safeLocation})
3. Prioritize emergency fund if current savings are low
4. If they have high-interest debt, allocate more to debt payment
5. Account for their ${profile.dependents} dependent(s) in food, healthcare, etc.
6. Match recommendations to their stated financial goals
7. Be practical and specific with all tips and action items
8. Ensure the budget is balanced and achievable`

      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      
      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI service')
      }

      const parsed = parseAIResponse(response)
      
      if (!parsed.budget || !parsed.budget.allocations) {
        console.error('Invalid budget structure:', parsed)
        throw new Error('AI returned invalid budget structure')
      }

      const budget: DetailedBudget = {
        id: Date.now().toString(),
        profileId: profile.createdAt,
        totalIncome: totalIncome,
        ...parsed.budget,
        createdAt: new Date().toISOString()
      }
      
      setDetailedBudget(() => budget)
      setActiveTab('budget')
      toast.success('Your personalized budget is ready!', {
        description: 'Review your AI-generated financial plan below'
      })
    } catch (error) {
      console.error('Budget generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate budget'
      toast.error(errorMessage, {
        description: 'Please try again or adjust your profile details'
      })
    } finally {
      setIsGeneratingBudget(false)
    }
  }, [setFinancialProfile, setDetailedBudget, setActiveTab, setIsGeneratingBudget])

  const handleStartOver = useCallback(() => {
    setFinancialProfile(() => null)
    setDetailedBudget(() => null)
    setActiveTab('advisor')
  }, [setFinancialProfile, setDetailedBudget, setActiveTab])

  const monthExpenses = useMemo(() => {
    if (!expenses) return []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return expenses.filter(e => {
      const [year, month, day] = e.date.split('-').map(Number)
      const expenseDate = new Date(year, month - 1, day)
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear
    })
  }, [expenses])

  const totalSpent = useMemo(() => 
    monthExpenses.reduce((sum, e) => sum + e.amount, 0), 
    [monthExpenses]
  )

  const categoryData = useMemo(() => 
    CATEGORIES.map(category => {
      const total = monthExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
      return { name: category, value: total }
    }).filter(d => d.value > 0), 
    [monthExpenses]
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-5 md:space-y-8 animate-in fade-in duration-500 px-1 md:px-0 pt-4 md:pt-0">
      <div className="flex items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1.5 md:space-y-2 flex-1 min-w-0"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gradient-cyan">Finance</h1>
          <p className="text-sm md:text-base text-muted-foreground/60 font-normal line-clamp-2">
            Watch your dreams leak away, one transaction at a time
          </p>
        </motion.div>

        {activeTab === 'expenses' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Button
                  size="default"
                  className="gap-2 h-11 md:h-9 px-5 md:px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all flex-shrink-0"
                >
                  <Plus size={18} weight="bold" className="md:w-4 md:h-4" />
                  <span className="font-semibold">Add</span>
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-primary/30 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl">Log New Expense</DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  Track your spending and stay on budget
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 md:space-y-5 pt-3 md:pt-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-amount" className="text-xs md:text-sm font-semibold">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="h-10 md:h-11 glass-morphic border-border/50 focus:border-primary text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-category" className="text-xs md:text-sm font-semibold">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger id="expense-category" className="h-10 md:h-11 glass-morphic border-border/50 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-description" className="text-xs md:text-sm font-semibold">Description (Optional)</Label>
                  <AutocompleteInput
                    id="expense-description"
                    placeholder="What was this for?"
                    value={newExpense.description}
                    onValueChange={(value) => setNewExpense({ ...newExpense, description: value })}
                    historicalData={historicalDescriptions}
                    maxSuggestions={5}
                  />
                </div>
                <div className="flex gap-2 md:gap-3 pt-2">
                  <Button onClick={addExpense} className="flex-1 h-10 md:h-11 shadow-md text-sm md:text-base">Log Expense</Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10 md:h-11 text-sm md:text-base">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 -mx-3 md:mx-0 px-3 md:px-0">
        <TabGroup
          tabs={[
            { id: 'expenses', label: 'Expenses' },
            { id: 'advisor', label: 'AI Advisor', icon: <Sparkle weight="fill" size={14} /> },
            ...(detailedBudget ? [{ id: 'budget', label: 'Budget' }] : []),
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'advisor' ? (
        <>
          {isGeneratingBudget ? (
            <NeumorphicCard className="border-primary/30 py-12 md:py-16" animate={false}>
              <div className="max-w-lg mx-auto space-y-8">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkle weight="fill" className="text-primary" size={56} />
                  </motion.div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-xl md:text-2xl">Analyzing Your Financial Profile</h3>
                  <p className="text-muted-foreground text-sm md:text-[15px]">AI is crunching the numbers (and judging your choices)</p>
                </div>
                <SarcasticProgress />
              </div>
            </NeumorphicCard>
          ) : detailedBudget && financialProfile ? (
            <DetailedBudgetDisplay budget={detailedBudget} onStartOver={handleStartOver} />
          ) : (
            <FinancialAdvisorInterview onComplete={handleProfileComplete} />
          )}
        </>
      ) : activeTab === 'budget' && detailedBudget ? (
        <DetailedBudgetDisplay budget={detailedBudget} onStartOver={handleStartOver} />
      ) : (
        <>
          <EditExpenseDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            expense={selectedExpense}
            onEditExpense={editExpense}
            categories={CATEGORIES}
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8"
          >
            <NeumorphicCard className="border-primary/20 hover:border-primary/40 transition-all duration-300 p-5 md:p-10" animate={false}>
              <StatCard 
                stats={[
                  { value: `$${totalSpent.toFixed(2)}`, label: 'This Month', gradient: 'from-primary to-primary/70' },
                  { value: monthExpenses.length, label: 'Transactions' },
                  { value: categoryData.length, label: 'Categories' }
                ]}
              />
            </NeumorphicCard>

            {categoryData.length > 0 ? (
              <NeumorphicCard className="border-accent/20 p-5 md:p-10" animate={false}>
                <AccessibleChart
                  title="Spending by Category"
                  description="View your expenses broken down by category"
                  data={categoryData}
                  columns={[
                    { key: 'name', label: 'Category' },
                    { 
                      key: 'value', 
                      label: 'Amount', 
                      format: (val) => `$${Number(val).toFixed(2)}` 
                    },
                    { 
                      key: 'value', 
                      label: 'Percentage', 
                      format: (val) => `${((Number(val) / totalSpent) * 100).toFixed(1)}%` 
                    }
                  ]}
                  ariaLabel={`Spending by category chart showing ${categoryData.length} categories with total spending of $${totalSpent.toFixed(2)}`}
                >
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.22 0.03 265)',
                          border: '1px solid oklch(0.35 0.03 265)',
                          borderRadius: '0.75rem',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                          color: 'oklch(0.95 0.01 265)'
                        }}
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </AccessibleChart>
              </NeumorphicCard>
            ) : (
              <NeumorphicCard className="border-border/30 flex items-center justify-center text-center py-16 md:py-24" animate={false}>
                <div className="px-4 md:px-6">
                  <ChartPie size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 md:mb-5 opacity-40 md:w-14 md:h-14" />
                  <p className="text-sm md:text-base text-muted-foreground">Add expenses to see breakdown</p>
                </div>
              </NeumorphicCard>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 md:mt-16"
          >
            <div className="flex items-center justify-between mb-6 md:mb-10 gap-3">
              <h2 className="text-base md:text-2xl font-semibold flex items-center gap-2">
                <TrendUp weight="fill" className="text-primary" size={18} />
                <span className="hidden xs:inline">Recent Expenses</span>
                <span className="xs:hidden">Expenses</span>
              </h2>
              {expenses && expenses.length > 0 && (
                <Badge variant="secondary" className="text-[10px] md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                  {expenses.length} total
                </Badge>
              )}
            </div>
            {!expenses || expenses.length === 0 ? (
              <NeumorphicCard className="border-border/30 text-center py-12 md:py-20" animate={false}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="px-4 md:px-6"
                >
                  <CurrencyDollar size={48} weight="duotone" className="text-primary mx-auto mb-4 md:mb-5 opacity-50 md:w-14 md:h-14" />
                  <h3 className="font-semibold text-lg md:text-2xl mb-2 md:mb-3">No expenses yet</h3>
                  <p className="text-muted-foreground text-xs md:text-base max-w-sm mx-auto">
                    Start tracking your spending to gain insights into your financial habits
                  </p>
                </motion.div>
              </NeumorphicCard>
            ) : expenses.length > 50 ? (
              <VirtualList
                items={[...(expenses || [])].reverse()}
                itemHeight={100}
                containerHeight={600}
                overscan={5}
                className="rounded-xl"
                renderItem={(expense) => {
                  const categoryIcon = CATEGORY_ICONS[expense.category] || '💵'
                  return (
                    <div className="px-1 py-1.5">
                      <NeumorphicCard className="hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 p-4 md:p-7" animate={false}>
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-base md:text-xl">
                              {categoryIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-3 mb-0.5 md:mb-1 flex-wrap">
                                <span className="text-base md:text-2xl font-semibold tabular-nums text-primary">
                                  ${expense.amount.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="text-[9px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5">
                                  {expense.category}
                                </Badge>
                              </div>
                              {expense.description && (
                                <p className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1.5 line-clamp-1">
                                  {expense.description}
                                </p>
                              )}
                              <p className="text-[9px] md:text-xs text-muted-foreground/70 font-medium">
                                {new Date(expense.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  weekday: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(expense)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-7 h-7 md:w-8 md:h-8"
                              aria-label={`Edit expense: ${expense.description || expense.category} $${expense.amount.toFixed(2)}`}
                            >
                              <PencilSimple size={14} className="md:w-4 md:h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExpense(expense.id)}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-7 h-7 md:w-8 md:h-8"
                              aria-label={`Delete expense: ${expense.description || expense.category} $${expense.amount.toFixed(2)}`}
                            >
                              <Trash size={14} className="md:w-4 md:h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </NeumorphicCard>
                    </div>
                  )
                }}
              />
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-3 md:gap-6"
              >
                {[...(expenses || [])].reverse().slice(0, 10).map((expense) => {
                  const categoryIcon = CATEGORY_ICONS[expense.category] || '💵'
                  return (
                    <motion.div key={expense.id} variants={item}>
                      <NeumorphicCard className="hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 p-4 md:p-7" animate={false}>
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-base md:text-xl">
                              {categoryIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 md:gap-3 mb-0.5 md:mb-1 flex-wrap">
                                <span className="text-base md:text-2xl font-semibold tabular-nums text-primary">
                                  ${expense.amount.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="text-[9px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5">
                                  {expense.category}
                                </Badge>
                              </div>
                              {expense.description && (
                                <p className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1.5 line-clamp-1">
                                  {expense.description}
                                </p>
                              )}
                              <p className="text-[9px] md:text-xs text-muted-foreground/70 font-medium">
                                {new Date(expense.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  weekday: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(expense)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-7 h-7 md:w-8 md:h-8"
                              aria-label={`Edit expense: ${expense.description || expense.category} $${expense.amount.toFixed(2)}`}
                            >
                              <PencilSimple size={14} className="md:w-4 md:h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExpense(expense.id)}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-7 h-7 md:w-8 md:h-8"
                              aria-label={`Delete expense: ${expense.description || expense.category} $${expense.amount.toFixed(2)}`}
                            >
                              <Trash size={14} className="md:w-4 md:h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </NeumorphicCard>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
