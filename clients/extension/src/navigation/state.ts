import { initialRoute } from '@core/ui/navigation/routes'
import { initialRouteQueryKey } from '@core/ui/query/keys'
import { HistoryEntry } from '@lib/ui/navigation/state'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { removePersistentState } from '../state/persistent/removePersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'
const [key] = initialRouteQueryKey

export const getInitialRoute = async () => {
  const value = await getPersistentState(key, undefined)

  if (value === undefined) {
    return initialRoute
  }

  await removePersistentState(key)

  return value
}

export const setInitialRoute = async (route: HistoryEntry) => {
  await setPersistentState(key, route)
}
