import { ChildrenProp } from '@lib/ui/props'
import { mediaBreakPoints } from '@lib/ui/responsive/mediaQuery'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Size = 'mobile' | 'tablet' | 'desktop'

const getSize = (width: number): Size => {
  if (width < mediaBreakPoints.mobileDevice) return 'mobile'
  if (width < mediaBreakPoints.tabletDevice) return 'tablet'
  return 'desktop'
}

const ResponsivenessContext = createContext<Size>('tablet')

export const ResponsivenessProvider = ({ children }: ChildrenProp) => {
  const [size, setSize] = useState<Size>(() => getSize(window.innerWidth))

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize(window.innerWidth))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ResponsivenessContext.Provider value={size}>
      {children}
    </ResponsivenessContext.Provider>
  )
}

export const useResponsiveness = () => {
  const size = useContext(ResponsivenessContext)

  return useMemo(() => {
    const isMobile = size === 'mobile'
    const isTablet = size === 'tablet'
    const isDesktop = size === 'desktop'

    return {
      current: size,
      // Exact matches
      isMobile,
      isTablet,
      isDesktop,
      // "And up" helpers
      isTabletOrLarger: isTablet || isDesktop,
      isDesktopOrLarger: isDesktop,
      // "And down" helpers
      isMobileOrSmaller: isMobile,
      isTabletOrSmaller: isMobile || isTablet,
      // Legacy aliases (deprecated - use new names)
      isSmall: isMobile,
      isMedium: isTablet,
      isLarge: isDesktop,
    }
  }, [size])
}
