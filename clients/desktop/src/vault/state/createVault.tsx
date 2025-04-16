import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  CreateVaultFunction,
  CreateVaultProvider as CreateVaultProviderBase,
} from '@core/ui/vault/state/createVault'
import { ChildrenProp } from '@lib/ui/props'
import { useCallback } from 'react'

import { SaveVault } from '../../../wailsjs/go/storage/Store'
import { useDefaultChains } from '../../chain/state/defaultChains'
import { createVaultDefaultCoins } from '../coins/createVaultDefaultCoins'
import { toStorageVault } from '../utils/storageVault'

export const CreateVaultProvider = ({ children }: ChildrenProp) => {
  const [defaultChains] = useDefaultChains()
  const walletCore = useAssertWalletCore()

  const createVault: CreateVaultFunction = useCallback(
    async vault => {
      const storageVault = toStorageVault(vault)

      await SaveVault(storageVault)

      await createVaultDefaultCoins({
        vault,
        defaultChains,
        walletCore,
      })

      return vault
    },
    [defaultChains, walletCore]
  )

  return (
    <CreateVaultProviderBase value={createVault}>
      {children}
    </CreateVaultProviderBase>
  )
}
