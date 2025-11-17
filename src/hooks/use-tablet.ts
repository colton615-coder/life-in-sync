import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setBreakpoint('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", updateBreakpoint)
    updateBreakpoint()
    
    return () => mql.removeEventListener("change", updateBreakpoint)
  }, [])

  return breakpoint
}

export function useIsTablet() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'tablet'
}

export function useIsMobileOrTablet() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'mobile' || breakpoint === 'tablet'
}
