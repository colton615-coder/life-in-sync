import { Button } from '@/components/ui/button'
import {
  House,
  Target,
  ChartBar,
  CheckCircle,
  Brain,
  Barbell,
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
      <nav className="hidden md:flex flex-col gap-2 p-6 w-72 border-r border-border/50 bg-white/60 backdrop-blur-xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            LiFE-iN-SYNC
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Your Life Dashboard</p>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentModule === item.id ? 'default' : 'ghost'}
              className={cn(
                'justify-start gap-3 h-11 text-[15px] font-medium transition-all',
                currentModule === item.id 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon size={22} weight={currentModule === item.id ? 'fill' : 'regular'} />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/50 bg-white/95 backdrop-blur-xl z-50 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-3 max-w-lg mx-auto">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl min-w-[64px] transition-all',
                currentModule === item.id 
                  ? 'bg-primary/10 text-primary scale-105' 
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              <item.icon size={24} weight={currentModule === item.id ? 'fill' : 'regular'} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
