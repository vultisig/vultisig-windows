import { useEffect, useState } from 'react'

type SupportedMedias =
  | 'mobileDeviceAndUp'
  | 'mobileDeviceAndDown'
  | 'tabletDeviceAndUp'
  | 'desktopDeviceAndUp'
  | 'mobileDeviceOnly'
  | 'tabletDeviceOnly'
  | 'desktopDeviceOnly'

type SupportedMediasWidths = 'mobileDevice' | 'tabletDevice' | 'desktopDevice'

export const mediaBreakPoints: Record<SupportedMediasWidths, number> = {
  mobileDevice: 550,
  tabletDevice: 768,
  desktopDevice: 1100,
}

/**
 * The browser extension popup's width, and the narrowest layout any shared
 * component has to survive. It sits below `mobileDevice`, so no device
 * breakpoint distinguishes it — size against this instead of assuming a phone
 * has the room a phone usually does.
 */
export const extensionPopupWidth = 360

export const mediaQuery: Record<SupportedMedias, string> = {
  mobileDeviceAndDown: `(max-width: ${mediaBreakPoints.mobileDevice - 1}px)`,
  mobileDeviceAndUp: `(min-width: ${mediaBreakPoints.mobileDevice}px)`,
  mobileDeviceOnly: `(min-width: ${mediaBreakPoints.mobileDevice}px) and (max-width: ${
    mediaBreakPoints.tabletDevice - 1
  }px)`,

  desktopDeviceAndUp: `(min-width: ${mediaBreakPoints.desktopDevice}px)`,
  desktopDeviceOnly: `(min-width: ${mediaBreakPoints.desktopDevice}px)`,

  tabletDeviceAndUp: `(min-width: ${mediaBreakPoints.tabletDevice}px)`,
  tabletDeviceOnly: `(min-width: ${mediaBreakPoints.tabletDevice}px) and (max-width: ${
    mediaBreakPoints.desktopDevice - 1
  }px)`,
}

export const useIsTabletDeviceAndUp = () => {
  const [isTabletOrLarger, setIsTabletOrLarger] = useState(
    typeof window === 'undefined'
      ? false
      : window.innerWidth >= mediaBreakPoints.tabletDevice
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

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
