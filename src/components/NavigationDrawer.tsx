import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  House, 
  ChartBar, 
  CalendarDots, 
  Gear, 
  CurrencyDollar,
  CheckSquare,
  Barbell,
  ShoppingCart,
  LockKey,
  ChatsCircle,
  List,
  X
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NavModule {
  icon: any
  label: string
  id: string
  color: string
}

const modules: NavModule[] = [
  { icon: House, label: 'Dashboard', id: 'dashboard', color: 'text-cyan-400' },
  { icon: CheckSquare, label: 'Habits', id: 'habits', color: 'text-green-400' },
  { icon: CurrencyDollar, label: 'Finance', id: 'finance', color: 'text-emerald-400' },
  { icon: ChartBar, label: 'Tasks', id: 'tasks', color: 'text-orange-400' },
  { icon: Barbell, label: 'Workouts', id: 'workouts', color: 'text-red-400' },
  { icon: ChatsCircle, label: 'Knox AI', id: 'knox', color: 'text-purple-400' },
  { icon: ShoppingCart, label: 'Shopping', id: 'shopping', color: 'text-blue-400' },
  { icon: CalendarDots, label: 'Calendar', id: 'calendar', color: 'text-pink-400' },
  { icon: LockKey, label: 'Vault', id: 'vault', color: 'text-yellow-400' },
  { icon: Gear, label: 'Settings', id: 'settings', color: 'text-gray-400' },
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
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
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
              className="fixed left-0 top-0 h-full w-80 z-[101] glass-card border-r-2 border-primary/30 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
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
                      className="rounded-full hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X size={24} weight="bold" />
                    </Button>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-muted-foreground text-sm"
                >
                  Access all modules from here
                </motion.p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
                          'w-full justify-start gap-3 h-12 rounded-lg transition-all duration-200 group relative overflow-hidden px-3',
                          isActive
                            ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-foreground border border-primary/40 shadow-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                        )}
                        onClick={() => handleModuleClick(module.id)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeModule"
                            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-3 w-full">
                          <div className={cn(
                            'transition-all duration-200 flex-shrink-0',
                            module.color
                          )}>
                            <IconComponent 
                              size={32} 
                              weight={isActive ? 'fill' : 'duotone'}
                              className={cn(
                                'drop-shadow-[0_0_8px_currentColor]',
                                isActive && 'animate-pulse-button'
                              )}
                            />
                          </div>
                          <span className="font-semibold text-base flex-1 text-left">
                            {module.label}
                          </span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-primary neon-glow"
                            />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="p-4 border-t border-primary/20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-xs text-muted-foreground"
                >
                  <p className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    LiFE-iN-SYNC
                  </p>
                  <p className="mt-1">Optimize Your Life</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
