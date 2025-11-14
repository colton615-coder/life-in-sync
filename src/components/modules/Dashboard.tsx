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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-[15px]">Your unified command center</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="text-center py-20">
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-2 border-primary/30"
            >
              <SquaresFour size={48} weight="duotone" className="text-primary" />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold mb-3 text-foreground">Dashboard Coming Soon</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            This will be your central hub for insights, stats, and quick access to all modules
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
