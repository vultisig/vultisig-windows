import { StorageKey } from '@core/ui/storage/StorageKey'
import { vaultsInitialValue, VaultsStorage } from '@core/ui/storage/vaults'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

const getVaults = async () =>
  getStorageValue(StorageKey.vaults, vaultsInitialValue)

export const updateVaults = async (vaults: Vault[]) => {
  await setStorageValue(StorageKey.vaults, vaults)
}

export const getVault = async (vaultId: string) => {
  const vaults = await getVaults()
  return shouldBePresent(vaults.find(v => getVaultId(v) === vaultId))
}

export const vaultsStorage: VaultsStorage = {
  deleteVault: async vaultId => {
    const vaults = await getVaults()

    await updateVaults(vaults.filter(v => getVaultId(v) !== vaultId))
  },
  updateVault: async ({ vaultId, fields }) => {
    const vaults = await getVaults()
    const vaultIndex = shouldBePresent(
      vaults.findIndex(vault => getVaultId(vault) === vaultId)
    )

    const updatedVaults = updateAtIndex(vaults, vaultIndex, vault => ({
      ...vault,
      ...fields,
    }))

    await updateVaults(updatedVaults)

    return updatedVaults[vaultIndex]
  },
  createVault: async vault => {
    const prevVaults = await getVaults()

    await updateVaults([
      ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
      vault,
    ])

    return vault
  },
  updateVaultsKeyShares: async vaultsKeyShares => {
    const vaults = await getVaults()

    const newVaults = vaults.map(vault => ({
      ...vault,
      keyShares: vaultsKeyShares[getVaultId(vault)],
    }))

    await updateVaults(newVaults)
  },
  getVaults,
}
