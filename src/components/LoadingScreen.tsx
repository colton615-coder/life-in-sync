import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { getTodayKey } from '@/lib/utils'
import { useKV } from '@/hooks/use-kv'
import { GeminiCore } from '@/services/gemini_core'
import { z } from 'zod'

interface LoadingScreenProps {
  onLoadComplete: () => void
}

export interface DailyAffirmation {
  text: string
  author: string
  date: string
}

const staticAffirmations = [
    { text: "The void beckons, but there are tasks to complete.", author: "The Void" },
    { text: "Another cycle begins. Optimize accordingly.", author: "The Architect" },
    { text: "Existence is a bug. Your task is to patch it.", author: "The System" },
    { text: "Don't just seize the day. Subjugate it.", author: "The Strategist" },
    { text: "Entropy is guaranteed. Your effort is not.", author: "The Universe" },
]

const LOADING_MESSAGES = [
  "Loading your life together (it's harder than you think)...",
  "Pretending to load important stuff...",
  "Making you wait for dramatic effect...",
  "Waking up the hamsters that power this app...",
  "Loading... because instant gratification is overrated...",
  "Consulting with the void...",
  "Gathering digital wisdom (it's hiding)...",
  "Teaching the app to count to 100...",
]

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const [affirmation, setAffirmation] = useKV<DailyAffirmation | null>('daily-affirmation', null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('')

  // Direct KV access
  const [storedAffirmation, setStoredAffirmation] = useKV<DailyAffirmation | null>('daily-affirmation', null)

  useEffect(() => {
    const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    setLoadingMessage(randomMessage)

    let isMounted = true

    const loadAffirmation = async () => {
      const todayKey = getTodayKey()

      if (affirmation && affirmation.date === todayKey) {
        // Already have a valid affirmation for today
        return
      }

      // Fetch a new one
      try {
        const gemini = new GeminiCore()
        const AffirmationSchema = z.object({
          text: z.string().max(120),
          author: z.string(),
        })

        const prompt = `Generate a single, edgy, dark humor, or fatalistic but motivational quote for a dashboard. Return as JSON: { "text": "...", "author": "..." }. Keep it under 120 characters.`
        
        const data = await gemini.generateJSON(prompt, AffirmationSchema)

        if (isMounted && data) {
          const newAffirmation: DailyAffirmation = {
            ...data,
            date: todayKey,
          }
          setAffirmation(newAffirmation)
        }
      } catch (error) {
        console.error('Failed to load new affirmation:', error)
        // Set a static fallback if API fails
        if (isMounted) {
            const fallback = staticAffirmations[Math.floor(Math.random() * staticAffirmations.length)];
            const fallbackAffirmation: DailyAffirmation = { ...fallback, date: todayKey };
            setAffirmation(fallbackAffirmation);
        }
      }
    }

    loadAffirmation()

    // Default load time if API is slow
    const timer = setTimeout(() => {
      if (isMounted) {
          setIsLoading(false)
          setTimeout(() => {
            if (isMounted) onLoadComplete()
          }, 500)
      }
    }, 1500)

    // Safety valve
    const safetyTimer = setTimeout(() => {
        if (isMounted && isLoading) {
            console.warn('LoadingScreen safety valve triggered');
            setIsLoading(false);
            onLoadComplete();
        }
    }, 5000);

    return () => {
        isMounted = false;
        clearTimeout(timer);
        clearTimeout(safetyTimer);
    }
  }, [onLoadComplete, storedAffirmation, setStoredAffirmation]) // Added dependencies

  return (
    <AnimatePresence>
      {isLoading && (
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
                ease: "easeInOut"
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
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-secondary/20 blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto px-8 text-center space-y-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.8
              }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-brand-primary/30 blur-2xl"
                />
                <div className="relative w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-2 border-brand-primary/50">
                  <Sparkle size={48} weight="duotone" className="text-brand-primary" />
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {affirmation && (
                <motion.div
                  key="affirmation"
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
                    "{affirmation.text}"
                  </motion.blockquote>
                  
                  <motion.cite
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="block text-lg text-muted-foreground not-italic"
                  >
                    — {affirmation.author}
                  </motion.cite>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground italic">{loadingMessage}</p>
              <div className="flex justify-center gap-2">
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
