import { Coin } from '@core/chain/coin/Coin'
import { useMutation } from '@tanstack/react-query'

import { SaveCoin } from '../../../wailsjs/go/storage/Store'
import { deriveAddress } from '../../chain/utils/deriveAddress'
import { toHexPublicKey } from '../../chain/utils/toHexPublicKey'
import { useInvalidateQueries } from '../../lib/ui/query/hooks/useInvalidateQueries'
import { useAssertWalletCore } from '../../providers/WalletCoreProvider'
import { toStorageCoin } from '../../storage/storageCoin'
import { getVaultPublicKey } from '../publicKey/getVaultPublicKey'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { useCurrentVault } from '../state/currentVault'
import { getStorageVaultId } from '../utils/storageVault'

export const useSaveCoinMutation = () => {
  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

  const invalidate = useInvalidateQueries()

  return useMutation({
    onError: error => {
      console.error('save coin error: ', error)
    },
    mutationFn: async (coin: Coin) => {
      console.log('coin', coin)
      console.log('vault', vault)
      console.log('walletCore', walletCore)

      const publicKey = await getVaultPublicKey({
        vault,
        chain: coin.chain,
        walletCore,
      })

      console.log('publicKey', publicKey)

      const address = deriveAddress({
        chain: coin.chain,
        publicKey,
        walletCore,
      })

      console.log('address', address)

      const hexPublicKey = toHexPublicKey({
        publicKey,
        walletCore,
      })

      console.log('hexPublicKey', hexPublicKey)

      const storageCoin = toStorageCoin({
        ...coin,
        address,
        hexPublicKey,
      })

      console.log('storageCoin', storageCoin)

      await SaveCoin(getStorageVaultId(vault), storageCoin)

      await invalidate(vaultsQueryKey)
    },
  })
}
