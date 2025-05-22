import { GetVaultFoldersFunction } from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { VaultFolder } from '@core/ui/vault/VaultFolder'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const initialVaultFolders: VaultFolder[] = []

export const getVaultFolders: GetVaultFoldersFunction = async () => {
  return getPersistentState(StorageKey.vaultFolders, initialVaultFolders)
}

export const updateVaultFolders = async (folders: VaultFolder[]) => {
  await setPersistentState(StorageKey.vaultFolders, folders)
}
