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
    <div className={cn('flex gap-1 p-1 bg-muted/50 rounded-xl w-full md:w-fit', className)} role="tablist" aria-label="Tab navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          data-active={activeTab === tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={cn(
            'px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 flex-1 md:flex-initial whitespace-nowrap',
            'flex items-center justify-center gap-1.5 md:gap-2',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
          )}
        >
          {tab.icon && <span className="text-sm md:text-lg flex-shrink-0" aria-hidden="true">{tab.icon}</span>}
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
