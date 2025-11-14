import { Card } from '../Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CurrencyDollar, Trash, ChartPie, PencilSimple } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Expense, Budget } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { EditExpenseDialog } from '@/components/EditExpenseDialog'
import { AIBudgetGenerator } from '@/components/AIBudgetGenerator'
import { TabGroup } from '@/components/TabGroup'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other']
const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6b7280']

export function Finance() {
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', [])
  const [budgets] = useKV<Budget[]>('budgets', [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState('expenses')
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-2 text-[15px]">Track expenses and manage budget with AI</p>
        </div>
        {activeTab === 'expenses' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus size={20} weight="bold" />
                Add Expense
              </Button>
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
      </div>

      <TabGroup
        tabs={[
          { id: 'expenses', label: 'Expenses' },
          { id: 'ai-budget', label: 'AI Budget Generator' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'ai-budget' ? (
        <AIBudgetGenerator />
      ) : (
        <>
          <EditExpenseDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            expense={selectedExpense}
            onEditExpense={editExpense}
            categories={CATEGORIES}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CurrencyDollar size={28} weight="fill" className="text-primary" />
                </div>
                <div>
                  <div className="text-4xl font-bold tabular-nums">${totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">Total this month</div>
                </div>
              </div>
            </Card>

            {categoryData.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <ChartPie size={22} className="text-primary" />
                  <h3 className="font-semibold text-lg">Spending by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid oklch(0.92 0.005 270)',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-5">Recent Expenses</h2>
            {!expenses || expenses.length === 0 ? (
              <Card className="text-center py-16">
                <CurrencyDollar size={56} weight="duotone" className="text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">No expenses yet</h3>
                <p className="text-muted-foreground text-[15px]">Start tracking your spending!</p>
              </Card>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4"
              >
                {[...(expenses || [])].reverse().slice(0, 10).map((expense) => (
                  <motion.div key={expense.id} variants={item}>
                    <Card>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold tabular-nums">${expense.amount.toFixed(2)}</span>
                            <Badge variant="secondary">
                              {expense.category}
                            </Badge>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-muted-foreground mb-2">{expense.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-medium">
                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(expense)}
                            className="flex-shrink-0 text-muted-foreground hover:text-accent"
                          >
                            <PencilSimple size={20} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExpense(expense.id)}
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash size={20} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
