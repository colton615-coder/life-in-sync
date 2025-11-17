import { Component, ReactNode } from 'react'
import { Alert, AlertTitle, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset)
      }

      return (
        <div className="p-4 md:p-6">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive" className="mb-4">
              <Warning size={20} weight="bold" aria-hidden="true" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                This module encountered an error and couldn't load properly. Don't worry, your other modules are still working fine.
              </AlertDescription>
            </Alert>
            
            <div className="neumorphic-card p-6 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Error Details:</h3>
              <pre className="text-xs text-destructive bg-muted/50 p-4 rounded-lg border border-border overflow-auto max-h-40 font-mono">
                {this.state.error.message}
              </pre>
            </div>
            
            <Button 
              onClick={this.handleReset} 
              className="w-full button-glow"
              aria-label="Try reloading this module"
            >
              <ArrowClockwise size={20} weight="bold" aria-hidden="true" />
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
