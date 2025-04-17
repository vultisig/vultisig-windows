import {
  CreateVaultFunction,
  CreateVaultProvider as CreateVaultProviderBase,
} from '@core/ui/vault/state/createVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { getVaults, useVaultsMutation } from './vaults'

export const CreateVaultProvider = ({ children }: ChildrenProp) => {
  const { mutateAsync: updateVaults } = useVaultsMutation()

  const createVault: CreateVaultFunction = useCallback(
    async vault => {
      const prevVaults = await getVaults()

      await updateVaults([
        ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
        vault,
      ])

      return vault
    },
    [updateVaults]
  )

  return (
    <CreateVaultProviderBase value={createVault}>
      {children}
    </CreateVaultProviderBase>
  )
}
