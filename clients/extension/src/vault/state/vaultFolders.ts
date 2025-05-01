import { vaultFoldersQueryKey } from '@core/ui/query/keys'
import { GetVaultFoldersFunction } from '@core/ui/state/storage'
import { VaultFolder } from '@core/ui/vault/VaultFolder'

import { getPersistentState } from '../../state/persistent/getPersistentState'

const [key] = vaultFoldersQueryKey

const initialVaultFolders: VaultFolder[] = []

export const getVaultFolders: GetVaultFoldersFunction = async () => {
  return getPersistentState(key, initialVaultFolders)
}
