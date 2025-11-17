import { motion } from 'framer-motion'
import { CircleNotch } from '@phosphor-icons/react'
import { useState, useEffect, useMemo } from 'react'

interface SarcasticLoaderProps {
  className?: string
  size?: number
}

const SARCASTIC_MESSAGES = [
  "Convincing AI this is important...",
  "Teaching robots to count calories...",
  "Asking ChatGPT to do math...",
  "Pretending to work hard...",
  "Consulting the algorithm gods...",
  "Making it look fancy...",
  "Generating professional excuses...",
  "Doing the thing you could've done yourself...",
  "Summoning digital wisdom...",
  "Calculating your hopes and dreams...",
  "Running very complex calculations (not really)...",
  "Avoiding actual work, AI-style...",
  "Teaching a computer to be smart...",
  "Beep boop beep... (that's computer for 'wait')...",
  "Consulting with artificial intelligence (emphasis on artificial)...",
  "Making you wait for no reason...",
  "Justifying my existence as a feature...",
  "Pretending this takes longer than it does...",
  "Doing AI things you wouldn't understand...",
  "Loading... because instant results are suspicious...",
]

export function SarcasticLoader({ className = '', size = 20 }: SarcasticLoaderProps) {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const randomMessage = SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)]
    setMessage(randomMessage)
  }, [])

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <CircleNotch size={size} weight="bold" className="text-primary" />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground italic"
      >
        {message}
      </motion.span>
    </div>
  )
}

interface SarcasticProgressProps {
  className?: string
}

export function SarcasticProgress({ className = '' }: SarcasticProgressProps) {
  const PROGRESS_MESSAGES = useMemo(
    () => [
      [0, "Polishing the chrome..."],
      [10, "Reticulating splines..."],
      [20, "Aligning the dilithium crystals... with a hammer."],
      [30, "Charging the flux capacitor... to 87."],
      [40, "It's not a bug, it's an undocumented feature."],
      [50, "Dividing by zero..."],
      [60, "Are we there yet?"],
      [70, "I'm not slow, I'm just enjoying the scenery."],
      [80, "Just one more thing..."],
      [90, "Almost there... I think."],
      [95, "Okay, maybe I am a little slow."],
      [100, "Done! Finally."],
    ],
    []
  );

  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState(PROGRESS_MESSAGES[0][1])
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) {
          clearInterval(interval)
          return 98
        }
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 98)
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentMessage = PROGRESS_MESSAGES.find((m, idx) => {
      const nextMessage = PROGRESS_MESSAGES[idx + 1]
      return progress >= (m[0] as number) && (!nextMessage || progress < (nextMessage[0] as number))
    })

    if (currentMessage && currentMessage[1] !== message) {
      setMessage(currentMessage[1])
      setMessageIndex(prev => prev + 1)
    }
  }, [progress, message, PROGRESS_MESSAGES])

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent-vibrant rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between text-xs"
      >
        <span className="text-muted-foreground italic">{message}</span>
        <span className="text-muted-foreground font-mono">{Math.round(progress)}%</span>
      </motion.div>
    </div>
  )
}
