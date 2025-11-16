import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ 
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-[101] bg-sidebar border-r border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gradient"
                  >
                    Navigation
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="rounded-lg hover:bg-destructive/20 hover:text-destructive h-10 w-10"
                    >
                      <X size={24} weight="bold" />
                    </Button>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-muted-foreground text-sm uppercase tracking-wide"
                >
                  Modules
                </motion.p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                {modules.map((module, index) => {
                  const IconComponent = module.icon
                  const isActive = activeModule === module.id
                  
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.05 * index,
                        type: 'spring',
                        stiffness: 300,
                        damping: 30
                      }}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start gap-3 h-12 rounded-lg transition-all duration-150 relative',
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50 border border-transparent'
                        )}
                        onClick={() => handleModuleClick(module.id)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeModule"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-3 w-full pl-2">
                          <IconComponent 
                            size={22}
                            weight={isActive ? 'fill' : 'regular'}
                            className="flex-shrink-0"
                          />
                          <span className="font-medium text-sm flex-1 text-left">
                            {module.label}
                          </span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-primary"
                            />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="p-4 border-t border-border">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="font-bold text-gradient text-lg">
                    LiFE-iN-SYNC
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs uppercase tracking-wide">
                    Dashboard UI
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
