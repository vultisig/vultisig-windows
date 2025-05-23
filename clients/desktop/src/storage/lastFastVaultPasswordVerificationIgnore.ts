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

export const getLastFastVaultPasswordVerification: GetLastFastVaultPasswordVerificationFunction =
  async () => {
    return (
      (await persistentStorage.getItem<LastVerificationRecord>(
        StorageKey.lastFastVaultPasswordVerification
      )) ?? initialLastFastVaultPasswordVerification
    )
  }

export const getLastFastVaultPasswordVerificationPerVault: GetLastFastVaultPasswordVerificationPerVaultFunction =
  async vaultId => {
    const all = await getLastFastVaultPasswordVerification()
    return all[vaultId] ?? 0
  }

export const setLastFastVaultPasswordVerification: SetLastFastVaultPasswordVerificationFunction =
  async value => {
    await persistentStorage.setItem(
      StorageKey.lastFastVaultPasswordVerification,
      value
    )
  }

export const setLastFastVaultPasswordVerificationPerVault: SetLastFastVaultPasswordVerificationPerVaultFunction =
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
