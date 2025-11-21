
import { motion } from 'framer-motion'
import { Spinner } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'

const SARCASTIC_MESSAGES = [
  "Loading... because the internet isn't instant.",
  "Fetching your life data...",
  "Hold on, we're getting the good stuff.",
  "Spinning wheels...",
  "Calculating the meaning of life...",
  "Doing the math...",
  "Waking up the hamsters...",
  "Locating the bits and bytes...",
]

const SARCASTIC_PROGRESS_MESSAGES = [
    "Crunching the numbers (ouch)...",
    "Judging your spending habits...",
    "Finding money you didn't know you lost...",
    "Asking the magic 8-ball...",
    "Consulting financial spirits...",
    "Dividing by zero...",
    "Simulating stock market crashes...",
]

export function SarcasticLoader() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage(SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)])
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Spinner size={48} className="text-primary" />
      </motion.div>
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  )
}

export function SarcasticProgress() {
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState(SARCASTIC_PROGRESS_MESSAGES[0])

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval)
                    return 100
                }
                // Slow down as we get closer to 100
                const increment = Math.max(0.5, (100 - p) / 20 * Math.random())
                return p + increment
            })
        }, 100)

        const messageInterval = setInterval(() => {
            setMessage(SARCASTIC_PROGRESS_MESSAGES[Math.floor(Math.random() * SARCASTIC_PROGRESS_MESSAGES.length)])
        }, 3000)

        return () => {
            clearInterval(interval)
            clearInterval(messageInterval)
        }
    }, [])

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
             <Progress value={progress} className="h-2" />
             <p className="text-center text-sm text-muted-foreground animate-pulse">{message}</p>
        </div>
    )
}
