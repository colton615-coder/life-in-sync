import { Card } from '../Card'
import { 
  Target,
  SquaresFour
} from '@phosphor-icons/react'
import { Module } from '@/lib/types'
import { motion } from 'framer-motion'

interface DashboardProps {
  onNavigate: (module: Module) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-[15px]">Your unified command center</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="text-center py-12 md:py-20">
          <div className="mb-4 md:mb-6 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl glass-card flex items-center justify-center border-2 border-primary/30"
            >
              <SquaresFour size={32} weight="duotone" className="text-primary md:w-12 md:h-12" />
            </motion.div>
          </div>
          <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 text-foreground">Dashboard Coming Soon</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-md mx-auto px-4">
            This will be your central hub for insights, stats, and quick access to all modules
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
