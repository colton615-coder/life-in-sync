import { useState, useEffect, Suspense, lazy } from 'react'
import { NavigationDrawer } from '@/components/NavigationDrawer'
import { NavigationButton } from '@/components/NavigationButton'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { Module } from '@/lib/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { clearAllAppData } from '@/lib/clear-data'
import { LoadingScreen } from './components/LoadingScreen'
// @ts-expect-error virtual:pwa-register is dynamically generated
import { registerSW } from 'virtual:pwa-register'
import { SarcasticLoader } from './components/SarcasticLoader'

// Lazy load modules
const Dashboard = lazy(() => import('@/components/modules/Dashboard').then(module => ({ default: module.Dashboard })))
const Habits = lazy(() => import('@/components/modules/Habits').then(module => ({ default: module.Habits })))
const Finance = lazy(() => import('@/components/modules/Finance').then(module => ({ default: module.Finance })))
const Tasks = lazy(() => import('@/components/modules/Tasks').then(module => ({ default: module.Tasks })))
const Workouts = lazy(() => import('@/components/modules/Workouts').then(module => ({ default: module.Workouts })))
const Knox = lazy(() => import('@/components/modules/Knox').then(module => ({ default: module.Knox })))
const Shopping = lazy(() => import('@/components/modules/Shopping').then(module => ({ default: module.Shopping })))
const Calendar = lazy(() => import('@/components/modules/Calendar').then(module => ({ default: module.Calendar })))
const Settings = lazy(() => import('@/components/modules/Settings').then(module => ({ default: module.Settings })))
const GolfSwing = lazy(() => import('@/components/modules/GolfSwing').then(module => ({ default: module.GolfSwing })))
const Connections = lazy(() => import('@/components/modules/Connections').then(module => ({ default: module.Connections })))

function App() {
  const [activeModule, setActiveModule] = useState<Module>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // PWA Update handling
    const updateSW = registerSW({
      onNeedRefresh() {
        toast.message('New version available', {
          description: 'Reload to get the latest updates.',
          action: {
            label: 'Reload',
            onClick: () => updateSW(true)
          }
        })
      },
      onOfflineReady() {
        toast.success('App ready to work offline')
      },
    })

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
    const ModuleLoader = () => (
        <div className="flex items-center justify-center min-h-[50vh]">
            <SarcasticLoader />
        </div>
    )

    return (
      <Suspense fallback={<ModuleLoader />}>
        <ErrorBoundary>
          {(() => {
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
              case 'golf':
                return <GolfSwing />
              case 'connections':
                return <Connections />
              case 'settings':
                return <Settings />
              default:
                return <Dashboard onNavigate={handleModuleChange} />
            }
          })()}
        </ErrorBoundary>
      </Suspense>
    )
  }

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
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