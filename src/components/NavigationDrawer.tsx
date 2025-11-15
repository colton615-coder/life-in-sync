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
  color: string
}

const modules: NavModule[] = [
  { icon: House, label: 'Dashboard', id: 'dashboard', color: 'text-icon-vibrant' },
  { icon: CheckSquare, label: 'Habits', id: 'habits', color: 'text-icon-primary' },
  { icon: CurrencyDollar, label: 'Finance', id: 'finance', color: 'text-icon-vibrant' },
  { icon: ListChecks, label: 'Tasks', id: 'tasks', color: 'text-icon-accent' },
  { icon: Barbell, label: 'Workouts', id: 'workouts', color: 'text-icon-secondary' },
  { icon: ChatsCircle, label: 'Knox AI', id: 'knox', color: 'text-icon-accent' },
  { icon: ShoppingCart, label: 'Shopping', id: 'shopping', color: 'text-icon-primary' },
  { icon: CalendarDots, label: 'Calendar', id: 'calendar', color: 'text-icon-secondary' },
  { icon: LockKey, label: 'Golf Swing', id: 'vault', color: 'text-icon-accent' },
  { icon: Gear, label: 'Settings', id: 'settings', color: 'text-icon-muted' },
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
              className="fixed inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-violet-900/40 backdrop-blur-md z-[100]"
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
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-[101] glass-card border-r-2 border-white/30 shadow-2xl flex flex-col"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.18))',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
              }}
            >
              <div className="p-4 md:p-6 border-b border-white/25">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl font-bold bg-gradient-to-r from-icon-vibrant via-icon-accent to-icon-secondary bg-clip-text text-transparent drop-shadow-sm"
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
                      className="rounded-full hover:bg-destructive/25 hover:text-destructive text-foreground/80 h-8 w-8 md:h-10 md:w-10 transition-all duration-200"
                    >
                      <X size={20} weight="bold" className="md:hidden drop-shadow-[0_0_4px_currentColor]" />
                      <X size={24} weight="bold" className="hidden md:block drop-shadow-[0_0_4px_currentColor]" />
                    </Button>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-foreground/70 text-xs md:text-sm font-medium"
                >
                  Access all modules from here
                </motion.p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1.5 md:space-y-2">
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
                          'w-full justify-start gap-2 md:gap-3 h-10 md:h-12 rounded-xl transition-all duration-200 group relative overflow-hidden px-2 md:px-3',
                          isActive
                            ? 'bg-gradient-to-r from-white/40 to-white/25 text-foreground border-2 border-white/50 shadow-lg backdrop-blur-sm'
                            : 'text-foreground/75 hover:text-foreground hover:bg-white/20 border border-white/20 hover:border-white/40 hover:shadow-md'
                        )}
                        onClick={() => handleModuleClick(module.id)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeModule"
                            className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/15 rounded-xl"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <div className="relative z-10 flex items-center gap-2 md:gap-3 w-full">
                          <div className={cn(
                            'transition-all duration-200 flex-shrink-0',
                            module.color,
                            isActive && 'drop-shadow-[0_0_10px_currentColor]'
                          )}>
                            <IconComponent 
                              size={24}
                              weight={isActive ? 'fill' : 'duotone'}
                              className={cn(
                                'transition-all duration-200 md:w-7 md:h-7',
                                isActive ? 'drop-shadow-[0_0_12px_currentColor]' : 'drop-shadow-[0_0_6px_currentColor]',
                                isActive && 'animate-pulse-button'
                              )}
                            />
                          </div>
                          <span className={cn(
                            "font-semibold text-sm md:text-base flex-1 text-left transition-all duration-200",
                            isActive ? "text-foreground drop-shadow-sm" : "text-foreground/80"
                          )}>
                            {module.label}
                          </span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-gradient-to-br from-icon-vibrant to-icon-accent drop-shadow-[0_0_8px_currentColor]"
                            />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="p-3 md:p-4 border-t border-white/25">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-[10px] md:text-xs"
                >
                  <p className="font-bold bg-gradient-to-r from-icon-vibrant via-icon-accent to-icon-secondary bg-clip-text text-transparent drop-shadow-sm text-sm md:text-base">
                    LiFE-iN-SYNC
                  </p>
                  <p className="mt-0.5 md:mt-1 text-foreground/70 font-medium">Optimize Your Life</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
