
import { motion } from 'framer-motion'
import { Spinner } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const GENERIC_MESSAGES = [
  "Loading... because the internet isn't instant.",
  "Fetching your life data...",
  "Hold on, we're getting the good stuff.",
  "Spinning wheels...",
  "Calculating the meaning of life...",
  "Doing the math...",
  "Waking up the hamsters...",
  "Locating the bits and bytes...",
]

const GYM_MESSAGES = [
  "Locating your muscles...",
  "Loading weights (they're heavy)...",
  "Judging your skip days...",
  "Preparing the pain cave...",
  "Calculating protein intake...",
  "Spotting you...",
  "Calibrating gravity...",
]

const FINANCE_MESSAGES = [
  "Calculating how poor you are...",
  "Judging your Starbucks addiction...",
  "Finding money you didn't know you lost...",
  "Consulting the financial spirits...",
  "Simulating stock market crashes...",
  "Auditing your bad decisions...",
  "Searching for your retirement fund...",
]

const GOLF_MESSAGES = [
  "Analyzing your slice...",
  "Finding the fairway (it's hard)...",
  "Calculating wind speed...",
  "Polishing the clubs...",
  "Judging your swing mechanics...",
  "Loading excuses...",
  "Calibrating launch angle...",
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

type LoaderContext = 'default' | 'finance' | 'gym' | 'golf';

interface SarcasticLoaderProps {
  text?: string;
  context?: LoaderContext;
  className?: string;
}

export function SarcasticLoader({ text, context = 'default', className }: SarcasticLoaderProps) {
  const [message, setMessage] = useState(text || '')

  useEffect(() => {
    if (text) {
      setMessage(text);
      return;
    }

    let messages = GENERIC_MESSAGES;
    switch (context) {
      case 'gym':
        messages = GYM_MESSAGES;
        break;
      case 'finance':
        messages = FINANCE_MESSAGES;
        break;
      case 'golf':
        messages = GOLF_MESSAGES;
        break;
      default:
        messages = GENERIC_MESSAGES;
    }

    setMessage(messages[Math.floor(Math.random() * messages.length)]);

    // Optional: Cycle messages if loading takes too long
    const interval = setInterval(() => {
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [text, context])

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8 min-h-[40vh]", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Spinner size={48} className="text-cyan-400" />
      </motion.div>
      <p className="text-muted-foreground text-sm animate-pulse font-mono">{message}</p>
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
