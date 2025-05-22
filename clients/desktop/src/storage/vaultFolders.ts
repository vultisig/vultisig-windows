import { vaultFoldersInitialValue } from '@core/ui/storage/vaultFolders'
import { VaultFoldersStorage } from '@core/ui/storage/vaultFolders'

import {
  DeleteVaultFolder,
  GetVaultFolder,
  GetVaultFolders,
  SaveVaultFolder,
} from '../../wailsjs/go/storage/Store'

export const vaultFoldersStorage: VaultFoldersStorage = {
  getVaultFolders: async () => {
    const storageVaultFolders =
      (await GetVaultFolders()) ?? vaultFoldersInitialValue
    return storageVaultFolders
  },
  deleteVaultFolder: async folderId => {
    await DeleteVaultFolder(folderId)
  },
  updateVaultFolder: async ({ id, fields }) => {
    const folder = await GetVaultFolder(id)

    const updatedFolder = {
      ...folder,
      ...fields,
    }

    await SaveVaultFolder(updatedFolder)
  },
  createVaultFolder: async folder => {
    await SaveVaultFolder(folder)
  },
}
