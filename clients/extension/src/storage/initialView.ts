import { CoreView, initialCoreView } from '@core/ui/navigation/CoreView'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { removePersistentState } from '@lib/ui/state/persistent/removePersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

import { AppView } from '../navigation/AppView'

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
