import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ShoppingItem } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PencilSimple, Trash, Plus, NotePencil } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Shopping() {
  const [items, setItems] = useKV<ShoppingItem[]>('shopping-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setItems(current => [...(current || []), newItem])
    setNewItemName('')
    inputRef.current?.focus()
  }

  const handleToggleComplete = (itemId: string) => {
    setItems(current =>
      (current || []).map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handleStartEdit = (item: ShoppingItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      setEditingId(null)
      return
    }

    setItems(current =>
      (current || []).map(item =>
        item.id === editingId ? { ...item, name: editingName.trim() } : item
      )
    )
    setEditingId(null)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(current => (current || []).filter(item => item.id !== itemId))
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const activeItems = (items || []).filter(item => !item.completed)
  const completedItems = (items || []).filter(item => item.completed)
  const allItems = [...activeItems, ...completedItems]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3">
            <NotePencil className="w-8 h-8 text-primary" weight="duotone" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Shopping List</h1>
        <p className="text-muted-foreground">Simple. Clean. Effective.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="neumorphic rounded-3xl p-8 md:p-10 space-y-6"
      >
        <form onSubmit={handleAddItem} className="flex gap-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add an item..."
              className="h-14 text-base neumorphic-inset border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            disabled={!newItemName.trim()}
          >
            <Plus className="w-5 h-5" weight="bold" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {allItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 px-4"
              >
                <div className="rounded-full bg-muted/30 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <NotePencil className="w-8 h-8 text-muted-foreground/50" weight="duotone" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Your list is empty. Start adding items!
                </p>
              </motion.div>
            ) : (
              allItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.02,
                  }}
                  layout
                  className="group"
                >
                  <div
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl transition-all duration-200',
                      'hover:bg-muted/30',
                      item.completed && 'opacity-60'
                    )}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      transition={{ duration: 0.1 }}
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => handleToggleComplete(item.id)}
                        className="w-6 h-6 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </motion.div>

                    {editingId === item.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          ref={editInputRef}
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={handleEditKeyDown}
                          className="h-10 text-base neumorphic-inset border-0"
                        />
                      </div>
                    ) : (
                      <label
                        htmlFor={`item-${item.id}`}
                        className={cn(
                          'flex-1 text-base cursor-pointer select-none transition-all duration-200',
                          item.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {item.name}
                      </label>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {editingId !== item.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(item)}
                            className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                          >
                            <PencilSimple className="w-4 h-4" weight="duotone" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" weight="duotone" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {allItems.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {activeItems.length} active {activeItems.length === 1 ? 'item' : 'items'}
              </span>
              <span>
                {completedItems.length} completed
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
