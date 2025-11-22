import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'

import "./main.css"
import "./styles/theme.css"

// Inject Spark Shim
import { sparkShim } from './lib/spark-shim';
if (typeof window !== 'undefined') {
  // @ts-expect-error - Injecting shim into window
  window.spark = sparkShim;
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
