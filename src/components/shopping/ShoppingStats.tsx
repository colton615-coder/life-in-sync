import { useMemo } from 'react'
import { ShoppingItem } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { ShoppingCart, CheckCircle, TrendUp, Tag } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ShoppingStatsProps {
  activeCount: number
  completedCount: number
  items: ShoppingItem[]
}

export function ShoppingStats({ activeCount, completedCount, items }: ShoppingStatsProps) {
  const stats = useMemo(() => {
    const highPriorityCount = items.filter(
      (item) => !item.completed && item.priority === 'high'
    ).length

    const categoryBreakdown = items
      .filter((item) => !item.completed)
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryBreakdown).sort(
      ([, a], [, b]) => b - a
    )[0]

    return {
      highPriorityCount,
      topCategory: topCategory ? topCategory[0] : 'None',
      topCategoryCount: topCategory ? topCategory[1] : 0,
    }
  }, [items])

  const statCards = [
    {
      label: 'Active Items',
      value: activeCount,
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'High Priority',
      value: stats.highPriorityCount,
      icon: TrendUp,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Top Category',
      value: stats.topCategory,
      subValue: stats.topCategoryCount > 0 ? `${stats.topCategoryCount} items` : undefined,
      icon: Tag,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="elevated-card p-4 md:p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                  {stat.value}
                </p>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subValue}
                  </p>
                )}
              </div>
              <div className={`rounded-xl ${stat.bgColor} p-2.5 md:p-3 flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} weight="duotone" />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
