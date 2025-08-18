import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  GetVaultFoldersFunction,
  vaultFoldersInitialValue,
  VaultFoldersStorage,
} from '@core/ui/storage/vaultFolders'
import { getVaultId } from '@core/ui/vault/Vault'
import { VaultFolder } from '@core/ui/vault/VaultFolder'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { updateVaults, vaultsStorage } from './vaults'

const getVaultFolders: GetVaultFoldersFunction = async () => {
  return getStorageValue(StorageKey.vaultFolders, vaultFoldersInitialValue)
}

const updateVaultFolders = async (folders: VaultFolder[]) => {
  await setStorageValue(StorageKey.vaultFolders, folders)
}

export const vaultFoldersStorage: VaultFoldersStorage = {
  createVaultFolder: async folder => {
    const folders = await getVaultFolders()
    await updateVaultFolders([...folders, folder])
    // Update vaults with the new folder ID
    if (folder.vaultIds?.length) {
      const vaults = await vaultsStorage.getVaults()
      const updatedVaults = vaults.map(vault => {
        if (folder.vaultIds?.includes(getVaultId(vault))) {
          return { ...vault, folderId: folder.id }
        }
        return vault
      })
      await updateVaults(updatedVaults)
    }
  },
  getVaultFolders,
  updateVaultFolder: async ({ id, fields }) => {
    const vaultFolders = await getVaultFolders()
    const vaultFolderIndex = shouldBePresent(
      vaultFolders.findIndex(vaultFolder => vaultFolder.id === id)
    )

    const updatedVaultFolders = updateAtIndex(
      vaultFolders,
      vaultFolderIndex,
      vaultFolder => ({
        ...vaultFolder,
        ...fields,
      })
    )

    await updateVaultFolders(updatedVaultFolders)
  },
  deleteVaultFolder: async folderId => {
    const folders = await getVaultFolders()
    const vaults = await vaultsStorage.getVaults()

    // Update vaults to remove folder reference
    const updatedVaults = vaults.map(vault =>
      vault.folderId === folderId ? { ...vault, folderId: undefined } : vault
    )

    await updateVaults(updatedVaults)
    await updateVaultFolders(folders.filter(folder => folder.id !== folderId))
  },
}
