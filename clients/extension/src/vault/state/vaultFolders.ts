import { vaultFoldersQueryKey } from '@core/ui/query/keys'
import { GetVaultFoldersFunction } from '@core/ui/state/storage'
import { VaultFolder } from '@core/ui/vault/VaultFolder'

import { getPersistentState } from '../../state/persistent/getPersistentState'
import { setPersistentState } from '../../state/persistent/setPersistentState'

const [key] = vaultFoldersQueryKey

const initialVaultFolders: VaultFolder[] = []

export const getVaultFolders: GetVaultFoldersFunction = async () => {
  return getPersistentState(key, initialVaultFolders)
}

export const updateVaultFolders = async (folders: VaultFolder[]) => {
  await setPersistentState(key, folders)
}
