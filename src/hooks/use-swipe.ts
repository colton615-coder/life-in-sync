import { useRef, useState, useEffect, TouchEvent, MouseEvent } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeConfig {
  threshold?: number
  preventDefaultTouchmoveEvent?: boolean
}

interface SwipeResult {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: () => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: () => void
  onMouseLeave: () => void
  swipeDistance: number
  isSwiping: boolean
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
}

export function useSwipe(
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
): SwipeResult {
  const { threshold = 50, preventDefaultTouchmoveEvent = false } = config
  
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  const isMouseDown = useRef(false)

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
    setIsSwiping(true)
    setSwipeDirection(null)
    setSwipeDistance(0)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault()
    }
    
    if (!touchStart) return
    
    const currentTouch = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    }
    
    setTouchEnd(currentTouch)
    
    const diffX = touchStart.x - currentTouch.x
    const diffY = touchStart.y - currentTouch.y
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeDirection(diffX > 0 ? 'left' : 'right')
      setSwipeDistance(Math.abs(diffX))
    } else {
      setSwipeDirection(diffY > 0 ? 'up' : 'down')
      setSwipeDistance(Math.abs(diffY))
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false)
      setSwipeDirection(null)
      setSwipeDistance(0)
      return
    }

    const diffX = touchStart.x - touchEnd.x
    const diffY = touchStart.y - touchEnd.y

    const isHorizontalSwipe = Math.abs(diffX) > Math.abs(diffY)
    const isVerticalSwipe = Math.abs(diffY) > Math.abs(diffX)

    if (isHorizontalSwipe && Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        handlers.onSwipeLeft?.()
      } else {
        handlers.onSwipeRight?.()
      }
    }

    if (isVerticalSwipe && Math.abs(diffY) > threshold) {
      if (diffY > 0) {
        handlers.onSwipeUp?.()
      } else {
        handlers.onSwipeDown?.()
      }
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsSwiping(false)
    setSwipeDirection(null)
    setSwipeDistance(0)
  }

  const onMouseDown = (e: MouseEvent) => {
    isMouseDown.current = true
    setTouchStart({
      x: e.clientX,
      y: e.clientY,
    })
    setIsSwiping(true)
    setSwipeDirection(null)
    setSwipeDistance(0)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isMouseDown.current || !touchStart) return

    const currentPos = {
      x: e.clientX,
      y: e.clientY,
    }

    setTouchEnd(currentPos)

    const diffX = touchStart.x - currentPos.x
    const diffY = touchStart.y - currentPos.y

    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeDirection(diffX > 0 ? 'left' : 'right')
      setSwipeDistance(Math.abs(diffX))
    } else {
      setSwipeDirection(diffY > 0 ? 'up' : 'down')
      setSwipeDistance(Math.abs(diffY))
    }
  }

  const onMouseUp = () => {
    if (!isMouseDown.current) return
    
    isMouseDown.current = false
    onTouchEnd()
  }

  const onMouseLeave = () => {
    if (isMouseDown.current) {
      isMouseDown.current = false
      setTouchStart(null)
      setTouchEnd(null)
      setIsSwiping(false)
      setSwipeDirection(null)
      setSwipeDistance(0)
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    swipeDistance,
    isSwiping,
    swipeDirection,
  }
}
