import { useState } from 'react'
import { NavigationDrawer } from '@/components/NavigationDrawer'
import { NavigationButton } from '@/components/NavigationButton'
import { AbstractBackground } from '@/components/AbstractBackground'
import { LoadingScreen } from '@/components/LoadingScreen'
import { Toaster } from '@/components/ui/sonner'
import { useTheme } from '@/components/ThemeProvider'
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

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAppReady, setIsAppReady] = useState(false)
  const { effectiveTheme } = useTheme()

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId as Module)
    setDrawerOpen(false)
    
    if (['vault', 'history'].includes(moduleId)) {
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
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handleModuleChange} />
    }
  }

  return (
    <>
      {!isAppReady && <LoadingScreen onLoadComplete={() => setIsAppReady(true)} />}
      
      <div className="min-h-screen bg-background relative">
        <AbstractBackground />

        <div className="relative z-10 max-w-6xl mx-auto px-3 py-4 md:px-8 md:py-16 pb-24 md:pb-32">
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

        <Toaster position="top-right" theme={effectiveTheme} />
      </div>
    </>
  )
}

export default App
