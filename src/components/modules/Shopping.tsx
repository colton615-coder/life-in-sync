import { useState, useRef, useEffect } from 'react'
import { useKV } from '@/hooks/use-kv'
import { ShoppingItem } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PencilSimple, Trash, Plus, ShoppingCart, CheckCircle, Sparkle, Lightning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { StatCard } from '@/components/StatCard'
import { SwipeableItem } from '@/components/SwipeableItem'
import { useIsMobile } from '@/hooks/use-mobile'

export function Shopping() {
  const [items, setItems] = useKV<ShoppingItem[]>('shopping-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confetti, setConfetti] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

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
    toast.success('Item added!', { icon: '🛒' })
  }

  const handleToggleComplete = (itemId: string) => {
    const item = items?.find(i => i.id === itemId)
    const isCompleting = item && !item.completed
    
    setItems(current =>
      (current || []).map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
    
    if (isCompleting) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 1000)
      toast.success('Item checked off!', { icon: '✨' })
    }
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
    toast.success('Item removed', { icon: '🗑️' })
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleClearCompleted = () => {
    setItems(current => (current || []).filter(item => !item.completed))
    toast.success('Completed items cleared!', { icon: '🧹' })
  }

  const activeItems = (items || []).filter(item => !item.completed)
  const completedItems = (items || []).filter(item => item.completed)
  const allItems = [...activeItems, ...completedItems]
  const completionRate = allItems.length > 0 ? Math.round((completedItems.length / allItems.length) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 relative px-2 md:px-0 pt-4 md:pt-0">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-brand-tertiary/20 via-brand-primary/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-brand-secondary/20 via-brand-tertiary/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: window.innerWidth / 2, 
                y: window.innerHeight / 2,
                scale: 0,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [0, 1, 0.8],
                rotate: Math.random() * 360,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#ff6b9d', '#feca57', '#48dbfb', '#1dd1a1', '#ee5a6f', '#c44569'][Math.floor(Math.random() * 6)]
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-2 md:pt-4 text-center space-y-5 md:space-y-6"
      >
        <motion.div 
          className="flex items-center justify-center gap-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="rounded-3xl bg-brand-gradient p-5 md:p-6 shadow-2xl shadow-glow-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10" weight="duotone" />
          </div>
        </motion.div>
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-gradient">
            Shopping List 2.0
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2.5 md:mt-3 flex items-center justify-center gap-2">
            <Lightning className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" weight="fill" />
            Capitalism made pretty
            <Sparkle className="w-4 h-4 md:w-5 md:h-5 text-brand-secondary" weight="fill" />
          </p>
        </div>

        {allItems.length > 0 && (
          <StatCard 
            stats={[
              { value: `${completionRate}%`, label: 'Complete', gradient: 'from-green-500 to-emerald-500' },
              { value: activeItems.length, label: 'To Buy' },
              { value: completedItems.length, label: 'Bought' }
            ]}
            className="pt-2"
          />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl glass-card backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-brand-tertiary/5 to-brand-secondary/5" />
        
        <div className="relative p-6 md:p-10 space-y-6">
          <form onSubmit={handleAddItem} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What do you need to buy?"
                className="h-12 text-base pl-5 pr-4 glass-morphic backdrop-blur-sm border-2 border-border/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl shadow-md transition-all duration-200"
                autoFocus
              />
              {newItemName && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Sparkle className="w-5 h-5 text-brand-primary animate-pulse" weight="fill" />
                </motion.div>
              )}
            </div>
            <Button
              type="submit"
              size="default"
              className="h-12 px-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium shadow-md"
              disabled={!newItemName.trim()}
            >
              <Plus className="w-5 h-5" weight="bold" />
              <span>Add</span>
            </Button>
          </form>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {allItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-20 px-4"
                >
                  <motion.div 
                    className="rounded-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 dark:from-brand-primary/30 dark:to-brand-secondary/30 w-20 h-20 flex items-center justify-center mx-auto mb-6"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ShoppingCart className="w-10 h-10 text-brand-primary" weight="duotone" />
                  </motion.div>
                  <p className="text-xl font-medium text-foreground mb-2">
                    Your list is empty!
                  </p>
                  <p className="text-muted-foreground">
                    Start adding items to get organized
                  </p>
                </motion.div>
              ) : (
                <>
                  {activeItems.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" weight="duotone" />
                        To Buy ({activeItems.length})
                      </h3>
                    </div>
                  )}
                  {activeItems.map((item) => {
                    const itemContent = (
                      <div
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300',
                          'glass-morphic',
                          'hover:from-brand-primary/10 hover:to-brand-secondary/10 dark:hover:from-brand-primary/20 dark:hover:to-brand-secondary/20',
                          'hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-brand-primary/30'
                        )}
                      >
                        <motion.div
                          whileTap={{ scale: 0.85, rotate: 5 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.completed}
                            onCheckedChange={() => handleToggleComplete(item.id)}
                            className="w-7 h-7 rounded-xl data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=checked]:border-green-500 border-2 transition-all duration-300"
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
                              className="h-12 text-base bg-white dark:bg-gray-800 border-2 border-brand-primary/50 rounded-xl"
                            />
                          </div>
                        ) : (
                          <label
                            htmlFor={`item-${item.id}`}
                            className="flex-1 text-lg font-medium cursor-pointer select-none transition-all duration-200"
                          >
                            {item.name}
                          </label>
                        )}

                        <div className={cn(
                          "flex items-center gap-1 transition-all duration-200",
                          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}>
                          {editingId !== item.id && (
                            <>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStartEdit(item)}
                                  aria-label={`Edit ${item.name}`}
                                  className="h-11 w-11 min-w-[44px] min-h-[44px] hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded-xl"
                                >
                                  <PencilSimple className="w-5 h-5" weight="duotone" />
                                </Button>
                              </motion.div>

                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  aria-label={`Delete ${item.name}`}
                                  className="h-11 w-11 min-w-[44px] min-h-[44px] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-xl transition-colors"
                                >
                                  <Trash className="w-5 h-5" weight="duotone" />
                                </Button>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    )

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 30, scale: 0.8 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.03,
                          type: "spring",
                          stiffness: 200
                        }}
                        layout
                        className="group"
                      >
                        {isMobile && editingId !== item.id ? (
                          <SwipeableItem
                            onDelete={() => handleDeleteItem(item.id)}
                            deleteThreshold={80}
                          >
                            {itemContent}
                          </SwipeableItem>
                        ) : (
                          itemContent
                        )}
                      </motion.div>
                    )
                  })}

                  {completedItems.length > 0 && (
                    <>
                      <div className="mt-8 mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" weight="fill" />
                          Completed ({completedItems.length})
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearCompleted}
                          className="text-xs hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded-lg"
                        >
                          Clear Completed
                        </Button>
                      </div>
                      {completedItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          layout
                          className="group"
                        >
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 opacity-60 hover:opacity-80 transition-all duration-200">
                            <motion.div whileTap={{ scale: 0.85 }}>
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={item.completed}
                                onCheckedChange={() => handleToggleComplete(item.id)}
                                className="w-7 h-7 rounded-xl data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 data-[state=checked]:border-green-500 border-2"
                              />
                            </motion.div>

                            <label
                              htmlFor={`item-${item.id}`}
                              className="flex-1 text-lg font-medium cursor-pointer select-none line-through text-muted-foreground"
                            >
                              {item.name}
                            </label>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  aria-label={`Delete ${item.name}`}
                                  className="h-11 w-11 min-w-[44px] min-h-[44px] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-xl transition-colors"
                                >
                                  <Trash className="w-5 h-5" weight="duotone" />
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
