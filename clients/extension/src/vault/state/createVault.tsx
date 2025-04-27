import { useDefaultChains } from '@clients/extension/src/chain/state/useDefaultChains'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  CreateVaultFunction,
  CreateVaultProvider as CreateVaultProviderBase,
} from '@core/ui/vault/state/createVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { createVaultDefaultCoins } from '../coins/createVaultDefaultCoins'
import { useVaultCoinsMutation } from './coins'
import { getVaults, useVaultsMutation } from './vaults'

export const CreateVaultProvider = ({ children }: ChildrenProp) => {
  const { mutateAsync: updateVaults } = useVaultsMutation()
  const { mutateAsync: updateVaultCoins } = useVaultCoinsMutation()
  const walletCore = useAssertWalletCore()
  const [defaultChains] = useDefaultChains()

  const createVault: CreateVaultFunction = useCallback(
    async vault => {
      const prevVaults = await getVaults()

      await updateVaults([
        ...prevVaults.filter(v => getVaultId(v) !== getVaultId(vault)),
        vault,
      ])

      await createVaultDefaultCoins({
        vault,
        defaultChains,
        walletCore,
        currentVaultId: getVaultId(vault),
        updateVaultCoins,
      })

      return vault
    },
    [updateVaults, defaultChains, walletCore, updateVaultCoins]
  )

  return (
    <CreateVaultProviderBase value={createVault}>
      {children}
    </CreateVaultProviderBase>
  )
}
