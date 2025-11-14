import { useState, useEffect } from 'react'
import { ShoppingItem } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PencilSimple } from '@phosphor-icons/react'

interface EditShoppingItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ShoppingItem
  onEdit: (item: ShoppingItem) => void
}

const categories = [
  'Groceries',
  'Household',
  'Personal Care',
  'Health',
  'Clothing',
  'Electronics',
  'Other',
]

const units = ['item(s)', 'kg', 'g', 'L', 'mL', 'pcs', 'box', 'pack', 'bag']

export function EditShoppingItemDialog({
  open,
  onOpenChange,
  item,
  onEdit,
}: EditShoppingItemDialogProps) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [unit, setUnit] = useState(item.unit || 'item(s)')
  const [category, setCategory] = useState(item.category)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(item.priority)
  const [notes, setNotes] = useState(item.notes || '')

  useEffect(() => {
    setName(item.name)
    setQuantity(item.quantity.toString())
    setUnit(item.unit || 'item(s)')
    setCategory(item.category)
    setPriority(item.priority)
    setNotes(item.notes || '')
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    onEdit({
      ...item,
      name: name.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      category,
      priority,
      notes: notes.trim() || undefined,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="rounded-lg bg-accent/20 p-2">
              <PencilSimple className="w-5 h-5 text-accent-foreground" weight="duotone" />
            </div>
            Edit Shopping Item
          </DialogTitle>
          <DialogDescription>
            Update the details of your shopping item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-base font-medium">
              Item Name *
            </Label>
            <Input
              id="edit-name"
              placeholder="e.g., Fresh Milk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity" className="text-base font-medium">
                Quantity *
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unit" className="text-base font-medium">
                Unit
              </Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="edit-unit" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-base font-medium">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-category" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority" className="text-base font-medium">
                Priority *
              </Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger id="edit-priority" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-base font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="edit-notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <PencilSimple className="w-4 h-4" weight="duotone" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
