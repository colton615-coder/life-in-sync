import { NeumorphicCard } from '../NeumorphicCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CurrencyDollar, Trash, ChartPie } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { Expense, Budget } from '@/lib/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other']
const COLORS = ['oklch(0.646 0.222 41.116)', 'oklch(0.6 0.118 184.704)', 'oklch(0.60 0.20 295)', 'oklch(0.828 0.189 84.429)', 'oklch(0.769 0.188 70.08)', 'oklch(0.577 0.245 27.325)', 'oklch(0.556 0 0)']

export function Finance() {
  const [expenses, setExpenses] = useKV<Expense[]>('expenses', [])
  const [budgets] = useKV<Budget[]>('budgets', [])
  const [dialogOpen, setDialogOpen] = useState(false)
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

  const deleteExpense = (expenseId: string) => {
    setExpenses((current) => (current || []).filter(e => e.id !== expenseId))
    toast.success('Expense deleted')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground mt-2">Track expenses and manage budget</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Input
                  placeholder="What was this for?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <Button onClick={addExpense} className="w-full">Log Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeumorphicCard>
          <div className="flex items-center gap-3 mb-4">
            <CurrencyDollar size={32} weight="duotone" className="text-accent" />
            <div>
              <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total this month</div>
            </div>
          </div>
        </NeumorphicCard>

        {categoryData.length > 0 && (
          <NeumorphicCard>
            <div className="flex items-center gap-2 mb-4">
              <ChartPie size={24} className="text-accent" />
              <h3 className="font-semibold">Spending by Category</h3>
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
                    backgroundColor: 'oklch(0.22 0.03 285)',
                    border: '1px solid oklch(0.28 0.04 285)',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </NeumorphicCard>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        {!expenses || expenses.length === 0 ? (
          <NeumorphicCard className="text-center py-12">
            <CurrencyDollar size={48} weight="duotone" className="text-accent mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No expenses yet</h3>
            <p className="text-muted-foreground">Start tracking your spending!</p>
          </NeumorphicCard>
        ) : (
          <div className="grid gap-3">
            {[...(expenses || [])].reverse().slice(0, 10).map((expense) => (
              <NeumorphicCard key={expense.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">${expense.amount.toFixed(2)}</span>
                      <span className="text-sm px-2 py-1 rounded-md bg-muted text-muted-foreground">
                        {expense.category}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{expense.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteExpense(expense.id)}
                  >
                    <Trash size={20} />
                  </Button>
                </div>
              </NeumorphicCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
