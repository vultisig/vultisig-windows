import { useEffect, useState } from 'react'

type SupportedMedias =
  | 'mobileDeviceAndUp'
  | 'tabletDeviceAndUp'
  | 'desktopDeviceAndUp'
  | 'mobileDeviceOnly'
  | 'tabletDeviceOnly'
  | 'desktopDeviceOnly'

type SupportedMediasWidths = 'mobileDevice' | 'tabletDevice' | 'desktopDevice'

const mediaBreakPoints: Record<SupportedMediasWidths, number> = {
  mobileDevice: 550,
  tabletDevice: 768,
  desktopDevice: 1100,
}

export const mediaQuery: Record<SupportedMedias, string> = {
  mobileDeviceAndUp: `(min-width: ${mediaBreakPoints.mobileDevice}px)`,
  mobileDeviceOnly: `(min-width: ${mediaBreakPoints.mobileDevice}px) and (max-width: ${
    mediaBreakPoints.tabletDevice - 1
  }px)`,

  desktopDeviceAndUp: `(min-width: ${mediaBreakPoints.desktopDevice}px)`,
  desktopDeviceOnly: `(min-width: ${mediaBreakPoints.desktopDevice}px) and (max-width: ${
    mediaBreakPoints.desktopDevice - 1
  }px)`,

  tabletDeviceAndUp: `(min-width: ${mediaBreakPoints.tabletDevice}px)`,
  tabletDeviceOnly: `(min-width: ${mediaBreakPoints.tabletDevice}px) and (max-width: ${
    mediaBreakPoints.desktopDevice - 1
  }px)`,
}

export const useIsTabletDeviceAndUp = () => {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(
    window.innerWidth >= mediaBreakPoints.tabletDevice - 1
  )

  useEffect(() => {
    const targetMediaQuery = window.matchMedia(mediaQuery.tabletDeviceAndUp)

    const handleChange = (event: MediaQueryListEvent) => {
      setIsTabletOrLarger(event.matches)
    }

    setIsTabletOrLarger(targetMediaQuery.matches)

    targetMediaQuery.addEventListener('change', handleChange)

    return () => {
      targetMediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isTabletOrLarger
}
