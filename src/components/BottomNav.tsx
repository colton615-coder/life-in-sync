import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { House, ChartBar, CalendarDots, Gear, List } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: any
  label: string
  id: string
}

const navItems: NavItem[] = [
  { icon: House, label: 'Home', id: 'home' },
  { icon: ChartBar, label: 'Analytics', id: 'analytics' },
  { icon: CalendarDots, label: 'History', id: 'history' },
  { icon: Gear, label: 'Settings', id: 'settings' },
]

interface BottomNavProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute bottom-20 left-0 glass-card rounded-2xl p-2 mb-2 min-w-[200px]"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) => {
                const IconComponent = item.icon
                const isActive = activeTab === item.id
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-primary/20 text-primary border border-primary/30 neon-glow'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      )}
                      onClick={() => {
                        onTabChange(item.id)
                        setIsExpanded(false)
                      }}
                    >
                      <IconComponent 
                        size={20} 
                        weight={isActive ? 'fill' : 'regular'} 
                      />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          className={cn(
            'w-16 h-16 rounded-2xl shadow-2xl transition-all duration-300',
            isExpanded
              ? 'bg-destructive/80 hover:bg-destructive text-destructive-foreground'
              : 'glass-card text-primary hover:bg-primary/20 animate-glow'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <List size={28} weight="bold" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}
