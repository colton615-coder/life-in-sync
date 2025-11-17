import { useState } from 'react'
import { NavigationDrawer } from '@/components/NavigationDrawer'
import { NavigationButton } from '@/components/NavigationButton'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Module } from '@/lib/types'
import { Dashboard } from '@/components/modules/Dashboard'
import { Habits } from '@/components/modules/Habits'
import { Finance } from '@/components/modules/Finance'
import { Tasks } from '@/components/modules/Tasks'
import { Workouts } from '@/components/modules/Workouts'
import { Knox } from '@/components/modules/Knox'
import { Shopping } from '@/components/modules/Shopping'
import { Calendar } from '@/components/modules/Calendar'
import { Settings } from '@/components/modules/Settings'
import { GolfSwing } from '@/components/modules/GolfSwing'
import { Connections } from '@/components/modules/Connections'

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId as Module)
    setDrawerOpen(false)
    
    if (['history'].includes(moduleId)) {
      toast.info('Coming soon', {
        description: `${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} module is under development`,
      })
      setActiveModule('dashboard')
    }
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleModuleChange} />
      case 'habits':
        return <Habits />
      case 'finance':
        return <Finance />
      case 'tasks':
        return <Tasks />
      case 'workouts':
        return <Workouts />
      case 'knox':
        return <Knox />
      case 'shopping':
        return <Shopping />
      case 'calendar':
        return <Calendar />
      case 'vault':
        return <GolfSwing />
      case 'connections':
        return <Connections />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handleModuleChange} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-32">
        {renderModule()}
      </div>

      <NavigationButton 
        onClick={() => setDrawerOpen(!drawerOpen)}
        isOpen={drawerOpen}
      />

      <NavigationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
      />

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
