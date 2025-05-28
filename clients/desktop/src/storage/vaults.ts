import { vaultsInitialValue, VaultsStorage } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { recordMap } from '@lib/utils/record/recordMap'
import { toEntries } from '@lib/utils/record/toEntries'

import {
  DeleteVault,
  GetVault,
  GetVaults,
  SaveVault,
  SaveVaultsKeyShares,
} from '../../wailsjs/go/storage/Store'
import { fromStorageVault, toStorageVault } from '../vault/utils/storageVault'

const getVaults = async () => {
  const storageVaults = (await GetVaults()) ?? vaultsInitialValue
  return storageVaults.map(fromStorageVault)
}

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
  getVaults,
  updateVaultsKeyShares: async vaultsKeyShares => {
    const vaults = await getVaults()

    const storageVaultsKeyShares = recordMap(
      vaultsKeyShares,
      (keyShares, vaultId) => {
        const { publicKeys } = shouldBePresent(
          vaults.find(v => getVaultId(v) === vaultId)
        )

        return toEntries(keyShares).map(({ key, value }) => ({
          public_key: publicKeys[key],
          keyshare: value,
        }))
      }
    )

    await SaveVaultsKeyShares(storageVaultsKeyShares)
  },
}
