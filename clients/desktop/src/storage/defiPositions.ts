import { DefiPositionsStorage } from '@core/ui/storage/defiPositions'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const defiPositionsStorage: DefiPositionsStorage = {
  getDefiPositions: async () => {
    const value = persistentStorage.getItem<Record<string, string[]>>(
      StorageKey.defiPositions
    )

    if (value === undefined) {
      return {}
    }

    return value
  },
  setDefiPositions: async positions => {
    persistentStorage.setItem(StorageKey.defiPositions, positions)
  },
}
