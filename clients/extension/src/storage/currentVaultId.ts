import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  CurrentVaultId,
  CurrentVaultIdStorage,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const currentVaultIdStorage: CurrentVaultIdStorage = {
  getCurrentVaultId: () =>
    getPersistentState(StorageKey.currentVaultId, initialCurrentVaultId),
  setCurrentVaultId: async (vaultId: CurrentVaultId) => {
    await setPersistentState(StorageKey.currentVaultId, vaultId)
  },
}
