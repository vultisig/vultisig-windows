import { StorageKey } from '@core/ui/storage/StorageKey'
import { vaultsInitialValue, VaultsStorage } from '@core/ui/storage/vaults'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { assertVaultRecoveryReplacement } from '../../ui/storage/vaultRecoveryReplacement'
import { deleteCoinsForVault } from './coins'

let vaultsMutationChain: Promise<unknown> = Promise.resolve()

// Every vaults write is a read-modify-write of the whole array, so concurrent
// callers would each write back a stale copy and the last one would win.
const serializeVaultsMutation = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = vaultsMutationChain.then(fn, fn)
  vaultsMutationChain = next.catch(() => undefined)
  return next
}

const getVaults = async () =>
  getStorageValue(StorageKey.vaults, vaultsInitialValue)

export const updateVaults = async (vaults: Vault[]) => {
  await setStorageValue(StorageKey.vaults, vaults)
}

/** The stored vault with this id, or `undefined` when it no longer exists. */
export const findVault = async (vaultId: string) => {
  const vaults = await getVaults()
  return vaults.find(v => getVaultId(v) === vaultId)
}

export const getVault = async (vaultId: string) =>
  shouldBePresent(await findVault(vaultId))

export const vaultsStorage: VaultsStorage = {
  deleteVault: vaultId =>
    serializeVaultsMutation(async () => {
      const vaults = await getVaults()

      await deleteCoinsForVault(vaultId)
      await updateVaults(vaults.filter(v => getVaultId(v) !== vaultId))
    }),
  updateVault: ({ vaultId, fields }) =>
    serializeVaultsMutation(async () => {
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
    }),
  createVault: vault =>
    serializeVaultsMutation(async () => {
      const prevVaults = await getVaults()

      await updateVaults([
        ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
        vault,
      ])

      return vault
    }),
  replaceVault: ({ expectedVault, vault }) =>
    serializeVaultsMutation(async () => {
      const currentVaults = await getVaults()
      const vaultId = getVaultId(vault)
      const matchingIndexes = currentVaults.flatMap((candidate, index) =>
        getVaultId(candidate) === vaultId ? [index] : []
      )

      if (matchingIndexes.length !== 1) {
        throw new Error(
          'Recovery replacement requires exactly one stored vault'
        )
      }

      const vaultIndex = matchingIndexes[0]
      assertVaultRecoveryReplacement({
        currentVault: currentVaults[vaultIndex],
        expectedVault,
        replacementVault: vault,
      })

      await updateVaults(updateAtIndex(currentVaults, vaultIndex, () => vault))
      return vault
    }),
  updateVaultsKeyShares: vaultsKeyShares =>
    serializeVaultsMutation(async () => {
      const vaults = await getVaults()

      const newVaults = vaults.map(vault => {
        const allKeyShares = vaultsKeyShares[getVaultId(vault)]
        if (!allKeyShares) return vault

        return {
          ...vault,
          keyShares: allKeyShares.keyShares,
          chainKeyShares: allKeyShares.chainKeyShares,
          keyShareMldsa: allKeyShares.keyShareMldsa,
        }
      })

      await updateVaults(newVaults)
    }),
  getVaults,
}
