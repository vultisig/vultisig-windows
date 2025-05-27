import {
  CurrentVaultId,
  CurrentVaultIdStorage,
  initialCurrentVaultId,
} from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const currentVaultIdStorage: CurrentVaultIdStorage = {
  getCurrentVaultId: () =>
    getPersistentState(StorageKey.currentVaultId, initialCurrentVaultId),
  setCurrentVaultId: async (vaultId: CurrentVaultId) => {
    await setPersistentState(StorageKey.currentVaultId, vaultId)
  },
}
