import { CoreView, initialCoreView } from '@core/ui/navigation/CoreView'
import { initialViewQueryKey } from '@core/ui/query/keys'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { removePersistentState } from '../state/persistent/removePersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'
import { AppView } from './AppView'

const [key] = initialViewQueryKey

export const getInitialView = async () => {
  const value = await getPersistentState(key, undefined)

  if (value === undefined) {
    return initialCoreView
  }

  await removePersistentState(key)

  return value
}

export const setInitialView = async (view: AppView | CoreView) => {
  await setPersistentState(key, view)
}
