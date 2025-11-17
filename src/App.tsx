import { useState, useEffect } from 'react'
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
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { clearAllAppData } from '@/lib/clear-data'

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const clearData = async () => {
      const hasCleared = localStorage.getItem('data-cleared-v1')
      if (!hasCleared) {
        await clearAllAppData()
        localStorage.setItem('data-cleared-v1', 'true')
      }
    }
    clearData()
  }, [])

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
        return (
          <ErrorBoundary>
            <Dashboard onNavigate={handleModuleChange} />
          </ErrorBoundary>
        )
      case 'habits':
        return (
          <ErrorBoundary>
            <Habits />
          </ErrorBoundary>
        )
      case 'finance':
        return (
          <ErrorBoundary>
            <Finance />
          </ErrorBoundary>
        )
      case 'tasks':
        return (
          <ErrorBoundary>
            <Tasks />
          </ErrorBoundary>
        )
      case 'workouts':
        return (
          <ErrorBoundary>
            <Workouts />
          </ErrorBoundary>
        )
      case 'knox':
        return (
          <ErrorBoundary>
            <Knox />
          </ErrorBoundary>
        )
      case 'shopping':
        return (
          <ErrorBoundary>
            <Shopping />
          </ErrorBoundary>
        )
      case 'calendar':
        return (
          <ErrorBoundary>
            <Calendar />
          </ErrorBoundary>
        )
      case 'vault':
        return (
          <ErrorBoundary>
            <GolfSwing />
          </ErrorBoundary>
        )
      case 'connections':
        return (
          <ErrorBoundary>
            <Connections />
          </ErrorBoundary>
        )
      case 'settings':
        return (
          <ErrorBoundary>
            <Settings />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary>
            <Dashboard onNavigate={handleModuleChange} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <div id="main-content" className="md:px-8 md:py-8 pb-20 md:pb-32 text-5xl">
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
  );
}

export default App
