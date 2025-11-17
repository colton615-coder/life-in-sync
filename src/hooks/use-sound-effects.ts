import { useCallback, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

type SoundType = 'success' | 'complete' | 'delete' | 'tap' | 'error' | 'notification'

export function useSoundEffects() {
  const [soundEnabled] = useKV<boolean>('settings-sound-enabled', false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    if (!soundEnabled) return

    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      console.warn('Sound playback failed:', error)
    }
  }, [soundEnabled, getAudioContext])

  const playSound = useCallback((soundType: SoundType) => {
    if (!soundEnabled) return

    switch (soundType) {
      case 'success':
        playTone(523.25, 0.1, 'sine', 0.3)
        setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 50)
        setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 120)
        break
      
      case 'complete':
        playTone(659.25, 0.1, 'sine', 0.3)
        setTimeout(() => playTone(783.99, 0.1, 'sine', 0.3), 80)
        setTimeout(() => playTone(1046.50, 0.15, 'sine', 0.3), 160)
        setTimeout(() => playTone(1318.51, 0.2, 'sine', 0.3), 250)
        break
      
      case 'delete':
        playTone(440, 0.05, 'sine', 0.2)
        setTimeout(() => playTone(220, 0.15, 'sine', 0.2), 50)
        break
      
      case 'tap':
        playTone(800, 0.05, 'sine', 0.15)
        break
      
      case 'error':
        playTone(200, 0.15, 'square', 0.2)
        setTimeout(() => playTone(150, 0.2, 'square', 0.2), 100)
        break
      
      case 'notification':
        playTone(880, 0.1, 'sine', 0.25)
        setTimeout(() => playTone(1174.66, 0.15, 'sine', 0.25), 100)
        break
    }
  }, [soundEnabled, playTone])

  return { playSound, soundEnabled }
}
