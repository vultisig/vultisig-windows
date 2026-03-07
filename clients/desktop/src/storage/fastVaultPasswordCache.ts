import {
  FastVaultPasswordCacheStorage,
  FastVaultPasswordCacheValue,
  initialFastVaultPasswordCacheValue,
} from '@core/ui/storage/fastVaultPasswordCache'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const fastVaultPasswordCacheStorage: FastVaultPasswordCacheStorage = {
  getFastVaultPasswordCache: async () => {
    const value = persistentStorage.getItem<FastVaultPasswordCacheValue>(
      StorageKey.fastVaultPasswordCache
    )

    if (value === undefined) {
      return initialFastVaultPasswordCacheValue
    }

    return value
  },
  setFastVaultPasswordCache: async (value: FastVaultPasswordCacheValue) => {
    persistentStorage.setItem(StorageKey.fastVaultPasswordCache, value)
  },
}
