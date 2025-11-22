
import { useState } from 'react'
import { Expense } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useKV } from '@/hooks/use-kv'
import { toast } from 'sonner'
import { Plus } from '@phosphor-icons/react'

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Saving',
  'Personal',
  'Debt',
  'Entertainment'
]

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const [, setExpenses] = useKV<Expense[]>('expenses', [])
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[2]) // Default to Food
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount")
        return
    }

    const newExpense: Expense = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        category,
        description: description.trim(),
        date: new Date().toISOString()
    }

    setExpenses(current => [newExpense, ...(current || [])])
    toast.success(`Added expense: $${newExpense.amount}`)

    // Reset
    setAmount('')
    setDescription('')
    setCategory(DEFAULT_CATEGORIES[2])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card border-accent/30">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Plus size={20} weight="bold"/>
            </div>
            Add Expense
          </DialogTitle>
          <DialogDescription>
            Log a new transaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="add-amount" className="text-sm font-semibold">Amount</Label>
            <Input
              id="add-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 glass-morphic border-border/50 focus:border-accent text-lg"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-category" className="text-sm font-semibold">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="add-category" className="h-11 glass-morphic border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-description" className="text-sm font-semibold">Description (Optional)</Label>
            <Input
              id="add-description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 glass-morphic border-border/50 focus:border-accent"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
