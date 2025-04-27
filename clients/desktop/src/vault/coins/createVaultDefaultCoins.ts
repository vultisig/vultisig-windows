import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { toStorageCoin } from '../../storage/storageCoin'
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey'

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

      return toStorageCoin({
        ...chainFeeCoin[chain],
        address,
      })
    })
  )

  await SaveCoins(getVaultId(vault), coins)
}
