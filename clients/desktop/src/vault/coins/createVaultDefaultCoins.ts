import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { WalletCore } from '@trustwallet/wallet-core'

import { storage } from '../../../wailsjs/go/models'
import { SaveCoins } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toHexPublicKey } from '../../chain/utils/toHexPublicKey'
import { toStorageCoin } from '../../storage/storageCoin'
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey'
import { getStorageVaultId } from '../utils/storageVault'

type CreateVaultDefaultCoinsInput = {
  vault: storage.Vault
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

  await SaveCoins(getStorageVaultId(vault), coins)
}
