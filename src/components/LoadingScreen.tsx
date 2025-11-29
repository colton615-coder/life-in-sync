import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUOTES } from '@/lib/quotes'

interface LoadingScreenProps {
  onLoadComplete: () => void
}

interface Quote {
  text: string
  author: string
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [show, setShow] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Select a random quote on mount
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    setQuote(randomQuote)

    // Enforce a minimum display time
    const timer = setTimeout(() => {
      if (isMounted) {
        setShow(false)
        // Add a small delay for the exit animation before calling onLoadComplete
        setTimeout(() => {
          if (isMounted) onLoadComplete()
        }, 500) // Corresponds to the exit animation duration
      }
    }, 3500) // Minimum display time: 3.5 seconds

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [onLoadComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-primary/20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [180, 270, 360],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/20 blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto px-8 text-center space-y-12">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                duration: 0.8,
              }}
              className="flex flex-col items-center mb-8"
            >
              <motion.img
                src="/assets/loading-visual.jpeg"
                alt="Loading"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-64 h-auto mx-auto rounded-xl shadow-2xl"
              />
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4 text-3xl font-bold text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              >
                LiFE-iN-SYNC
              </motion.h1>
            </motion.div>

            <AnimatePresence mode="wait">
              {quote && (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="space-y-6"
                >
                  <motion.blockquote
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed"
                  >
                    "{quote.text}"
                  </motion.blockquote>

                  <motion.cite
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="block text-lg text-muted-foreground not-italic"
                  >
                    — {quote.author}
                  </motion.cite>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="h-10" // Placeholder to prevent layout shift
            >
               <div className="flex justify-center gap-2 pt-4">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full bg-brand-primary"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
