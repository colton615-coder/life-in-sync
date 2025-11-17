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
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]"
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
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-[101] bg-card border-r-2 border-border shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b-2 border-border">
                <div className="flex items-center justify-between mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gradient-cyan"
                  >
                    Command Center
                  </motion.h2>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 rounded-full button-neumorphic flex items-center justify-center"
                  >
                    <X size={20} weight="bold" className="text-foreground" />
                  </motion.button>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="widget-title"
                >
                  Modules
                </motion.p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-neumorphic">
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
                      <button
                        className={cn(
                          'w-full h-14 rounded-2xl transition-all duration-200 relative flex items-center gap-4 px-4',
                          isActive
                            ? 'button-glow text-accent-foreground'
                            : 'button-neumorphic text-foreground hover:text-primary'
                        )}
                        onClick={() => handleModuleClick(module.id)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeModule"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-accent-foreground rounded-r-full"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          isActive ? "bg-accent-foreground/10" : ""
                        )}>
                          <IconComponent 
                            size={22}
                            weight={isActive ? 'fill' : 'regular'}
                          />
                        </div>
                        <span className="font-semibold text-sm flex-1 text-left">
                          {module.label}
                        </span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-accent-foreground glow-shadow"
                          />
                        )}
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="p-6 border-t-2 border-border">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="font-bold text-gradient-cyan text-xl tracking-tight">
                    LiFE-iN-SYNC
                  </p>
                  <p className="mt-1 widget-title">
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
