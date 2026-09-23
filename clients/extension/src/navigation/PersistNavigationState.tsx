import { useNavigation } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect, useRef } from 'react'

import {
  removePersistedHistory,
  setPersistedHistory,
} from '../storage/persistedView'
import { AppView } from './AppView'
import { getPersistableHistory } from './persistableViews'

/**
 * Mirrors the navigation history to extension storage so the popup reopens
 * where the user left it, writing only views that are safe to keep on disk.
 */
export const PersistNavigationState = ({ children }: ChildrenProp) => {
  const [{ history }] = useNavigation()

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const persistableHistory = getPersistableHistory(history as AppView[])
    if (persistableHistory) {
      setPersistedHistory(persistableHistory)
    } else {
      removePersistedHistory()
    }
  }, [history])

  return children
}
