import { ChildrenProp } from '@lib/ui/props'
import { mediaBreakPoints } from '@lib/ui/responsive/mediaQuery'
import { createContext, useContext, useEffect, useState } from 'react'

type Size = 's' | 'm' | 'l'

const getSize = (width: number): Size => {
  if (width < mediaBreakPoints.mobileDevice) return 's'
  if (width < mediaBreakPoints.desktopDevice) return 'm'
  return 'l'
}

const ResponsivenessContext = createContext<Size>('m')

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
  return {
    current: size,
    isSmall: size === 's',
    isMedium: size === 'm',
    isLarge: size === 'l',
  }
}
