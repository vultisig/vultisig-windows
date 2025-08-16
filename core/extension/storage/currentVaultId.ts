import {
  CurrentVaultId,
  CurrentVaultIdStorage,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const currentVaultIdStorage: CurrentVaultIdStorage = {
  getCurrentVaultId: () =>
    getStorageValue(StorageKey.currentVaultId, initialCurrentVaultId),
  setCurrentVaultId: async (vaultId: CurrentVaultId) => {
    await setStorageValue(StorageKey.currentVaultId, vaultId)
  },
}
