import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { separateByCompletion, CompletableItem } from '@/lib/completion-tracker'

export type FilterType = 'all' | 'active' | 'completed'

interface UseCompletableItemsOptions<T> {
  storageKey: string
  defaultValue: T[]
  isCompleted: (item: T) => boolean
}

export function useCompletableItems<T extends CompletableItem>({
  storageKey,
  defaultValue,
  isCompleted
}: UseCompletableItemsOptions<T>) {
  const [items, setItems] = useKV<T[]>(storageKey, defaultValue)
  const [filterType, setFilterType] = useState<FilterType>('all')
  
  const { active, completed } = useMemo(() => {
    return separateByCompletion(items || [], isCompleted)
  }, [items, isCompleted])
  
  const filteredItems = useMemo(() => {
    switch (filterType) {
      case 'active':
        return active
      case 'completed':
        return completed
      case 'all':
      default:
        return [...active, ...completed]
    }
  }, [filterType, active, completed])
  
  const stats = useMemo(() => ({
    total: (items || []).length,
    active: active.length,
    completed: completed.length,
    completionRate: items?.length ? Math.round((completed.length / items.length) * 100) : 0
  }), [items, active, completed])
  
  return {
    items: items || [],
    setItems,
    active,
    completed,
    filteredItems,
    filterType,
    setFilterType,
    stats
  }
}
