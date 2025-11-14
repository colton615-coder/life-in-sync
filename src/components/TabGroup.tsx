import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabGroupProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function TabGroup({ tabs, activeTab, onChange, className }: TabGroupProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-muted/50 rounded-xl w-fit', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          data-active={activeTab === tab.id}
          className={cn(
            'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            'flex items-center gap-2',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
          )}
        >
          {tab.icon && <span className="text-lg">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
