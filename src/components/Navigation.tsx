import { Button } from '@/components/ui/button'
import {
  House,
  Target,
  ChartBar,
  CheckCircle,
  Brain,
  Barbell,
  ShoppingCart,
  Calendar,
  Lock
} from '@phosphor-icons/react'
import { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NavigationProps {
  currentModule: Module
  onNavigate: (module: Module) => void
}

const navItems = [
  { id: 'dashboard' as Module, label: 'Dashboard', icon: House },
  { id: 'habits' as Module, label: 'Habits', icon: Target },
  { id: 'finance' as Module, label: 'Finance', icon: ChartBar },
  { id: 'tasks' as Module, label: 'Tasks', icon: CheckCircle },
  { id: 'knox' as Module, label: 'Knox', icon: Brain },
  { id: 'workouts' as Module, label: 'Workouts', icon: Barbell },
]

export function Navigation({ currentModule, onNavigate }: NavigationProps) {
  return (
    <>
      <nav className="hidden md:flex flex-col gap-2 p-4 w-64 border-r border-border bg-card/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            LiFE-iN-SYNC
          </h2>
        </div>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentModule === item.id ? 'default' : 'ghost'}
            className={cn(
              'justify-start gap-3',
              currentModule === item.id && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </Button>
        ))}
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm z-50">
        <div className="flex items-center justify-around p-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px]',
                currentModule === item.id && 'bg-accent/20 text-accent'
              )}
            >
              <item.icon size={24} weight={currentModule === item.id ? 'fill' : 'regular'} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
