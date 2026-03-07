import {
  FastVaultPasswordCacheStorage,
  FastVaultPasswordCacheValue,
  initialFastVaultPasswordCacheValue,
} from '@core/ui/storage/fastVaultPasswordCache'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const fastVaultPasswordCacheStorage: FastVaultPasswordCacheStorage = {
  getFastVaultPasswordCache: () =>
    getStorageValue(
      StorageKey.fastVaultPasswordCache,
      initialFastVaultPasswordCacheValue
    ),
  setFastVaultPasswordCache: async (value: FastVaultPasswordCacheValue) => {
    await setStorageValue(StorageKey.fastVaultPasswordCache, value)
  },
}
