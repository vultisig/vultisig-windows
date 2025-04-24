import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toStorageCoin } from '../../storage/storageCoin'

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
  const coins = await Promise.all(
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

      return toStorageCoin({
        ...chainFeeCoin[chain],
        address,
      })
    })
  )

  await SaveCoins(getVaultId(vault), coins)
}
