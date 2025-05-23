import {
  GetLastFastVaultPasswordVerificationFunction,
  GetLastFastVaultPasswordVerificationPerVaultFunction,
  initialLastFastVaultPasswordVerification,
  LastVerificationRecord,
  SetLastFastVaultPasswordVerificationFunction,
  SetLastFastVaultPasswordVerificationPerVaultFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

const getLastFastVaultPasswordVerification: GetLastFastVaultPasswordVerificationFunction =
  async () => {
    return (
      persistentStorage.getItem<LastVerificationRecord>(
        StorageKey.lastFastVaultPasswordVerification
      ) ?? initialLastFastVaultPasswordVerification
    )
  }

const getLastFastVaultPasswordVerificationPerVault: GetLastFastVaultPasswordVerificationPerVaultFunction =
  async vaultId => {
    const all = await getLastFastVaultPasswordVerification()
    return all[vaultId] ?? 0
  }

const setLastFastVaultPasswordVerification: SetLastFastVaultPasswordVerificationFunction =
  async value => {
    persistentStorage.setItem(
      StorageKey.lastFastVaultPasswordVerification,
      value
    )
  }

const setLastFastVaultPasswordVerificationPerVault: SetLastFastVaultPasswordVerificationPerVaultFunction =
  async (vaultId, timestamp) => {
    const all = await getLastFastVaultPasswordVerification()
    const updated = { ...all, [vaultId]: timestamp }
    await setLastFastVaultPasswordVerification(updated)
  }

export const lastFastVaultPasswordVerificationStorage = {
  getLastFastVaultPasswordVerification,
  getLastFastVaultPasswordVerificationPerVault,
  setLastFastVaultPasswordVerification,
  setLastFastVaultPasswordVerificationPerVault,
}
