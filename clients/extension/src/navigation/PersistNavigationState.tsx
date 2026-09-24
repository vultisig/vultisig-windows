import { useNavigation } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect, useRef } from 'react'

import { removePersistedView, setPersistedView } from '../storage/persistedView'
import { getPersistableView } from './persistableViews'

/**
 * Saves the view the popup should reopen on to extension storage, keeping
 * only the state fields allowlisted for it.
 */
export const PersistNavigationState = ({ children }: ChildrenProp) => {
  const [{ history }] = useNavigation()

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const view = getPersistableView(history)
    if (view) {
      setPersistedView(view)
    } else {
      removePersistedView()
    }
  }, [history])

  return children
}
