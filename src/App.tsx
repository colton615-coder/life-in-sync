import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Dashboard } from '@/components/modules/Dashboard'
import { Habits } from '@/components/modules/Habits'
import { Tasks } from '@/components/modules/Tasks'
import { Finance } from '@/components/modules/Finance'
import { Workouts } from '@/components/modules/Workouts'
import { Knox } from '@/components/modules/Knox'
import { Module } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentModule} />
      case 'habits':
        return <Habits />
      case 'tasks':
        return <Tasks />
      case 'finance':
        return <Finance />
      case 'workouts':
        return <Workouts />
      case 'knox':
        return <Knox />
      default:
        return <Dashboard onNavigate={setCurrentModule} />
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation currentModule={currentModule} onNavigate={setCurrentModule} />
      <main className="flex-1 p-6 md:p-10 pb-28 md:pb-10 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderModule()}
        </div>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid oklch(0.92 0.005 270)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  )
}

export default App
