import { ChildrenProp } from '@lib/ui/props'
import { createContext, useContext, useEffect, useState } from 'react'

import { currentProductBrand } from './brand'

/**
 * How the shell boots. `splash` plays the brand animation and holds the tree
 * until WalletCore is ready. `instant` paints the first view right away, shows
 * a neutral placeholder for shell loading and lets WalletCore consumers
 * suspend until the WASM has loaded; the action popup uses it so an icon click
 * never plays the logo.
 */
export type StartupMode = 'splash' | 'instant'

type StartupSplashState = {
  isSplashEnabled: boolean
  hasCompletedStartupSplash: boolean
  completeStartupSplash: () => void
}

const defaultStartupSplashState: StartupSplashState = {
  isSplashEnabled: true,
  hasCompletedStartupSplash: true,
  completeStartupSplash: () => undefined,
}

const StartupSplashContext = createContext<StartupSplashState>(
  defaultStartupSplashState
)

const splashSessionKey =
  currentProductBrand === 'station'
    ? 'stationHasCompletedStartupSplash'
    : 'hasCompletedStartupSplash'

const hasSessionStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.session

type StartupSplashProviderProps = ChildrenProp & {
  mode?: StartupMode
}

/**
 * Tracks whether the startup splash animation has been shown, persisting
 * across extension window reopens via chrome.storage.session. In `instant`
 * mode the splash counts as completed from the start and nothing is persisted.
 */
export const StartupSplashProvider = ({
  children,
  mode = 'splash',
}: StartupSplashProviderProps) => {
  const isSplashEnabled = mode === 'splash'
  const [hasCompletedStartupSplash, setHasCompletedStartupSplash] =
    useState(!isSplashEnabled)

  useEffect(() => {
    if (!isSplashEnabled || !hasSessionStorage) return

    chrome.storage.session.get(splashSessionKey).then(result => {
      if (result[splashSessionKey]) {
        setHasCompletedStartupSplash(true)
      }
    })
  }, [isSplashEnabled])

  const value: StartupSplashState = {
    isSplashEnabled,
    hasCompletedStartupSplash,
    completeStartupSplash: () => {
      setHasCompletedStartupSplash(true)
      if (isSplashEnabled && hasSessionStorage) {
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
