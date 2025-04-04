import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'

import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toHexPublicKey } from '../../chain/utils/toHexPublicKey'
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

      const hexPublicKey = toHexPublicKey({
        publicKey,
        walletCore,
      })

      return toStorageCoin({
        ...chainFeeCoin[chain],
        address,
        hexPublicKey,
      })
    })
  )

  await SaveCoins(getVaultId(vault), coins)
}
