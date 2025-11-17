import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className,
}: ErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Alert variant="destructive" className="glass-card border-destructive/50">
        <WarningCircle className="h-5 w-5" aria-hidden="true" />
        <AlertTitle className="text-lg font-semibold">{title}</AlertTitle>
        <AlertDescription className="text-base mt-2 space-y-3">
          <p>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="glass-morphic border-destructive/50 hover:border-destructive hover:bg-destructive/10 text-destructive-foreground"
            >
              <ArrowClockwise className="mr-2 h-4 w-4" aria-hidden="true" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}
