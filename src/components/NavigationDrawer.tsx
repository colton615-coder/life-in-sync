import { motion, AnimatePresence } from 'framer-motion'
import { 
  House, 
  ListChecks, 
  CalendarDots, 
  Gear, 
  CurrencyDollar,
  CheckSquare,
  Barbell,
  ShoppingCart,
  LockKey,
  ChatsCircle,
  LinkSimple,
  X
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NavModule {
  icon: any
  label: string
  id: string
}

const modules: NavModule[] = [
  { icon: House, label: 'Dashboard', id: 'dashboard' },
  { icon: CheckSquare, label: 'Habits', id: 'habits' },
  { icon: CurrencyDollar, label: 'Finance', id: 'finance' },
  { icon: ListChecks, label: 'Tasks', id: 'tasks' },
  { icon: Barbell, label: 'Workouts', id: 'workouts' },
  { icon: ChatsCircle, label: 'Knox AI', id: 'knox' },
  { icon: ShoppingCart, label: 'Shopping', id: 'shopping' },
  { icon: CalendarDots, label: 'Calendar', id: 'calendar' },
  { icon: LockKey, label: 'Golf Swing', id: 'vault' },
  { icon: LinkSimple, label: 'Connections', id: 'connections' },
  { icon: Gear, label: 'Settings', id: 'settings' },
]

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeModule: string
  onModuleChange: (moduleId: string) => void
}

export function NavigationDrawer({ isOpen, onClose, activeModule, onModuleChange }: NavigationDrawerProps) {
  const handleModuleClick = (moduleId: string) => {
    onModuleChange(moduleId)
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring',
                damping: 25,
                stiffness: 250,
              }}
              className="fixed left-0 top-0 h-full w-72 max-w-[85vw] z-[101] bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl flex flex-col"
              role="dialog"
              aria-label="Navigation menu"
              aria-modal="true"
            >
              <div className="p-5 border-b border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-semibold text-gradient-cyan"
                    id="navigation-title"
                  >
                    Command Center
                  </motion.h2>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center"
                    aria-label="Close navigation menu"
                  >
                    <X size={18} weight="bold" className="text-foreground" aria-hidden="true" />
                  </motion.button>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Modules
                </motion.p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-neumorphic">
                <nav aria-labelledby="navigation-title">
                  {modules.map((module, index) => {
                    const IconComponent = module.icon
                    const isActive = activeModule === module.id
                    
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: 0.03 * index,
                          type: 'spring',
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <button
                          className={cn(
                            'w-full h-11 rounded-xl transition-all duration-200 relative flex items-center gap-3 px-3 group',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                              : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                          )}
                          onClick={() => handleModuleClick(module.id)}
                          aria-label={`${module.label} module${isActive ? ', currently active' : ''}`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                            isActive ? "bg-primary-foreground/10" : "bg-transparent group-hover:bg-background/50"
                          )}>
                            <IconComponent 
                              size={20}
                              weight={isActive ? 'fill' : 'regular'}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="font-medium text-sm flex-1 text-left">
                            {module.label}
                          </span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary-foreground"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              <div className="p-5 border-t border-border/30">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <p className="font-bold text-gradient-cyan text-lg tracking-tight">
                    LiFE-iN-SYNC
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    Personal Command Center
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
