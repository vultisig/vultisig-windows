import {
  CurrentVaultId,
  CurrentVaultIdStorage,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const currentVaultIdStorage: CurrentVaultIdStorage = {
  getCurrentVaultId: async () => {
    const value = persistentStorage.getItem<CurrentVaultId>(
      StorageKey.currentVaultId
    )

    if (value === undefined) {
      return initialCurrentVaultId
    }

    return value
  },
  setCurrentVaultId: async (vaultId: CurrentVaultId) => {
    persistentStorage.setItem(StorageKey.currentVaultId, vaultId)
  },
}
