
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckSquare, ShoppingCart, Receipt } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AddHabitDialog } from './AddHabitDialog'
import { AddShoppingItemDialog } from '@/components/shopping/AddShoppingItemDialog'
import { AddExpenseDialog } from './AddExpenseDialog'
import { useKV } from '@/hooks/use-kv'
import { Habit, ShoppingItem } from '@/lib/types'
import { toast } from 'sonner'

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [habitOpen, setHabitOpen] = useState(false)
  const [shoppingOpen, setShoppingOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

  // We use KV hooks here just to pass the setters to the dialogs if they need them,
  // or we can implement the logic here.
  const [, setHabits] = useKV<Habit[]>('habits', [])
  const [, setShoppingItems] = useKV<ShoppingItem[]>('shopping-items', [])

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'currentProgress' | 'streak'>) => {
    const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitData.name,
        icon: habitData.icon,
        target: habitData.targetCount,
        trackingType: 'boolean', // Defaulting simple habits via FAB
        streak: 0,
        entries: [],
        createdAt: new Date().toISOString()
    }
    setHabits(current => [...(current || []), newHabit])
    toast.success(`Habit "${newHabit.name}" created!`)
  }

  const handleAddShoppingItem = (itemData: Omit<ShoppingItem, 'id' | 'completed' | 'createdAt'>) => {
     const newItem: ShoppingItem = {
         id: Date.now().toString(),
         ...itemData,
         completed: false,
         createdAt: new Date().toISOString()
     }
     setShoppingItems(current => [...(current || []), newItem])
     toast.success(`${newItem.name} added to list`)
  }

  const actions = [
    {
      label: 'Add Habit',
      icon: CheckSquare,
      onClick: () => setHabitOpen(true),
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    },
    {
      label: 'Add Item',
      icon: ShoppingCart,
      onClick: () => setShoppingOpen(true),
      color: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      label: 'Add Expense',
      icon: Receipt,
      onClick: () => setExpenseOpen(true),
      color: 'bg-purple-500 hover:bg-purple-600 text-white'
    },
  ]

  return (
    <>
      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-4 md:bottom-8 md:right-8">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-end gap-3 mb-2">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <span className="glass-card px-3 py-1.5 text-sm font-medium shadow-lg backdrop-blur-md border-primary/20">
                    {action.label}
                  </span>
                  <Button
                    size="icon"
                    onClick={() => {
                      action.onClick()
                      setIsOpen(false)
                    }}
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg shadow-black/20 transition-transform hover:scale-105 border-0",
                      action.color
                    )}
                    aria-label={action.label}
                  >
                    <action.icon size={20} weight="bold" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-xl shadow-primary/30 transition-all duration-300 z-50 border-0",
            isOpen ? "bg-destructive hover:bg-destructive/90 rotate-45" : "bg-primary hover:bg-primary/90 hover:scale-105"
          )}
          aria-label={isOpen ? "Close Actions" : "Quick Actions"}
        >
          <Plus size={28} weight="bold" className="text-white" />
        </Button>
      </div>

      <AddHabitDialog
        open={habitOpen}
        onOpenChange={setHabitOpen}
        onAddHabit={handleAddHabit}
      />

      <AddShoppingItemDialog
        open={shoppingOpen}
        onOpenChange={setShoppingOpen}
        onAdd={handleAddShoppingItem}
      />

      <AddExpenseDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
      />
    </>
  )
}
