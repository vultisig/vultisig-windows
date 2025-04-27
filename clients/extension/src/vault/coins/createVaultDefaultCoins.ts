import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

import { getVaultPublicKey } from './getVaultPublicKey'

type CreateVaultDefaultCoinsInput = {
  vault: Vault
  defaultChains: Chain[]
  walletCore: WalletCore
  currentVaultId: string
  updateVaultCoins: (vaultId: string, coins: AccountCoin[]) => Promise<void>
}

export const createVaultDefaultCoins = async ({
  vault,
  defaultChains,
  walletCore,
  currentVaultId,
  updateVaultCoins,
}: CreateVaultDefaultCoinsInput) => {
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
  await updateVaultCoins(currentVaultId, coins)
}
