import { useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

export function useHapticFeedback() {
  const [hapticEnabled] = useKV<boolean>('settings-haptic-enabled', true)

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!hapticEnabled) return
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [hapticEnabled])

  const triggerHaptic = useCallback((style: HapticStyle = 'light') => {
    if (!hapticEnabled) return

    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 40,
      selection: [5, 10],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [40, 100, 40, 100, 40],
    }

    vibrate(patterns[style])
  }, [vibrate, hapticEnabled])

  return { triggerHaptic, vibrate, hapticEnabled }
}
