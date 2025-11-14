import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ShoppingItem } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PencilSimple, Trash, Plus, ShoppingCart, CheckCircle, Sparkle, Lightning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function Shopping() {
  const [items, setItems] = useKV<ShoppingItem[]>('shopping-items', [])
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [confetti, setConfetti] = useState(false)
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
    <div className="max-w-3xl mx-auto space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
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
        className="pt-2 md:pt-4 text-center space-y-4"
      >
        <motion.div 
          className="flex items-center justify-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-4 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <ShoppingCart className="w-10 h-10 text-white relative z-10" weight="duotone" />
          </div>
        </motion.div>
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Shopping List 2.0
          </h1>
          <p className="text-lg text-muted-foreground mt-2 flex items-center justify-center gap-2">
            <Lightning className="w-4 h-4 text-yellow-500" weight="fill" />
            Smart. Fast. Beautiful.
            <Sparkle className="w-4 h-4 text-pink-500" weight="fill" />
          </p>
        </div>

        {allItems.length > 0 && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-6 pt-2"
          >
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {completionRate}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{activeItems.length}</div>
              <div className="text-xs text-muted-foreground">To Buy</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{completedItems.length}</div>
              <div className="text-xs text-muted-foreground">Bought</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
        
        <div className="relative p-6 md:p-10 space-y-6">
          <form onSubmit={handleAddItem} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="What do you need to buy?"
                className="h-16 text-lg pl-6 pr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-800/50 focus-visible:border-purple-500 focus-visible:ring-4 focus-visible:ring-purple-500/20 rounded-2xl shadow-lg transition-all duration-300"
                autoFocus
              />
              {newItemName && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <Sparkle className="w-5 h-5 text-purple-500 animate-pulse" weight="fill" />
                </motion.div>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-16 px-8 gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 rounded-2xl font-semibold text-lg"
              disabled={!newItemName.trim()}
            >
              <Plus className="w-6 h-6" weight="bold" />
              <span className="hidden sm:inline">Add Item</span>
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
                    className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 w-20 h-20 flex items-center justify-center mx-auto mb-6"
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
                    <ShoppingCart className="w-10 h-10 text-purple-500" weight="duotone" />
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
                  {activeItems.map((item, index) => (
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
                      <div
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl transition-all duration-300',
                          'bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30',
                          'hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20',
                          'hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-purple-200/50'
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
                              className="h-12 text-base bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 rounded-xl"
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

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {editingId !== item.id && (
                            <>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStartEdit(item)}
                                  className="h-10 w-10 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 rounded-xl"
                                >
                                  <PencilSimple className="w-5 h-5" weight="duotone" />
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-xl transition-colors"
                                >
                                  <Trash className="w-5 h-5" weight="duotone" />
                                </Button>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

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
                      {completedItems.map((item, index) => (
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
                                  className="h-10 w-10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 rounded-xl transition-colors"
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
