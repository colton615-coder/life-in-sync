import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'

import "./main.css"
import "./styles/theme.css"

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
