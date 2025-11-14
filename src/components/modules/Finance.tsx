import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CurrencyDollar, Trash, ChartPie, PencilSimple, Sparkle, TrendUp, Wallet } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Expense, FinancialProfile, DetailedBudget } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { EditExpenseDialog } from '@/components/EditExpenseDialog'
import { FinancialAdvisorInterview } from '@/components/FinancialAdvisorInterview'
import { DetailedBudgetDisplay } from '@/components/DetailedBudgetDisplay'
import { TabGroup } from '@/components/TabGroup'
import { AIButton } from '@/components/AIButton'

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

  const addExpense = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error('Please enter a valid amount')
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
    toast.success('Expense logged!')
  }

  const editExpense = (expenseId: string, updates: Partial<Expense>) => {
    setExpenses((current) => 
      (current || []).map(e => 
        e.id === expenseId ? { ...e, ...updates } : e
      )
    )
    toast.success('Expense updated!')
  }

  const deleteExpense = (expenseId: string) => {
    setExpenses((current) => (current || []).filter(e => e.id !== expenseId))
    toast.success('Expense deleted')
  }

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense)
    setEditDialogOpen(true)
  }

  const handleProfileComplete = async (profile: FinancialProfile) => {
    setFinancialProfile(profile)
    setIsGeneratingBudget(true)
    
    try {
      const totalIncome = profile.monthlyIncome + (profile.partnerIncome || 0)
      
      const promptText = `You are an expert financial advisor. Based on the following detailed financial profile, create a comprehensive, personalized budget plan.

FINANCIAL PROFILE:
- Total Monthly Income: $${totalIncome}
- Location: ${profile.location}
- Dependents: ${profile.dependents}
- Housing: ${profile.housingType} ($${profile.monthlyHousingCost}/month)
- Has Debt: ${profile.hasDebt ? 'Yes' : 'No'}
${profile.hasDebt ? `- Debt Types: ${profile.debtTypes?.join(', ')}
- Total Debt: $${profile.totalDebtAmount}
- Current Monthly Payment: $${profile.monthlyDebtPayment}` : ''}
- Financial Goals: ${profile.financialGoals.join(', ')}
- Risk Tolerance: ${profile.riskTolerance}
- Emergency Fund Goal: ${profile.emergencyFundMonths} months
- Current Savings: $${profile.currentSavings || 0}
- Has Retirement: ${profile.hasRetirement ? 'Yes' : 'No'}
- Spending Habits: ${profile.spendingHabits}
${profile.majorExpenses ? `- Upcoming Expenses: ${profile.majorExpenses}` : ''}
${profile.concerns ? `- Concerns: ${profile.concerns}` : ''}

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
2. Consider their location's cost of living (${profile.location})
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

      let parsed
      try {
        parsed = JSON.parse(response)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response:', response)
        throw new Error('Failed to parse AI response')
      }
      
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
      
      setDetailedBudget(budget)
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
  }

  const handleStartOver = () => {
    setFinancialProfile(null)
    setDetailedBudget(null)
    setActiveTab('advisor')
  }

  const monthExpenses = (expenses || []).filter(e => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  })

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryData = CATEGORIES.map(category => {
    const total = monthExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
    return { name: category, value: total }
  }).filter(d => d.value > 0)

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
    <div className="space-y-3 md:space-y-5 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-2 md:gap-4 flex-wrap"
      >
        <div className="space-y-0.5">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Finance
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Smart expense tracking & AI-powered budget planning
          </p>
        </div>
        {activeTab === 'expenses' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="gap-2 px-6 md:px-8 h-14 md:h-16 rounded-2xl flex items-center justify-center font-semibold text-base md:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              >
                <Plus size={22} weight="bold" className="md:w-6 md:h-6" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="text-2xl">Log New Expense</DialogTitle>
                <DialogDescription>
                  Track your spending and stay on budget
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-amount" className="text-sm font-semibold">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="h-11 glass-morphic border-border/50 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-category" className="text-sm font-semibold">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger id="expense-category" className="h-11 glass-morphic border-border/50">
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
                  <Label htmlFor="expense-description" className="text-sm font-semibold">Description (Optional)</Label>
                  <Input
                    id="expense-description"
                    placeholder="What was this for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="h-11 glass-morphic border-border/50 focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={addExpense} className="flex-1 h-11 shadow-md">Log Expense</Button>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <TabGroup
        tabs={[
          { id: 'expenses', label: 'Expenses' },
          { id: 'advisor', label: 'AI Financial Advisor', icon: <Sparkle weight="fill" size={16} /> },
          ...(detailedBudget ? [{ id: 'budget', label: 'Your Budget' }] : []),
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'advisor' ? (
        <>
          {isGeneratingBudget ? (
            <Card className="glass-card border-primary/30 text-center py-16">
              <Sparkle weight="fill" className="text-primary mx-auto mb-4 animate-spin" size={56} />
              <h3 className="font-semibold text-2xl mb-2">Analyzing Your Financial Profile</h3>
              <p className="text-muted-foreground text-[15px]">Creating your personalized budget plan...</p>
            </Card>
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4"
          >
            <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Wallet size={26} weight="fill" className="text-primary md:w-8 md:h-8" />
                </div>
                <div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium mb-0.5 md:mb-1">Total Spent</div>
                  <div className="text-2xl md:text-4xl font-bold tabular-nums bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                    ${totalSpent.toFixed(2)}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground font-medium mt-0.5">This month</div>
                </div>
              </div>
            </Card>

            {categoryData.length > 0 ? (
              <Card className="glass-card border-accent/20">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <ChartPie size={20} weight="fill" className="text-accent md:w-6 md:h-6" />
                  <h3 className="font-semibold text-base md:text-lg">Spending by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
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
                      wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card className="glass-card border-border/30 flex items-center justify-center text-center py-12">
                <div>
                  <ChartPie size={48} weight="duotone" className="text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">Add expenses to see breakdown</p>
                </div>
              </Card>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-lg md:text-2xl font-semibold flex items-center gap-2">
                <TrendUp weight="fill" className="text-primary" size={22} />
                Recent Expenses
              </h2>
              {expenses && expenses.length > 0 && (
                <Badge variant="secondary" className="text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">
                  {expenses.length} total
                </Badge>
              )}
            </div>
            {!expenses || expenses.length === 0 ? (
              <Card className="glass-card border-border/30 text-center py-14 md:py-16">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <CurrencyDollar size={56} weight="duotone" className="text-primary mx-auto mb-4 md:mb-5 opacity-50 md:w-16 md:h-16" />
                  <h3 className="font-semibold text-xl md:text-2xl mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
                    Start tracking your spending to gain insights into your financial habits
                  </p>
                </motion.div>
              </Card>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-2.5 md:gap-3"
              >
                {[...(expenses || [])].reverse().slice(0, 10).map((expense) => {
                  const categoryIcon = CATEGORY_ICONS[expense.category] || '💵'
                  return (
                    <motion.div key={expense.id} variants={item}>
                      <Card className="glass-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                        <div className="flex items-center justify-between gap-3 md:gap-4">
                          <div className="flex items-center gap-2.5 md:gap-3 flex-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-lg md:text-xl">
                              {categoryIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                                <span className="text-xl md:text-2xl font-bold tabular-nums text-primary">
                                  ${expense.amount.toFixed(2)}
                                </span>
                                <Badge variant="secondary" className="text-[10px] md:text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                              {expense.description && (
                                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-1.5 line-clamp-1">
                                  {expense.description}
                                </p>
                              )}
                              <p className="text-[10px] md:text-xs text-muted-foreground/70 font-medium">
                                {new Date(expense.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric',
                                  weekday: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(expense)}
                              className="flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-8 h-8"
                            >
                              <PencilSimple size={16} className="md:w-5 md:h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExpense(expense.id)}
                              className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-8 h-8"
                            >
                              <Trash size={16} className="md:w-5 md:h-5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
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
