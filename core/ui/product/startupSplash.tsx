import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext, useState } from 'react'

type StartupSplashState = {
  hasCompletedStartupSplash: boolean
  completeStartupSplash: () => void
}

const defaultStartupSplashState: StartupSplashState = {
  hasCompletedStartupSplash: true,
  completeStartupSplash: () => undefined,
}

const StartupSplashContext = createContext<StartupSplashState>(
  defaultStartupSplashState
)

export const StartupSplashProvider = ({ children }: ChildrenProp) => {
  const [hasCompletedStartupSplash, setHasCompletedStartupSplash] =
    useState(false)

  const value: StartupSplashState = {
    hasCompletedStartupSplash,
    completeStartupSplash: () => {
      setHasCompletedStartupSplash(true)
    },
  }

  return (
    <StartupSplashContext.Provider value={value}>
      {children}
    </StartupSplashContext.Provider>
  )
}

export const useStartupSplash = () => useContext(StartupSplashContext)
