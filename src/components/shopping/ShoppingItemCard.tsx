import { ShoppingItem } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Circle, 
  ArrowUp, 
  PencilSimple, 
  Trash, 
  Package,
  Carrot,
  FirstAid,
  Bathtub,
  House,
  TShirt,
  GameController
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ShoppingItemCardProps {
  item: ShoppingItem
  index: number
  onToggleComplete: (id: string) => void
  onEdit: (item: ShoppingItem) => void
  onDelete: (id: string) => void
}

const categoryIcons: Record<string, any> = {
  'Groceries': Carrot,
  'Household': House,
  'Personal Care': Bathtub,
  'Health': FirstAid,
  'Clothing': TShirt,
  'Electronics': GameController,
  'Other': Package,
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground border-muted',
  medium: 'bg-accent/20 text-accent-foreground border-accent/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
}

export function ShoppingItemCard({
  item,
  index,
  onToggleComplete,
  onEdit,
  onDelete,
}: ShoppingItemCardProps) {
  const CategoryIcon = categoryIcons[item.category] || Package

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.03,
        exit: { duration: 0.2 }
      }}
      layout
    >
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          item.completed 
            ? "bg-muted/30 border-border/50" 
            : "elevated-card border-l-4",
          item.priority === 'high' && !item.completed && "border-l-destructive",
          item.priority === 'medium' && !item.completed && "border-l-accent",
          item.priority === 'low' && !item.completed && "border-l-muted-foreground",
        )}
      >
        <div className="p-4 flex items-center gap-4">
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            <Checkbox
              id={`item-${item.id}`}
              checked={item.completed}
              onCheckedChange={() => onToggleComplete(item.id)}
              className={cn(
                "w-6 h-6 rounded-lg transition-all duration-200",
                item.completed && "data-[state=checked]:bg-success data-[state=checked]:border-success"
              )}
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={cn(
                  "rounded-lg p-1.5 flex-shrink-0 transition-colors duration-200",
                  item.completed ? "bg-muted" : "bg-primary/10"
                )}>
                  <CategoryIcon 
                    className={cn(
                      "w-4 h-4",
                      item.completed ? "text-muted-foreground" : "text-primary"
                    )} 
                    weight="duotone" 
                  />
                </div>
                <h3 
                  className={cn(
                    "font-semibold text-base truncate transition-all duration-200",
                    item.completed && "line-through text-muted-foreground"
                  )}
                >
                  {item.name}
                </h3>
              </div>

              {!item.completed && item.priority === 'high' && (
                <Badge 
                  variant="destructive" 
                  className="gap-1 flex-shrink-0 animate-pulse-button"
                >
                  <ArrowUp className="w-3 h-3" weight="bold" />
                  Urgent
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="w-3.5 h-3.5" weight="duotone" />
                <span>
                  {item.quantity} {item.unit || 'item(s)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Circle className="w-1 h-1 fill-current text-muted-foreground/40" />
                <span className="text-muted-foreground">{item.category}</span>
              </div>

              {!item.completed && item.priority !== 'high' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Circle className="w-1 h-1 fill-current text-muted-foreground/40" />
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs px-2 py-0",
                        item.priority === 'medium' && "border-accent/50 text-accent-foreground",
                        item.priority === 'low' && "border-muted text-muted-foreground"
                      )}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {item.notes && (
              <p className={cn(
                "text-sm mt-2 line-clamp-2 transition-colors duration-200",
                item.completed ? "text-muted-foreground/70" : "text-muted-foreground"
              )}>
                {item.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-9 w-9 hover:bg-accent hover:text-accent-foreground"
            >
              <PencilSimple className="w-4 h-4" weight="duotone" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id)}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash className="w-4 h-4" weight="duotone" />
            </Button>
          </div>
        </div>

        {item.completed && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-success origin-left"
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </Card>
    </motion.div>
  )
}
