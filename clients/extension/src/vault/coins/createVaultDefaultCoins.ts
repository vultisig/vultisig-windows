import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

import { deriveAddress } from '@clients/desktop/src/chain/utils/deriveAddress'
import { getVaultPublicKey } from '@clients/desktop/src/vault/publicKey/getVaultPublicKey'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getVaultCoins, useVaultCoinsMutation } from '../state/coins'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultId } from '../state/currentVaultId'

type CreateVaultDefaultCoinsInput = {
  vault: Vault
  defaultChains: Chain[]
  walletCore: WalletCore
}

export const createVaultDefaultCoins = async ({
  vault,
  defaultChains,
  walletCore,
}: CreateVaultDefaultCoinsInput) => {
  const vaultCoins = await getVaultCoins()
  const { mutateAsync: updateVaultCoins } = useVaultCoinsMutation()
  const [currentVaultId] = useCurrentVaultId()
  console.log('currentVaultId:', currentVaultId)

  const coins: AccountCoin[] = await Promise.all(
    defaultChains.map(async chain => {
      const publicKey = await getVaultPublicKey({
        chain,
        vault,
        walletCore,
      })

      const address = deriveAddress({
        chain,
        publicKey,
        walletCore,
      })

      return {
        ...chainFeeCoin[chain],
        address,
      }
    })
  )
  console.log('coins:', coins)

  updateVaultCoins({ ...vaultCoins, [currentVaultId!]: coins })
}
