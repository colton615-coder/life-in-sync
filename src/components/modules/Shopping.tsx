import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { ShoppingItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, ShoppingCart, Check, Archive } from '@phosphor-icons/react'
import { AddShoppingItemDialog } from '@/components/shopping/AddShoppingItemDialog'
import { EditShoppingItemDialog } from '@/components/shopping/EditShoppingItemDialog'
import { ShoppingItemCard } from '@/components/shopping/ShoppingItemCard'
import { ShoppingStats } from '@/components/shopping/ShoppingStats'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function Shopping() {
  const [items, setItems] = useKV<ShoppingItem[]>('shopping-items', [])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')

  const activeItems = useMemo(
    () => (items || []).filter(item => !item.completed).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }),
    [items]
  )

  const completedItems = useMemo(
    () => (items || []).filter(item => item.completed).sort((a, b) => 
      new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
    ),
    [items]
  )

  const handleAddItem = (item: Omit<ShoppingItem, 'id' | 'completed' | 'createdAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setItems(current => [...(current || []), newItem])
    toast.success('Item added', {
      description: `${newItem.name} added to your shopping list`,
    })
  }

  const handleEditItem = (updatedItem: ShoppingItem) => {
    setItems(current =>
      (current || []).map(item => (item.id === updatedItem.id ? updatedItem : item))
    )
    toast.success('Item updated', {
      description: `${updatedItem.name} has been updated`,
    })
  }

  const handleToggleComplete = (itemId: string) => {
    setItems(current =>
      (current || []).map(item => {
        if (item.id === itemId) {
          const isCompleting = !item.completed
          return {
            ...item,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : undefined,
          }
        }
        return item
      })
    )

    const item = (items || []).find(i => i.id === itemId)
    if (item) {
      if (!item.completed) {
        toast.success('Item checked off!', {
          description: `${item.name} marked as purchased`,
        })
      } else {
        toast.info('Item unchecked', {
          description: `${item.name} moved back to shopping list`,
        })
      }
    }
  }

  const handleDeleteItem = (itemId: string) => {
    const item = (items || []).find(i => i.id === itemId)
    setItems(current => (current || []).filter(item => item.id !== itemId))
    
    if (item) {
      toast.success('Item removed', {
        description: `${item.name} deleted from your list`,
      })
    }
  }

  const handleEditClick = (item: ShoppingItem) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  const handleClearCompleted = () => {
    const count = completedItems.length
    setItems(current => (current || []).filter(item => !item.completed))
    toast.success('Completed items cleared', {
      description: `Removed ${count} completed ${count === 1 ? 'item' : 'items'}`,
    })
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3">
              <ShoppingCart className="w-7 h-7 text-primary" weight="duotone" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Shopping List
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize your shopping with smart lists
              </p>
            </div>
          </div>

          <Button
            onClick={() => setAddDialogOpen(true)}
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" weight="bold" />
            Add Item
          </Button>
        </div>
      </motion.div>

      <ShoppingStats 
        activeCount={activeItems.length}
        completedCount={completedItems.length}
        items={items || []}
      />

      <Card className="elevated-card p-1">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'completed')}>
          <div className="p-4 pb-0">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="active" className="gap-2 text-base">
                <ShoppingCart className="w-4 h-4" weight="duotone" />
                Active
                {activeItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2 text-base">
                <Archive className="w-4 h-4" weight="duotone" />
                Completed
                {completedItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {completedItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="p-4 pt-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {activeItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 px-4"
                >
                  <div className="rounded-full bg-muted/50 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No items yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start building your shopping list by adding your first item
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" weight="bold" />
                    Add Your First Item
                  </Button>
                </motion.div>
              ) : (
                activeItems.map((item, index) => (
                  <ShoppingItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="p-4 pt-6 space-y-3">
            {completedItems.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCompleted}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Clear All Completed
                </Button>
              </div>
            )}
            
            <AnimatePresence mode="popLayout">
              {completedItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 px-4"
                >
                  <div className="rounded-full bg-muted/50 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-muted-foreground" weight="duotone" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No completed items</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Items you check off will appear here
                  </p>
                </motion.div>
              ) : (
                completedItems.map((item, index) => (
                  <ShoppingItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </Card>

      <AddShoppingItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddItem}
      />

      {editingItem && (
        <EditShoppingItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={editingItem}
          onEdit={handleEditItem}
        />
      )}
    </div>
  )
}
