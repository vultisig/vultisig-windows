import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

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
      const publicKey = getPublicKey({
        chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
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
  const validCoins = coins.filter(coin => coin !== null) as AccountCoin[]
  if (validCoins.length > 0) {
    await updateVaultCoins(currentVaultId, validCoins)
  }
}
