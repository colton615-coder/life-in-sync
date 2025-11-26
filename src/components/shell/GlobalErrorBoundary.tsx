// src/components/shell/GlobalErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/services/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('GlobalErrorBoundary', 'A critical UI error occurred.', {
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-gradient-radial from-violet-900 to-black flex items-center justify-center p-4 text-slate-200 font-sans">
          <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-lg shadow-[0_8px_32px_0_rgba(135,31,38,0.37)] p-8 text-center animate-glitch-in">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-red-400 mb-2 font-mono tracking-wider">
              SYSTEM CRITICAL
            </h1>
            <p className="text-slate-300 mb-6">
              A critical error has occurred, preventing the application from continuing. Please reinitialize the system.
            </p>

            <div className="bg-black/20 p-4 rounded-md text-left mb-6">
              <h3 className="text-sm font-semibold text-red-400/80 mb-2">Error Code:</h3>
              <pre className="text-xs text-slate-400 opacity-70 font-mono whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </div>

            <button
              onClick={this.handleReload}
              className="flex items-center justify-center w-full px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-md hover:bg-red-500/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Reinitialize System
            </button>
          </div>
          <style>
            {`
              @keyframes glitch-in {
                0% {
                  transform: translate(0);
                  opacity: 0;
                }
                20% {
                  transform: translate(-3px, 3px);
                }
                40% {
                  transform: translate(-3px, -3px);
                }
                60% {
                  transform: translate(3px, 3px);
                }
                80% {
                  transform: translate(3px, -3px);
                }
                100% {
                  transform: translate(0);
                  opacity: 1;
                }
              }
              .animate-glitch-in {
                animation: glitch-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
              }
            `}
          </style>
        </div>
      );
    }

    return this.props.children;
  }
}
