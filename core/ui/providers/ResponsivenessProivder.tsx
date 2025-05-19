import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { createContext, FC, PropsWithChildren, useContext } from 'react'
import { useMedia } from 'react-use'

type WindowSizeContextType = {
  isMobileScreen: boolean
}

const ResponsivenessContext = createContext<WindowSizeContextType>(null!)

export const ResponsivenessProvider: FC<PropsWithChildren> = ({ children }) => {
  const isMobileScreen = useMedia(mediaQuery.mobileDeviceAndDown)

  return (
    <ResponsivenessContext.Provider value={{ isMobileScreen }}>
      {children}
    </ResponsivenessContext.Provider>
  )
}

export const useResponsiveness = () => {
  const context = useContext(ResponsivenessContext)

  if (!context) {
    throw new Error(
      'useResponsiveness must be used within a ResponsivenessProvider'
    )
  }
  return context
}
