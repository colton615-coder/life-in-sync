import { useState, useEffect, Suspense, lazy } from 'react'
import { Toaster } from '@/components/shell/Toaster'
import { toast } from 'sonner'
import { Module } from '@/lib/types'
import { GlobalErrorBoundary } from '@/components/shell/GlobalErrorBoundary'
import { clearAllAppData } from '@/lib/clear-data'
import { LoadingScreen } from './components/LoadingScreen'
import { SarcasticLoader } from './components/SarcasticLoader'

// Shell Components
import { AppBackground } from '@/components/shell/AppBackground'
import { LifeCore } from '@/components/shell/LifeCore'
import { FloatingDock } from '@/components/shell/FloatingDock'
import { WorkoutProvider } from '@/context/WorkoutContext'
import { useKeyboardAvoidance } from '@/hooks/use-keyboard-avoidance'

// @ts-expect-error virtual:pwa-register is dynamically generated
import { registerSW } from 'virtual:pwa-register'

// Lazy load all modules to reduce initial bundle size
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
  const [isLoading, setIsLoading] = useState(true)

  // Initialize global keyboard avoidance
  useKeyboardAvoidance();

  useEffect(() => {
    document.title = 'LiFE-iN-SYNC';
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
      try {
        const hasCleared = localStorage.getItem('data-cleared-v1')
        if (!hasCleared) {
          await clearAllAppData()
          localStorage.setItem('data-cleared-v1', 'true')
        }
      } catch (error) {
        console.error('Failed to clear app data:', error)
      }
    }
    clearData()
  }, [])

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId as Module)
    
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
      </Suspense>
    )
  }

  if (isLoading) {
    return <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
  }

  // If we are in the Golf module, we might want to suppress the global LifeCore header
  // to maximize screen real estate, as per the "Single Screen" requirement.
  const isGolfModule = activeModule === 'golf';

  return (
    <GlobalErrorBoundary>
      <WorkoutProvider>
        <AppBackground>
          <div className="min-h-screen">
            <a href="#main-content" className="skip-to-content text-white">
              Skip to main content
            </a>

            {/* Global Header (LifeCore) - Conditional */}
            {!isGolfModule && <LifeCore />}

            {/* Main Content Area */}
            {/* Adjusted padding to account for the Floating Dock at bottom */}
            <main id="main-content" className="md:px-8 pb-40">
              {renderModule()}
            </main>

            {/* Floating Dock Navigation */}
            <FloatingDock
                activeModule={activeModule}
                onNavigate={handleModuleChange}
            />

            <Toaster />
          </div>
        </AppBackground>
      </WorkoutProvider>
    </GlobalErrorBoundary>
  );
}

export default App
