import { useState, useEffect } from 'react'
import { Expense } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  onEditExpense: (expenseId: string, updates: Partial<Expense>) => void
  categories: string[]
}

export function EditExpenseDialog({ open, onOpenChange, expense, onEditExpense, categories }: EditExpenseDialogProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString())
      setCategory(expense.category)
      setDescription(expense.description || '')
    }
  }, [expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (expense && amount && parseFloat(amount) > 0) {
      onEditExpense(expense.id, {
        amount: parseFloat(amount),
        category,
        description,
      })
      onOpenChange(false)
    }
  }

  if (!expense) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-card border-accent/30">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Expense</DialogTitle>
          <DialogDescription>
            Update your expense details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-amount" className="text-sm font-semibold">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 glass-morphic border-border/50 focus:border-accent"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-sm font-semibold">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="h-11 glass-morphic border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-semibold">Description (Optional)</Label>
            <Input
              id="edit-description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 glass-morphic border-border/50 focus:border-accent"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="h-11 shadow-md"
            >
              Update Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
