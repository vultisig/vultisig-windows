import { CoreView, initialCoreView } from '@core/ui/navigation/CoreView'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { AppView } from '../navigation/AppView'
import { getPersistentState } from '../state/persistent/getPersistentState'
import { removePersistentState } from '../state/persistent/removePersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const initialViewStorage = {
  getInitialView: async () => {
    const value = await getPersistentState(StorageKey.initialView, undefined)

    if (value === undefined) {
      return initialCoreView
    }

    await removePersistentState(StorageKey.initialView)

    return value
  },
}

export const setInitialView = async (view: AppView | CoreView) => {
  await setPersistentState(StorageKey.initialView, view)
}
