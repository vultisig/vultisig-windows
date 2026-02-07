import { useNavigation } from '@lib/ui/navigation/state'
import { ChildrenProp } from '@lib/ui/props'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { useEffect, useRef } from 'react'

import {
  removePersistedHistory,
  setPersistedHistory,
} from '../storage/persistedView'
import { AppView } from './AppView'
import { shouldPersistView } from './persistableViews'

export const PersistNavigationState = ({ children }: ChildrenProp) => {
  const [{ history }] = useNavigation()
  const currentView = getLastItem(history) as AppView

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }


    if (shouldPersistView(currentView.id)) {
      setPersistedHistory(history as AppView[])
    } else {
      removePersistedHistory()
    }
  }, [currentView.id, history])

  return children
}
