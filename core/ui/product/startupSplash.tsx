import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext, useEffect, useState } from 'react'

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

const splashSessionKey = 'hasCompletedStartupSplash'

const hasSessionStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.session

/** Tracks whether the startup splash animation has been shown, persisting across extension popup reopens via chrome.storage.session. */
export const StartupSplashProvider = ({ children }: ChildrenProp) => {
  const [hasCompletedStartupSplash, setHasCompletedStartupSplash] =
    useState(false)

  useEffect(() => {
    if (!hasSessionStorage) return

    chrome.storage.session.get(splashSessionKey).then(result => {
      if (result[splashSessionKey]) {
        setHasCompletedStartupSplash(true)
      }
    })
  }, [])

  const value: StartupSplashState = {
    hasCompletedStartupSplash,
    completeStartupSplash: () => {
      setHasCompletedStartupSplash(true)
      if (hasSessionStorage) {
        chrome.storage.session.set({ [splashSessionKey]: true })
      }
    },
  }

  return (
    <StartupSplashContext.Provider value={value}>
      {children}
    </StartupSplashContext.Provider>
  )
}

export const useStartupSplash = () => useContext(StartupSplashContext)
