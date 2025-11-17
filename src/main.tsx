import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { useState } from 'react'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { LoadingScreen } from './components/LoadingScreen.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

function Root() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="system">
        {isLoading ? (
          <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
        ) : (
          <App />
        )}
      </ThemeProvider>
    </ErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
