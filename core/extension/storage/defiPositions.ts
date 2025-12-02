import { DefiPositionsStorage } from '@core/ui/storage/defiPositions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const defiPositionsStorage: DefiPositionsStorage = {
  getDefiPositions: async () =>
    getStorageValue<Record<string, string[]>>(StorageKey.defiPositions, {}),
  setDefiPositions: async positions => {
    await setStorageValue(StorageKey.defiPositions, positions)
  },
}
