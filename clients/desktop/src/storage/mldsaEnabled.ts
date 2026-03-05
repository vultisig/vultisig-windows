import {
  isMLDSAInitiallyEnabled,
  MLDSAEnabledStorage,
} from '@core/ui/storage/mldsaEnabled'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const mldsaEnabledStorage: MLDSAEnabledStorage = {
  getIsMLDSAEnabled: async () => {
    const value = persistentStorage.getItem<boolean>(StorageKey.isMLDSAEnabled)

    if (value === undefined) {
      return isMLDSAInitiallyEnabled
    }

    return value
  },
  setIsMLDSAEnabled: async isMLDSAEnabled => {
    persistentStorage.setItem(StorageKey.isMLDSAEnabled, isMLDSAEnabled)
  },
}
