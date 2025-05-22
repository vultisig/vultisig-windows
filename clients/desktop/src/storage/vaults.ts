import { vaultsInitialValue, VaultsStorage } from '@core/ui/storage/vaults'

import {
  DeleteVault,
  GetVault,
  GetVaults,
  SaveVault,
} from '../../wailsjs/go/storage/Store'
import { fromStorageVault, toStorageVault } from '../vault/utils/storageVault'

export const vaultsStorage: VaultsStorage = {
  deleteVault: async vaultId => {
    await DeleteVault(vaultId)
  },
  updateVault: async ({ vaultId, fields }) => {
    const oldStorageVault = await GetVault(vaultId)
    const oldVault = fromStorageVault(oldStorageVault)

    const newVault = { ...oldVault, ...fields }
    const newStorageVault = toStorageVault(newVault)

    await SaveVault(newStorageVault)

    return newVault
  },
  createVault: async vault => {
    const storageVault = toStorageVault(vault)

    await SaveVault(storageVault)

    return vault
  },
  getVaults: async () => {
    const storageVaults = (await GetVaults()) ?? vaultsInitialValue
    return storageVaults.map(fromStorageVault)
  },
}
