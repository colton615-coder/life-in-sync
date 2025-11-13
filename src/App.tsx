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
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderModule()}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

export default App