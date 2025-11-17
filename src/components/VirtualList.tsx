import { ReactNode } from 'react'
import { useVirtualScroll } from '@/hooks/use-virtual-scroll'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  overscan?: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  emptyState?: ReactNode
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight = 600,
  overscan = 3,
  renderItem,
  className = '',
  emptyState,
}: VirtualListProps<T>) {
  const {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    handleScroll,
  } = useVirtualScroll(items, { itemHeight, overscan, containerHeight })

  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto scrollbar-neumorphic ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
