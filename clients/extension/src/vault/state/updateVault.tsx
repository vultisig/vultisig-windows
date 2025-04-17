import {
  UpdateVaultFunction,
  UpdateVaultProvider as UpdateVaultProviderBase,
} from '@core/ui/vault/state/updateVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'

import { getVaults, useVaultsMutation } from './vaults'

export const UpdateVaultProvider = ({ children }: ChildrenProp) => {
  const { mutateAsync: updateVaults } = useVaultsMutation()

  const updateVault: UpdateVaultFunction = useCallback(
    async ({ vaultId, fields }) => {
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
    [updateVaults]
  )

  return (
    <UpdateVaultProviderBase value={updateVault}>
      {children}
    </UpdateVaultProviderBase>
  )
}
