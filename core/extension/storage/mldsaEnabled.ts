import {
  isMLDSAInitiallyEnabled,
  MLDSAEnabledStorage,
} from '@core/ui/storage/mldsaEnabled'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const mldsaEnabledStorage: MLDSAEnabledStorage = {
  getIsMLDSAEnabled: async () => {
    return getStorageValue(StorageKey.isMLDSAEnabled, isMLDSAInitiallyEnabled)
  },
  setIsMLDSAEnabled: async isMLDSAEnabled => {
    await setStorageValue(StorageKey.isMLDSAEnabled, isMLDSAEnabled)
  },
}
